import { createClient } from '@supabase/supabase-js';

// Support both Vite and legacy REACT_APP_ prefixes, trim whitespace
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || import.meta.env.REACT_APP_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.REACT_APP_SUPABASE_ANON_KEY || '').trim();

// Fallback values for production (remove these after testing)
const fallbackUrl = 'https://kjzfbneibfiyyqhxyusx.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqemZibmVpYmZpeXlxaHh5dXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NzE5MDQsImV4cCI6MjA3NjE0NzkwNH0.O5hmzKSQAwF2o2oZxl4tGi6-r3fHDpld7PYAv9QUMb4';

// Use fallback if environment variables are not set
const finalUrl = supabaseUrl || fallbackUrl;
const finalKey = supabaseAnonKey || fallbackKey;

// Debug logging for deployment
console.log('🔧 Environment Debug:', {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'NOT SET',
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
    supabaseUrl: supabaseUrl ? 'SET' : 'NOT SET',
    supabaseAnonKey: supabaseAnonKey ? 'SET' : 'NOT SET'
});

if (!finalUrl || !finalKey) {
    // eslint-disable-next-line no-console
    console.error('[Supabase] Missing env. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env and restart dev server.');
}

export const supabase = createClient(finalUrl, finalKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
});
