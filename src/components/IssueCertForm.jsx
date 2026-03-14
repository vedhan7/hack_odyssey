import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Upload, ShieldCheck, FileText } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { validateCertificateData, prepareCertificatePayload } from '../lib/certificates';
import { issueCertificateOnChain } from '../lib/blockchain';
import { uploadFileToIPFS, uploadJSONToIPFS } from '../lib/ipfs';
import { supabase } from '../lib/supabase';

export default function IssueCertForm({ onIssueSuccess }) {
  const { account, signer } = useWallet();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  
  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    studentWallet: '',
    degree: 'B.Tech',
    institution: 'Institution Name', 
    dateIssued: new Date().toISOString().split('T')[0],
    cgpa: '',
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!account || !signer) return toast.error("Connect MetaMask to issue certificates.");
    if (!file) return toast.error("Please upload the PDF certificate.");

    const validation = validateCertificateData(formData);
    if (!validation.isValid) {
      validation.errors.forEach(err => toast.error(err));
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("1. Uploading PDF to IPFS...");

    try {
      // 1. Upload PDF to IPFS
      const pdfCID = await uploadFileToIPFS(file);
      
      toast.loading("2. Uploading SBT Metadata to IPFS...", { id: loadingToast });
      // Upload SBT Metadata to IPFS
      const sbtMetadata = {
        name: `Certificate for ${formData.studentName}`,
        description: `${formData.degree} issued by ${formData.institution}`,
        image: `ipfs://${pdfCID}`,
        attributes: [
          { trait_type: "Degree", value: formData.degree },
          { trait_type: "CGPA", value: formData.cgpa },
          { trait_type: "Issue Date", value: formData.dateIssued }
        ]
      };
      const metadataURI = await uploadJSONToIPFS(sbtMetadata);

      // 2. Prepare Payload (generate SHA-256 Hash)
      toast.loading("3. Generating deterministic SHA-256 hash...", { id: loadingToast });
      const payload = prepareCertificatePayload(formData);

      // 3. Issue on Blockchain
      toast.loading("4. Please confirm transaction in MetaMask...", { id: loadingToast });
      const txResult = await issueCertificateOnChain(
        signer, 
        payload.certHash, 
        pdfCID, 
        payload.studentWallet,
        metadataURI
      );

      // 4. Save to Database - Synchronize with blockchain record
      toast.loading("5. Sealing metadata in database...", { id: loadingToast });
      const { error: dbError } = await supabase.from('certificates').insert({
        id: "CRT-SBT-" + txResult.certId, // Using the blockchain ID as part of the DB ID
        student_name: payload.studentName,
        course_name: payload.degree,
        issue_date: payload.dateIssued,
        issuer_id: session?.user?.id, // Capture the logged-in institution ID
        file_hash: payload.certHash,
        ipfs_hash: pdfCID,
        is_revoked: false
      });

      // Ignore DB errors in mock environments, but log them
      if (dbError) console.warn("Supabase DB not configured for insert:", dbError);

      toast.success(`Cert #${txResult.certId} fully sealed on Polygon!`, { id: loadingToast });
      if (onIssueSuccess) onIssueSuccess();

      // Reset form
      setFile(null);
      setFormData({ ...formData, studentName: '', studentEmail: '', studentWallet: '', cgpa: '' });

    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to issue certificate", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 rounded-2xl w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ShieldCheck className="text-accent" /> Issue Single Certificate
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Student Name</label>
            <input 
              type="text" name="studentName" value={formData.studentName} onChange={handleChange}
              className="w-full bg-surface border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent" required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Student Email</label>
            <input 
              type="email" name="studentEmail" value={formData.studentEmail} onChange={handleChange}
              className="w-full bg-surface border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent" required 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-muted mb-2">Student MetaMask Wallet</label>
            <input 
              type="text" name="studentWallet" value={formData.studentWallet} onChange={handleChange}
              placeholder="0x..."
              className="w-full bg-surface border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent" required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Degree</label>
            <input 
              type="text" name="degree" value={formData.degree} onChange={handleChange}
              className="w-full bg-surface border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent" required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">CGPA</label>
            <input 
              type="number" step="0.01" name="cgpa" value={formData.cgpa} onChange={handleChange}
              className="w-full bg-surface border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent" required 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Upload Certificate PDF</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-700 border-dashed rounded-lg hover:border-accent transition-colors">
            <div className="space-y-1 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted" />
              <div className="flex text-sm text-muted justify-center">
                <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-accent hover:text-accent-glow focus-within:outline-none">
                  <span>Upload a file</span>
                  <input type="file" className="sr-only" accept="application/pdf" onChange={handleFileChange} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-muted">PDF up to 10MB</p>
              {file && <p className="text-sm text-success mt-2">Selected: {file.name}</p>}
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || !account}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent to-purple-600 hover:from-accent-glow hover:to-purple-500 py-3 rounded-xl font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              Issue & Seal on Blockchain
            </>
          )}
        </button>
      </form>
    </div>
  );
}
