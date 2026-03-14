import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase Environment Variables: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
  console.error("Please configure your .env file.");
}

// Initialize the Supabase client safely
// Using 'implicit' flow for client-side SPAs (no server-side code exchange needed)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'implicit'
      }
    })
  : { 
      auth: { 
        getSession: async () => ({ data: { session: null } }), 
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithOAuth: async () => ({ error: new Error("Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.") }),
        signOut: async () => ({})
      },
      from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }), update: () => ({ eq: () => ({ eq: () => ({}) }) }) }) })
    };
