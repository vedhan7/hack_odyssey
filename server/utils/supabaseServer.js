const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("[⚠️ SUPABASE] Warning: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Backend write operations will fail.");
}

const supabaseAdmin = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

if (supabaseAdmin) {
  console.log("[🟢 SUPABASE] Admin client initialized");
}

module.exports = { supabaseAdmin };
