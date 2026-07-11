import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { supabase } from '../../lib/supabaseClient';
import ProductCard from "./ProductCard";

interface ProductoData {
  idProducto: number;
  nombreProducto: string;
  precioProducto: number;
  descripcionProducto: string;
  imagenProducto?: string;
  slug: string;
  marca: string;
  stockProducto?: number;
  categoria: string;
}

interface Props {
  categoria: string;
  slug: string;
}

export default function ComprasSimilares({ categoria, slug }: Props) {
  const [similares, setSimilares] = useState<ProductoData[]>([]);

  useEffect(() => {
    supabase
      .from('producto')
      .select('*, marca:pk_marca_producto(*), categoria:pk_categoria_producto(*), inventario:inventario!pk_producto!left(stock_actual)')
      .then(({ data }) => {
        if (data) {
          const mismos: ProductoData[] = data
            .filter((p: any) => {
              const cat = p.categoria?.nombre_categoria_producto || '';
              return cat.toLowerCase() === categoria.toLowerCase() && p.slug !== slug;
            })
            .slice(0, 8)
            .map((p: any) => ({
              idProducto: p.id_producto,
              nombreProducto: p.nombre_producto,
              precioProducto: Number(p.precio_producto),
              descripcionProducto: p.descripcion_producto || '',
              imagenProducto: p.imagen_producto,
              slug: p.slug,
              marca: p.marca?.nombre_marca_producto || '',
              stockProducto: p.inventario?.stock_actual ?? 0,
              categoria: p.categoria?.nombre_categoria_producto || '',
            }));
          setSimilares(mismos);
        }
      });
  }, [categoria, slug]);

  if (similares.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2">
          <ChevronRight className="w-5 h-5 text-blue-700" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Compras similares</h2>
          <p className="text-xs text-gray-400">Productos relacionados con {categoria}</p>
        </div>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory">
        {similares.map(p => (
          <div key={p.idProducto} className="min-w-[240px] max-w-[260px] snap-start flex-shrink-0">
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
        ))}
      </div>
    </section>
  );
}
