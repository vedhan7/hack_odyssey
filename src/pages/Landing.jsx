import React from 'react';
import { ArrowRight, FileCheck2, Shield, Blocks } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-accent text-sm font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          Live on Polygon Amoy Testnet
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
          Verify Any Certificate in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">3 Seconds</span>. Guaranteed.
        </h1>
        
        <p className="text-xl text-muted mb-10 leading-relaxed">
          The zero-cost, tamper-proof credential layer for academic institutions.
          Blockchain-sealed, SHA-256 hashed, and IPFS stored.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/verify" className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-bg font-bold text-lg hover:bg-slate-200 transition-colors">
            Verify a Certificate <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/admin" className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-surface border border-slate-700 text-white font-bold text-lg hover:border-accent transition-colors">
            Admin Portal
          </Link>
        </div>
      </div>

      {/* Stats / Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-24">
        <FeatureCard 
          icon={<Shield className="w-8 h-8 text-emerald-400" />}
          title="100% Tamper Proof"
          desc="Mathematical certainty powered by SHA-256 and Soulbound Tokens."
        />
        <FeatureCard 
          icon={<Blocks className="w-8 h-8 text-blue-400" />}
          title="Zero Cost Operations"
          desc="Fully decentralized and completely free for Hack Odyssey 3.0."
        />
        <FeatureCard 
          icon={<FileCheck2 className="w-8 h-8 text-purple-400" />}
          title="Instant Verification"
          desc="Employers can verify credentials instantly via ID, Hash, or QR Code."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-6 rounded-2xl glass-card border border-slate-800 hover:border-slate-600 transition-colors">
      <div className="mb-4 bg-slate-800/50 w-14 h-14 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-muted leading-relaxed">{desc}</p>
    </div>
  );
}
