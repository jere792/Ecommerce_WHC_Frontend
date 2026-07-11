import { useEffect, useRef, useState } from "react";
import ProductCard from "../ui/ProductCard";
import { ProductCardSkeleton } from "../ui/Skeleton";
import { supabase } from '../../lib/supabaseClient';

interface ProductoSimple {
  idProducto: number;
  nombreProducto: string;
  descripcionProducto: string;
  imagenProducto?: string;
  slug: string;
  precioProducto: number;
  stockProducto: number;
  categoria?: string;
}

export default function NewProductsCarousel() {
  const [productos, setProductos] = useState<ProductoSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const treintaDiasAtras = new Date();
      treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);

      const { data } = await supabase
        .from('producto')
        .select('*, categoria:pk_categoria_producto(nombre_categoria_producto), inventario:inventario!pk_producto!left(stock_actual)')
        .gte('created_at', treintaDiasAtras.toISOString())
        .order('created_at', { ascending: false });

      if (data) {
        setProductos(
          data.map((p: any) => ({
            idProducto: p.id_producto,
            nombreProducto: p.nombre_producto,
            descripcionProducto: p.descripcion_producto || '',
            imagenProducto: p.imagen_producto,
            slug: p.slug,
            precioProducto: Number(p.precio_producto),
            stockProducto: p.inventario?.stock_actual ?? 0,
            categoria: p.categoria?.nombre_categoria_producto || undefined,
          }))
        );
      }
      setLoading(false);
    })();
  }, []);

  const scrollBy = (offset: number) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (productos.length === 0 && !loading) return null;

  return (
    <section className="py-6 sm:py-8 md:py-10 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-1">
            RECIÉN LLEGADOS
          </h2>
          <div className="text-gray-600 mb-4">
            Los últimos productos que acaban de llegar al catálogo
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => scrollBy(-320)}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 shadow w-10 h-10 items-center justify-center hover:bg-gray-100 transition -left-4"
            aria-label="Anterior"
          >
            <svg width={24} height={24} fill="none" stroke="currentColor"><path d="M15 19l-7-7 7-7" strokeWidth="2" /></svg>
          </button>
          <button
            onClick={() => scrollBy(320)}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 shadow w-10 h-10 items-center justify-center hover:bg-gray-100 transition -right-4"
            aria-label="Siguiente"
          >
            <svg width={24} height={24} fill="none" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeWidth="2" /></svg>
          </button>

          <div
            ref={carouselRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto py-4 px-2 pr-8 sm:pr-0 scroll-smooth snap-x snap-mandatory hide-scrollbar"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="snap-start min-w-[75%] sm:min-w-[260px] sm:max-w-[280px] flex-shrink-0">
                  <ProductCardSkeleton />
                </div>
              ))
            ) : (
              productos.map((p) => (
                <div key={p.idProducto} className="snap-start min-w-[75%] sm:min-w-[260px] sm:max-w-[280px] flex-shrink-0">
                  <ProductCard
                    id={p.idProducto}
                    nombre={p.nombreProducto}
                    descripcion={p.descripcionProducto}
                    imagen={p.imagenProducto}
                    slug={p.slug}
                    precio={p.precioProducto}
                    stock={p.stockProducto}
                    categoria={p.categoria}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </section>
  );
}
