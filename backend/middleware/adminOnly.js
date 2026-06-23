/**
 * Requires `authenticate` middleware to have run first (req.user must be set).
 */
export function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

export default adminOnly;
