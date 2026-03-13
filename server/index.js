require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
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
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CertChain Secure API running' });
});

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const verifyRoutes = require('./routes/verifyRoutes');

// Routes Attached
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/verify', verifyRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`[🚀 SERVER] CertChain Backend running on port ${PORT}`);
});
