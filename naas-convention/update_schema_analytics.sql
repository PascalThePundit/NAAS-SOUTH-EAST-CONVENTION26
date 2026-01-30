-- 1. Create a table to store analytics
CREATE TABLE IF NOT EXISTS site_analytics (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  count BIGINT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Insert the initial row for page views if it doesn't exist
INSERT INTO site_analytics (name, count)
VALUES ('page_views', 0)
ON CONFLICT (name) DO NOTHING;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE site_analytics ENABLE ROW LEVEL SECURITY;

-- 4. Create a policy to allow anyone (public) to READ the stats
CREATE POLICY "Allow public read access" 
ON site_analytics 
FOR SELECT 
USING (true);

-- 5. Create a secure function to increment the counter
--    SECURITY DEFINER means this function runs with the privileges of the creator (admin),
--    bypassing RLS for the update, so we don't need to give public WRITE access to the table.
CREATE OR REPLACE FUNCTION increment_page_view()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE site_analytics
  SET count = count + 1,
      updated_at = now()
  WHERE name = 'page_views';
END;
$$;
