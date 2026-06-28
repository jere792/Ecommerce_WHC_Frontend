import { useEffect, useState } from "react";
import { supabase } from '../../lib/supabaseClient';

interface Producto {
  idProducto: number;
  nombreProducto: string;
  precioProducto: number;
  descripcionProducto: string;
  imagenProducto?: string;
  slug: string;
  marca: string;
}

interface ProductDetailProps {
  slug: string;
}

export default function ProductDetail({ slug }: ProductDetailProps) {
  const [producto, setProducto] = useState<Producto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProducto(null);
    setError(null);
    supabase
      .from('producto')
      .select('*, marca:pk_marca_producto(*)')
      .eq('slug', slug)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setError("Producto no encontrado");
          return;
        }
        setProducto({
          idProducto: data.id_producto,
          nombreProducto: data.nombre_producto,
          precioProducto: Number(data.precio_producto),
          descripcionProducto: data.descripcion_producto || '',
          imagenProducto: data.imagen_producto,
          slug: data.slug,
          marca: (data as any).marca?.nombre_marca_producto || '',
        });
      });
  }, [slug]);

  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!producto) return <div className="p-8 text-center text-gray-400">Cargando producto...</div>;

  return (
    <div className="bg-white rounded-xl shadow-lg grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
      <div>
        <div className="bg-blue-50 rounded-lg flex items-center justify-center h-80 mb-4">
          {producto.imagenProducto ? (
            <img src={producto.imagenProducto} alt={producto.nombreProducto} className="h-72 object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-blue-200">Sin imagen</div>
          )}
        </div>
        <div className="flex gap-2 justify-center">
          {[producto.imagenProducto, producto.imagenProducto, producto.imagenProducto, producto.imagenProducto].map((img, i) =>
            <div key={i} className="w-16 h-16 rounded bg-blue-100 flex items-center justify-center overflow-hidden">
              {img ? <img src={img} alt="" className="h-full object-contain" /> : <span />}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 mb-2">{producto.nombreProducto}</h1>
          <div className="text-xl font-semibold text-blue-600 mb-4">S/. {producto.precioProducto.toFixed(2)}</div>
          <p className="text-gray-600 mb-6">{producto.descripcionProducto}</p>
          <div className="flex items-center gap-3 mb-6">
            <button className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold">-</button>
            <span className="text-lg font-semibold">1</span>
            <button className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold">+</button>
          </div>
          <button className="w-full py-3 rounded-full bg-gradient-to-r from-blue-700 to-blue-400 text-white font-bold shadow mb-3 hover:from-blue-800 hover:to-blue-500 transition-all">
            Añadir al carrito
          </button>
          <div className="text-xs text-blue-800 text-center mb-4">Envío gratis a partir de S/. 200</div>
        </div>
        <div className="mt-4 border-t divide-y">
          <details className="py-2 cursor-pointer">
            <summary className="font-medium text-blue-800">Características</summary>
            <div className="text-sm text-gray-600 pt-2">- Marca: {producto.marca}</div>
          </details>
          <details className="py-2 cursor-pointer">
            <summary className="font-medium text-blue-800">Cuidados</summary>
            <div className="text-sm text-gray-600 pt-2">Limpieza y uso adecuado.</div>
          </details>
          <details className="py-2 cursor-pointer">
            <summary className="font-medium text-blue-800">Envío</summary>
            <div className="text-sm text-gray-600 pt-2">Delivery gratis a compras mayores a S/. 200</div>
          </details>
          <details className="py-2 cursor-pointer">
            <summary className="font-medium text-blue-800">Devoluciones</summary>
            <div className="text-sm text-gray-600 pt-2">Consulta políticas de devolución.</div>
          </details>
        </div>
      </div>
    </div>
  );
}
