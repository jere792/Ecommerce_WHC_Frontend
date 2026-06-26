import { useEffect, useState } from "react";
import ProductCard from "../ui/ProductCard";
import { ProductCardSkeleton } from "../ui/Skeleton";
import { supabase } from '../../lib/supabaseClient';

interface Producto {
  idProducto: number;
  nombreProducto: string;
  precioProducto: number;
  descripcionProducto: string;
  imagenProducto?: string;
  slug: string;
  marca: string;
  categoria: string;
  stockProducto: number; 
}

interface ProductCarouselProps {
  pkCategoria: string;
  titulo: string;
  subtitulo?: string;
}

export default function ProductCarousel({ pkCategoria, titulo, subtitulo }: ProductCarouselProps) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    supabase
      .from('producto')
      .select('*, categoria:pk_categoria_producto(*), marca:pk_marca_producto(*)')
      .then(({ data }) => {
        if (data) {
          const adaptados: Producto[] = data.map((p: any) => ({
            idProducto: p.id_producto,
            nombreProducto: p.nombre_producto,
            precioProducto: Number(p.precio_producto),
            descripcionProducto: p.descripcion_producto || '',
            imagenProducto: p.imagen_producto,
            slug: p.slug,
            marca: p.marca?.nombre_marca_producto || '',
            categoria: p.categoria?.nombre_categoria_producto || '',
            stockProducto: p.stock_producto,
          }));
          setProductos(adaptados);
        }
        setLoading(false);
      });
  }, []);

  const productosFiltrados = productos.filter(prod =>
    prod.categoria?.toLowerCase() === pkCategoria.toLowerCase()
  );

  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-blue-900 mb-1">
          {titulo}
        </h2>
        {subtitulo && (
          <div className="text-center text-gray-600 mb-4">{subtitulo}</div>
        )}

        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-2 px-2 scroll-smooth snap-x snap-mandatory"
               style={{ WebkitOverflowScrolling: "touch" }}>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="min-w-[260px] max-w-[280px] snap-start">
                  <ProductCardSkeleton />
                </div>
              ))
            ) : productosFiltrados.length === 0 ? (
              <div className="text-center w-full py-8 text-gray-400">No hay productos para esta categoría.</div>
            ) : (
              productosFiltrados.map(producto => (
                <div
                  key={producto.idProducto}
                  className="min-w-[260px] max-w-[280px] snap-start"
                >
                  <ProductCard
                    id={producto.idProducto}
                    nombre={producto.nombreProducto}
                    descripcion={producto.descripcionProducto}
                    imagen={producto.imagenProducto}
                    slug={producto.slug}
                    precio={producto.precioProducto}
                    stock={producto.stockProducto}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}