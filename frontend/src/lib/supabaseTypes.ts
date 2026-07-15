export interface Usuario {
  id_usuario: number;
  auth_user_id: string;
  correo_persona: string;
  nombres: string;
  apellidos?: string | null;
  telefono?: string | null;
  pk_rol_usuario: number;
  estado?: boolean;
  created_at: string;
  updated_at: string;
  rol?: RolUsuario;
}

export interface RolUsuario {
  id_rol_usuario: number;
  nombre_rol: string;
}

export interface Producto {
  id_producto: number;
  nombre_producto: string;
  precio_producto: number;
  descripcion_producto: string | null;
  imagen_producto: string | null;
  precio_compra: number | null;
  pk_categoria_producto: number | null;
  pk_marca_producto: number | null;
  ficha_tecnica_url: string | null;
  slug: string;
  estado: string;
  destacado: boolean;
  nuevo: boolean;
  created_at: string;
  updated_at: string;
  imagenes?: ProductoImagen[];
  categoria?: CategoriaProducto;
  marca?: MarcaProducto;
  inventario?: Inventario;
}

export interface CategoriaProducto {
  id_categoria_producto: number;
  nombre_categoria_producto: string;
  slug?: string | null;
  descripcion?: string | null;
  estado?: string;
  orden?: number | null;
  mostrar_en_home?: boolean;
  subtitulo_home?: string | null;
  pk_categoria_padre?: number | null;
  subcategorias?: CategoriaProducto[];
}

export interface MarcaProducto {
  id_marca_producto: number;
  nombre_marca_producto: string;
}

export interface Oferta {
  id_oferta: number;
  pk_producto: number;
  precio_oferta: number;
  tipo_descuento: string;
  valor_descuento: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  producto?: Producto;
}

export interface Pedido {
  id_pedido: number;
  fecha: string;
  pk_extra: number | null;
  pk_usuario: number;
  pk_metodopago: number | null;
  estado_pago: string;
  monto_total: number;
  nombre: string | null;
  telefono: string | null;
  codigo_transaccion?: string | null;
  created_at: string;
  updated_at: string;
  usuario?: Usuario;
  detalles?: PedidoDetalle[];
  historial_estados?: PedidoEstadoPago[];
}

export interface PedidoDetalle {
  id_pedido_detalle: number;
  cantidad_pedido: number | null;
  pk_producto_pedido: number | null;
  pk_pedido: number | null;
  producto?: Producto;
}

export interface PedidoEstadoPago {
  id_historial: number;
  pk_pedido: number | null;
  estado: string | null;
  fecha_estado: string | null;
  comentario: string | null;
}

export interface Movimiento {
  id_movimiento: number;
  id_producto: number | null;
  tipo_movimiento: string | null;
  cantidad: number | null;
  fecha: string | null;
  observacion: string | null;
  responsable: string | null;
  stock_anterior: number | null;
  stock_posterior: number | null;
}

export interface ServicioAdicional {
  id_servicio_adicional: number;
  nombre: string;
  descripcion: string | null;
  costo: number | null;
  duracion_dias: number | null;
  activo: boolean;
}

export interface PageHero {
  id_page_hero: number;
  pagina: string;
  titulo: string;
  subtitulo: string;
  imagen_url: string | null;
  created_at: string;
}

export interface HeroSlide {
  id_hero_slide: number;
  image_url: string;
  texto: string;
  orden: number;
  activo: boolean;
  created_at: string;
}

export interface ProductoImagen {
  id_producto_imagen: number;
  id_producto: number;
  url: string;
  orden: number;
  created_at: string;
}

export interface ConfiguracionTienda {
  id: number;
  esta_abierto: boolean;
  apertura_semana: string;
  cierre_semana: string;
  apertura_sabado: string;
  cierre_sabado: string;
  apertura_domingo: string | null;
  cierre_domingo: string | null;
  actualizado_en: string;
  nombre_empresa?: string | null;
  telefono_empresa?: string | null;
  whatsapp_empresa?: string | null;
  correo_empresa?: string | null;
  direccion_empresa?: string | null;
  horario_empresa?: string | null;
  url_google_maps?: string | null;
  url_logo?: string | null;
}

export interface IngresoMercaderia {
  id_ingreso: number;
  fecha: string;
  observacion: string | null;
  created_at: string;
  codigo_transaccion?: string | null;
  detalles?: IngresoDetalle[];
}

export interface IngresoDetalle {
  id_ingreso_detalle: number;
  pk_ingreso: number;
  pk_producto: number;
  cantidad: number;
  precio_compra: number | null;
  producto?: Producto;
}

export interface Inventario {
  id_inventario: number;
  pk_producto: number;
  stock_actual: number;
  stock_minimo: number;
}

export interface MetodoPago {
  id_metodo_pago: number;
  nombre_metodo_pago: string;
}

export interface LibroReclamacion {
  id_reclamo: number;
  nombre: string;
  apellidos: string | null;
  dni: string | null;
  telefono: string | null;
  correo: string | null;
  tipo_reclamo: string | null;
  domicilio: string | null;
  descripcion: string | null;
  responsable: string | null;
  estado: string | null;
  created_at: string | null;
  update_at: string | null;
}

export interface LoginRequest {
  correo: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  correo: string;
  password: string;
}

export interface AuthResponse {
  user: Usuario | null;
  session: unknown;
}
