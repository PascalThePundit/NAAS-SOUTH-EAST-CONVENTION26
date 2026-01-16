-- 1. Database Schema Fix: Ensure 'department' column exists
-- We attempt to rename if the old column exists, otherwise we add the new one.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'dept_faculty') THEN
        ALTER TABLE registrations RENAME COLUMN dept_faculty TO department;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'department') THEN
        ALTER TABLE registrations ADD COLUMN department TEXT;
    END IF;
END $$;

-- 2. Establish RLS 'Insert' Policy
-- Enable RLS if not already enabled (idempotent operation usually, but good to be sure)
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Drop the policy if it exists to avoid errors on recreation
DROP POLICY IF EXISTS "Allow public registration" ON registrations;

-- Create the policy to allow any user (anon) to insert rows
CREATE POLICY "Allow public registration" ON registrations FOR INSERT WITH CHECK (true);

-- Also allow reading for duplicate checks (public read)
DROP POLICY IF EXISTS "Enable read for public" ON registrations;
CREATE POLICY "Enable read for public" ON registrations FOR SELECT USING (true);
