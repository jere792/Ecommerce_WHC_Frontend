import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { MarcaProducto } from '../../lib/supabaseTypes';
import { Edit, Trash2, Search } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable, { type Column } from '../../components/ui/DataTable';

const PAGE_SIZE = 10;

export default function AdminBrands() {
  const [brands, setBrands] = useState<(MarcaProducto & { logo_url?: string; mostrar_en_home?: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => { loadBrands(); }, []);

  const loadBrands = async () => {
    const { data } = await supabase.from('marca_producto').select('*').order('id_marca_producto', { ascending: true });
    if (data) setBrands(data as any);
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminar esta marca?')) return;
    await supabase.from('marca_producto').delete().eq('id_marca_producto', id);
    loadBrands();
  };

  const toggleHome = async (brand: any) => {
    await supabase.from('marca_producto').update({ mostrar_en_home: !brand.mostrar_en_home }).eq('id_marca_producto', brand.id_marca_producto);
    loadBrands();
  };

  const filtered = useMemo(() => {
    if (search.length < 3) return brands;
    const q = search.toLowerCase();
    return brands.filter((b) => b.nombre_marca_producto.toLowerCase().includes(q));
  }, [brands, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search]);

  const columns: Column<any>[] = [
    {
      header: 'Logo',
      render: (b) =>
        b.logo_url ? (
          <img src={b.logo_url} alt="" className="h-10 object-contain" />
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        ),
    },
    {
      header: 'Marca',
      render: (b) => <span className="font-medium text-foreground">{b.nombre_marca_producto}</span>,
    },
    {
      header: 'En home',
      render: (b) => (
        <button
          onClick={() => toggleHome(b)}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            b.mostrar_en_home
              ? 'bg-[var(--success-bg)] text-[var(--success)]'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {b.mostrar_en_home ? 'Sí' : 'No'}
        </button>
      ),
    },
    {
      header: 'Acciones',
      render: (b) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/admin/marcas/editar/${b.id_marca_producto}`)}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(b.id_marca_producto)}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">Cargando...</div>;

  return (
    <div>
      <PageHeader title="Marcas" buttonLabel="Nueva marca" buttonTo="/admin/marcas/nueva" />

      <div className="flex items-center gap-3 mb-4 p-4 border border-border rounded-lg bg-background">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginated}
        keyExtractor={(b) => b.id_marca_producto}
        emptyMessage="No se encontraron marcas"
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
