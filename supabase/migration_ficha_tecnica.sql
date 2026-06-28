-- Add ficha_tecnica_url column to producto table
ALTER TABLE producto ADD COLUMN IF NOT EXISTS ficha_tecnica_url text;
