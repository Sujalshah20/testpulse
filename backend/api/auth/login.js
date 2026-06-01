// api/auth/login.js
import { getDB, ObjectId } from '../../lib/mongodb.js';
import redis from '../../lib/redis.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const origin = process.env.CLIENT_URL || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({
    success: false, message: 'Method not allowed'
  });

  try {
    const { email, password } = req.body;
    const db = getDB();

    // Validation
    if (!email || !password) return res.status(400).json({
      success: false, message: 'Email and password required'
    });

    // Rate limiting via Upstash
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const cleanIp = ip.split(',')[0].trim();
    const attempts = await redis.incr(`login:${cleanIp}`);
    if (attempts === 1) await redis.expire(`login:${cleanIp}`, 900);
    if (attempts > 5) return res.status(429).json({
      success: false, message: 'Too many attempts. Try after 15 minutes.'
    });

    // Query MongoDB
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });

    if (!user) return res.status(401).json({
      success: false, message: 'Invalid credentials'
    });

    if (!user.is_active) return res.status(403).json({
      success: false, message: 'Account deactivated'
    });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({
      success: false, message: 'Invalid credentials'
    });

    const accessToken = jwt.sign(
      { id: user._id.toString(), role: user.role, uuid: user.uuid },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Store refresh token in Upstash
    await redis.set(`refresh:${user._id.toString()}`, refreshToken, { ex: 604800 });

    return res.status(200).json({
      success: true,
      data: {
        accessToken, refreshToken,
        user: { id: user._id.toString(), name: user.name, role: user.role }
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}