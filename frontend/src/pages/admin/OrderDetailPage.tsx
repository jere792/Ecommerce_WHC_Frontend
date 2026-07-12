import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { Pedido } from '../../lib/supabaseTypes';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    const { data } = await supabase
      .from('pedido')
      .select('*, usuario:pk_usuario(*), detalles:pedido_detalles(*, producto:pk_producto_pedido(*))')
      .eq('id_pedido', id)
      .single();
    if (data) setOrder(data as unknown as Pedido);
    setLoading(false);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">Cargando...</div>;
  if (!order) return <div className="text-center py-12 text-muted-foreground">Pedido no encontrado</div>;

  return (
    <div>
      <Link to="/admin/pedidos" className="text-primary hover:underline mb-4 block">&larr; Volver</Link>
      <h1 className="text-2xl font-bold mb-6 text-foreground">Pedido #{order.id_pedido}</h1>

      <div className="bg-background rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Usuario</p>
            <p className="font-medium text-foreground">{order.usuario?.nombre_persona}</p>
            <p className="text-sm text-muted-foreground">{order.usuario?.correo_persona}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fecha</p>
            <p className="font-medium text-foreground">{new Date(order.fecha).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Estado</p>
            <p className="font-medium text-foreground">{order.estado_pago}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="font-medium text-xl text-foreground">S/{Number(order.monto_total).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="bg-background rounded-lg shadow overflow-hidden">
        <h2 className="text-lg font-semibold p-4 border-b border-border text-foreground">Detalles del pedido</h2>
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Producto</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Cantidad</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Precio</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(order.detalles || []).map((d) => (
              <tr key={d.id_pedido_detalle} className="hover:bg-muted">
                <td className="px-4 py-3 text-sm text-foreground">{d.producto?.nombre_producto || 'Producto #' + d.pk_producto_pedido}</td>
                <td className="px-4 py-3 text-sm text-center text-foreground">{d.cantidad_pedido}</td>
                <td className="px-4 py-3 text-sm text-right text-foreground">
                  S/{Number(d.producto?.precio_producto || 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium text-foreground">
                  S/{((d.cantidad_pedido || 0) * Number(d.producto?.precio_producto || 0)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
