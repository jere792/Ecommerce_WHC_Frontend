import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";
import PageHeroBanner from '../../components/ui/PageHero';
import { Publicidad } from '../../components/ui/Publicidad';
import Marcas from '../../components/ui/Marcas';
import ProductCard from '../../components/ui/ProductCard';
import { ProductCardSkeleton } from '../../components/ui/Skeleton';
import { supabase } from '../../lib/supabaseClient';
import type { Producto } from '../../lib/supabaseTypes';

interface ProductoAdapted {
  idProducto: number;
  nombreProducto: string;
  precio: number;
  descripcionProducto: string;
  imagenProducto?: string;
  slug: string;
  marca: string;
  stockProducto: number;
}

const MARCAS = [
  "Trébol", "Sloan", "Genebre", "Vainsa", "Helvex", "Leeyes", "Sunmixer"
];

const PAGE_SIZE = 8;

const ProductsPage: React.FC = () => {
  const [productos, setProductos] = useState<ProductoAdapted[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroMarcas, setFiltroMarcas] = useState<string[]>([]);
  const [precioMax, setPrecioMax] = useState<number>(0);

  const [paginaActual, setPaginaActual] = useState(1);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const searchQuery = params.get("search")?.toLowerCase() || "";

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('producto')
          .select('*, marca:pk_marca_producto(*)');
        if (data) {
          const adaptados: ProductoAdapted[] = (data as unknown as (Producto & { marca?: { nombre_marca_producto: string } })[]).map((p) => ({
            idProducto: p.id_producto,
            nombreProducto: p.nombre_producto,
            precio: Number(p.precio_producto),
            descripcionProducto: p.descripcion_producto || '',
            imagenProducto: p.imagen_producto || undefined,
            slug: p.slug,
            marca: p.marca?.nombre_marca_producto || '',
            stockProducto: p.stock_producto,
          }));
          setProductos(adaptados);
        }
        setLoading(false);
      } catch {
        setLoading(false);
      }
    })();
  }, []);

  const hayProductos = productos.length > 0;
  const precios = productos.map(p => p.precio);
  const precioMasBajo = hayProductos ? Math.min(...precios) : 0;
  const precioMasAlto = hayProductos ? Math.max(...precios) : 0;

  useEffect(() => {
    if (hayProductos) {
      setPrecioMax(precioMasAlto);
    }
  }, [precioMasAlto, hayProductos]);

  const handleMarcaChange = (marca: string) => {
    setFiltroMarcas(prev =>
      prev.includes(marca)
        ? prev.filter(m => m !== marca)
        : [...prev, marca]
    );
    setPaginaActual(1);
  };

  const limpiarFiltros = () => {
    setFiltroMarcas([]);
    setPrecioMax(precioMasAlto);
    setPaginaActual(1);
  };

  const filtrosActivos = filtroMarcas.length > 0 || precioMax < precioMasAlto;

  const rangoPrecio = precioMasAlto - precioMasBajo;
  const porcentajePrecio = rangoPrecio > 0 ? ((precioMax - precioMasBajo) / rangoPrecio) * 100 : 0;

  const productosFiltrados = productos
    .filter(prod =>
      (filtroMarcas.length === 0 || filtroMarcas.includes(prod.marca)) &&
      prod.precio <= precioMax &&
      prod.nombreProducto.toLowerCase().includes(searchQuery)
    )
    .sort((a, b) => a.precio - b.precio);

  const cantidadResultados = productosFiltrados.length;
  const totalPaginas = Math.ceil(cantidadResultados / PAGE_SIZE);
  const productosPaginados = productosFiltrados.slice(
    (paginaActual - 1) * PAGE_SIZE,
    paginaActual * PAGE_SIZE
  );

  const cambiarPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) setPaginaActual(pagina);
  };

  const Pagination = () => (
    <div className="flex justify-center items-center gap-2 my-6">
      <button
        onClick={() => cambiarPagina(paginaActual - 1)}
        disabled={paginaActual === 1}
        className="px-2 py-1 text-blue-700 disabled:text-gray-400"
        aria-label="Página anterior"
      >
        &lt;
      </button>
      {Array.from({ length: totalPaginas }, (_, i) => (
        <button
          key={i + 1}
          onClick={() => cambiarPagina(i + 1)}
          className={`px-2 py-1 rounded ${paginaActual === i + 1 ? 'bg-blue-600 text-white' : 'text-blue-700 hover:bg-blue-100'}`}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={() => cambiarPagina(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
        className="px-2 py-1 text-blue-700 disabled:text-gray-400"
        aria-label="Página siguiente"
      >
        &gt;
      </button>
    </div>
  );

  return (
    <div>
      <PageHeroBanner pagina="productos" />

      <div className="block lg:hidden px-4 mb-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-4">
          <div>
            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Marca</span>
            <div className="flex flex-wrap gap-2 mt-3">
              {MARCAS.map(marca => {
                const active = filtroMarcas.includes(marca);
                return (
                  <button
                    key={marca}
                    onClick={() => handleMarcaChange(marca)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {marca}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="border-t border-gray-100 pt-3">
            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Precio</span>
            {hayProductos && precioMasBajo < precioMasAlto ? (
              <div className="mt-3">
                <input
                  type="range"
                  min={precioMasBajo}
                  max={precioMasAlto}
                  value={precioMax}
                  onChange={e => setPrecioMax(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer
                             [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                             [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow
                             [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full
                             [&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full"
                  style={{
                    background: `linear-gradient(to right, #2563eb ${porcentajePrecio}%, #e5e7eb ${porcentajePrecio}%)`,
                  }}
                />
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-400">S/. {precioMasBajo}</span>
                  <span className="font-semibold text-blue-700">Hasta S/. {precioMax}</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-xs mt-2">No hay productos para filtrar</div>
            )}
          </div>
          {filtrosActivos && (
            <button onClick={limpiarFiltros} className="text-sm text-red-500 hover:text-red-700 font-medium self-start">
              Limpiar filtros
            </button>
          )}
        </div>
        <div className="text-sm font-medium text-gray-500 mt-2">{cantidadResultados} Resultados</div>
      </div>

      <div className="container mx-auto py-8 px-4 flex flex-col lg:flex-row gap-8">
        <aside className="hidden lg:block w-1/5 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Filtros</h3>
              {filtrosActivos && (
                <button onClick={limpiarFiltros} className="text-xs text-red-500 hover:text-red-700 font-medium">
                  Limpiar
                </button>
              )}
            </div>
            <div className="mb-5">
              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide block mb-3">Marca</span>
              <div className="flex flex-col gap-1.5">
                {MARCAS.map(marca => {
                  const active = filtroMarcas.includes(marca);
                  return (
                    <button
                      key={marca}
                      onClick={() => handleMarcaChange(marca)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                      }`}
                    >
                      <span className={`inline-block w-4 h-4 rounded mr-2 align-middle border-2 transition-all ${
                        active ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                      }`}>
                        {active && <svg className="w-3 h-3 text-white mx-auto mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </span>
                      {marca}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide block mb-3">Precio</span>
              {hayProductos && precioMasBajo < precioMasAlto ? (
                <div>
                  <input
                    type="range"
                    min={precioMasBajo}
                    max={precioMasAlto}
                    value={precioMax}
                    onChange={e => setPrecioMax(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer
                               [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                               [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow
                               [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full
                               [&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full"
                    style={{
                      background: `linear-gradient(to right, #2563eb ${porcentajePrecio}%, #e5e7eb ${porcentajePrecio}%)`,
                    }}
                  />
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-400">S/. {precioMasBajo}</span>
                    <span className="font-semibold text-blue-700">Hasta S/. {precioMax}</span>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-sm">No hay productos para filtrar</div>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="text-sm font-medium text-gray-500">{cantidadResultados} Resultados</div>
            </div>
          </div>
        </aside>

        <main className="w-full lg:w-4/5">
          <div className="text-sm font-medium text-gray-500 mb-3 hidden lg:block">{cantidadResultados} Resultados</div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          ) : productosPaginados.length === 0 ? (
            <div className="col-span-full text-center">No hay productos disponibles.</div>
          ) : (
            productosPaginados.map(producto => (
              <ProductCard
                key={producto.idProducto}
                id={producto.idProducto}
                nombre={producto.nombreProducto}
                descripcion={producto.descripcionProducto}
                imagen={producto.imagenProducto}
                slug={producto.slug}
                precio={producto.precio}
                stock={producto.stockProducto}
              />
            ))
          )}
        </div>
          {totalPaginas > 1 && <Pagination />}
        </main>
      </div>

      <Publicidad textoPromocional="Delivery gratis a compras mayores a S/.200" />
      <Marcas />
    </div>
  );
};

export default ProductsPage;
