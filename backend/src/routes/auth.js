import express from 'express';
import { getMongoStatus } from '../db/mongo.js';
import { ensureUserIndexes, findUserByEmail, createUser } from '../db/userRepository.js';
import { validateEmail, validatePassword } from '../utils/validators.js';
import bcrypt from 'bcryptjs';
import { signAuthToken } from '../utils/jwt.js';
import { requireAuth } from '../middleware/auth.js';

export function authRoutes() {
  const router = express.Router();

  router.post('/signup', async (req, res) => {
    try {
      const mongo = getMongoStatus();
      if (!mongo.enabled || !mongo.connected) {
        return res.status(503).json({ error: 'Database unavailable. Please configure MongoDB.' });
      }

      const { email, emailId, password } = req.body || {};
      const userEmail = (email || emailId || '').toString().trim().toLowerCase();

      if (!validateEmail(userEmail)) {
        return res.status(400).json({ error: 'Invalid email address.' });
      }

      const pwdValidation = validatePassword(password);
      if (!pwdValidation.valid) {
        return res.status(400).json({ error: pwdValidation.message });
      }

      await ensureUserIndexes();

      const existing = await findUserByEmail(userEmail);
      if (existing) {
        return res.status(409).json({ error: 'Email already registered.' });
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const user = await createUser({ email: userEmail, passwordHash });

      const token = signAuthToken({ sub: String(user._id), email: user.email });

      return res.status(201).json({
        message: 'Signup successful.',
        user: { id: user._id, email: user.email },
        token,
      });
    } catch (err) {
      if (err?.code === 11000) {
        return res.status(409).json({ error: 'Email already registered.' });
      }
      console.error('Signup error:', err?.message || err);
      console.error('Signup error stack:', err?.stack);
      console.error('Signup error details:', {
        name: err?.name,
        code: err?.code,
        message: err?.message,
        mongoStatus: getMongoStatus()
      });
      
      // Check if it's a MongoDB connection error
      if (err?.message?.includes('MongoDB is not available') || err?.message?.includes('MongoDB is not initialized')) {
        return res.status(503).json({ 
          error: 'Database unavailable. Please configure MongoDB and ensure it is running.',
          details: process.env.NODE_ENV !== 'production' ? { message: err?.message } : undefined
        });
      }
      
      // In development, return more details
      const errorMessage = process.env.NODE_ENV === 'production' 
        ? 'Internal server error.' 
        : `Internal server error: ${err?.message || 'Unknown error'}`;
      
      return res.status(500).json({ 
        error: errorMessage,
        details: process.env.NODE_ENV !== 'production' ? {
          message: err?.message,
          name: err?.name,
          code: err?.code
        } : undefined
      });
    }
  });

  router.post('/signin', async (req, res) => {
    try {
      const mongo = getMongoStatus();
      if (!mongo.enabled || !mongo.connected) {
        return res.status(503).json({ error: 'Database unavailable. Please configure MongoDB.' });
      }

      const { email, emailId, password } = req.body || {};
      const userEmail = (email || emailId || '').toString().trim().toLowerCase();

      if (!validateEmail(userEmail)) {
        return res.status(400).json({ error: 'Invalid email or password.' });
      }
      if (typeof password !== 'string' || password.length === 0) {
        return res.status(400).json({ error: 'Invalid email or password.' });
      }

      const existing = await findUserByEmail(userEmail);
      if (!existing) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const match = await bcrypt.compare(password, existing.passwordHash);
      if (!match) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = signAuthToken({ sub: String(existing._id), email: existing.email });

      return res.status(200).json({
        message: 'Signin successful.',
        user: { id: existing._id, email: existing.email },
        token,
      });
    } catch (err) {
      console.error('Signin error:', err?.message || err);
      console.error('Signin error stack:', err?.stack);
      console.error('Signin error details:', {
        name: err?.name,
        code: err?.code,
        message: err?.message,
        mongoStatus: getMongoStatus()
      });
      
      // Check if it's a MongoDB connection error
      if (err?.message?.includes('MongoDB is not available') || err?.message?.includes('MongoDB is not initialized')) {
        return res.status(503).json({ 
          error: 'Database unavailable. Please configure MongoDB and ensure it is running.',
          details: process.env.NODE_ENV !== 'production' ? { message: err?.message } : undefined
        });
      }
      
      // In development, return more details
      const errorMessage = process.env.NODE_ENV === 'production' 
        ? 'Internal server error.' 
        : `Internal server error: ${err?.message || 'Unknown error'}`;
      
      return res.status(500).json({ 
        error: errorMessage,
        details: process.env.NODE_ENV !== 'production' ? {
          message: err?.message,
          name: err?.name,
          code: err?.code
        } : undefined
      });
    }
  });

  router.get('/me', requireAuth, async (req, res) => {
    return res.status(200).json({
      user: {
        id: req.user?.sub || null,
        email: req.user?.email || null,
      }
    });
  });

  return router;
}


