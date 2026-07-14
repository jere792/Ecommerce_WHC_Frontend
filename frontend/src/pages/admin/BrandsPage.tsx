import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { MarcaProducto } from '../../lib/supabaseTypes';
import { Edit, Trash2, Tag } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import FilterBar from '../../components/ui/FilterBar';
import CardList, { type CardField } from '../../components/ui/CardList';

const PAGE_SIZE = 12;

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

  const fields: CardField<any>[] = [
    {
      className: 'flex items-center gap-4',
      render: (b) => (
        <>
          <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border">
            {b.logo_url ? (
              <img src={b.logo_url} alt="" className="w-full h-full object-contain p-1" />
            ) : (
              <span className="text-muted-foreground text-2xl font-bold">{(b.nombre_marca_producto || '?')[0]}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{b.nombre_marca_producto}</p>
            {b.descripcion_marca_producto && (
              <p className="text-xs text-muted-foreground truncate">{b.descripcion_marca_producto}</p>
            )}
          </div>
          <button
            onClick={() => toggleHome(b)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              b.mostrar_en_home
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {b.mostrar_en_home ? 'Sí' : 'No'}
          </button>
        </>
      ),
    },
    {
      className: 'flex items-center gap-2 mt-4 pt-3 border-t border-border',
      render: (b) => (
        <>
          <button
            onClick={() => navigate(`/admin/marcas/editar/${b.id_marca_producto}`)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
          >
            <Edit className="w-3.5 h-3.5" /> Editar
          </button>
          <button
            onClick={() => handleDelete(b.id_marca_producto)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Eliminar
          </button>
        </>
      ),
    },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">Cargando...</div>;

  return (
    <div>
      <PageHeader title="Marcas" description="Gestiona las marcas de productos" icon={<Tag className="w-5 h-5" />} buttonLabel="Nueva marca" buttonTo="/admin/marcas/nueva" />

      <FilterBar
        title="marcas"
        fields={[
          { type: 'search', value: search, onChange: setSearch, placeholder: 'Buscar por nombre...' },
        ]}
        onClear={() => setSearch('')}
      />

      <CardList
        fields={fields}
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
