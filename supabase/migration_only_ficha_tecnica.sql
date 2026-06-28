-- Safe migration: only adds column, does NOT delete any data
ALTER TABLE producto ADD COLUMN IF NOT EXISTS ficha_tecnica_url text;
