-- Add cover_image_url to books table
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Update RLS if necessary (Optional, assuming public access to select books is already enabled)
