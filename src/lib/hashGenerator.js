import CryptoJS from 'crypto-js';

/**
 * Generates a SHA-256 hash matching the on-chain requirement: ID -> Hash + CID + Issuer + Time
 * We hash the core payload that proves authenticity.
 */
export const generateCertificateHash = ({
  studentName,
  degree,
  institution,
  dateIssued,
  cgpa
}) => {
  // We use a strict deterministic format for hashing.
  // Any change in casing, spacing, or date format will completely change the hash.
  const payloadStr = JSON.stringify({
    name: studentName.trim(),
    degree: degree.trim(),
    institution: institution.trim(),
    date: dateIssued.trim(),
    cgpa: cgpa.toString().trim()
  });

  return '0x' + CryptoJS.SHA256(payloadStr).toString(CryptoJS.enc.Hex);
};

/**
 * Checks if an on-chain hash matches the locally generated hash from data.
 */
export const verifyHashMatch = (onChainHash, dataObj) => {
  const localHash = generateCertificateHash(dataObj);
  return localHash.toLowerCase() === onChainHash.toLowerCase();
};

export const generateHash = generateCertificateHash;
