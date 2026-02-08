-- Ensure business_pitches table has the correct schema
CREATE TABLE IF NOT EXISTS public.business_pitches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    uid TEXT NOT NULL,
    registration_id UUID REFERENCES public.registrations(id),
    video_url TEXT,
    document_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add columns if they don't exist (in case table already exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_pitches' AND column_name = 'uid') THEN
        ALTER TABLE public.business_pitches ADD COLUMN uid TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_pitches' AND column_name = 'video_url') THEN
        ALTER TABLE public.business_pitches ADD COLUMN video_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_pitches' AND column_name = 'document_url') THEN
        ALTER TABLE public.business_pitches ADD COLUMN document_url TEXT;
    END IF;
END $$;
