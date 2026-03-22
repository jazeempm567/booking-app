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

// ── Get publishable key (so frontend doesn't hardcode it) ──
app.get('/api/config', (req, res) => {
    res.json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
});

// ── Create a PaymentIntent ──
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency, customerName, customerEmail, serviceName, staffName } = req.body;

        // Amount must be in the smallest currency unit (fils for AED)
        // 1 AED = 100 fils
        const amountInFils = Math.round(amount * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInFils,
            currency: currency || 'aed',
            automatic_payment_methods: {
                enabled: true
            },
            metadata: {
                customerName: customerName || '',
                customerEmail: customerEmail || '',
                serviceName: serviceName || '',
                staffName: staffName || ''
            },
            receipt_email: customerEmail || undefined
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

// ── Serve the app ──
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'services.html'));
});

app.listen(PORT, () => {
    console.log(`\n🚀 Glamour Studio server running at http://localhost:${PORT}`);
    console.log(`📄 Open: http://localhost:${PORT}/pages/services.html\n`);
});
