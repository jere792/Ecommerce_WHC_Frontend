import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { LibroReclamacion } from '../../lib/supabaseTypes';
import { BookOpen, Eye, CheckCircle, XCircle } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import FilterBar from '../../components/ui/FilterBar';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';

const ESTADO_COLORS: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  atendido: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  derivado: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  aprobado: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rechazado: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  anulado: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function AdminForms() {
  const [reclamos, setReclamos] = useState<LibroReclamacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState(0);
  const [tipoFiltro, setTipoFiltro] = useState(0);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ id: number; mode: string } | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => { loadReclamos(); }, [estadoFiltro, tipoFiltro, fechaDesde, fechaHasta]);

  const loadReclamos = async () => {
    let query = supabase
      .from('libro_reclamacion')
      .select('*')
      .order('id_reclamo', { ascending: false });

    if (estadoFiltro === 1) query = query.eq('estado', 'pendiente');
    else if (estadoFiltro === 2) query = query.eq('estado', 'atendido');
    else if (estadoFiltro === 3) query = query.eq('estado', 'anulado');
    if (tipoFiltro === 1) query = query.eq('tipo_reclamo', 'RECLAMO');
    else if (tipoFiltro === 2) query = query.eq('tipo_reclamo', 'QUEJA');
    if (fechaDesde) query = query.gte('created_at', fechaDesde);
    if (fechaHasta) query = query.lte('created_at', `${fechaHasta}T23:59:59`);

    const { data } = await query;
    if (data) setReclamos(data as LibroReclamacion[]);
    setLoading(false);
  };

  const handleConfirmAction = async () => {
    if (confirmAction == null) return;
    const { id, mode } = confirmAction;
    setConfirmAction(null);

    const nuevoEstado = mode === 'aprobar' ? 'aprobado' : 'rechazado';
    const { error } = await supabase.from('libro_reclamacion').update({ estado: nuevoEstado }).eq('id_reclamo', id);
    if (error) { showToast('Error al actualizar: ' + error.message, 'error'); } else { showToast(`Reclamo ${nuevoEstado} correctamente`, mode === 'aprobar' ? 'success' : 'warning'); }
    loadReclamos();
  };

  const filtered = useMemo(() => {
    if (!search || search.length < 3) return reclamos;
    const q = search.toLowerCase();
    return reclamos.filter(r =>
      r.nombre.toLowerCase().includes(q) ||
      (r.apellidos && r.apellidos.toLowerCase().includes(q)) ||
      (r.dni && r.dni.includes(q)) ||
      (r.correo && r.correo.toLowerCase().includes(q))
    );
  }, [reclamos, search]);

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">Cargando...</div>;

  const tipoColors: Record<string, string> = {
    RECLAMO: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    QUEJA: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  };

  return (
    <div>
      <PageHeader
        title="Libro de reclamos"
        description="Gestiona los reclamos y quejas registrados"
        icon={<BookOpen className="w-5 h-5" />}
      />

      <FilterBar
        title="reclamos"
        fields={[
          { type: 'search', label: 'Buscar', value: search, onChange: setSearch, placeholder: 'Buscar por nombre, DNI o correo (mín 3 caracteres)...' },
          { type: 'date', label: 'Fecha desde', value: fechaDesde, onChange: setFechaDesde, width: 'min-w-[200px]' },
          { type: 'date', label: 'Fecha hasta', value: fechaHasta, onChange: setFechaHasta, width: 'min-w-[200px]' },
        ]}
        fields2={[
          { type: 'select', label: 'Tipo', value: tipoFiltro, onChange: setTipoFiltro, options: [
            { value: 0, label: 'Todos' },
            { value: 1, label: 'Reclamo' },
            { value: 2, label: 'Queja' },
          ], width: 'flex-1' },
          { type: 'select', label: 'Estado', value: estadoFiltro, onChange: setEstadoFiltro, options: [
            { value: 0, label: 'Todos' },
            { value: 1, label: 'Pendiente' },
            { value: 2, label: 'Atendido' },
            { value: 3, label: 'Anulado' },
          ], width: 'flex-1' },
        ]}
        onClear={() => { setSearch(''); setEstadoFiltro(0); setTipoFiltro(0); setFechaDesde(''); setFechaHasta(''); }}
      />

      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Nombre</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">DNI</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Tipo</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Teléfono</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Estado</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Fecha</th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                  {search ? 'No se encontraron reclamos.' : 'No hay reclamos registrados.'}
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id_reclamo} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {r.nombre} {r.apellidos || ''}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{r.dni || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${tipoColors[r.tipo_reclamo || ''] || 'bg-muted text-muted-foreground'}`}>
                      {r.tipo_reclamo || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{r.telefono || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${ESTADO_COLORS[r.estado || ''] || 'bg-muted text-muted-foreground'}`}>
                      {r.estado || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => navigate(`/admin/libro-reclamos/${r.id_reclamo}`)}
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {(r.estado === 'pendiente' || !r.estado) && (
                        <>
                          <button
                            onClick={() => setConfirmAction({ id: r.id_reclamo, mode: 'aprobar' })}
                            className="p-1.5 rounded-lg hover:bg-green-500/10 text-muted-foreground hover:text-green-600 transition-colors"
                            title="Aprobar"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmAction({ id: r.id_reclamo, mode: 'rechazar' })}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            title="Rechazar"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirmAction != null}
        title={confirmAction?.mode === 'aprobar' ? 'Aprobar reclamo' : 'Rechazar reclamo'}
        message={confirmAction?.mode === 'aprobar' ? '¿Estás seguro de aprobar este reclamo?' : '¿Estás seguro de rechazar este reclamo?'}
        confirmText={confirmAction?.mode === 'aprobar' ? 'Aprobar' : 'Rechazar'}
        variant={confirmAction?.mode === 'aprobar' ? 'primary' : 'destructive'}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
