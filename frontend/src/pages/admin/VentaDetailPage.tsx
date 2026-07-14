import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { Pedido } from '../../lib/supabaseTypes';
import { ShoppingCart, ArrowLeft, FileText, User, Phone, CalendarDays, Tag } from 'lucide-react';
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

  const handlePdf = async () => {
    if (!venta) return;
    try {
      await generateCotizacion(venta);
    } catch {
      showToast('Error al generar PDF', 'error');
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">Cargando...</div>;
  if (!venta) return <div className="text-center py-12 text-muted-foreground">Venta no encontrada</div>;

  return (
    <div>
      <PageHeader
        title="Detalle de venta"
        description="Detalle de la venta"
        icon={<ShoppingCart className="w-5 h-5" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda: Datos del cliente */}
        <div className="border border-border rounded-lg bg-background overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-border bg-muted/30">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Datos del cliente
            </h3>
          </div>
          <div className="p-5 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Nombres completos</p>
                  <p className="text-sm font-medium text-foreground">{venta.nombre || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <p className="text-sm text-foreground">{venta.telefono || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarDays className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Fecha</p>
                  <p className="text-sm text-foreground">{new Date(venta.fecha).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Tag className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Estado</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[venta.estado_pago] || 'bg-muted text-muted-foreground'}`}>
                    {venta.estado_pago}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: Productos */}
        <div className="border border-border rounded-lg bg-background overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-border bg-muted/30">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
              Productos
            </h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Producto</th>
                  <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 w-20">Cantidad</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 w-24">Precio</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3 w-24">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(venta.detalles || []).map((d: any) => (
                  <tr key={d.id_pedido_detalle || Math.random()} className="hover:bg-muted/30">
                    <td className="px-5 py-3 text-sm text-foreground">
                      {d.producto?.nombre_producto || `Producto #${d.pk_producto_pedido}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-foreground">{d.cantidad_pedido}</td>
                    <td className="px-4 py-3 text-sm text-right text-foreground">
                      S/{Number(d.producto?.precio_producto || 0).toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-sm text-right font-medium text-foreground">
                      S/{((d.cantidad_pedido || 0) * Number(d.producto?.precio_producto || 0)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-4 border-t border-border bg-muted/20">
            <div className="flex items-center justify-end gap-4">
              <span className="text-sm font-medium text-foreground">Total</span>
              <span className="text-xl font-bold text-foreground">S/{Number(venta.monto_total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Botones inferiores */}
      <div className="flex items-center justify-end gap-3 mt-6">
        <button
          onClick={() => navigate('/admin/ventas')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a ventas
        </button>
        {venta.estado_pago === 'pendiente' && (
          <button
            onClick={handlePdf}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors"
          >
            <FileText className="w-4 h-4" />
            Descargar cotización PDF
          </button>
        )}
      </div>
    </div>
  );
}
