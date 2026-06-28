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

  if (loading) return <div className="text-center py-10 text-muted-foreground">Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Productos</h1>
        <Link
          to="/admin/productos/nuevo"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" /> Nuevo producto
        </Link>
      </div>

      <div className="bg-background rounded-lg shadow mb-4 p-4 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border  rounded-lg text-sm bg-background text-foreground"
          />
        </div>
        <select
          value={brandFilter}
          onChange={e => setBrandFilter(Number(e.target.value))}
          className="border  rounded-lg px-3 py-2 text-sm bg-background text-foreground"
        >
          <option value={0}>Todas las marcas</option>
          {brands.map(b => (
            <option key={b.id_marca_producto} value={b.id_marca_producto}>{b.nombre_marca_producto}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={e => setLowStockOnly(e.target.checked)}
            className="rounded border-border text-primary focus:ring-primary"
          />
          Stock bajo (&le;{LOW_STOCK_THRESHOLD})
        </label>
        <span className="text-sm text-muted-foreground ml-auto">
          {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      <div className="bg-background rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Imagen</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Marca</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Precio venta</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Stock</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Categoria</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">No se encontraron productos</td>
              </tr>
            ) : (
              paginated.map((p) => (
                <tr key={p.id_producto} className="hover:bg-muted ">
                  <td className="px-4 py-3">
                    {p.imagen_producto ? (
                      <img src={p.imagen_producto} alt="" className="h-10 w-10 object-cover rounded border " />
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{p.nombre_producto}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{p.marca?.nombre_marca_producto || '-'}</td>
                  <td className="px-4 py-3 text-sm text-foreground">S/{Number(p.precio_producto).toFixed(2)}</td>
                  <td className={`px-4 py-3 text-sm font-medium ${p.stock_producto <= LOW_STOCK_THRESHOLD ? 'text-destructive' : 'text-foreground'}`}>
                    {p.stock_producto}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{p.categoria?.nombre_categoria_producto || '-'}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{p.estado?.nombre_estado_producto || '-'}</td>
                  <td className="px-4 py-3 text-sm flex gap-2">
                    <button
                      onClick={() => navigate(`/admin/productos/editar/${p.slug}`)}
                      className="text-primary hover:text-primary/80"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id_producto)}
                      className="text-destructive hover:text-destructive/80"
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
            className="px-3 py-1.5 text-sm rounded border  disabled:opacity-30 hover:bg-muted  text-foreground"
          >
            &lt; Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1.5 text-sm rounded border ${
                p === page
                  ? 'bg-primary text-white '
                  : 'border-border hover:bg-muted  text-foreground'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm rounded border  disabled:opacity-30 hover:bg-muted  text-foreground"
          >
            Siguiente &gt;
          </button>
        </div>
      )}
    </div>
  );
}


