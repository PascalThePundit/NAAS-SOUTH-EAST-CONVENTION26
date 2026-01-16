-- Add new columns for South-East Zonal update
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS tshirt_size text,
ADD COLUMN IF NOT EXISTS health_concerns text;

-- Ensure zone is text (it usually is, but good to be safe if it was an enum)
-- ALTER TABLE registrations ALTER COLUMN zone TYPE text; 
