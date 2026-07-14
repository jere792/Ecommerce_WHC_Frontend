import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { ChevronUp, ChevronDown, Edit, Trash2, Tag, Package } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import FilterBar from '../../components/ui/FilterBar';
import CardList, { type CardField } from '../../components/ui/CardList';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';

export default function AdminBrands() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState(1);
  const [confirmAction, setConfirmAction] = useState<{ id: number; mode: 'delete' | 'recover' } | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => { loadBrands(); }, [estadoFiltro]);

  const loadBrands = async () => {
    let query = supabase.from('marca_producto').select('*');
    if (estadoFiltro === 1) query = query.eq('activo', true);
    else if (estadoFiltro === 2) query = query.eq('activo', false);
    let { data } = await query.order('orden', { ascending: true, nullsFirst: false });
    if (data) {
      const needOrden = data.some((b: any) => b.orden == null);
      if (needOrden) {
        for (let i = 0; i < data.length; i++) {
          if (data[i].orden == null) {
            await supabase.from('marca_producto').update({ orden: i + 1 }).eq('id_marca_producto', data[i].id_marca_producto);
            data[i].orden = i + 1;
          }
        }
        const { data: reloaded } = await supabase.from('marca_producto').select('*').order('orden', { ascending: true });
        if (reloaded) data = reloaded;
      }
      setBrands(data as any);
    }
    setLoading(false);
  };

  const toggleActivo = async (brand: any) => {
    const nuevo = !(brand.activo !== false);
    const { error } = await supabase.from('marca_producto').update({ activo: nuevo }).eq('id_marca_producto', brand.id_marca_producto);
    if (error) { showToast('Error al cambiar estado: ' + error.message, 'error'); } else { showToast(`Marca ${nuevo ? 'activada' : 'inactivada'} correctamente`, nuevo ? 'success' : 'warning'); }
    loadBrands();
  };

  const handleConfirmAction = async () => {
    if (confirmAction == null) return;
    const { id, mode } = confirmAction;
    if (mode === 'delete') {
      const { error } = await supabase.from('marca_producto').update({ activo: false }).eq('id_marca_producto', id);
      if (error) { showToast('Error al eliminar: ' + error.message, 'error'); } else { showToast('Marca eliminada correctamente', 'warning'); }
    } else {
      const { error } = await supabase.from('marca_producto').update({ activo: true }).eq('id_marca_producto', id);
      if (error) { showToast('Error al recuperar: ' + error.message, 'error'); } else { showToast('Marca recuperada correctamente', 'success'); }
    }
    setConfirmAction(null);
    loadBrands();
  };

  const toggleHome = async (brand: any) => {
    const nuevo = !brand.mostrar_en_home;
    const { error } = await supabase.from('marca_producto').update({ mostrar_en_home: nuevo }).eq('id_marca_producto', brand.id_marca_producto);
    if (error) { showToast('Error al cambiar: ' + error.message, 'error'); } else { showToast(nuevo ? 'Mostrando en home' : 'Ocultada del home', nuevo ? 'success' : 'warning'); }
    loadBrands();
  };

  const handleMove = async (brand: any, direction: 'up' | 'down') => {
    const idx = filtered.findIndex((b: any) => b.id_marca_producto === brand.id_marca_producto);
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= filtered.length) return;

    const current = filtered[idx];
    const target = filtered[targetIdx];

    const { error: err1 } = await supabase.from('marca_producto').update({ orden: target.orden }).eq('id_marca_producto', current.id_marca_producto);
    const { error: err2 } = await supabase.from('marca_producto').update({ orden: current.orden }).eq('id_marca_producto', target.id_marca_producto);

    if (err1 || err2) {
      showToast('Error al reordenar', 'error');
    } else {
      showToast('Orden actualizado correctamente', 'success');
    }
    loadBrands();
  };

  const filtered = useMemo(() => {
    if (search.length < 3) return brands;
    const q = search.toLowerCase();
    return brands.filter((b: any) => b.nombre_marca_producto?.toLowerCase().includes(q));
  }, [brands, search]);

  const fields: CardField<any>[] = [
    {
      className: 'flex items-center gap-4',
      render: (b: any) => {
        const idx = filtered.findIndex((x: any) => x.id_marca_producto === b.id_marca_producto);
        return (
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
              {b.descripcion_marca && (
                <p className="text-xs text-muted-foreground truncate">{b.descripcion_marca}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMove(b, 'down')}
                  disabled={idx === filtered.length - 1}
                  className="p-0.5 rounded hover:bg-muted disabled:opacity-20 transition-colors leading-none"
                >
                  <ChevronDown className="w-3.5 h-3.5 text-foreground" />
                </button>
                <span className="text-xs font-medium text-muted-foreground w-4 text-center">{b.orden ?? '-'}</span>
                <button
                  onClick={() => handleMove(b, 'up')}
                  disabled={idx === 0}
                  className="p-0.5 rounded hover:bg-muted disabled:opacity-20 transition-colors leading-none"
                >
                  <ChevronUp className="w-3.5 h-3.5 text-foreground" />
                </button>
              </div>
              <div className="w-full border-t border-border" />
              <button
                onClick={() => toggleActivo(b)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                  b.activo !== false
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {b.activo !== false ? 'Activo' : 'Inactivo'}
              </button>
            </div>
          </>
        );
      },
    },
    {
      className: 'flex items-center gap-2 mt-4 pt-3 border-t border-border',
      render: (b: any) => (
        <>
          <button
            onClick={() => toggleHome(b)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shrink-0 ${
              b.mostrar_en_home ? 'bg-yellow-500' : 'bg-muted'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
              b.mostrar_en_home ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
          <span className="text-xs text-muted-foreground">{b.mostrar_en_home ? 'En home' : 'Oculto'}</span>
          <div className="flex-1" />
          <button
            onClick={() => navigate(`/admin/marcas/editar/${b.id_marca_producto}`)}
            className="flex items-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
          >
            <Edit className="w-3.5 h-3.5" /> Editar
          </button>
          {b.activo !== false ? (
            <button
              onClick={() => setConfirmAction({ id: b.id_marca_producto, mode: 'delete' })}
              className="flex items-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Eliminar
            </button>
          ) : (
            <button
              onClick={() => setConfirmAction({ id: b.id_marca_producto, mode: 'recover' })}
              className="flex items-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
            >
              <Package className="w-3.5 h-3.5" /> Recuperar
            </button>
          )}
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
          { type: 'search', label: 'Buscar marca', value: search, onChange: setSearch, placeholder: 'Buscar por nombre...' },
          { type: 'select', label: 'Estado', width: 'min-w-[420px] max-w-[420px]', value: estadoFiltro, onChange: setEstadoFiltro, options: [
            { value: 1, label: 'Activo' },
            { value: 2, label: 'Inactivo' },
            { value: 0, label: 'Todos' },
          ]},
        ]}
        onClear={() => { setSearch(''); setEstadoFiltro(1); }}
      />

      <CardList
        fields={fields}
        data={filtered}
        keyExtractor={(b: any) => b.id_marca_producto}
        emptyMessage="No se encontraron marcas"
      />

      <ConfirmDialog
        open={confirmAction != null}
        title={confirmAction?.mode === 'delete' ? 'Eliminar marca' : 'Recuperar marca'}
        message={confirmAction?.mode === 'delete' ? '¿Estás seguro de eliminar esta marca? Se desactivará de forma lógica.' : '¿Estás seguro de recuperar esta marca?'}
        confirmText={confirmAction?.mode === 'delete' ? 'Eliminar' : 'Recuperar'}
        variant={confirmAction?.mode === 'delete' ? 'destructive' : 'primary'}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
