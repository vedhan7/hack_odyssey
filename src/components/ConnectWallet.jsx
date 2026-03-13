import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { Wallet } from 'lucide-react';

export default function ConnectWallet({ className = "" }) {
  const { account, isConnecting, connectWallet, formatAddress } = useWallet();

  if (account) {
    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-medium ${className}`}>
        <div className="w-2 h-2 rounded-full bg-success"></div>
        {formatAddress(account)}
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-glow border border-transparent rounded-lg text-sm text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <Wallet className="w-4 h-4" />
      {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
    </button>
  );
}
