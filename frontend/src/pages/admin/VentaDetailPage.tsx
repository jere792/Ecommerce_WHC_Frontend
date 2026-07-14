import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { Pedido } from '../../lib/supabaseTypes';
import { ShoppingCart, ArrowLeft, FileText } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { generateCotizacion } from '../../lib/generatePdf';
import { useToast } from '../../components/ui/Toast';

const STATUS_COLORS: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  pagado: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rechazado: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function AdminVentaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [venta, setVenta] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVenta();
  }, [id]);

  const loadVenta = async () => {
    const { data } = await supabase
      .from('pedido')
      .select('*, detalles:pedido_detalles(*, producto:pk_producto_pedido(*))')
      .eq('id_pedido', id)
      .single();
    if (data) setVenta(data as unknown as Pedido);
    setLoading(false);
  };

  const handlePdf = () => {
    if (!venta) return;
    try {
      generateCotizacion(venta);
    } catch {
      showToast('Error al generar PDF', 'error');
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">Cargando...</div>;
  if (!venta) return <div className="text-center py-12 text-muted-foreground">Venta no encontrada</div>;

  return (
    <div>
      <PageHeader
        title={`Venta #${venta.id_pedido}`}
        description="Detalle de la venta"
        icon={<ShoppingCart className="w-5 h-5" />}
      />

      <div className="border border-border rounded-lg p-6 bg-background max-w-4xl mx-auto mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Cliente</p>
            <p className="text-sm font-medium text-foreground">{venta.nombre || '—'}</p>
            {venta.telefono && <p className="text-xs text-muted-foreground">{venta.telefono}</p>}
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Fecha</p>
            <p className="text-sm text-foreground">{new Date(venta.fecha).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Estado</p>
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[venta.estado_pago] || 'bg-muted text-muted-foreground'}`}>
              {venta.estado_pago}
            </span>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total</p>
            <p className="text-xl font-bold text-foreground">S/{Number(venta.monto_total).toFixed(2)}</p>
          </div>
        </div>

        {venta.estado_pago === 'pendiente' && (
          <div className="mt-4 pt-4 border-t border-border flex justify-end">
            <button
              onClick={handlePdf}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors"
            >
              <FileText className="w-4 h-4" />
              Descargar cotización PDF
            </button>
          </div>
        )}
      </div>

      <div className="border border-border rounded-lg bg-background max-w-4xl mx-auto overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Productos</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Producto</th>
              <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Cantidad</th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Precio</th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(venta.detalles || []).map((d: any) => (
              <tr key={d.id_pedido_detalle || Math.random()} className="hover:bg-muted/30">
                <td className="px-6 py-3 text-sm text-foreground">
                  {d.producto?.nombre_producto || `Producto #${d.pk_producto_pedido}`}
                </td>
                <td className="px-4 py-3 text-sm text-center text-foreground">{d.cantidad_pedido}</td>
                <td className="px-4 py-3 text-sm text-right text-foreground">
                  S/{Number(d.producto?.precio_producto || 0).toFixed(2)}
                </td>
                <td className="px-6 py-3 text-sm text-right font-medium text-foreground">
                  S/{((d.cantidad_pedido || 0) * Number(d.producto?.precio_producto || 0)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-muted/30">
            <tr>
              <td colSpan={3} className="px-6 py-3 text-sm font-medium text-right text-foreground">Total</td>
              <td className="px-6 py-3 text-sm font-bold text-right text-foreground">
                S/{Number(venta.monto_total).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex justify-center max-w-4xl mx-auto mt-6">
        <button
          onClick={() => navigate('/admin/ventas')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a ventas
        </button>
      </div>
    </div>
  );
}
