-- Fix for Supabase 401 (The Duplicate Check Blocker)
-- This policy allows the 'anon' (public) role to SELECT from the registrations table
-- necessary for checking if a user is already registered before payment.

-- Enable RLS on the table if it's not already (safety check)
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access
-- Target roles: anon
-- Expression: true
CREATE POLICY "Allow public read access"
ON registrations
FOR SELECT
TO anon
USING (true);
