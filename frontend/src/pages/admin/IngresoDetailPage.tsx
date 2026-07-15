import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { IngresoMercaderia } from '../../lib/supabaseTypes';
import { Package, ArrowLeft, CalendarDays, FileText } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';

export default function AdminIngresoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ingreso, setIngreso] = useState<IngresoMercaderia | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('ingreso_mercaderia')
      .select('*, detalles:ingreso_detalle(*, producto:pk_producto(*))')
      .eq('id_ingreso', id)
      .single()
      .then(({ data }) => {
        if (data) setIngreso(data as unknown as IngresoMercaderia);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">Cargando...</div>;
  if (!ingreso) return <div className="text-center py-12 text-muted-foreground">Ingreso no encontrado</div>;

  const totalCompra = (ingreso.detalles || []).reduce((s, d) => s + (d.cantidad * (d.precio_compra || 0)), 0);

  return (
    <div>
      <PageHeader
        title="Detalle de ingreso"
        description={ingreso.codigo_transaccion || `#${ingreso.id_ingreso}`}
        icon={<Package className="w-5 h-5" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-border rounded-lg bg-background overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-muted/30">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Información
            </h3>
          </div>
          <div className="p-5 space-y-3">
            <div>
              <span className="text-xs text-muted-foreground">Código</span>
              <p className="text-sm font-medium text-foreground font-mono">{ingreso.codigo_transaccion || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Fecha</span>
              <p className="text-sm text-foreground flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                {new Date(ingreso.fecha).toLocaleString('es-PE')}
              </p>
            </div>
            {ingreso.observacion && (
              <div>
                <span className="text-xs text-muted-foreground">Observación</span>
                <p className="text-sm text-foreground">{ingreso.observacion}</p>
              </div>
            )}
            <div>
              <span className="text-xs text-muted-foreground">Total productos</span>
              <p className="text-sm font-semibold text-foreground">{ingreso.detalles?.length || 0}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Total compra</span>
              <p className="text-sm font-bold text-foreground">S/{totalCompra.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-border rounded-lg bg-background overflow-hidden mt-6">
        <div className="px-5 py-4 border-b border-border bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground">Productos ({ingreso.detalles?.length || 0})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-medium text-muted-foreground">Producto</th>
                <th className="px-5 py-3.5 text-right text-xs font-medium text-muted-foreground">Cantidad</th>
                <th className="px-5 py-3.5 text-right text-xs font-medium text-muted-foreground">Precio compra</th>
                <th className="px-5 py-3.5 text-right text-xs font-medium text-muted-foreground">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(ingreso.detalles || []).map((d, i) => (
                <tr key={d.id_ingreso_detalle || i} className="hover:bg-muted transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {d.producto?.imagen_producto ? (
                        <img src={d.producto.imagen_producto} alt="" className="h-10 w-10 object-cover rounded border shrink-0" />
                      ) : (
                        <div className="h-10 w-10 rounded border border-border bg-muted shrink-0" />
                      )}
                      <span className="text-sm font-medium text-foreground">{d.producto?.nombre_producto || '—'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-right text-foreground">{d.cantidad}</td>
                  <td className="px-5 py-3.5 text-sm text-right text-foreground">
                    {d.precio_compra ? `S/${d.precio_compra.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-right font-semibold text-foreground">
                    S/{(d.cantidad * (d.precio_compra || 0)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-end mt-6">
        <button onClick={() => navigate('/admin/ingresos')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver a ingresos
        </button>
      </div>
    </div>
  );
}
