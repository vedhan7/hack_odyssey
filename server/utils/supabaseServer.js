const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables directly from the project root .env
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("[🔴 SUPABASE] Missing credentials in .env: VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

let supabaseAdmin = null;
if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  console.log("[🟢 SUPABASE] Admin client initialized successfully");
}

module.exports = { supabaseAdmin };
