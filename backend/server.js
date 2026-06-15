import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resume.js';
import analysisRoutes from './routes/analysis.js';
import paymentRoutes from './routes/payment.js';

// Force Google & Cloudflare DNS
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ Catch unhandled errors
process.on('unhandledRejection', (err) => {
  console.error('🔴 Unhandled Rejection:', err.message);
  console.error(err);
});

process.on('uncaughtException', (err) => {
  console.error('🔴 Uncaught Exception:', err.message);
  console.error(err);
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

// ✅ Request logger
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/payment', paymentRoutes);

// Test Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Skill Analyzer API Running 🚀'
  });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('🔴 Global Error:', err.message);
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// MongoDB Connection
async function startServer() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log('URI Exists:', !!process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);

    console.log('✅ MongoDB Connected Successfully');

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error('❌ FULL MongoDB Error:');
    console.error(err);
    process.exit(1);
  }
}

startServer();