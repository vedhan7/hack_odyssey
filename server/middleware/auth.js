const jwt = require('jsonwebtoken');

/**
 * Middleware to verify that the incoming request has a valid Admin JWT token.
 * Prevents unauthorized users from issuing certificates.
 */
const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid token format' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // In Supabase, the JWT secret is usually the same as the SUPABASE_JWT_SECRET
    // For this backend, we verify the token against the JWT_SECRET provided in the .env
    const secret = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    
    // Attach the decoded user data (e.g., sub/id and email)
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
