import React, { useRef } from 'react';
import { Download, Share2, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import QRGenerator from './QRGenerator';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

export default function CertificateCard({ cert }) {
  const printRef = useRef();

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    if (!element) return;
    
    const toastId = toast.loading("Generating High-Res PDF...");
    try {
      const canvas = await html2canvas(element, { scale: 3, useCORS: true });
      const data = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(data, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`CertChain_${cert.student_name}_${cert.course_name}.pdf`);
      toast.success("PDF Downloaded!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF", { id: toastId });
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/verify?hash=${cert.file_hash}`;
    navigator.clipboard.writeText(url);
    toast.success("Verification link copied to clipboard!");
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-2xl border border-slate-700 hover:border-accent transition-colors relative group">
      
      {/* Visual representation of the Certificate */}
      <div 
        ref={printRef}
        className="relative bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] p-8 min-h-[350px] flex flex-col justify-center items-center text-center border-b border-slate-800"
      >
        {/* Holographic Watermark Effect */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-accent/5 to-transparent pointer-events-none"></div>

        <div className="relative z-10 w-full">
          <h2 className="text-3xl font-bold tracking-widest text-[#e2e8f0] uppercase mb-2">Certificate of Completion</h2>
          <div className="w-16 h-1 bg-accent mx-auto mb-8 rounded-full"></div>
          
          <p className="text-muted text-sm uppercase tracking-widest mb-2">This certifies that</p>
          <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-6 drop-shadow-sm">
            {cert.student_name}
          </h3>
          
          <p className="text-muted text-sm uppercase tracking-widest mb-2">has successfully completed the degree of</p>
          <h4 className="text-2xl font-bold text-white mb-8">{cert.course_name}</h4>
          
          <div className="flex justify-between items-end w-full px-8 mt-12">
            <div className="text-left">
              <p className="text-xs text-muted uppercase tracking-widest mb-1">Date of Issue</p>
              <p className="font-mono text-white">{new Date(cert.issue_date).toLocaleDateString()}</p>
            </div>
            
            {/* The Verification QR is embedded right on the printable certificate */}
            <div className="bg-white/90 p-2 rounded-xl">
               <QRGenerator value={`${window.location.origin}/verify?hash=${cert.file_hash}`} size={80} title="" />
            </div>

            <div className="text-right">
              <p className="text-xs text-muted uppercase tracking-widest mb-1">Grade / CGPA</p>
              <p className="font-mono text-emerald-400 font-bold text-lg">{cert.cgpa}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata & Actions (Not exported to PDF) */}
      <div className="p-6 bg-surface">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-xs text-muted uppercase font-bold tracking-wider mb-1">Blockchain Verification</p>
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${!cert.is_revoked ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                {!cert.is_revoked ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {!cert.is_revoked ? 'ACTIVE' : 'REVOKED'}
              </span>
              <a 
                href={`https://amoy.polygonscan.com/tx/${cert.tx_hash}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-accent hover:text-accent-glow text-xs flex items-center gap-1"
              >
                PolygonScan <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <div className="text-right">
             <p className="text-xs text-muted font-mono break-all w-32 truncate" title={cert.file_hash}>
                Hash: {cert.file_hash.substring(0, 10)}...
             </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-colors border border-slate-600"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button 
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-accent hover:bg-accent-glow text-white font-medium text-sm transition-colors border border-transparent"
          >
            <Share2 className="w-4 h-4" /> Share Link
          </button>
        </div>
      </div>

    </div>
  );
}
