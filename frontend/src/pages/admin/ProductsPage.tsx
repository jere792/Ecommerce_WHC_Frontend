import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { MarcaProducto, Producto } from '../../lib/supabaseTypes';
import { Edit, Trash2, Package, AlertTriangle } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import ProductFilters from '../../components/ui/ProductFilters';
import DataTable, { type Column } from '../../components/ui/DataTable';

const PAGE_SIZE = 10;
const LOW_STOCK_THRESHOLD = 10;

type ViewMode = 'all' | 'lowStock';

export default function AdminProducts() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState<number>(0);
  const [view, setView] = useState<ViewMode>('all');
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
      result = result.filter((p) => p.nombre_producto.toLowerCase().includes(q));
    }

    if (brandFilter) {
      result = result.filter((p) => p.pk_marca_producto === brandFilter);
    }

    if (view === 'lowStock') {
      result = result.filter((p) => p.stock_producto <= LOW_STOCK_THRESHOLD);
    }

    return result;
  }, [products, search, brandFilter, view]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminar este producto?')) return;
    await supabase.from('producto').delete().eq('id_producto', id);
    setProducts((prev) => prev.filter((p) => p.id_producto !== id));
  };

  useEffect(() => {
    setPage(1);
  }, [search, brandFilter, view]);

  const columns: Column<Producto>[] = [
    {
      header: 'Imagen',
      render: (p) =>
        p.imagen_producto ? (
          <img
            src={p.imagen_producto}
            alt=""
            className="h-10 w-10 object-cover rounded border"
          />
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        ),
    },
    {
      header: 'Nombre',
      render: (p) => (
        <span className="font-medium text-foreground">{p.nombre_producto}</span>
      ),
    },
    {
      header: 'Marca',
      render: (p) => p.marca?.nombre_marca_producto || '-',
    },
    {
      header: 'Precio venta',
      render: (p) => `S/${Number(p.precio_producto).toFixed(2)}`,
    },
    {
      header: 'Stock',
      render: (p) => (
        <span
          className={`font-medium ${
            p.stock_producto <= LOW_STOCK_THRESHOLD
              ? 'text-destructive'
              : 'text-foreground'
          }`}
        >
          {p.stock_producto}
        </span>
      ),
    },
    {
      header: 'Categoria',
      render: (p) => p.categoria?.nombre_categoria_producto || '-',
    },
    {
      header: 'Estado',
      render: (p) => p.estado?.nombre_estado_producto || '-',
    },
    {
      header: 'Acciones',
      render: (p) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/admin/productos/editar/${p.slug}`)}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(p.id_producto)}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading)
    return (
      <div className="text-center py-10 text-muted-foreground">Cargando...</div>
    );

  return (
    <div>
      <PageHeader
        title="Productos"
        buttonLabel="Agregar producto"
        buttonTo="/admin/productos/nuevo"
      />

      <ProductFilters
        search={search}
        onSearchChange={setSearch}
        brandFilter={brandFilter}
        onBrandFilterChange={(v) => setBrandFilter(v)}
        brands={brands}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
              view === 'all'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Package className="w-4 h-4" />
            Listado normal
          </button>
          <button
            onClick={() => setView('lowStock')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
              view === 'lowStock'
                ? 'bg-destructive text-white shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Stock bajo (&le;{LOW_STOCK_THRESHOLD})
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginated}
        keyExtractor={(p) => p.id_producto}
        emptyMessage="No se encontraron productos"
      />

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 p-3 border border-border rounded-lg bg-background">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm rounded border border-border bg-background disabled:opacity-30 hover:bg-muted text-foreground transition-colors"
          >
            &lt; Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                p === page
                  ? 'bg-primary text-white border-primary'
                  : 'border-border bg-background hover:bg-muted text-foreground'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm rounded border border-border bg-background disabled:opacity-30 hover:bg-muted text-foreground transition-colors"
          >
            Siguiente &gt;
          </button>
        </div>
      )}
    </div>
  );
}
