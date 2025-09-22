// middleware/authenticateUser.js
import jwt from 'jsonwebtoken';
import UserModel from '../Models/User.js';

export default async function authenticateUser(req, res, next) {
  try {
    const hdr = req.headers.authorization || '';
    if (!hdr.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }
    const token = hdr.split(' ')[1];

    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) {
      console.error('[Auth] Missing JWT_SECRET_KEY');
      return res.status(500).json({ success: false, message: 'Server misconfigured' });
    }

    // Reject RS256 tokens (e.g., Google ID tokens) immediately
    if (token.startsWith('eyJhbGciOiJS')) {
      return res.status(401).json({ success: false, message: 'Invalid token issuer/alg' });
    }

    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    const userId = decoded.userId || decoded.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Invalid token payload' });

    const user = await UserModel.findById(userId);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    console.error('[Auth middleware] error:', err);
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}