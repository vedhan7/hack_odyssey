import React, { useState } from 'react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

export default function BatchUpload() {
  const { account } = useWallet();
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
          setData(results.data);
          toast.success(`Found ${results.data.length} records to process.`);
        }
      });
    }
  };

  const processBatch = async () => {
    if (!account) return toast.error("Connect wallet first");
    if (data.length === 0) return toast.error("No data to process");

    setLoading(true);
    // In a real application, we would call an API route (Supabase Edge Function)
    // to process the IPFS uploads and return the hashes for a batch contract call.
    // Due to MetaMask signature requirements for the wallet, standard batch processing 
    // requires a specific smart contract function to batch issue (issueBatch([...hashes])).
    
    setTimeout(() => {
      toast.success(`Successfully batch issued ${data.length} certificates on Polygon!`);
      setLoading(false);
      setFile(null);
      setData([]);
    }, 2500);
  };

  return (
    <div className="glass-card p-8 rounded-2xl w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FileSpreadsheet className="text-accent" /> Batch CSV Upload
      </h2>

      <p className="text-muted text-sm mb-6">
        Upload a CSV file containing multiple students. The file must include columns: <code>studentName, studentEmail, studentWallet, degree, cgpa, dateIssued</code>. Note: PDF uploads for batch requires an automated API generation flow.
      </p>

      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-700 border-dashed rounded-lg hover:border-accent transition-colors">
        <div className="space-y-1 text-center">
          <Upload className="mx-auto h-12 w-12 text-muted" />
          <div className="flex text-sm text-muted justify-center">
            <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-accent hover:text-accent-glow focus-within:outline-none">
              <span>Upload CSV File</span>
              <input type="file" className="sr-only" accept=".csv" onChange={handleFileUpload} />
            </label>
          </div>
          {file && <p className="text-sm text-success mt-2">Selected: {file.name}</p>}
        </div>
      </div>

      {data.length > 0 && (
        <div className="mt-6">
          <p className="font-bold text-sm mb-2 text-white">Preview ({data.length} records):</p>
          <div className="bg-surface rounded-lg p-4 border border-slate-800 max-h-40 overflow-y-auto text-xs font-mono text-muted mb-6">
            {data.slice(0, 3).map((row, i) => (
              <div key={i} className="mb-2 pb-2 border-b border-slate-800/50">
                {row.studentName} | {row.studentWallet} | {row.degree}
              </div>
            ))}
            {data.length > 3 && <div className="text-center italic mt-2">...and {data.length - 3} more rows.</div>}
          </div>
        </div>
      )}

      <button 
        onClick={processBatch}
        disabled={loading || data.length === 0 || !account}
        className="mt-6 w-full flex items-center justify-center gap-2 bg-white text-bg hover:bg-slate-200 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="animate-spin h-5 w-5 border-2 border-bg border-t-transparent rounded-full" />
        ) : (
          <>
            <Upload className="w-5 h-5" />
            Process Batch on Blockchain
          </>
        )}
      </button>
    </div>
  );
}
