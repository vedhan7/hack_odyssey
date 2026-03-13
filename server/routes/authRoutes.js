const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Mock Admin Credentials (In production, use Supabase Auth or bcrypt hashed passwords in DB)
const MOCK_ADMIN = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'admin@university.edu',
  password: 'password123', // Extremely insecure! Dev only.
  institution: 'Hack Odyssey University'
};

// --------------------------------------------------------------------------
// ADMIN LOGIN
// --------------------------------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate credentials
    if (email !== MOCK_ADMIN.email || password !== MOCK_ADMIN.password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Sign JWT
    const token = jwt.sign(
      { id: MOCK_ADMIN.id, email: MOCK_ADMIN.email, institution: MOCK_ADMIN.institution },
      process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      admin: { email: MOCK_ADMIN.email, institution: MOCK_ADMIN.institution }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
