import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, FileCheck } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * CertPDFExport Component
 * Renders a hidden certificate template and provides a button to export it to PDF.
 */
const CertPDFExport = ({ certificate }) => {
  const certificateRef = useRef(null);

  const handleDownload = async () => {
    if (!certificate) return;
    
    const toastId = toast.loading("Generating secure PDF...");
    
    try {
      const element = certificateRef.current;
      // Temporarily show the hidden element for capturing
      element.style.display = 'block';
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificate-${certificate.id}.pdf`);
      
      element.style.display = 'none';
      toast.success("Certificate downloaded!", { id: toastId });
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error("Failed to generate PDF", { id: toastId });
    }
  };

  return (
    <>
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-glow text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-accent/20"
      >
        <Download className="w-5 h-5" />
        Download Secure PDF
      </button>

      {/* Hidden Template for PDF Generation */}
      <div 
        ref={certificateRef} 
        style={{ 
          display: 'none', 
          width: '800px', 
          padding: '60px', 
          background: '#0f172a',
          color: 'white',
          fontFamily: 'sans-serif',
          position: 'fixed',
          top: '-9999px',
          left: '-9999px'
        }}
      >
        <div style={{ border: '8px solid #3b82f6', padding: '40px', textAlign: 'center', borderRadius: '12px', borderStyle: 'double' }}>
           <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center' }}>
             <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '20px', borderRadius: '50%' }}>
               <FileCheck size={60} color="#3b82f6" />
             </div>
           </div>
           
           <h1 style={{ fontSize: '48px', fontWeight: 'bold', margin: '0 0 10px 0', color: 'white' }}>CERTIFICATE</h1>
           <p style={{ fontSize: '18px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '40px' }}>Of Achievement</p>
           
           <p style={{ fontSize: '18px', color: '#94a3b8', marginBottom: '10px' }}>This is to certify that</p>
           <h2 style={{ fontSize: '42px', fontWeight: 'bold', margin: '0 0 40px 0', color: '#3b82f6' }}>{certificate.student_name}</h2>
           
           <p style={{ fontSize: '18px', color: '#94a3b8', marginBottom: '10px' }}>has successfully completed</p>
           <h3 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 50px 0' }}>{certificate.course_name}</h3>
           
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '60px', textAlign: 'left' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', margin: '0 0 5px 0' }}>Issue Date</p>
                <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{new Date(certificate.issue_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', margin: '0 0 5px 0' }}>Certificate ID</p>
                <p style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'monospace' }}>{certificate.id}</p>
              </div>
           </div>
           
           <div style={{ marginTop: '80px', borderTop: '1px solid #1e293b', paddingTop: '30px' }}>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>Cryptographically Verified Signature (SHA-256)</p>
              <p style={{ fontSize: '11px', color: '#3b82f6', fontFamily: 'monospace', wordBreak: 'break-all', opacity: 0.8 }}>{certificate.file_hash}</p>
           </div>
        </div>
      </div>
    </>
  );
};

export default CertPDFExport;
