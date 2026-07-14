import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { PageHero } from '../../lib/supabaseTypes';
import { Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';

const PAGINA_LABELS: Record<string, string> = {
  productos: 'Productos',
  contacto: 'Contacto',
  terminos: 'Términos',
  privacidad: 'Privacidad',
};

export default function AdminPageHero() {
  const [heroes, setHeroes] = useState<PageHero[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => { loadHeroes(); }, []);

  const loadHeroes = async () => {
    const { data } = await supabase.from('page_hero').select('*').order('pagina');
    if (data) setHeroes(data as PageHero[]);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (deleteId == null) return;
    const { error } = await supabase.from('page_hero').delete().eq('id_page_hero', deleteId);
    if (error) {
      showToast('Error al eliminar: ' + error.message, 'error');
    } else {
      showToast('Hero eliminado correctamente', 'warning');
    }
    setDeleteId(null);
    loadHeroes();
  };

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">Cargando...</div>;

  return (
    <div>
      <PageHeader
        title="Hero páginas"
        description="Administra los heroes de las páginas"
        icon={<ImageIcon className="w-5 h-5" />}
      />

      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Imagen</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Página</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Título</th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {heroes.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-muted-foreground text-sm">No hay heroes. Crea el primero.</td>
              </tr>
            ) : (
              heroes.map((h) => (
                <tr key={h.id_page_hero} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    {h.imagen_url ? (
                      <img src={h.imagen_url} alt="" className="h-14 w-24 rounded-lg object-cover border border-border" />
                    ) : (
                      <div className="h-14 w-24 rounded-lg bg-muted flex items-center justify-center border border-border">
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {PAGINA_LABELS[h.pagina] || h.pagina}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground">{h.titulo}</p>
                    {h.subtitulo && <p className="text-xs text-muted-foreground truncate max-w-[250px]">{h.subtitulo}</p>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => navigate(`/admin/page-hero/editar/${h.id_page_hero}`)}
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(h.id_page_hero)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={deleteId != null}
        title="Eliminar hero"
        message="¿Estás seguro de eliminar este hero de página? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
