import { generateCertificateHash } from './hashGenerator';
import { supabase } from './supabase';

/**
 * Validates the raw input data from the Institution Portal
 * before sending it to the blockchain or database.
 */
export const validateCertificateData = (data) => {
  const errors = [];
  
  if (!data.studentName || data.studentName.trim().length < 3) {
    errors.push("Valid student name is required.");
  }
  
  if (!data.studentEmail || !/^\S+@\S+\.\S+$/.test(data.studentEmail)) {
    errors.push("Valid student email is required.");
  }
  
  if (!data.studentWallet || !/^0x[a-fA-F0-9]{40}$/.test(data.studentWallet)) {
    errors.push("Valid Ethereum wallet address is required.");
  }
  
  if (!data.degree || data.degree.trim() === '') {
    errors.push("Degree name is required.");
  }
  
  if (!data.institution || data.institution.trim() === '') {
    errors.push("Institution name is required.");
  }
  
  if (!data.dateIssued || isNaN(new Date(data.dateIssued).getTime())) {
    errors.push("Valid issue date is required.");
  }
  
  if (!data.cgpa || isNaN(parseFloat(data.cgpa))) {
    errors.push("Valid CGPA is required.");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Prepares the payload for the blockchain (hash) and Supabase
 */
export const prepareCertificatePayload = (data) => {
  const hash = generateCertificateHash({
    studentName: data.studentName,
    degree: data.degree,
    institution: data.institution,
    dateIssued: data.dateIssued,
    cgpa: data.cgpa
  });

  return {
    ...data,
    certHash: hash
  };
};
