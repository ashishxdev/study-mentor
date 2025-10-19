import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || import.meta.env.REACT_APP_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.REACT_APP_SUPABASE_ANON_KEY || '').trim();

const fallbackUrl = 'https://kjzfbneibfiyyqhxyusx.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqemZibmVpYmZpeXlxaHh5dXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NzE5MDQsImV4cCI6MjA3NjE0NzkwNH0.O5hmzKSQAwF2o2oZxl4tGi6-r3fHDpld7PYAv9QUMb4';

const finalUrl = supabaseUrl || fallbackUrl;
const finalKey = supabaseAnonKey || fallbackKey;

export const supabase = createClient(finalUrl, finalKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
});
