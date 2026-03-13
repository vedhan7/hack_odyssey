const crypto = require('crypto');
const fs = require('fs');

/**
 * Reads a file from disk and computes its SHA-256 hash using Node's native crypto module.
 * This ensures the signature generation happens EXCLUSIVELY on the secure backend.
 * 
 * @param {string} filePath - Absolute path to the uploaded file to hash
 * @returns {Promise<string>} The SHA-256 hex string "0x..."
 */
const generateFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    // We use a stream to map the exact bytes of the file, not just text data.
    // This guarantees an exact cryptographic match for verifying certificates natively.
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('error', err => reject(err));
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => {
      // Preface with 0x for standard blockchain formatting
      const hex = '0x' + hash.digest('hex');
      resolve(hex);
    });
  });
};

module.exports = {
  generateFileHash
};
