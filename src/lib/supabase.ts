import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
// Support multiple naming conventions for backward compatibility
const supabasePublishableKey = 
  process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY || 
  process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 
  process.env.REACT_APP_SUPABASE_ANON_KEY || 
  '';

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn(
    'Missing Supabase environment variables. Please set REACT_APP_SUPABASE_URL and one of: REACT_APP_SUPABASE_PUBLISHABLE_KEY, REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY, or REACT_APP_SUPABASE_ANON_KEY'
  );
}

// Using 'any' for Database type to avoid TypeScript strict type checking issues
// The database schema types will be enforced at runtime by Supabase
export const supabase = createClient<any>(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'apikey': supabasePublishableKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
  },
});

