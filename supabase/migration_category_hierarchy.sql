-- Add parent category reference for 3-level hierarchy
ALTER TABLE categoria_p ADD COLUMN IF NOT EXISTS pk_categoria_padre bigint REFERENCES categoria_p(id_categoria_producto) ON DELETE SET NULL;

-- Index for faster hierarchy lookups
CREATE INDEX IF NOT EXISTS idx_categoria_padre ON categoria_p(pk_categoria_padre);
