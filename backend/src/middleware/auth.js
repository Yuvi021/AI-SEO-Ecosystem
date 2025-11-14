import { extractTokenFromRequest, verifyAuthToken } from '../utils/jwt.js';

export function requireAuth(req, res, next) {
  try {
    const token = extractTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: 'Authorization token missing.' });
    }
    const decoded = verifyAuthToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}


