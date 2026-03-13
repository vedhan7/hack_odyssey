import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase Environment Variables: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
  console.error("Please configure your .env file.");
}

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
