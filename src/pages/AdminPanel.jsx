import React, { useState, useEffect } from 'react';
import { Shield, Key, Upload, FileText, CheckCircle, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Upload Form
  const [studentName, setStudentName] = useState('');
  const [degree, setDegree] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const sessionStr = localStorage.getItem('certchain_session');
    if (sessionStr) {
      const parsed = JSON.parse(sessionStr);
      setSession(parsed);
      fetchCertificates();
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('certchain_session');
    toast.success('Logged out');
    navigate('/login');
  };

  const fetchCertificates = async () => {
    const API_URL = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : 'http://localhost:3001';
    try {
      const res = await fetch(`${API_URL}/api/admin/certificates`, {
        headers: { 'Authorization': 'Bearer admin-hardcoded-token' }
      });
      const data = await res.json();
      if (data.success) setCertificates(data.certificates);
    } catch (err) {
      console.error("Failed to fetch ledger:", err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a PDF document");

    setUploading(true);
    const toastId = toast.loading("Uploading and securing document...");

    const formData = new FormData();
    formData.append('document', file);
    formData.append('studentName', studentName);
    formData.append('degree', degree);

    // If it's empty string we are on the same domain (Vercel)
    const API_URL = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : 'http://localhost:3001';
    
    try {
      const res = await fetch(`${API_URL}/api/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer admin-hardcoded-token'
        },
        body: formData
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success("Document hashed & stored successfully!", { id: toastId });
        setCertificates([...certificates, data.record]);
        setStudentName('');
        setDegree('');
        setFile(null);
        e.target.reset();
      } else {
        toast.error(data.error || "Upload failed", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error during upload.", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="pt-32 text-center text-muted">Loading secure session...</div>;
  }

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="w-8 h-8 text-danger" />
            Institution Control
          </h1>
          <p className="text-muted mt-1">Logged in as <span className="text-white font-medium">{session?.user?.email}</span></p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload Form */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 rounded-2xl border-t-4 border-accent sticky top-24">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Upload className="w-5 h-5 text-accent" /> Issue Certificate
            </h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Student Name</label>
                <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="w-full bg-surface border border-slate-700 rounded-xl px-4 py-3 text-sm text-white" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Degree / Program</label>
                <input type="text" value={degree} onChange={(e) => setDegree(e.target.value)} className="w-full bg-surface border border-slate-700 rounded-xl px-4 py-3 text-sm text-white" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Original PDF File</label>
                <div className="border-2 border-dashed border-slate-700 hover:border-accent bg-surface/50 rounded-xl p-4 text-center cursor-pointer relative transition-colors">
                  <input type="file" onChange={(e) => setFile(e.target.files[0])} accept="application/pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
                  {file ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle className="w-8 h-8 text-success mb-2" />
                      <span className="text-sm font-medium text-white break-all">{file.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <FileText className="w-8 h-8 text-muted mb-2" />
                      <span className="text-sm font-medium text-white mb-1">Click to attach PDF</span>
                      <span className="text-xs text-muted">The backend will compute the signature.</span>
                    </div>
                  )}
                </div>
              </div>
              <button type="submit" disabled={uploading} className="w-full bg-accent hover:bg-accent-glow text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex justify-center items-center mt-6">
                 {uploading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : "Secure & Issue"}
              </button>
            </form>
          </div>
        </div>

        {/* Issued Documents Ledger */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-2">Issued Documents Ledger</h2>
            <p className="text-sm text-muted mb-6">These documents have had their SHA-256 signatures stored on the secure backend.</p>

            {certificates.length === 0 ? (
              <div className="text-center py-12 border border-slate-700/50 border-dashed rounded-xl">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-muted">No documents issued yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-800">
                    <tr className="text-muted text-xs uppercase tracking-wider">
                      <th className="pb-3 font-medium">Student</th>
                      <th className="pb-3 font-medium">Degree</th>
                      <th className="pb-3 font-medium">Secure Hash (Backend)</th>
                      <th className="pb-3 font-medium text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {certificates.map((cert) => (
                      <tr key={cert.id}>
                        <td className="py-4 font-medium">{cert.student_name}</td>
                        <td className="py-4 text-sm text-muted">{cert.degree}</td>
                        <td className="py-4 font-mono text-xs text-accent">
                          <span className="bg-accent/10 px-2 py-1 rounded" title={cert.file_hash}>
                            {cert.file_hash.substring(0, 16)}...
                          </span>
                        </td>
                        <td className="py-4 text-sm text-right text-muted">{new Date(cert.issued_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
