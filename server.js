// ── Zahi Spa — Stripe Payment Server ──

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const fs = require('fs');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // serve static files

// ── Bookings file path ──
const BOOKINGS_FILE = path.join(__dirname, 'data', 'bookings.json');

// Ensure bookings.json exists
if (!fs.existsSync('data')) {
    fs.mkdirSync('data', { recursive: true });
}
if (!fs.existsSync(BOOKINGS_FILE)) {
    fs.writeFileSync(BOOKINGS_FILE, '[]', 'utf8');
}

// Helper: Read bookings
function getBookings() {
    try {
        const data = fs.readFileSync(BOOKINGS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading bookings:', error.message);
        return [];
    }
}

// Helper: Save bookings
function saveBookings(bookings) {
    try {
        fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error saving bookings:', error.message);
        return false;
    }
}

// ── SPA Route Handler - Serve index.html for root ──
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Serve pages ──
app.get('/pages/:page', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', req.params.page));
});

// ── Fallback for direct page access ──
app.get('/:page.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', req.params.page + '.html'));
});

// ── Get publishable key (so frontend doesn't hardcode it) ──
app.get('/api/config', (req, res) => {
    res.json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
});

// ── Create a PaymentIntent ──
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { 
            amount, 
            currency, 
            customerName, 
            customerEmail, 
            serviceName, 
            staffName,
            serviceDuration,
            bookingDate,
            bookingTime,
            price,
            vat
        } = req.body;

        // Amount must be in the smallest currency unit (fils for AED)
        // 1 AED = 100 fils
        const amountInFils = Math.round(amount * 100);

        // Build detailed description with all booking info + price breakdown
        const description = `📅 ${bookingDate || 'N/A'} at ${bookingTime || 'N/A'} | ⏱️ ${serviceDuration || 'N/A'} min | 💇 ${serviceName || 'N/A'} by ${staffName || 'N/A'} | 💰 Base: ${price || 'N/A'} AED + VAT: ${vat || 'N/A'} AED = ${amount || 'N/A'} AED`;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInFils,
            currency: currency || 'aed',
            description: description, // Full booking details with price breakdown
            automatic_payment_methods: {
                enabled: true
            },
            metadata: {
                customerName: customerName || '',
                customerEmail: customerEmail || '',
                serviceName: serviceName || '',
                staffName: staffName || '',
                serviceDuration: serviceDuration || '',
                bookingDate: bookingDate || '',
                bookingTime: bookingTime || '',
                basePrice: price || '',
                vatAmount: vat || ''
            },
            receipt_email: customerEmail || undefined // Automatically sends receipt email
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });

    } catch (error) {
        console.error('Error creating PaymentIntent:', error.message);
        res.status(500).json({
            error: error.message
        });
    }
});

// ── Get payment status ──
app.get('/api/payment-status/:id', async (req, res) => {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(req.params.id);
        res.json({
            status: paymentIntent.status,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ════════════════════════════════════════
// ── BOOKINGS API ──
// ════════════════════════════════════════

// Get all bookings
app.get('/api/bookings', (req, res) => {
    try {
        const bookings = getBookings();
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single booking
app.get('/api/bookings/:id', (req, res) => {
    try {
        const bookings = getBookings();
        const booking = bookings.find(b => b.id === req.params.id);
        if (booking) {
            res.json(booking);
        } else {
            res.status(404).json({ error: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Save new booking
app.post('/api/bookings', (req, res) => {
    try {
        const bookings = getBookings();
        const newBooking = {
            id: 'BK-' + Date.now(),
            ...req.body,
            createdAt: new Date().toISOString(),
            status: 'confirmed'
        };
        
        bookings.push(newBooking);
        saveBookings(bookings);
        
        // Send email notification to admin
        sendAdminNotification(newBooking);
        
        res.status(201).json(newBooking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete booking
app.delete('/api/bookings/:id', (req, res) => {
    try {
        let bookings = getBookings();
        bookings = bookings.filter(b => b.id !== req.params.id);
        saveBookings(bookings);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ── Send admin notification email ──
function sendAdminNotification(booking) {
    // Email notification setup (optional - configure if needed)
    console.log('📧 New booking notification:', booking);
    // You can enable email notifications by adding Nodemailer configuration
}

app.listen(PORT, () => {
    console.log(`\n🚀 Glamour Studio server running at http://localhost:${PORT}`);
    console.log(`📄 Open: http://localhost:${PORT}/pages/services.html\n`);
});
