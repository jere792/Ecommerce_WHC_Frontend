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
      supabase.from('producto').select('*, marca:pk_marca_producto(*), inventario:inventario!pk_producto!left(stock_actual)'),
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

  const grupos = useMemo(() => {
    const map = new Map<string, Producto[]>();
    const catNombre = new Map<number, string>();
    categorias.forEach(c => catNombre.set(c.id_categoria_producto, c.nombre_categoria_producto));
    productos.forEach(p => {
      const key = p.pkCategoria ? catNombre.get(p.pkCategoria) || 'General' : 'General';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
    return map;
  }, [productos, categorias]);

  return (
    <section className="py-6 sm:py-8 md:py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-blue-900 mb-1">
          {titulo}
        </h2>
        {subtitulo && (
          <div className="text-center text-gray-600 mb-4">{subtitulo}</div>
        )}

        {loading ? (
          <div className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto py-4 px-2 pr-8 sm:pr-2 scroll-smooth snap-x snap-mandatory hide-scrollbar"
               style={{ WebkitOverflowScrolling: "touch" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="min-w-[75%] sm:min-w-[260px] sm:max-w-[280px] snap-start">
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        ) : productos.length === 0 ? (
          <div className="text-center w-full py-8 text-gray-400">No hay productos para esta categoría.</div>
        ) : (
          <div className="space-y-6">
            {Array.from(grupos.entries()).map(([subcatName, prods]) => (
              <div key={subcatName}>
                <h3 className="text-base font-bold text-blue-900 mb-2 border-l-4 border-blue-500 pl-3">
                  {subcatName}
                </h3>
                <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory hide-scrollbar"
                     style={{ WebkitOverflowScrolling: "touch" }}>
                  {prods.map(producto => (
                    <div
                      key={producto.idProducto}
                      className="min-w-[75%] sm:min-w-[260px] sm:max-w-[280px] snap-start flex-shrink-0"
                    >
                      <ProductCard
                        id={producto.idProducto}
                        nombre={producto.nombreProducto}
                        descripcion={producto.descripcionProducto}
                        imagen={producto.imagenProducto}
                        slug={producto.slug}
                        precio={producto.precioProducto}
                        stock={producto.stockProducto}
                        categoria={subcatName}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </section>
  );
}
