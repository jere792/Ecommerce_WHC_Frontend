-- =============================================
-- FULL SEED: Categories + Brands + Products
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Delete all dependent data first
DELETE FROM producto_imagen;
DELETE FROM oferta;
DELETE FROM movimiento;
DELETE FROM pedidodetalles;
DELETE FROM pedido_estado_pago;
DELETE FROM pedido;
DELETE FROM producto;
DELETE FROM marca_p;
DELETE FROM estado_p;
DELETE FROM categoria_p;

-- 2. Ensure pk_categoria_padre column exists
ALTER TABLE categoria_p ADD COLUMN IF NOT EXISTS pk_categoria_padre bigint REFERENCES categoria_p(id_categoria_producto) ON DELETE SET NULL;

-- 3. Add mostrar_en_home and subtitulo_home to categoria_p if not exist
ALTER TABLE categoria_p ADD COLUMN IF NOT EXISTS mostrar_en_home boolean DEFAULT false;
ALTER TABLE categoria_p ADD COLUMN IF NOT EXISTS subtitulo_home text;

-- 4. Reset sequences
SELECT setval('categoria_p_id_categoria_producto_seq', 100, false);

-- =============================================
-- CATEGORIES
-- =============================================

-- LEVEL 1: Main categories
INSERT INTO categoria_p (id_categoria_producto, nombre_categoria_producto, mostrar_en_home) VALUES
  (1, 'Griferías', true),
  (2, 'Sanitarios', true),
  (3, 'Accesorios', true),
  (4, 'Gasfitería', true),
  (5, 'Herramientas', true);

-- LEVEL 2: Under Griferías (1)
INSERT INTO categoria_p (id_categoria_producto, nombre_categoria_producto, pk_categoria_padre) VALUES
  (10, 'Baño', 1),
  (11, 'Cocina', 1),
  (12, 'Especializada', 1);

-- LEVEL 2: Under Sanitarios (2)
INSERT INTO categoria_p (id_categoria_producto, nombre_categoria_producto, pk_categoria_padre) VALUES
  (13, 'Inodoros', 2),
  (14, 'Lavamanos', 2),
  (15, 'Urinarios', 2),
  (16, 'Tanques', 2);

-- LEVEL 2: Under Accesorios (3)
INSERT INTO categoria_p (id_categoria_producto, nombre_categoria_producto, pk_categoria_padre) VALUES
  (17, 'Baño', 3),
  (18, 'Cocina', 3);

-- LEVEL 2: Under Gasfitería (4)
INSERT INTO categoria_p (id_categoria_producto, nombre_categoria_producto, pk_categoria_padre) VALUES
  (19, 'Tuberías', 4),
  (34, 'Válvulas', 4),
  (35, 'Conexiones', 4);

-- LEVEL 2: Under Herramientas (5)
INSERT INTO categoria_p (id_categoria_producto, nombre_categoria_producto, pk_categoria_padre) VALUES
  (36, 'Manuales', 5),
  (37, 'Eléctricas', 5);

-- LEVEL 3: Under Griferías > Baño (10)
INSERT INTO categoria_p (id_categoria_producto, nombre_categoria_producto, pk_categoria_padre) VALUES
  (20, 'Llaves Baño', 10),
  (21, 'Mezcladoras Baño', 10),
  (22, 'Monocomandos Baño', 10),
  (23, 'Duchas', 10);

-- LEVEL 4: Under Griferías > Baño > Duchas (23)
INSERT INTO categoria_p (id_categoria_producto, nombre_categoria_producto, pk_categoria_padre) VALUES
  (30, 'Duchas Mezcladoras', 23),
  (31, 'Duchas Monocomandos', 23);

-- LEVEL 3: Under Griferías > Cocina (11)
INSERT INTO categoria_p (id_categoria_producto, nombre_categoria_producto, pk_categoria_padre) VALUES
  (24, 'Llaves Cocina', 11),
  (25, 'Mezcladoras Monocomáticas', 11),
  (26, 'Lavaderos', 11);

-- LEVEL 3: Under Griferías > Especializada (12)
INSERT INTO categoria_p (id_categoria_producto, nombre_categoria_producto, pk_categoria_padre) VALUES
  (27, 'Fluxómetros', 12),
  (28, 'Temporizados', 12),
  (29, 'Sensores', 12),
  (32, 'Llaves Urinario', 12),
  (33, 'Clínica', 12);

