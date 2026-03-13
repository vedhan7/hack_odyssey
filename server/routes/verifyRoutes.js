const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { generateFileHash } = require('../utils/hashUtils');
const { supabaseAdmin } = require('../utils/supabaseServer');

const router = express.Router();

// --------------------------------------------------------------------------
// MULTER SETUP - Stores files temporarily, we delete them after hashing
// --------------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/verification_temps/');
  },
  filename: (req, file, cb) => {
    cb(null, 'temp-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// --------------------------------------------------------------------------
// [PUBLIC] VERIFY CERTIFICATE
// --------------------------------------------------------------------------
router.post('/', upload.single('document'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'No document provided for verification.' });
    }

    // 1. Compute EXACT hash of the candidate PDF
    const candidateHash = await generateFileHash(file.path);

    // 2. Query REAL Supabase Database for an EXACT match on `file_hash`
    const { data: record, error: dbError } = await supabaseAdmin
      .from('certificates')
      .select('*')
      .eq('file_hash', candidateHash)
      .single();

    const isMatch = !!record;
    
    // Clean up: delete the temporary uploaded file immediately for security
    fs.unlink(file.path, (err) => {
      if (err) console.error("Failed to clean up temp file:", err);
    });

    if (dbError && dbError.code !== 'PGRST116') { // PGRST116 is "not found", which is fine
       console.error("Database Query Error:", dbError);
       return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }

    if (isMatch) {
      return res.status(200).json({
        success: true,
        isValid: true,
        message: 'Original Certificate Verified via Supabase',
        data: record
      });
    } else {
      return res.status(200).json({
        success: true,
        isValid: false,
        message: 'Invalid or Tampered Document',
        data: null
      });
    }

  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
