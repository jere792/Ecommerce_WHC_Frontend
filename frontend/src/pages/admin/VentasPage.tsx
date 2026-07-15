import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { Pedido } from '../../lib/supabaseTypes';
import { Eye, ShoppingCart, XCircle, CheckCircle, RotateCcw, FileText } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import FilterBar from '../../components/ui/FilterBar';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { useAuthContext } from '../../hooks/AuthContext';
import { generateCotizacion } from '../../lib/generatePdf';
import Pagination from '../../components/ui/Pagination';

const STATUS_COLORS: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  pagado: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rechazado: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const getDefaultFechaDesde = () => {
  const d = new Date();
  d.setDate(d.getDate() - 14);
  return d.toISOString().split('T')[0];
};

export default function AdminVentas() {
  const { user } = useAuthContext();
  const [ventas, setVentas] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [estadoFiltro, setEstadoFiltro] = useState(0);
  const [searchNombre, setSearchNombre] = useState('');
  const [fechaDesde, setFechaDesde] = useState(getDefaultFechaDesde());
  const [fechaHasta, setFechaHasta] = useState('');
  const [montoMin, setMontoMin] = useState('');
  const [montoMax, setMontoMax] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ id: number; mode: string } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => { loadVentas(); }, [estadoFiltro, searchNombre, fechaDesde, fechaHasta, montoMin, montoMax]);
  useEffect(() => { setPage(1); }, [estadoFiltro, searchNombre, fechaDesde, fechaHasta, montoMin, montoMax]);

  const loadVentas = async () => {
    setLoading(true);
    let query = supabase
      .from('pedido')
      .select('*, detalles:pedido_detalles(*, producto:pk_producto_pedido(*))')
      .order('fecha', { ascending: false });

    if (estadoFiltro === 1) query = query.eq('estado_pago', 'pendiente');
    else if (estadoFiltro === 2) query = query.eq('estado_pago', 'pagado');
    else if (estadoFiltro === 3) query = query.eq('estado_pago', 'rechazado');

    if (searchNombre) query = query.ilike('nombre', `%${searchNombre}%`);
    if (fechaDesde) query = query.gte('fecha', fechaDesde);
    if (fechaHasta) query = query.lte('fecha', `${fechaHasta}T23:59:59`);
    if (montoMin) query = query.gte('monto_total', Number(montoMin));
    if (montoMax) query = query.lte('monto_total', Number(montoMax));

    const { data } = await query;
    if (data) setVentas(data as unknown as Pedido[]);
    setLoading(false);
  };

  const handleConfirmAction = async () => {
    if (confirmAction == null) return;
    const { id, mode } = confirmAction;
    setConfirmAction(null);

    const venta = ventas.find(v => v.id_pedido === id);
    if (!venta) return;

    if (mode === 'pagar') {
      const { error } = await supabase.from('pedido').update({ estado_pago: 'pagado' }).eq('id_pedido', id);
      if (error) { showToast('Error al pagar: ' + error.message, 'error'); return; }

      const { data: pedido } = await supabase
        .from('pedido')
        .select('codigo_transaccion')
        .eq('id_pedido', id)
        .single();
      const codigo = (pedido as any)?.codigo_transaccion || `VTA-${id}`;

      const { data: detalles } = await supabase
        .from('pedido_detalles')
        .select('*')
        .eq('pk_pedido', id);

      for (const d of detalles || []) {
        const { error: rpcError } = await supabase.rpc('decrement_stock', { p_producto_id: d.pk_producto_pedido, p_cantidad: d.cantidad_pedido });
        if (rpcError) {
          showToast('Error al actualizar stock: ' + rpcError.message, 'error');
          continue;
        }
        await supabase.from('movimiento').insert({
          id_producto: d.pk_producto_pedido,
          tipo_movimiento: 'VENTA',
          cantidad: d.cantidad_pedido,
          observacion: codigo,
          responsable: user?.nombres || 'Admin',
        });
      }

      showToast('Venta marcada como pagada', 'success');
    } else if (mode === 'rechazar') {
      const { error } = await supabase.from('pedido').update({ estado_pago: 'rechazado' }).eq('id_pedido', id);
      if (error) { showToast('Error al rechazar: ' + error.message, 'error'); return; }
      showToast('Venta rechazada', 'warning');
    } else if (mode === 'anular') {
      const { error } = await supabase.from('pedido').update({ estado_pago: 'rechazado' }).eq('id_pedido', id);
      if (error) { showToast('Error al anular: ' + error.message, 'error'); return; }

      if (venta.estado_pago === 'pagado') {
        const { data: pedido } = await supabase
          .from('pedido')
          .select('codigo_transaccion')
          .eq('id_pedido', id)
          .single();
        const codigo = (pedido as any)?.codigo_transaccion || `ANULA-${id}`;

        const { data: detalles } = await supabase
          .from('pedido_detalles')
          .select('*')
          .eq('pk_pedido', id);

        for (const d of detalles || []) {
          const { error: rpcError } = await supabase.rpc('increment_stock', { p_producto_id: d.pk_producto_pedido, p_cantidad: d.cantidad_pedido });
          if (rpcError) {
            showToast('Error al revertir stock: ' + rpcError.message, 'error');
            continue;
          }
          await supabase.from('movimiento').insert({
            id_producto: d.pk_producto_pedido,
            tipo_movimiento: 'ANULACION',
            cantidad: d.cantidad_pedido,
            observacion: codigo,
            responsable: user?.nombres || 'Admin',
          });
        }
      }

      showToast('Venta anulada', 'warning');
    }

    loadVentas();
  };

  const getConfirmConfig = () => {
    if (!confirmAction) return { title: '', message: '', confirmText: '', variant: 'primary' as const };
    const { mode } = confirmAction;
    if (mode === 'pagar') return { title: 'Pagar venta', message: '¿Estás seguro de marcar esta venta como pagada? Se descontará del stock.', confirmText: 'Pagar', variant: 'primary' as const };
    if (mode === 'rechazar') return { title: 'Rechazar venta', message: '¿Estás seguro de rechazar esta venta?', confirmText: 'Rechazar', variant: 'destructive' as const };
    return { title: 'Anular venta', message: '¿Estás seguro de anular esta venta? Se revertirá el stock.', confirmText: 'Anular', variant: 'destructive' as const };
  };

  const handlePdf = async (v: Pedido) => {
    try {
      const { data } = await supabase
        .from('pedido')
        .select('*, detalles:pedido_detalles(*, producto:pk_producto_pedido(*))')
        .eq('id_pedido', v.id_pedido)
        .single();
      if (data) await generateCotizacion(data as unknown as Pedido);
    } catch {
      showToast('Error al generar PDF', 'error');
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">Cargando...</div>;

  const confirmCfg = getConfirmConfig();
  const paginatedVentas = ventas.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <PageHeader
        title="Ventas"
        description="Administra las ventas registradas"
        icon={<ShoppingCart className="w-5 h-5" />}
        buttonLabel="Generar venta"
        onButtonClick={() => navigate('/admin/ventas/nueva')}
      />

      <FilterBar
        title="ventas"
        fields={[
          { type: 'search', label: 'Cliente', value: searchNombre, onChange: setSearchNombre, placeholder: 'Buscar por nombre...' },
          { type: 'date', label: 'Fecha desde', value: fechaDesde, onChange: setFechaDesde, width: 'min-w-[200px]' },
          { type: 'date', label: 'Fecha hasta', value: fechaHasta, onChange: setFechaHasta, width: 'min-w-[200px]' },
        ]}
        fields2={[
          { type: 'select', label: 'Estado', value: estadoFiltro, onChange: setEstadoFiltro, options: [
            { value: 0, label: 'Todas' },
            { value: 1, label: 'Pendiente' },
            { value: 2, label: 'Pagado' },
            { value: 3, label: 'Rechazado' },
          ], width: 'flex-1' },
          { type: 'range', label: 'Monto', min: montoMin, max: montoMax, onMinChange: setMontoMin, onMaxChange: setMontoMax, minLimit: 0, maxLimit: 50000, width: 'flex-1' },
        ]}
        onClear={() => {
          setEstadoFiltro(0);
          setSearchNombre('');
          setFechaDesde(getDefaultFechaDesde());
          setFechaHasta('');
          setMontoMin('');
          setMontoMax('');
        }}
      />

      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 w-[15%]">Código</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 w-[25%]">Cliente</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 w-[18%]">Fecha</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 w-[15%]">Total</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 w-[12%]">Estado</th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 w-[15%]">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ventas.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">No hay ventas registradas.</td>
              </tr>
            ) : (
              paginatedVentas.map((v) => (
                <tr key={v.id_pedido} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground font-mono">{v.codigo_transaccion || `#${v.id_pedido}`}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{v.nombre || '—'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(v.fecha).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-foreground font-medium">S/{Number(v.monto_total).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[v.estado_pago] || 'bg-muted text-muted-foreground'}`}>
                      {v.estado_pago}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => navigate(`/admin/ventas/${v.id_pedido}`)}
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {v.estado_pago === 'pendiente' && (
                        <button
                          onClick={() => handlePdf(v)}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                          title="Descargar cotización"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      {v.estado_pago === 'pendiente' && (
                        <>
                          <button
                            onClick={() => setConfirmAction({ id: v.id_pedido, mode: 'pagar' })}
                            className="p-1.5 rounded-lg hover:bg-green-500/10 text-muted-foreground hover:text-green-600 transition-colors"
                            title="Pagar"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmAction({ id: v.id_pedido, mode: 'rechazar' })}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            title="Rechazar"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {v.estado_pago === 'pagado' && (
                        <button
                          onClick={() => setConfirmAction({ id: v.id_pedido, mode: 'anular' })}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          title="Anular"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pageSize={pageSize} total={ventas.length} onPageChange={setPage} onPageSizeChange={setPageSize} />

      <ConfirmDialog
        open={confirmAction != null}
        title={confirmCfg.title}
        message={confirmCfg.message}
        confirmText={confirmCfg.confirmText}
        variant={confirmCfg.variant}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