-- LEVEL 3: Under Sanitarios > Inodoros (13)
INSERT INTO categoria_p (id_categoria_producto, nombre_categoria_producto, pk_categoria_padre) VALUES
  (38, 'One Piece', 13),
  (39, 'Two Piece', 13),
  (40, 'Fluxómetros', 13);

-- LEVEL 3: Under Sanitarios > Lavamanos (14)
INSERT INTO categoria_p (id_categoria_producto, nombre_categoria_producto, pk_categoria_padre) VALUES
  (41, 'Sobrepuestos', 14),
  (42, 'Empotrados', 14),
  (43, 'Pie de Amigo', 14);

-- LEVEL 3: Under Accesorios > Baño (17)
INSERT INTO categoria_p (id_categoria_producto, nombre_categoria_producto, pk_categoria_padre) VALUES
  (44, 'Toalleros', 17),
  (45, 'Jaboneras', 17),
  (46, 'Papeleras', 17),
  (47, 'Ganchos', 17);

-- LEVEL 3: Under Accesorios > Cocina (18)
INSERT INTO categoria_p (id_categoria_producto, nombre_categoria_producto, pk_categoria_padre) VALUES
  (48, 'Lavaderos', 18),
  (49, 'Escurridores', 18);

-- LEVEL 3: Under Gasfitería > Tuberías (19)
INSERT INTO categoria_p (id_categoria_producto, nombre_categoria_producto, pk_categoria_padre) VALUES
  (50, 'PVC', 19),
  (51, 'CPVC', 19),
  (52, 'Polietileno', 19);

-- LEVEL 3: Under Herramientas > Manuales (36)
INSERT INTO categoria_p (id_categoria_producto, nombre_categoria_producto, pk_categoria_padre) VALUES
  (53, 'Llaves Stillson', 36),
  (54, 'Destornilladores', 36),
  (55, 'Alicates', 36);

-- LEVEL 3: Under Herramientas > Eléctricas (37)
INSERT INTO categoria_p (id_categoria_producto, nombre_categoria_producto, pk_categoria_padre) VALUES
  (56, 'Taladros', 37),
  (57, 'Esmeriles', 37);

-- =============================================
-- BRANDS
-- =============================================
INSERT INTO marca_p (nombre_marca_producto, mostrar_en_home) VALUES
  ('Trébol', true),
  ('Sloan', true),
  ('Genebre', true),
  ('Vainsa', true),
  ('Helvex', true),
  ('Leeyes', true),
  ('Sunmixer', true);

-- =============================================
-- PRODUCT STATES
-- =============================================
INSERT INTO estado_p (nombre_estado_producto) VALUES
  ('Nuevo'),
  ('Usado'),
  ('Reacondicionado');

-- =============================================
-- PRODUCTS (Griferías cat 1)
-- =============================================
INSERT INTO producto (nombre_producto, precio_producto, precio_compra, descripcion_producto, stock_producto, slug, pk_categoria_producto, pk_marca_producto, pk_estado_producto) VALUES
  ('Llave de Baño Monocomando Trébol', 189.90, 120.00, 'Llave monocomando para lavatorio con sistema cerámico. Acabado cromado brillante.', 50, 'llave-bano-monocomando-trebol', 20, 1, 1),
  ('Mezcladora Baño Genebre', 245.00, 155.00, 'Mezcladora para baño con aireador regulable y movimiento 360°.', 30, 'mezcladora-bano-genebre', 21, 3, 1),
  ('Ducha Mezcladora Sloan', 320.00, 210.00, 'Ducha mezcladora empotrable con brazo articulado y rociador de lluvia.', 20, 'ducha-mezcladora-sloan', 30, 2, 1),
  ('Llave de Cocina Helvex', 275.00, 175.00, 'Llave de cocina tipo cuello de ganso con rociador extraíble.', 40, 'llave-cocina-helvex', 24, 5, 1);

