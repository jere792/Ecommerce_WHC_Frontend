-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.rol_usuario (
  id_rol_usuario bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre_rol character varying NOT NULL,
  CONSTRAINT rol_usuario_pkey PRIMARY KEY (id_rol_usuario)
);
CREATE TABLE public.categoria_productos (
  id_categoria_producto bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre_categoria_producto character varying NOT NULL,
  mostrar_en_home boolean NOT NULL DEFAULT false,
  subtitulo_home character varying,
  pk_categoria_padre bigint,
  estado text DEFAULT 'activo'::text,
  slug text,
  descripcion text,
  orden integer DEFAULT 0,
  CONSTRAINT categoria_productos_pkey PRIMARY KEY (id_categoria_producto),
  CONSTRAINT categoria_p_pk_categoria_padre_fkey FOREIGN KEY (pk_categoria_padre) REFERENCES public.categoria_productos(id_categoria_producto)
);
CREATE TABLE public.marca_producto (
  id_marca_producto bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre_marca_producto character varying NOT NULL,
  logo_url text,
  mostrar_en_home boolean NOT NULL DEFAULT false,
  descripcion_marca text,
  orden integer,
  activo boolean DEFAULT true,
  CONSTRAINT marca_producto_pkey PRIMARY KEY (id_marca_producto)
);
CREATE TABLE public.metodo_pago (
  id_metodo_pago bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre_metodo_pago character varying NOT NULL,
  CONSTRAINT metodo_pago_pkey PRIMARY KEY (id_metodo_pago)
);
CREATE TABLE public.usuarios (
  id_usuario bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  correo_persona character varying NOT NULL UNIQUE,
  password character varying NOT NULL,
  nombres character varying NOT NULL,
  pk_rol_usuario bigint NOT NULL,
  reset_token character varying,
  reset_token_expiry bigint,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  estado boolean DEFAULT true,
  apellidos character varying,
  telefono character varying,
  session_token text,
  CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario),
  CONSTRAINT usuarios_pk_rol_usuario_fkey FOREIGN KEY (pk_rol_usuario) REFERENCES public.rol_usuario(id_rol_usuario)
);
CREATE TABLE public.producto (
  id_producto bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre_producto character varying NOT NULL,
  precio_producto numeric NOT NULL,
  descripcion_producto text,
  imagen_producto character varying,
  pk_categoria_producto bigint,
  pk_marca_producto bigint,
  slug character varying NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  precio_compra numeric,
  ficha_tecnica_url text,
  estado character varying DEFAULT 'activo'::character varying,
  destacado boolean DEFAULT false,
  nuevo boolean DEFAULT false,
  CONSTRAINT producto_pkey PRIMARY KEY (id_producto),
  CONSTRAINT producto_pk_categoria_producto_fkey FOREIGN KEY (pk_categoria_producto) REFERENCES public.categoria_productos(id_categoria_producto),
  CONSTRAINT producto_pk_marca_producto_fkey FOREIGN KEY (pk_marca_producto) REFERENCES public.marca_producto(id_marca_producto)
);
CREATE TABLE public.oferta (
  id_oferta bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  pk_producto bigint NOT NULL,
  precio_oferta numeric NOT NULL,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  tipo_descuento text NOT NULL DEFAULT 'fijo'::text CHECK (tipo_descuento = ANY (ARRAY['fijo'::text, 'porcentaje'::text])),
  valor_descuento numeric,
  estado text NOT NULL DEFAULT 'activo'::text,
  CONSTRAINT oferta_pkey PRIMARY KEY (id_oferta),
  CONSTRAINT oferta_pk_producto_fkey FOREIGN KEY (pk_producto) REFERENCES public.producto(id_producto)
);
CREATE TABLE public.servicio_adicionales (
  id_servicio_adicional bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre character varying NOT NULL,
  descripcion text,
  costo numeric,
  duracion_dias integer,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT servicio_adicionales_pkey PRIMARY KEY (id_servicio_adicional)
);
CREATE TABLE public.pedido (
  id_pedido bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  fecha timestamp with time zone NOT NULL DEFAULT now(),
  pk_extra bigint,
  pk_usuario bigint NOT NULL,
  pk_metodopago bigint,
  id_mercadopago character varying,
  estado_pago character varying NOT NULL DEFAULT 'pendiente'::character varying,
  monto_total numeric NOT NULL,
  preference_id character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  nombre text,
  telefono text,
  codigo_transaccion text,
  CONSTRAINT pedido_pkey PRIMARY KEY (id_pedido),
  CONSTRAINT pedido_pk_usuario_fkey FOREIGN KEY (pk_usuario) REFERENCES public.usuarios(id_usuario),
  CONSTRAINT pedido_pk_metodopago_fkey FOREIGN KEY (pk_metodopago) REFERENCES public.metodo_pago(id_metodo_pago),
  CONSTRAINT pedido_pk_extra_fkey FOREIGN KEY (pk_extra) REFERENCES public.servicio_adicionales(id_servicio_adicional)
);
CREATE TABLE public.pedido_detalles (
  id_pedido_detalle bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  cantidad_pedido integer,
  pk_producto_pedido bigint,
  pk_pedido bigint,
  precio_unitario numeric NOT NULL DEFAULT 0,
  CONSTRAINT pedido_detalles_pkey PRIMARY KEY (id_pedido_detalle),
  CONSTRAINT pedido_detalles_pk_producto_pedido_fkey FOREIGN KEY (pk_producto_pedido) REFERENCES public.producto(id_producto),
  CONSTRAINT pedido_detalles_pk_pedido_fkey FOREIGN KEY (pk_pedido) REFERENCES public.pedido(id_pedido)
);
CREATE TABLE public.pedido_estado_pago (
  id_historial bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  pk_pedido bigint,
  estado character varying,
  fecha_estado timestamp with time zone DEFAULT now(),
  comentario text,
  CONSTRAINT pedido_estado_pago_pkey PRIMARY KEY (id_historial),
  CONSTRAINT pedido_estado_pago_pk_pedido_fkey FOREIGN KEY (pk_pedido) REFERENCES public.pedido(id_pedido)
);
CREATE TABLE public.movimiento (
  id_movimiento bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_producto bigint,
  tipo_movimiento character varying,
  cantidad integer,
  fecha timestamp with time zone DEFAULT now(),
  observacion text,
  responsable text,
  stock_anterior integer,
  stock_posterior integer,
  CONSTRAINT movimiento_pkey PRIMARY KEY (id_movimiento),
  CONSTRAINT movimiento_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto)
);
CREATE TABLE public.libro_reclamacion (
  id_reclamo bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre character varying NOT NULL,
  apellidos character varying,
  dni character varying,
  telefono character varying,
  correo character varying,
  tipo_reclamo character varying,
  domicilio character varying,
  descripcion character varying,
  responsable character varying,
  created_at character varying,
  update_at character varying,
  estado text DEFAULT 'pendiente'::text,
  CONSTRAINT libro_reclamacion_pkey PRIMARY KEY (id_reclamo)
);
CREATE TABLE public.log_mercadopago (
  id_log bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  pk_pedido bigint,
  payload jsonb,
  fecha_log timestamp with time zone DEFAULT now(),
  CONSTRAINT log_mercadopago_pkey PRIMARY KEY (id_log),
  CONSTRAINT log_mercadopago_pk_pedido_fkey FOREIGN KEY (pk_pedido) REFERENCES public.pedido(id_pedido)
);
CREATE TABLE public.hero_slide (
  id_hero_slide bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  image_url text NOT NULL,
  texto character varying NOT NULL DEFAULT ''::character varying,
  descripcion character varying,
  orden integer NOT NULL DEFAULT 0,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT hero_slide_pkey PRIMARY KEY (id_hero_slide)
);
CREATE TABLE public.page_hero (
  id_page_hero bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  pagina character varying NOT NULL UNIQUE,
  titulo character varying NOT NULL DEFAULT ''::character varying,
  subtitulo character varying NOT NULL DEFAULT ''::character varying,
  imagen_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT page_hero_pkey PRIMARY KEY (id_page_hero)
);
CREATE TABLE public.producto_imagen (
  id_producto_imagen bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_producto bigint NOT NULL,
  url text NOT NULL,
  orden integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT producto_imagen_pkey PRIMARY KEY (id_producto_imagen),
  CONSTRAINT producto_imagen_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto)
);
CREATE TABLE public.ingreso_mercaderia (
  id_ingreso bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  fecha timestamp with time zone DEFAULT now(),
  observacion text,
  created_at timestamp with time zone DEFAULT now(),
  codigo_transaccion text,
  CONSTRAINT ingreso_mercaderia_pkey PRIMARY KEY (id_ingreso)
);
CREATE TABLE public.ingreso_detalle (
  id_ingreso_detalle bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  pk_ingreso bigint NOT NULL,
  pk_producto bigint NOT NULL,
  cantidad integer NOT NULL,
  precio_compra numeric,
  CONSTRAINT ingreso_detalle_pkey PRIMARY KEY (id_ingreso_detalle),
  CONSTRAINT ingreso_detalle_pk_ingreso_fkey FOREIGN KEY (pk_ingreso) REFERENCES public.ingreso_mercaderia(id_ingreso),
  CONSTRAINT ingreso_detalle_pk_producto_fkey FOREIGN KEY (pk_producto) REFERENCES public.producto(id_producto)
);
CREATE TABLE public.inventario (
  id_inventario bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  pk_producto bigint NOT NULL UNIQUE,
  stock_actual integer NOT NULL DEFAULT 0,
  stock_minimo integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT inventario_pkey PRIMARY KEY (id_inventario),
  CONSTRAINT inventario_pk_producto_fkey FOREIGN KEY (pk_producto) REFERENCES public.producto(id_producto)
);
CREATE TABLE public.configuracion_tienda (
  id bigint NOT NULL DEFAULT 1,
  esta_abierto boolean NOT NULL DEFAULT false,
  apertura_semana time without time zone NOT NULL DEFAULT '09:00:00'::time without time zone,
  cierre_semana time without time zone NOT NULL DEFAULT '18:00:00'::time without time zone,
  apertura_sabado time without time zone NOT NULL DEFAULT '09:00:00'::time without time zone,
  cierre_sabado time without time zone NOT NULL DEFAULT '13:00:00'::time without time zone,
  apertura_domingo time without time zone,
  cierre_domingo time without time zone,
  actualizado_en timestamp with time zone DEFAULT now(),
  nombre_empresa text,
  telefono_empresa text,
  whatsapp_empresa text,
  correo_empresa text,
  direccion_empresa text,
  horario_empresa text,
  url_google_maps text,
  url_logo text,
  url_facebook text,
  url_instagram text,
  url_tiktok text,
  CONSTRAINT configuracion_tienda_pkey PRIMARY KEY (id)
);