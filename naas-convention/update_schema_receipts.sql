-- 1. Add new column for receipt URL
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- 2. Ensure other fields that might be missing are present (defensive)
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS tshirt_size TEXT,
ADD COLUMN IF NOT EXISTS health_concerns TEXT,
ADD COLUMN IF NOT EXISTS transaction_id TEXT;

-- 3. Create Storage Bucket for Receipts (if not exists)
-- Note: This requires appropriate permissions. If this fails, create the bucket manually in the dashboard.
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Set up Storage Policy to allow public uploads (since users are anon)
-- Policy to allow anonymous uploads to 'receipts' bucket
CREATE POLICY "Allow public uploads"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'receipts');

-- Policy to allow viewing receipts (optional, maybe for admin?)
CREATE POLICY "Allow public select"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'receipts');