-- =============================================
-- PRODUCTS (Sanitarios cat 2)
-- =============================================
INSERT INTO producto (nombre_producto, precio_producto, precio_compra, descripcion_producto, stock_producto, slug, pk_categoria_producto, pk_marca_producto, pk_estado_producto) VALUES
  ('Inodoro One Piece Vainsa', 599.00, 380.00, 'Inodoro one piece de doble descarga con sistema sifónico. Incluye tapa y asiento.', 15, 'inodoro-one-piece-vainsa', 38, 4, 1),
  ('Inodoro Two Piece Trébol', 420.00, 270.00, 'Inodoro two piece con tanque separado. Descarga de 6L.', 25, 'inodoro-two-piece-trebol', 39, 1, 1),
  ('Lavamanos Sobrepuesto Helvex', 350.00, 220.00, 'Lavamanos de sobreponer de porcelana vitrificada. Medida 50x40cm.', 18, 'lavamanos-sobrepuesto-helvex', 41, 5, 1),
  ('Urinario Fluxómetro Sloan', 780.00, 500.00, 'Urinario de pared con fluxómetro integrado. Sistema de descarga automática.', 10, 'urinario-fluxometro-sloan', 15, 2, 1);

-- =============================================
-- PRODUCTS (Accesorios cat 3)
-- =============================================
INSERT INTO producto (nombre_producto, precio_producto, precio_compra, descripcion_producto, stock_producto, slug, pk_categoria_producto, pk_marca_producto, pk_estado_producto) VALUES
  ('Toallero Doble Genebre', 89.90, 55.00, 'Toallero de pared de 60cm con dos barras. Acero inoxidable satinado.', 60, 'toallero-doble-genebre', 44, 3, 1),
  ('Jabonera de Vidrio Leeyes', 35.00, 20.00, 'Jabonera de vidrio templado con soporte cromado.', 100, 'jabonera-vidrio-leeyes', 45, 6, 1),
  ('Papelera Inoxidable Sunmixer', 65.00, 38.00, 'Papelera de acero inoxidable con tapa basculante. Capacidad 5L.', 45, 'papelera-inoxidable-sunmixer', 46, 7, 1),
  ('Gancho Doble Cromado Trébol', 25.00, 12.00, 'Gancho doble para baño con acabado cromado brillante.', 80, 'gancho-doble-cromado-trebol', 47, 1, 1);

-- =============================================
-- PRODUCTS (Gasfitería cat 4)
-- =============================================
INSERT INTO producto (nombre_producto, precio_producto, precio_compra, descripcion_producto, stock_producto, slug, pk_categoria_producto, pk_marca_producto, pk_estado_producto) VALUES
  ('Tubería PVC 1/2" Trébol', 12.50, 7.00, 'Tubería de PVC para agua fría de 1/2 pulgada. Largo 3m.', 200, 'tuberia-pvc-12-trebol', 50, 1, 1),
  ('Válvula de Compuerta Bronce Genebre', 45.00, 28.00, 'Válvula de compuerta en bronce de 3/4 pulgada. Para agua caliente y fría.', 75, 'valvula-compuerta-bronce-genebre', 34, 3, 1),
  ('Codo PVC 1/2" Trébol', 3.50, 1.80, 'Codo de PVC para tubería de 1/2 pulgada. Ángulo 90°.', 500, 'codo-pvc-12-trebol', 35, 1, 1),
  ('Válvula Check PVC Sunmixer', 28.00, 16.00, 'Válvula check de PVC de 3/4 pulgada con resorte interno.', 60, 'valvula-check-pvc-sunmixer', 34, 7, 1);

-- =============================================
-- PRODUCTS (Herramientas cat 5)
-- =============================================
INSERT INTO producto (nombre_producto, precio_producto, precio_compra, descripcion_producto, stock_producto, slug, pk_categoria_producto, pk_marca_producto, pk_estado_producto) VALUES
  ('Llave Stillson 18" Trébol', 85.00, 50.00, 'Llave stillson profesional de 18 pulgadas. Acero al carbono templado.', 35, 'llave-stillson-18-trebol', 53, 1, 1),
  ('Destornillador Plano Profesional', 18.00, 9.00, 'Destornillador plano con mango ergonómico. Punta magnética.', 90, 'destornillador-plano-profesional', 54, 1, 1),
  ('Alicate de Presión Genebre', 42.00, 25.00, 'Alicate de presión con ajuste rápido. Mordazas aceradas.', 45, 'alicate-presion-genebre', 55, 3, 1),
  ('Taladro Percutor 650W Vainsa', 220.00, 140.00, 'Taladro percutor con velocidad variable. Incluye maletín y accesorios.', 20, 'taladro-percutor-650w-vainsa', 56, 4, 1);
