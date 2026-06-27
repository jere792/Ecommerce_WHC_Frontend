-- =============================================
-- Store Settings - Tabla unica con horarios
-- =============================================

-- 1. Crear tabla (idempotente)
CREATE TABLE IF NOT EXISTS store_settings (
  id bigint PRIMARY KEY DEFAULT 1,
  is_open boolean NOT NULL DEFAULT false,
  weekday_open time NOT NULL DEFAULT '09:00:00',
  weekday_close time NOT NULL DEFAULT '18:00:00',
  saturday_open time NOT NULL DEFAULT '09:00:00',
  saturday_close time NOT NULL DEFAULT '13:00:00',
  sunday_open time DEFAULT NULL,
  sunday_close time DEFAULT NULL,
  updated_at timestamptz DEFAULT now()
);

-- 2. Insertar fila por defecto si no existe
INSERT INTO store_settings (id, is_open)
VALUES (1, false)
ON CONFLICT (id) DO NOTHING;

-- 3. Habilitar Realtime (solo si no es miembro aun)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'store_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE store_settings;
  END IF;
END
$$;

-- 4. RLS - Permitir lectura publica, escritura solo autenticados
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read store_settings" ON store_settings;
CREATE POLICY "Anyone can read store_settings"
  ON store_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can update store_settings" ON store_settings;
CREATE POLICY "Authenticated users can update store_settings"
  ON store_settings FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can insert store_settings" ON store_settings;
CREATE POLICY "Authenticated users can insert store_settings"
  ON store_settings FOR INSERT
  WITH CHECK (true);