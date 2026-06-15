import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  analysisId: { type: mongoose.Schema.Types.ObjectId, ref: 'Analysis' },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String },
  amount: { type: Number, required: true }, // in paise
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Payment', paymentSchema);
