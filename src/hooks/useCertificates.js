import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './useWallet';
import { getStudentCertificates } from '../lib/blockchain';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function useCertificates() {
  const { account, provider } = useWallet();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCertificates = useCallback(async () => {
    if (!account || !provider) return;
    
    setLoading(true);
    try {
      // 1. Fetch from Blockchain (Source of Truth) to get IDs owned by student
      const certIds = await getStudentCertificates(provider, account);
      
      if (!certIds || certIds.length === 0) {
        setCertificates([]);
        setLoading(false);
        return;
      }
      
      // Convert BigInts to Strings for Supabase querying
      const idsAsString = certIds.map(id => id.toString());

      // 2. Hydrate metadata from Supabase
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          chain_id,
          cert_hash,
          ipfs_cid,
          tx_hash,
          student_name,
          degree,
          cgpa,
          date_issued,
          status,
          institutions ( name, logo_url )
        `)
        .in('chain_id', idsAsString);
        
      if (error) throw error;
      
      setCertificates(data || []);
      
    } catch (err) {
      console.error("Error fetching student certificates:", err);
      // Fallback for mocked environment without DB populated yet
      if (err.message.includes('relation "public.certificates" does not exist')) {
         toast.error("Database tables not yet migrated.");
      } else {
         toast.error("Failed to load certificates from blockchain.");
      }
    } finally {
      setLoading(false);
    }
  }, [account, provider]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  return { certificates, loading, refresh: fetchCertificates };
}
