// lib/middleware/verifyJWT.js
import jwt from 'jsonwebtoken';
import redis from '../redis.js';

export const verifyJWT = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false, message: 'No token provided'
    });
  }

  const token = auth.split(' ')[1];

  try {
    // Check blacklist in Upstash Redis
    const blacklisted = await redis.get(`blacklist:${token}`);
    if (blacklisted) {
      return res.status(401).json({
        success: false, message: 'Token invalidated'
      });
    }

    // Verify token signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Call the next function in the chain
    if (next) await next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const roleGuard = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({
      success: false, message: 'Access denied'
    });
  }
  if (next) next();
};
