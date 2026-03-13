const express = require('express');
const multer = require('multer');
const path = require('path');
const { generateFileHash } = require('../utils/hashUtils');
const { verifyAdminToken } = require('../middleware/auth');
const { supabaseAdmin } = require('../utils/supabaseServer');
const router = express.Router();

// --------------------------------------------------------------------------
// MULTER SETUP - Stores files temporarily or permanently in `server/uploads/`
// --------------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/admin_originals/');
  },
  filename: (req, file, cb) => {
    // Unique name to avoid clashes
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// --------------------------------------------------------------------------
// [AUTH REQUIRED] UPLOAD ORIGINAL CERTIFICATE
// --------------------------------------------------------------------------
router.post('/upload', verifyAdminToken, upload.single('document'), async (req, res) => {
  try {
    const file = req.file;
    const { studentName, degree } = req.body;
    
    if (!file) {
      return res.status(400).json({ success: false, error: 'No document uploaded' });
    }

    // 1. Compute EXACT hash of the uploaded PDF using node's native crypto on the server
    const fileHash = await generateFileHash(file.path);

    // 2. Insert into REAL Supabase Database
    const certId = "CRT-" + new Date().getFullYear() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
    
    const { data: dbRecord, error: dbError } = await supabaseAdmin
      .from('certificates')
      .insert([{
        id: certId,
        student_name: studentName || "Unknown",
        course_name: degree || "N/A",
        issue_date: new Date().toISOString().split('T')[0],
        issuer_id: req.admin.id,
        file_hash: fileHash,
        ipfs_hash: null, // To be updated if Pinata is used
        chained_hash: null // Chaining will be implemented in Phase 4
      }])
      .select()
      .single();

    if (dbError) {
      console.error("Database Insert Error:", dbError);
      return res.status(500).json({ success: false, error: 'Database capture failed' });
    }

    // Return the response
    res.status(201).json({
      success: true,
      message: 'Original document securely hashed and stored in Supabase.',
      record: dbRecord
    });
    
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// --------------------------------------------------------------------------
// [AUTH REQUIRED] GET ALL CERTIFICATES
// --------------------------------------------------------------------------
router.get('/certificates', verifyAdminToken, async (req, res) => {
  const { data: certificates, error } = await supabaseAdmin
    .from('certificates')
    .select('*')
    .eq('issuer_id', req.admin.id)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch certificates' });
  }

  res.json({ success: true, certificates });
});

module.exports = router;
