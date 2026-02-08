-- Create the business_pitches table
CREATE TABLE IF NOT EXISTS business_pitches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  registration_id UUID NOT NULL REFERENCES registrations(id),
  transaction_id TEXT NOT NULL, -- Storing this for easier lookup/verification context
  UNIQUE(registration_id),
  UNIQUE(transaction_id)
);

-- Enable RLS
ALTER TABLE business_pitches ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to insert (we verify UID on client/edge, and RLS allows insert)
-- We might want to restrict this more in a real app, but for this stage:
CREATE POLICY "Enable insert for public" ON business_pitches FOR INSERT WITH CHECK (true);

-- Policy: Allow public to read (to check for duplicates)
CREATE POLICY "Enable read for public" ON business_pitches FOR SELECT USING (true);
