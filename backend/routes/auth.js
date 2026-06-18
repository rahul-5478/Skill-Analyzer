import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// =======================
// ✅ TEST ROUTE
// =======================
router.get('/test', (req, res) => {
  res.json({ message: "Auth route working 🚀" });
});

// =======================
// ✅ REGISTER
// =======================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        premiumAnalyses: user.premiumAnalyses
      }
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// =======================
// ✅ LOGIN
// =======================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        premiumAnalyses: user.premiumAnalyses
      }
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// =======================
// ✅ GET PROFILE (PROTECTED)
// =======================
router.get('/me', authMiddleware, (req, res) => {
  return res.json({ user: req.user });
});

export default router;