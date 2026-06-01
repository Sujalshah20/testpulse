// api/auth/refresh.js
import { getDB, ObjectId } from '../../lib/mongodb.js';
import redis from '../../lib/redis.js';
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
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (e) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    const userId = decoded.id;

    // Check against Upstash Redis
    const cachedToken = await redis.get(`refresh:${userId}`);
    if (!cachedToken || cachedToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Session expired or invalidated'
      });
    }

    // Fetch user details from MongoDB
    const db = getDB();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { _id: 1, uuid: 1, role: 1, is_active: 1 } }
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account deactivated'
      });
    }

    // Generate new Access Token
    const accessToken = jwt.sign(
      { id: user._id.toString(), role: user.role, uuid: user.uuid?.toString() || user.uuid },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    return res.status(200).json({
      success: true,
      data: { accessToken }
    });

  } catch (err) {
    console.error('Refresh token error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}