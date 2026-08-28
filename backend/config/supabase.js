/**
 * Supabase Client Configuration
 * Server-side singleton client for PostgreSQL database operations
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_KEY;

let supabaseInstance = null;
let isConfigured = false;

if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http') && supabaseKey !== 'your_server_only_secret') {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    isConfigured = true;
    console.log('[Supabase Config] Server-side Supabase client initialized.');
  } catch (err) {
    console.error('[Supabase Config Error] Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('[Supabase Config] Supabase credentials not provided or using placeholder in .env.');
}

/**
 * Returns whether Supabase has valid configuration.
 */
function isSupabaseConfigured() {
  return isConfigured && supabaseInstance !== null;
}

/**
 * Returns the Supabase client instance.
 */
function getSupabaseClient() {
  return supabaseInstance;
}

/**
 * Checks connection health to Supabase database.
 */
async function checkSupabaseHealth() {
  if (!isSupabaseConfigured()) {
    return {
      status: 'unconfigured',
      message: 'Supabase URL or Service Key not configured in environment.'
    };
  }

  try {
    const { data, error } = await supabaseInstance
      .from('facilities')
      .select('id, name')
      .limit(1);

    if (error) {
      return {
        status: 'error',
        message: error.message
      };
    }

    return {
      status: 'connected',
      facilitiesCount: data ? data.length : 0
    };
  } catch (err) {
    return {
      status: 'error',
      message: err.message
    };
  }
}

module.exports = {
  getSupabaseClient,
  isSupabaseConfigured,
  checkSupabaseHealth
};
