// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Create a transaction schema
const transactionSchema = new mongoose.Schema({
    paymentId: String,
    amount: Number,
    status: String,
    createdAt: { type: Date, default: Date.now }
});
const Transaction = mongoose.model('Transaction', transactionSchema);

// Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create payment order
app.post('/create-order', async (req, res) => {
    const { amount, currency } = req.body;

    const options = {
        amount: amount * 100, // Amount in paise
        currency: currency,
        receipt: 'receipt#1',
        payment_capture: 1, // Auto capture
    };

    try {
        const response = await razorpay.orders.create(options);
        res.json(response);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Webhook to handle payment notifications
app.post('/webhook', express.json(), async (req, res) => {
    const webhookSecret = process.env.WEBHOOK_SECRET;
    const crypto = require('crypto');

    const signature = req.headers['x-razorpay-signature'];
    const expectedSignature = crypto.createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

    if (signature !== expectedSignature) {
        return res.status(403).send('Invalid signature');
    }

    const paymentData = req.body.payload.payment.entity;
    const transaction = new Transaction({
        paymentId: paymentData.id,
        amount: paymentData.amount,
        status: paymentData.status,
    });
    await transaction.save();
    console.log('Transaction saved:', transaction);

    res.json({ received: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
