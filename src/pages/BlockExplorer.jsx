import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database, Search, ArrowRight, ExternalLink } from 'lucide-react';

export default function BlockExplorer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('certificates')
          .select('chain_id, tx_hash, status, date_issued, institutions(name)')
          .order('date_issued', { ascending: false })
          .limit(50);
        
        if (data) setLogs(data);
      } catch (err) {
        console.warn("DB not ready:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.tx_hash?.toLowerCase().includes(search.toLowerCase()) || 
    log.chain_id?.toString().includes(search)
  );

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Database className="w-8 h-8 text-accent" />
            On-Chain Audit Log
          </h1>
          <p className="text-muted mt-2">View the immutable ledger of all certificates issued on the Polygon Amoy Testnet.</p>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Transaction Hash or Block ID..."
            className="block w-full pl-11 pr-4 py-3 bg-surface border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#1e293b]/50 border-b border-slate-800">
              <tr className="text-muted text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Network</th>
                <th className="px-6 py-4 font-medium">Tx Hash</th>
                <th className="px-6 py-4 font-medium">Block ID</th>
                <th className="px-6 py-4 font-medium">Issuer</th>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-muted">
                    <span className="animate-spin inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full mb-2"></span>
                    <p>Syncing ledger...</p>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-muted">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-xs font-bold text-purple-400 bg-purple-400/10 px-2 py-1 rounded w-max">
                         POLYGON AMOY
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">
                      <a 
                        href={`https://amoy.polygonscan.com/tx/${log.tx_hash}`} 
                        target="_blank" rel="noreferrer"
                        className="text-accent hover:text-white flex items-center gap-1 transition-colors"
                      >
                        {log.tx_hash?.substring(0, 14)}... <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-300">
                      {log.chain_id}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {log.institutions?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {new Date(log.date_issued).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 flex items-center gap-1 w-max rounded text-[10px] font-bold tracking-wider uppercase ${log.status === 'active' ? 'bg-success/20 text-success border border-success/30' : 'bg-danger/20 text-danger border border-danger/30'}`}>
                         {log.status === 'active' ? 'VERIFIED' : 'REVOKED'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
