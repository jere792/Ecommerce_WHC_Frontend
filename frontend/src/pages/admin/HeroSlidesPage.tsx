import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { HeroSlide } from '../../lib/supabaseTypes';
import { ChevronUp, ChevronDown, Edit, Trash2, Package, Image as ImageIcon } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import FilterBar from '../../components/ui/FilterBar';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';

export default function AdminHeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [estadoFiltro, setEstadoFiltro] = useState(1);
  const [confirmAction, setConfirmAction] = useState<{ id: number; mode: 'delete' | 'recover' } | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => { loadSlides(); }, [estadoFiltro]);

  const loadSlides = async () => {
    let query = supabase.from('hero_slide').select('*');
    if (estadoFiltro === 1) query = query.eq('activo', true);
    else if (estadoFiltro === 2) query = query.eq('activo', false);
    const { data } = await query.order('orden', { ascending: true });
    if (data) setSlides(data as HeroSlide[]);
    setLoading(false);
  };

  const handleConfirmAction = async () => {
    if (confirmAction == null) return;
    const { id, mode } = confirmAction;
    if (mode === 'delete') {
      const { error } = await supabase.from('hero_slide').update({ activo: false }).eq('id_hero_slide', id);
      if (error) { showToast('Error al eliminar: ' + error.message, 'error'); } else { showToast('Slide eliminado correctamente', 'warning'); }
    } else {
      const { error } = await supabase.from('hero_slide').update({ activo: true }).eq('id_hero_slide', id);
      if (error) { showToast('Error al recuperar: ' + error.message, 'error'); } else { showToast('Slide recuperado correctamente', 'success'); }
    }
    setConfirmAction(null);
    loadSlides();
  };

  const toggleActivo = async (slide: HeroSlide) => {
    const nuevo = !slide.activo;
    const { error } = await supabase.from('hero_slide').update({ activo: nuevo }).eq('id_hero_slide', slide.id_hero_slide);
    if (error) { showToast('Error al cambiar estado: ' + error.message, 'error'); } else { showToast(`Slide ${nuevo ? 'activado' : 'inactivado'} correctamente`, nuevo ? 'success' : 'warning'); }
    loadSlides();
  };

  const handleMove = async (slide: HeroSlide, direction: 'up' | 'down') => {
    const idx = sortedSlides.findIndex(s => s.id_hero_slide === slide.id_hero_slide);
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sortedSlides.length) return;

    const current = sortedSlides[idx];
    const target = sortedSlides[targetIdx];

    const { error: err1 } = await supabase.from('hero_slide').update({ orden: target.orden }).eq('id_hero_slide', current.id_hero_slide);
    const { error: err2 } = await supabase.from('hero_slide').update({ orden: current.orden }).eq('id_hero_slide', target.id_hero_slide);

    if (err1 || err2) {
      showToast('Error al reordenar', 'error');
    } else {
      showToast('Orden actualizado correctamente', 'success');
    }
    loadSlides();
  };

  const sortedSlides = useMemo(() =>
    [...slides].sort((a, b) => a.orden - b.orden),
  [slides]);

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">Cargando...</div>;

  return (
    <div>
      <PageHeader
        title="Hero Slides"
        description="Administra los slides del hero principal"
        icon={<ImageIcon className="w-5 h-5" />}
        buttonLabel="Nuevo slide"
        onButtonClick={() => navigate('/admin/hero-slides/nuevo')}
      />

      <FilterBar
        title="hero slides"
        fields={[
          { type: 'select', label: 'Estado', value: estadoFiltro, onChange: setEstadoFiltro, options: [
            { value: 1, label: 'Activo' },
            { value: 2, label: 'Inactivo' },
            { value: 0, label: 'Todos' },
          ]},
        ]}
        onClear={() => { setEstadoFiltro(1); }}
      />

      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Imagen</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Texto</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Orden</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Estado</th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedSlides.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">No hay slides. Crea el primero.</td>
              </tr>
            ) : (
              sortedSlides.map((s) => {
                const idx = sortedSlides.findIndex(x => x.id_hero_slide === s.id_hero_slide);
                return (
                  <tr key={s.id_hero_slide} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      {s.image_url ? (
                        <img src={s.image_url} alt="" className="h-14 w-24 rounded-lg object-cover border border-border" />
                      ) : (
                        <div className="h-14 w-24 rounded-lg bg-muted flex items-center justify-center border border-border">
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{s.texto || 'Sin texto'}</p>
                      {s.enlace && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{s.enlace}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMove(s, 'down')}
                          disabled={idx === sortedSlides.length - 1}
                          className="p-0.5 rounded hover:bg-muted disabled:opacity-20 transition-colors leading-none"
                        >
                          <ChevronDown className="w-3.5 h-3.5 text-foreground" />
                        </button>
                        <span className="text-sm text-foreground font-medium w-5 text-center">{s.orden}</span>
                        <button
                          onClick={() => handleMove(s, 'up')}
                          disabled={idx === 0}
                          className="p-0.5 rounded hover:bg-muted disabled:opacity-20 transition-colors leading-none"
                        >
                          <ChevronUp className="w-3.5 h-3.5 text-foreground" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActivo(s)}
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium cursor-pointer border-0 transition-colors ${
                          s.activo
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                            : 'bg-muted text-muted-foreground hover:bg-border'
                        }`}
                      >
                        {s.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/admin/hero-slides/editar/${s.id_hero_slide}`)}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {s.activo ? (
                          <button
                            onClick={() => setConfirmAction({ id: s.id_hero_slide, mode: 'delete' })}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirmAction({ id: s.id_hero_slide, mode: 'recover' })}
                            className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                            title="Recuperar"
                          >
                            <Package className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirmAction != null}
        title={confirmAction?.mode === 'delete' ? 'Eliminar slide' : 'Recuperar slide'}
        message={confirmAction?.mode === 'delete' ? '¿Estás seguro de eliminar este slide? Se marcará como inactivo.' : '¿Estás seguro de recuperar este slide?'}
        confirmText={confirmAction?.mode === 'delete' ? 'Eliminar' : 'Recuperar'}
        variant={confirmAction?.mode === 'delete' ? 'destructive' : 'primary'}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
