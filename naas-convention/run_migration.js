import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getEnvVars() {
  try {
    const envPath = path.resolve(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        const vars = {};
        envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            vars[key.trim()] = value.trim();
        }
        });
        return vars;
    } else {
        // Fallback to .env
        const envPath2 = path.resolve(__dirname, '.env');
        if (fs.existsSync(envPath2)) {
             const envFile = fs.readFileSync(envPath2, 'utf8');
             const vars = {};
             envFile.split('\n').forEach(line => {
             const [key, value] = line.split('=');
             if (key && value) {
                 vars[key.trim()] = value.trim();
             }
             });
             return vars;
        }
    }
  } catch (e) {
    console.error('Could not read .env files', e);
    return {};
  }
}

const env = getEnvVars();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY; // Using Anon key for now, hoping RPC works or we just log instructions

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('Running migration...');
  const sql = fs.readFileSync(path.join(__dirname, 'create_business_pitches.sql'), 'utf8');

  const { error } = await supabase.rpc('exec_sql', { query: sql });

  if (error) {
    console.error('Migration failed (RPC might be missing):', error.message);
    console.log('Please execute "create_business_pitches.sql" manually in Supabase SQL Editor.');
  } else {
    console.log('Migration successful!');
  }
}

runMigration();
