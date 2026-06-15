import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import authMiddleware from '../middleware/auth.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create order for premium analysis (₹10 = 1000 paise)
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { analysisId } = req.body;

    const order = await razorpay.orders.create({
      amount: 1000, // ₹10 in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        analysisId: analysisId || ''
      }
    });

    const payment = await Payment.create({
      userId: req.user._id,
      analysisId,
      razorpayOrderId: order.id,
      amount: 1000
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment._id,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify payment
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, analysisId } = req.body;

    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { razorpayPaymentId: razorpay_payment_id, status: 'paid' }
    );

    await User.findByIdAndUpdate(req.user._id, { $inc: { premiumAnalyses: 1 } });

    res.json({ 
      success: true, 
      paymentId: razorpay_payment_id,
      message: 'Payment verified! Unlocking premium analysis...' 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
