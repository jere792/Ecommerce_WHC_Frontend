import { useEffect, useMemo, useState } from "react";
import ProductCard from "../ui/ProductCard";
import { ProductCardSkeleton } from "../ui/Skeleton";
import { supabase } from '../../lib/supabaseClient';
import type { CategoriaProducto } from '../../lib/supabaseTypes';

interface Producto {
  idProducto: number;
  nombreProducto: string;
  precioProducto: number;
  descripcionProducto: string;
  imagenProducto?: string;
  slug: string;
  marca: string;
  stockProducto: number;
  pkCategoria: number | null;
}

interface ProductCarouselProps {
  pkCategoria: number;
  titulo: string;
  subtitulo?: string;
}

function getAllDescendantIds(categorias: CategoriaProducto[], parentId: number): number[] {
  const ids: number[] = [parentId];
  const children = categorias.filter(c => c.pk_categoria_padre === parentId);
  for (const child of children) {
    ids.push(...getAllDescendantIds(categorias, child.id_categoria_producto));
  }
  return ids;
}

export default function ProductCarousel({ pkCategoria, titulo, subtitulo }: ProductCarouselProps) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaProducto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    Promise.all([
      supabase.from('producto').select('*, marca:pk_marca_producto(*), inventario:inventario!pk_producto(stock_actual)'),
      supabase.from('categoria_productos').select('*'),
    ]).then(([prodRes, catRes]) => {
      const allCategorias = (catRes.data ?? []) as CategoriaProducto[];
      setCategorias(allCategorias);
      const categoryIds = getAllDescendantIds(allCategorias, pkCategoria);

      if (prodRes.data) {
        const adaptados: Producto[] = prodRes.data
          .filter((p: any) => p.pk_categoria_producto && categoryIds.includes(p.pk_categoria_producto))
          .map((p: any) => ({
            idProducto: p.id_producto,
            nombreProducto: p.nombre_producto,
            precioProducto: Number(p.precio_producto),
            descripcionProducto: p.descripcion_producto || '',
            imagenProducto: p.imagen_producto,
            slug: p.slug,
            marca: p.marca?.nombre_marca_producto || '',
            stockProducto: p.inventario?.stock_actual ?? 0,
            pkCategoria: p.pk_categoria_producto,
          }));
        setProductos(adaptados);
      }
      setLoading(false);
    });
  }, [pkCategoria]);

  const categoriaNombreMap = useMemo(() => {
    const map = new Map<number, string>();
    categorias.forEach(c => map.set(c.id_categoria_producto, c.nombre_categoria_producto));
    return map;
  }, [categorias]);

  return (
    <section className="py-6 sm:py-8 md:py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-blue-900 mb-1">
          {titulo}
        </h2>
        {subtitulo && (
          <div className="text-center text-gray-600 mb-4">{subtitulo}</div>
        )}

        <div className="relative">
          <div className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto py-4 px-2 pr-8 sm:pr-2 scroll-smooth snap-x snap-mandatory hide-scrollbar"
               style={{ WebkitOverflowScrolling: "touch" }}>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="min-w-[75%] sm:min-w-[260px] sm:max-w-[280px] snap-start">
                  <ProductCardSkeleton />
                </div>
              ))
            ) : productos.length === 0 ? (
              <div className="text-center w-full py-8 text-gray-400">No hay productos para esta categoría.</div>
            ) : (
              productos.map(producto => (
                <div
                  key={producto.idProducto}
                  className="min-w-[75%] sm:min-w-[260px] sm:max-w-[280px] snap-start"
                >
                  <ProductCard
                    id={producto.idProducto}
                    nombre={producto.nombreProducto}
                    descripcion={producto.descripcionProducto}
                    imagen={producto.imagenProducto}
                    slug={producto.slug}
                    precio={producto.precioProducto}
                    stock={producto.stockProducto}
                    categoria={producto.pkCategoria ? categoriaNombreMap.get(producto.pkCategoria) : undefined}
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
