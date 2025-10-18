import { createClient } from '@supabase/supabase-js';

// Support both Vite and legacy REACT_APP_ prefixes, trim whitespace
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || import.meta.env.REACT_APP_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.REACT_APP_SUPABASE_ANON_KEY || '').trim();

// Debug logging for deployment
console.log('🔧 Environment Debug:', {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'NOT SET',
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
    supabaseUrl: supabaseUrl ? 'SET' : 'NOT SET',
    supabaseAnonKey: supabaseAnonKey ? 'SET' : 'NOT SET'
});

if (!supabaseUrl || !supabaseAnonKey) {
    // eslint-disable-next-line no-console
    console.error('[Supabase] Missing env. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env and restart dev server.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
});
