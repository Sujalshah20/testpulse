// api/auth/logout.js
import redis from '../../lib/redis.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // CORS headers
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
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(400).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const token = authHeader.split(' ')[1];

    // Attempt to decode the access token to get user ID and remaining expiration
    let decoded;
    let blacklistTime = 900; // Default 15 minutes in seconds

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded && decoded.exp) {
        const now = Math.floor(Date.now() / 1000);
        blacklistTime = Math.max(1, decoded.exp - now);
      }
    } catch (e) {
      // If token is invalid or already expired, still proceed to logout
      try {
        decoded = jwt.decode(token);
      } catch (decodeErr) {
        // Unparseable token
      }
    }

    if (decoded && decoded.id) {
      // Remove refresh token
      await redis.del(`refresh:${decoded.id}`);
    }

    // Blacklist the access token
    // await redis.set('blacklist:' + token, 1, { ex: blacklistTime });
    await redis.set(`blacklist:${token}`, 1, { ex: blacklistTime });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
