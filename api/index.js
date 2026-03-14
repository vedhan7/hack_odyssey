const express = require('express');
const cors = require('cors');

// Provide a dummy require for Supabase credentials since Vercel automatically injects env variables
require('dotenv').config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CertChain Vercel API running' });
});

// Import backend routes
const adminRoutes = require('../server/routes/adminRoutes');
const verifyRoutes = require('../server/routes/verifyRoutes');

app.use('/api/admin', adminRoutes);
app.use('/api/verify', verifyRoutes);

// Export the app for Vercel Serverless Functions
module.exports = app;
