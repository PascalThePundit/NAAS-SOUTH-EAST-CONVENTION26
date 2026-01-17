import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseUrl.startsWith('https')) {
    console.error('CRITICAL: Supabase URL is missing or invalid! Check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
