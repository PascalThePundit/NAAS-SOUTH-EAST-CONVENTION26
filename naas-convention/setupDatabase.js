import {
  createClient
} from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import {
  fileURLToPath
} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to read .env.local
function getEnvVars() {
  try {
    const envPath = path.resolve(__dirname, '.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const vars = {};
    envFile.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        vars[key.trim()] = value.trim();
      }
    });
    return vars;
  } catch (e) {
    console.error('Could not read .env.local', e);
    return {};
  }
}

const env = getEnvVars();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const createTableSQL = `
-- Run this in your Supabase SQL Editor
CREATE TABLE IF NOT EXISTS registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  full_name TEXT NOT NULL,
  gender TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  department TEXT,
  institution TEXT,
  zone TEXT,
  skill_choice TEXT,
  wants_tshirt BOOLEAN DEFAULT FALSE,
  total_amount NUMERIC,
  payment_status TEXT DEFAULT 'pending'
);

-- Optional: Enable RLS
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Optional: Allow public inserts (if that is the intention for registration)
CREATE POLICY "Enable insert for public" ON registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read for public" ON registrations FOR SELECT USING (true);
`;

async function setupDatabase() {
  console.log('--- Supabase Database Setup ---');
  console.log(`Target URL: ${supabaseUrl}`);

  console.log('\nChecking connection...');
  const { data, error } = await supabase.from('registrations').select('count', {
    count: 'exact',
    head: true
  });

  if (error) {
    console.error('Connection/Table Check Error:', error.message);
    if (error.code === '42P01') { // undefined_table
      console.log('\nTable "registrations" does not exist.');
      console.log('Attempting to create via RPC (if "exec_sql" exists)...');

      const { error: rpcError } = await supabase.rpc('exec_sql', {
        query: createTableSQL
      });

      if (rpcError) {
        console.log('\nNOTE: Could not create table automatically via SDK (RPC "exec_sql" missing or unauthorized).');
        console.log('This is normal for the standard Anon key client.');
        console.log('\nPLEASE RUN THE FOLLOWING SQL IN YOUR SUPABASE SQL EDITOR:');
        console.log('-------------------------------------------------------');
        console.log(createTableSQL);
        console.log('-------------------------------------------------------');
      } else {
        console.log('Success! Table created via RPC.');
      }
    } else {
      console.log('An unexpected error occurred. Check your credentials.');
    }
  } else {
    console.log('Success! Connected to Supabase and "registrations" table exists.');
  }
}

setupDatabase();
