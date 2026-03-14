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
  origin: true, // Specifically allow the origin that is making the request
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
