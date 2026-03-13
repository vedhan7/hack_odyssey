import { useState } from 'react';
import { verifyCertificateOnChain } from '../lib/blockchain';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function useVerify() {
  const [result, setResult] = useState(null); // { valid: bool, data: obj, error: str }
  const [loading, setLoading] = useState(false);

  const verifyByHash = async (hash) => {
    if (!hash || hash.length !== 66 || !hash.startsWith('0x')) {
      toast.error("Invalid SHA-256 Hash format. Must be 66 characters hex starting with 0x");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // 1. Query Blockchain for cryptographically verified truth
      const onChainData = await verifyCertificateOnChain(hash);

      if (!onChainData.isValid) {
        setResult({ valid: false, error: "CERTIFICATE NOT FOUND OR REVOKED ON POLYGON." });
        return;
      }

      // 2. Fetch rich metadata from Supabase
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          chain_id,
          student_name,
          degree,
          cgpa,
          date_issued,
          institutions ( name, logo_url )
        `)
        .eq('chain_id', onChainData.id.toString())
        .single();
        
      if (error && !error.message.includes('No rows')) {
         console.warn("DB miss", error);
      }

      // 3. Set verified result
      setResult({
        valid: true,
        chainData: onChainData,
        dbData: data || null
      });
      
      toast.success("Certificate Cryptographically Verified!");

    } catch (error) {
      console.error(error);
      setResult({ valid: false, error: "Network Error: Could not reach Polygon Amoy." });
      toast.error("Verification failed due to network error.");
    } finally {
      setLoading(false);
    }
  };

  const resetVerification = () => setResult(null);

  return { verifyByHash, result, loading, resetVerification };
}
