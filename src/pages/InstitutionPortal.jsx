import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { ShieldAlert, BookOpen, Layers } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import IssueCertForm from '../components/IssueCertForm';
import BatchUpload from '../components/BatchUpload';
import { supabase } from '../lib/supabase';
import { revokeCertificateOnChain } from '../lib/blockchain';
import toast from 'react-hot-toast';

export default function InstitutionPortal() {
  const { account, signer } = useWallet();
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('issue');
  const [stats, setStats] = useState({ total: 0, active: 0, revoked: 0 });
  const [issuedCerts, setIssuedCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) loadStats(session.user.id);
    });
  }, []);

  // In a fully deployed version with backend, we would load from Supabase here
  const loadStats = async (userId) => {
    try {
      if (!userId) return;
      
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('issuer_id', userId);
        
      if (data) {
        setIssuedCerts(data);
        setStats({
          total: data.length,
          active: data.filter(c => !c.is_revoked).length,
          revoked: data.filter(c => c.is_revoked).length,
        });
      }
    } catch (err) {
      console.warn("Table might not exist yet:", err);
    }
  };

  useEffect(() => {
    loadStats();
  }, [account, activeTab]);

  const handleRevoke = async (cert) => {
    if (!confirm(`Are you sure you want to revoke certificate #${cert.chain_id}? This blockchain action cannot be undone.`)) return;
    
    setLoading(true);
    const toastId = toast.loading(`Revoking Certificate #${cert.chain_id}...`);
    try {
      await revokeCertificateOnChain(signer, cert.chain_id);
      
      // Update DB
      await supabase
        .from('certificates')
        .update({ is_revoked: true })
        .eq('id', cert.id);
        
      toast.success("Certificate revoked successfully.", { id: toastId });
      loadStats(session.user.id);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to revoke certificate.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Institution Dashboard</h1>
          <p className="text-muted mt-1">Manage and issue immutable credentials</p>
        </div>
        
        {account && (
          <div className="flex bg-surface p-1 rounded-xl border border-slate-700">
            <button 
              onClick={() => setActiveTab('issue')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'issue' ? 'bg-accent text-white' : 'text-muted hover:text-white'}`}
            >
              Issue Single
            </button>
            <button 
              onClick={() => setActiveTab('batch')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'batch' ? 'bg-accent text-white' : 'text-muted hover:text-white'}`}
            >
              Batch Upload
            </button>
            <button 
              onClick={() => setActiveTab('manage')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'manage' ? 'bg-accent text-white' : 'text-muted hover:text-white'}`}
            >
              Manage & Revoke
            </button>
          </div>
        )}
      </div>

      {!account ? (
        <div className="glass-card p-12 text-center rounded-2xl">
          <ShieldAlert className="w-16 h-16 text-warning mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-muted max-w-md mx-auto">
            You must connect your institution's authorized MetaMask wallet to access the dashboard and issue certificates on the Polygon blockchain.
          </p>
        </div>
      ) : (
        <>
          {/* KPI Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard title="Total Certificates" value={stats.total} icon={<Layers className="w-6 h-6" />} colorClass="text-accent" />
            <StatsCard title="Active & Valid" value={stats.active} icon={<BookOpen className="w-6 h-6" />} colorClass="text-success" />
            <StatsCard title="Revoked" value={stats.revoked} icon={<ShieldAlert className="w-6 h-6" />} colorClass="text-danger" />
          </div>

          {/* Dynamic Content Area */}
          <div className="animate-fade-in">
            {activeTab === 'issue' && <IssueCertForm onIssueSuccess={loadStats} />}
            {activeTab === 'batch' && <BatchUpload />}
            {activeTab === 'manage' && (
              <div className="glass-card p-6 rounded-2xl overflow-x-auto">
                <h2 className="text-xl font-bold mb-6">Manage Issued Certificates</h2>
                {issuedCerts.length === 0 ? (
                  <p className="text-muted text-center py-8">No certificates found. Issue one first!</p>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-muted border-b border-slate-800">
                        <th className="pb-3 font-medium">ID</th>
                        <th className="pb-3 font-medium">Student</th>
                        <th className="pb-3 font-medium">Degree</th>
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {issuedCerts.map((cert) => (
                        <tr key={cert.id} className="border-b border-slate-800/50">
                          <td className="py-4 font-mono text-sm">#{cert.id.substring(0, 8)}</td>
                          <td className="py-4">{cert.student_name}</td>
                          <td className="py-4">{cert.course_name}</td>
                          <td className="py-4 text-sm text-muted">{new Date(cert.issue_date).toLocaleDateString()}</td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${!cert.is_revoked ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                              {!cert.is_revoked ? 'ACTIVE' : 'REVOKED'}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            {!cert.is_revoked && (
                              <button 
                                onClick={() => handleRevoke(cert)}
                                disabled={loading}
                                className="text-xs font-bold text-danger hover:text-white hover:bg-danger px-3 py-1 rounded border border-danger transition-colors disabled:opacity-50"
                              >
                                REVOKE
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
