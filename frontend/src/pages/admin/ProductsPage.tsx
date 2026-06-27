import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { MarcaProducto, Producto } from '../../lib/supabaseTypes';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

const PAGE_SIZE = 10;
const LOW_STOCK_THRESHOLD = 10;

export default function AdminProducts() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState<number>(0);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [brands, setBrands] = useState<MarcaProducto[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      supabase
        .from('producto')
        .select('*, categoria:pk_categoria_producto(*), marca:pk_marca_producto(*), estado:pk_estado_producto(*)')
        .order('id_producto', { ascending: false }),
      supabase.from('marca_p').select('*').order('nombre_marca_producto'),
    ]).then(([prodRes, brandRes]) => {
      if (prodRes.data) setProducts(prodRes.data as unknown as Producto[]);
      if (brandRes.data) setBrands(brandRes.data as MarcaProducto[]);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let result = products;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.nombre_producto.toLowerCase().includes(q));
    }

    if (brandFilter) {
      result = result.filter(p => p.pk_marca_producto === brandFilter);
    }

    if (lowStockOnly) {
      result = result.filter(p => p.stock_producto <= LOW_STOCK_THRESHOLD);
    }

    return result;
  }, [products, search, brandFilter, lowStockOnly]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminar este producto?')) return;
    await supabase.from('producto').delete().eq('id_producto', id);
    setProducts(prev => prev.filter(p => p.id_producto !== id));
  };

  useEffect(() => { setPage(1) }, [search, brandFilter, lowStockOnly]);

  if (loading) return <div className="text-center py-10 text-gray-500">Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Productos</h1>
        <Link
          to="/admin/productos/nuevo"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Nuevo producto
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-4 p-4 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <select
          value={brandFilter}
          onChange={e => setBrandFilter(Number(e.target.value))}
          className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value={0}>Todas las marcas</option>
          {brands.map(b => (
            <option key={b.id_marca_producto} value={b.id_marca_producto}>{b.nombre_marca_producto}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={e => setLowStockOnly(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Stock bajo (&le;{LOW_STOCK_THRESHOLD})
        </label>
        <span className="text-sm text-gray-500 ml-auto">
          {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Imagen</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Marca</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Precio venta</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Stock</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Categoria</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-400">No se encontraron productos</td>
              </tr>
            ) : (
              paginated.map((p) => (
                <tr key={p.id_producto} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3">
                    {p.imagen_producto ? (
                      <img src={p.imagen_producto} alt="" className="h-10 w-10 object-cover rounded border dark:border-gray-600" />
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{p.nombre_producto}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{p.marca?.nombre_marca_producto || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">S/{Number(p.precio_producto).toFixed(2)}</td>
                  <td className={`px-4 py-3 text-sm font-medium ${p.stock_producto <= LOW_STOCK_THRESHOLD ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {p.stock_producto}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{p.categoria?.nombre_categoria_producto || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{p.estado?.nombre_estado_producto || '-'}</td>
                  <td className="px-4 py-3 text-sm flex gap-2">
                    <button
                      onClick={() => navigate(`/admin/productos/editar/${p.slug}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id_producto)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm rounded border dark:border-gray-600 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            &lt; Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1.5 text-sm rounded border ${
                p === page
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm rounded border dark:border-gray-600 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            Siguiente &gt;
          </button>
        </div>
      )}
    </div>
  );
}
