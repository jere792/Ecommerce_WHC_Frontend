import { useEffect, useState } from "react";
import { Heart, Truck, Shield, RotateCcw, Minus, Plus, ChevronLeft, ChevronRight, Check, Star, ImageOff } from "lucide-react";
import { useCart } from "./CartContext";
import { supabase } from '../../lib/supabaseClient';

interface ProductDetailProps {
  slug: string;
}

interface ProductoData {
  idProducto: number;
  nombreProducto: string;
  precioProducto: number;
  descripcionProducto: string;
  imagenProducto?: string;
  slug: string;
  marca: string;
  stockProducto?: number;
  categoria?: string;
  imagenesAdicionales: { url: string; id: number }[];
}

export default function ProductDetail({ slug }: ProductDetailProps) {
  const [producto, setProducto] = useState<ProductoData | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [tabActiva, setTabActiva] = useState<'descripcion' | 'caracteristicas' | 'envios'>('descripcion');
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState<Set<number | string>>(new Set());

  const { addItem, items } = useCart();

  useEffect(() => {
    setLoading(true);
    supabase
      .from('producto')
      .select('*, marca:pk_marca_producto(*), categoria:pk_categoria_producto(*), imagenes:producto_imagen(*)')
      .eq('slug', slug)
      .single()
      .then(({ data, error }) => {
        setLoading(false);
        if (error || !data) {
          setProducto(null);
          return;
        }
        const imagenesAdicionales = ((data as any).imagenes || [])
          .map((img: any) => ({ url: img.url, id: img.id_producto_imagen }))
          .sort((a: any, b: any) => a.orden - b.orden);

        setProducto({
          idProducto: data.id_producto,
          nombreProducto: data.nombre_producto,
          precioProducto: Number(data.precio_producto),
          descripcionProducto: data.descripcion_producto || '',
          imagenProducto: data.imagen_producto,
          slug: data.slug,
          marca: (data as any).marca?.nombre_marca_producto || '',
          stockProducto: data.stock_producto,
          categoria: (data as any).categoria?.nombre_categoria_producto || '',
          imagenesAdicionales,
        });
        setSelectedImage(0);
        setImgError(new Set());
      });
  }, [slug]);

  const stockDisponible = producto?.stockProducto ?? 0;
  const cartItem = items.find(item => item.id === (producto?.idProducto?.toString() ?? ""));
  const cantidadEnCarrito = cartItem?.quantity ?? 0;
  const cantidadMaxSeleccionable = Math.max(0, stockDisponible - cantidadEnCarrito);

  useEffect(() => {
    setCantidad(1);
  }, [producto?.idProducto]);

  const allImages: { url: string; id: number | string }[] = [];
  if (producto?.imagenProducto) {
    allImages.push({ url: producto.imagenProducto, id: 'main' });
  }
  if (producto?.imagenesAdicionales) {
    producto.imagenesAdicionales.forEach(img => {
      if (!allImages.some(ex => ex.url === img.url)) {
        allImages.push({ url: img.url, id: img.id });
      }
    });
  }

  const handleImgError = (id: number | string) => {
    setImgError(prev => new Set(prev).add(id));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="text-center py-20">
        <ImageOff className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">Producto no encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav className="text-sm text-gray-500 mb-6">
        <a href="/" className="hover:text-blue-700 transition-colors">Inicio</a>
        <span className="mx-2">/</span>
        <a href="/productos" className="hover:text-blue-700 transition-colors">Productos</a>
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-medium">{producto.nombreProducto}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="space-y-4">
          <div className="relative bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 group">
            <div className="aspect-square flex items-center justify-center p-8">
              {allImages.length > 0 && !imgError.has(allImages[selectedImage]?.id) ? (
                <img
                  src={allImages[selectedImage].url}
                  alt={producto.nombreProducto}
                  className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  onError={() => handleImgError(allImages[selectedImage].id)}
                />
              ) : (
                <div className="text-gray-300 flex flex-col items-center">
                  <ImageOff className="w-16 h-16 mb-2" />
                  <span className="text-sm">Sin imagen</span>
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage(prev => Math.max(0, prev - 1))}
                  disabled={selectedImage === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-sm flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={() => setSelectedImage(prev => Math.min(allImages.length - 1, prev + 1))}
                  disabled={selectedImage === allImages.length - 1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-sm flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </>
            )}
            {allImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                {selectedImage + 1} / {allImages.length}
              </div>
            )}
          </div>

          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {allImages.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 overflow-hidden transition-all ${
                    selectedImage === idx
                      ? 'border-blue-600 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {!imgError.has(img.id) ? (
                    <img
                      src={img.url}
                      alt={`${producto.nombreProducto} ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={() => handleImgError(img.id)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <ImageOff className="w-5 h-5 text-gray-300" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {producto.marca && (
            <span className="text-xs font-semibold tracking-widest text-blue-700 uppercase mb-1">
              {producto.marca}
            </span>
          )}

          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            {producto.nombreProducto}
          </h1>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`w-4 h-4 ${i <= 4 ? 'fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-sm text-gray-500">(0 reseñas)</span>
          </div>

          <div className="border-t border-gray-100 my-4" />

          <div className="mb-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                S/. {producto.precioProducto.toFixed(2)}
              </span>
              <span className="text-lg text-gray-400 line-through">
                S/. {(producto.precioProducto * 1.1).toFixed(2)}
              </span>
              <span className="text-xs font-semibold text-white bg-blue-600 px-2 py-0.5 rounded">
                -10%
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Precio Internet · Ahorras S/. {(producto.precioProducto * 0.1).toFixed(2)}</p>
          </div>

          <div className="border-t border-gray-100 my-4" />

          {producto.descripcionProducto && (
            <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
              {producto.descripcionProducto}
            </p>
          )}

          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-medium text-gray-700">Cantidad:</span>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                disabled={cantidad <= 1}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition disabled:opacity-30"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-semibold text-gray-900 text-lg select-none">{cantidad}</span>
              <button
                onClick={() => setCantidad(Math.min(cantidadMaxSeleccionable, cantidad + 1))}
                disabled={cantidad >= cantidadMaxSeleccionable}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition disabled:opacity-30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <span className={`text-sm ${stockDisponible > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {stockDisponible > 0 ? (
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  {stockDisponible} {stockDisponible === 1 ? 'disponible' : 'disponibles'}
                </span>
              ) : (
                'Sin stock'
              )}
            </span>
          </div>

          <button
            onClick={() => {
              if (cantidadMaxSeleccionable === 0) return;
              addItem({
                id: producto.idProducto.toString(),
                productId: producto.idProducto,
                name: producto.nombreProducto,
                price: producto.precioProducto,
                quantity: cantidad,
                image: producto.imagenProducto,
                stock: stockDisponible,
                brand: producto.marca,
                description: producto.descripcionProducto,
              });
            }}
            disabled={cantidadMaxSeleccionable === 0}
            className="w-full py-3.5 px-6 bg-blue-700 hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 mb-3"
          >
            <Truck className="w-5 h-5" />
            Agregar al carrito
          </button>

          <button className="w-full py-2.5 px-6 border-2 border-gray-200 hover:border-blue-300 text-gray-600 hover:text-blue-700 font-medium rounded-xl transition-all flex items-center justify-center gap-2 mb-6">
            <Heart className="w-5 h-5" />
            Agregar a favoritos
          </button>

          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Truck className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span>Delivery gratis a compras mayores a <strong>S/. 200</strong></span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span>Compra 100% segura con datos protegidos</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <RotateCcw className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span>Cambios y devoluciones dentro de los 7 días</span>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-400 space-y-1">
            <p>Código: #{producto.idProducto}</p>
            {producto.categoria && <p>Categoría: {producto.categoria}</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-12">
        <div className="flex border-b border-gray-200">
          {(['descripcion', 'caracteristicas', 'envios'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setTabActiva(tab)}
              className={`flex-1 py-4 px-6 text-sm font-semibold transition-all relative ${
                tabActiva === tab
                  ? 'text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'descripcion' && 'Descripción'}
              {tab === 'caracteristicas' && 'Características'}
              {tab === 'envios' && 'Envíos y Devolución'}
              {tabActiva === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-700" />
              )}
            </button>
          ))}
        </div>
        <div className="p-6 md:p-8">
          {tabActiva === 'descripcion' && (
            <div>
              {producto.descripcionProducto ? (
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {producto.descripcionProducto}
                </p>
              ) : (
                <p className="text-gray-400">Sin descripción disponible.</p>
              )}
            </div>
          )}
          {tabActiva === 'caracteristicas' && (
            <ul className="space-y-3 text-gray-700">
              {producto.marca && (
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span><strong>Marca:</strong> {producto.marca}</span>
                </li>
              )}
              {producto.categoria && (
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span><strong>Categoría:</strong> {producto.categoria}</span>
                </li>
              )}
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span><strong>Stock:</strong> {stockDisponible} unidades</span>
              </li>
            </ul>
          )}
          {tabActiva === 'envios' && (
            <div className="space-y-5 text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Envío</h4>
                <p className="text-sm leading-relaxed">
                  Realizamos envíos a todo Lima y provincias. El delivery es gratuito para compras mayores a S/. 200.
                  Los pedidos son procesados dentro de las 24 horas hábiles siguientes a la confirmación de la compra.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Devoluciones</h4>
                <p className="text-sm leading-relaxed">
                  Aceptamos cambios y devoluciones dentro de los 7 días posteriores a la recepción del producto.
                  El producto debe estar en su embalaje original y en las mismas condiciones en que fue recibido.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Garantía</h4>
                <p className="text-sm leading-relaxed">
                  Todos nuestros productos cuentan con garantía contra defectos de fabricación.
                  Para más información, contáctanos a través de nuestro formulario de contacto.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
