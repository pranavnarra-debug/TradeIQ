import { verifyAccessToken } from '../services/tokens.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Please log in to continue', code: 'AUTH_REQUIRED' });
  }

  try {
    const payload = verifyAccessToken(header.slice(7));
    req.user = { userId: payload.userId, username: payload.username, role: payload.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Access token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid access token', code: 'AUTH_REQUIRED' });
  }
}

export default authenticate;
