-- =============================================
-- RESET: Delete all products + categories, then seed
-- Run this ONLY in a fresh/clean DB 
-- =============================================

-- 1. Delete products first (FK constraints)
DELETE FROM producto_imagen;
DELETE FROM oferta;
DELETE FROM movimiento;
DELETE FROM pedidodetalles;
DELETE FROM pedido_estado_pago;
DELETE FROM pedido;
DELETE FROM producto;

-- 2. Delete all categories
DELETE FROM categoria_p;

-- 3. Add pk_categoria_padre column (if not exists)
ALTER TABLE categoria_p ADD COLUMN IF NOT EXISTS pk_categoria_padre bigint REFERENCES categoria_p(id_categoria_producto) ON DELETE SET NULL;

-- 4. Reset auto-increment sequence
SELECT setval('categoria_p_id_categoria_producto_seq', 100, false);

-- =============================================
-- NEW HIERARCHY
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
