// ── Zahi Spa — Stripe Payment Server ──

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // serve static files

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

app.listen(PORT, () => {
    console.log(`\n🚀 Glamour Studio server running at http://localhost:${PORT}`);
    console.log(`📄 Open: http://localhost:${PORT}/pages/services.html\n`);
});
