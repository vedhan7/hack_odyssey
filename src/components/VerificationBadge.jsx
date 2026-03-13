import React, { useEffect, useRef } from 'react';
import { ShieldCheck, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import gsap from 'gsap';

export default function VerificationBadge({ result, onReset }) {
  const badgeRef = useRef();

  useEffect(() => {
    // GSAP Animation for dramatic reveal
    if (badgeRef.current) {
      gsap.fromTo(badgeRef.current, 
        { scale: 0.8, opacity: 0, y: 30 }, 
        { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.7)" }
      );
    }
  }, [result]);

  if (!result) return null;

  if (!result.valid) {
    return (
      <div ref={badgeRef} className="glass-card p-8 rounded-2xl w-full max-w-2xl mx-auto border-2 border-danger shadow-[0_0_30px_rgba(239,68,68,0.3)] bg-danger/5">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="bg-danger/20 p-4 rounded-full mb-6">
            <XCircle className="w-16 h-16 text-danger" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Verification Failed</h2>
          <p className="text-danger font-medium mb-6">{result.error || "This certificate could not be verified on the blockchain."}</p>
          <button 
            onClick={onReset}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
          >
            Verify Another
          </button>
        </div>
      </div>
    );
  }

  // VALID RESULT
  const { chainData, dbData } = result;
  
  return (
    <div ref={badgeRef} className="glass-card p-8 rounded-2xl w-full max-w-2xl mx-auto border-2 border-success shadow-[0_0_30px_rgba(34,197,94,0.2)] relative overflow-hidden">
      {/* Success Confetti Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-success/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center text-center mb-8 pb-8 border-b border-slate-700">
        <div className="bg-success/20 p-4 rounded-full mb-4">
          <ShieldCheck className="w-16 h-16 text-success" />
        </div>
        <h2 className="text-3xl font-bold text-success mb-2">Cryptographically Verified</h2>
        <p className="text-muted text-sm">Seal matches the immutable record on Polygon Amoy Testnet.</p>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 mb-8">
        <div>
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Student</p>
          <p className="font-bold text-lg text-white">{dbData ? dbData.student_name : "Unknown / Anonymous"}</p>
        </div>
        <div>
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Degree / Credential</p>
          <p className="font-bold text-lg text-white">{dbData ? dbData.degree : "Unknown"}</p>
        </div>
        <div>
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Blockchain Hash</p>
          <p className="font-mono text-sm text-accent truncate" title={chainData.ipfsCID}>
            {chainData.ipfsCID.substring(0, 16)}...
          </p>
        </div>
        <div>
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Date Issued</p>
          <p className="text-white font-medium">
            {new Date(chainData.timestamp * 1000).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="relative z-10 flex justify-between items-center bg-slate-800/50 p-4 rounded-xl">
        <div className="flex items-center gap-2">
           <AlertTriangle className="w-4 h-4 text-accent" />
           <span className="text-xs text-muted font-medium">Blockchain Audit</span>
        </div>
        <a 
          href={`https://amoy.polygonscan.com/address/${chainData.issuer}`} 
          target="_blank" 
          rel="noreferrer"
          className="text-accent hover:text-white text-sm font-medium flex items-center gap-1 transition-colors"
        >
          View Issuer on Scan <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <div className="mt-8 text-center relative z-10">
        <button 
          onClick={onReset}
          className="text-muted hover:text-white underline text-sm transition-colors"
        >
          Verify Another Document
        </button>
      </div>
    </div>
  );
}
