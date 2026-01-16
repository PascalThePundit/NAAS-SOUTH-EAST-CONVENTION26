-- Enable RLS if it's not already on
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing insert policies to be safe/clean
DROP POLICY IF EXISTS "Enable insert for public" ON registrations;
DROP POLICY IF EXISTS "Allow public registration" ON registrations;
DROP POLICY IF EXISTS "Enable insert for everyone" ON registrations;

-- Create the new, definitive insert policy for everyone
CREATE POLICY "Enable insert for everyone" ON registrations FOR INSERT WITH CHECK (true);

-- Ensure public read access is still there for duplicate checking
DROP POLICY IF EXISTS "Enable read for public" ON registrations;
CREATE POLICY "Enable read for public" ON registrations FOR SELECT USING (true);
