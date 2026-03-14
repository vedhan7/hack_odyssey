const jwt = require('jsonwebtoken');

// Hardcoded admin token that matches the frontend
const HARDCODED_ADMIN_TOKEN = 'admin-hardcoded-token';
const HARDCODED_ADMIN = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'vedhanmail@gmail.com',
  institution: 'Hack Odyssey University'
};

/**
 * Middleware to verify that the incoming request has a valid Admin token.
 * Accepts both the hardcoded admin token and valid JWTs.
 */
const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid token format' });
  }

  const token = authHeader.split(' ')[1];

  // Accept hardcoded admin token
  if (token === HARDCODED_ADMIN_TOKEN) {
    req.admin = HARDCODED_ADMIN;
    return next();
  }

  // Fallback: try JWT verification
  try {
    const secret = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    req.admin = {
      id: decoded.sub,
      email: decoded.email,
      ...decoded
    };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired token' });
  }
};

module.exports = {
  verifyAdminToken
};
