import React, { useState } from 'react';
import { ShieldCheck, FileText, UploadCloud, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import CertPDFExport from '../components/CertPDFExport';

export default function VerifyPortal() {
  const [file, setFile] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
    } else {
      toast.error('Please upload a valid PDF document.');
    }
  };

  const handleVerify = async () => {
    if (!file) return toast.error("Please select a document first.");

    setVerifying(true);
    setResult(null);
    const toastId = toast.loading("Sending to secure backend for cryptographic validation...");

    const formData = new FormData();
    formData.append('document', file);

    // In production (Vercel), we use relative paths (''). In local dev, we hit the Express server.
    const API_URL = import.meta.env.PROD ? "" : "http://localhost:3001";
    try {
      const res = await fetch(`${API_URL}/api/verify`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        toast.dismiss(toastId);
        setResult(data);
      } else {
        toast.error(data.error || "Verification engine error", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error connecting to verification engine.", { id: toastId });
    } finally {
      setVerifying(false);
    }
  };

  const resetVerification = () => {
    setResult(null);
    setFile(null);
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen flex flex-col items-center justify-center">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-accent/20 rounded-full mb-6 relative">
          <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping opacity-50"></div>
          <ShieldCheck className="w-12 h-12 text-accent relative z-10" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-white">Public Verification Portal</h1>
        <p className="text-muted text-lg">
          Upload any certificate PDF. The backend engine will compute its SHA-256 signature natively and cross-reference the authoritative issuer database.
        </p>
      </div>

      {result ? (
        <div id="result-badge" className={`glass-card p-10 rounded-2xl w-full max-w-xl mx-auto border-2 shadow-[0_0_40px_rgba(0,0,0,0.2)] relative overflow-hidden text-center ${result.isValid ? 'border-success bg- सफलता/5 shadow-success/10' : 'border-danger bg-danger/5 shadow-danger/10'}`}>
          
          {result.isValid ? (
            <>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-success/20 rounded-full blur-[100px] pointer-events-none"></div>
              <div className="bg-success/20 p-5 rounded-full mb-6 mx-auto w-max">
                <ShieldCheck className="w-20 h-20 text-success" />
              </div>
              <h2 className="text-4xl font-black text-success mb-2 drop-shadow-sm">Original Certificate</h2>
              <p className="text-muted text-lg font-medium mb-8">This document exactly matches the cryptographic signature uploaded by the authorized institution.</p>
              
              <div className="bg-[#0a0f1d] p-6 rounded-xl border border-slate-700 text-left mb-6">
                 <p className="text-xs text-muted uppercase tracking-widest mb-1">Authenticated Metadata</p>
                 <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-muted uppercase">Student</p>
                      <p className="font-bold text-white">{result.data.student_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted uppercase">Course / Degree</p>
                      <p className="font-bold text-white">{result.data.course_name}</p>
                    </div>
                 </div>
              </div>

              <div className="flex justify-center mb-8">
                <CertPDFExport certificate={result.data} />
              </div>
            </>
          ) : (
            <>
              <div className="bg-danger/20 p-5 rounded-full mb-6 mx-auto w-max">
                <XCircle className="w-20 h-20 text-danger" />
              </div>
              <h2 className="text-4xl font-black text-danger mb-2">Invalid or Tampered</h2>
              <p className="text-danger/80 font-medium mb-8">The cryptographic signature of this file does not exist in our institutional database. It may have been altered.</p>
            </>
          )}

          <button 
            onClick={resetVerification}
            className="text-muted hover:text-white underline text-sm transition-colors font-medium"
          >
            Verify Another Document
          </button>
        </div>
      ) : (
        <div className="glass-card max-w-xl w-full mx-auto rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border-3 ${file ? 'border-solid border-accent bg-accent/5' : 'border-dashed border-slate-600 hover:border-slate-500 bg-surface/50'} rounded-2xl p-12 text-center transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[300px]`}
          >
            <input 
              type="file" 
              id="pdf-upload" 
              className="hidden" 
              accept="application/pdf" 
              onChange={(e) => setFile(e.target.files[0])} 
            />
            
            <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center w-full h-full">
              {file ? (
                <>
                  <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mb-6">
                    <FileText className="w-10 h-10 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{file.name}</h3>
                  <p className="text-muted text-sm border border-slate-700 px-3 py-1 rounded w-max">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                  </p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-slate-800 group-hover:bg-slate-700 rounded-full flex items-center justify-center mb-6 transition-colors shadow-inner">
                    <UploadCloud className="w-10 h-10 text-muted group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Drag & drop certificate</h3>
                  <p className="text-muted text-sm mb-6">or click to browse local files</p>
                  <p className="text-xs text-muted uppercase tracking-widest font-bold">PDF Only • Max 10MB</p>
                </>
              )}
            </label>
          </div>

          <button
            onClick={handleVerify}
            disabled={verifying || !file}
            className="w-full mt-6 flex items-center justify-center gap-2 py-4 bg-accent hover:bg-accent-glow text-white rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:hover:bg-accent"
          >
            {verifying ? (
              <span className="animate-spin h-6 w-6 border-3 border-white border-t-transparent rounded-full" />
            ) : (
              "Run Cryptographic Verification"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
