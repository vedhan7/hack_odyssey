import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { useCertificates } from '../hooks/useCertificates';
import CertificateCard from '../components/CertificateCard';
import CertPDFExport from '../components/CertPDFExport';
import { GraduationCap, ShieldAlert, RefreshCw } from 'lucide-react';

export default function StudentWallet() {
  const { account } = useWallet();
  const { certificates, loading, refresh } = useCertificates();

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-accent" />
            My Credentials
          </h1>
          <p className="text-muted mt-2">Your tamper-proof, blockchain-verified academic history.</p>
        </div>
        
        {account && (
          <button 
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Chain
          </button>
        )}
      </div>

      {!account ? (
        <div className="glass-card p-12 text-center rounded-2xl max-w-2xl mx-auto">
          <ShieldAlert className="w-16 h-16 text-warning mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-muted mx-auto mb-6">
            You must connect your MetaMask wallet to prove ownership and access your Soulbound Certificates.
          </p>
          <p className="text-xs text-muted font-mono">
            Network: Polygon Amoy Testnet (Chain ID 80002)
          </p>
        </div>
      ) : loading && certificates.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-accent border-t-transparent rounded-full"></div>
        </div>
      ) : certificates.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl max-w-3xl mx-auto border-dashed border-2 border-slate-700">
          <GraduationCap className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Certificates Found</h2>
          <p className="text-muted mx-auto">
            We couldn't find any Soulbound Tokens (SBTs) linked to your wallet address ({account.substring(0,6)}...{account.substring(account.length-4)}) on the Polygon Amoy network. Ensure your institution has issued your credential to this exact address.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8 animate-fade-in-up">
          {certificates.map((cert) => (
            <CertificateCard key={cert.chain_id} cert={cert} />
          ))}
        </div>
      )}
    </div>
  );
}
