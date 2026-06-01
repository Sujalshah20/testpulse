// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// We import dotenv dynamically to support local development seamlessly if a local .env is present
if (process.env.NODE_ENV !== 'production') {
  try {
    const dotenv = await import('dotenv');
    dotenv.config();
  } catch (e) {
    // dotenv not found, proceeding with process.env
  }
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY  // service key for backend only
);

export default supabase;
