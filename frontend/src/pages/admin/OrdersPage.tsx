import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { Pedido } from '../../lib/supabaseTypes';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const estadoFilter = searchParams.get('estado');

  useEffect(() => {
    loadOrders();
  }, [estadoFilter]);

  const loadOrders = async () => {
    let query = supabase
      .from('pedido')
      .select('*, usuario:pk_usuario(*)')
      .order('fecha', { ascending: false });

    if (estadoFilter) {
      query = query.eq('estado_pago', estadoFilter);
    }

    const { data } = await query;
    if (data) setOrders(data as unknown as Pedido[]);
    setLoading(false);
  };

  const cambiarEstado = async (id: number, nuevoEstado: string) => {
    const orden = orders.find(o => o.id_pedido === id);
    if (!orden) return;

    await supabase.from('pedido').update({ estado_pago: nuevoEstado }).eq('id_pedido', id);
    await supabase.from('pedido_estado_pago').insert({
      pk_pedido: id,
      estado: nuevoEstado,
      comentario: `Cambiado a ${nuevoEstado} por administrador`,
    });

    if (nuevoEstado === 'atendido') {
      const { data: detalles } = await supabase
        .from('pedidodetalles')
        .select('*')
        .eq('pk_pedido', id);

      for (const detalle of detalles || []) {
        await supabase.rpc('decrement_stock', {
          p_producto_id: detalle.pk_producto_pedido,
          p_cantidad: detalle.cantidad_pedido,
        });
        await supabase.from('movimiento').insert({
          id_producto: detalle.pk_producto_pedido,
          tipo_movimiento: 'PEDIDO_ATENDIDO',
          cantidad: detalle.cantidad_pedido,
          observacion: `Pedido #${id}`,
        });
      }
    }

    if (nuevoEstado === 'rechazado' && orden.estado_pago === 'atendido') {
      const { data: detalles } = await supabase
        .from('pedidodetalles')
        .select('*')
        .eq('pk_pedido', id);

      for (const detalle of detalles || []) {
        await supabase.rpc('increment_stock', {
          p_producto_id: detalle.pk_producto_pedido,
          p_cantidad: detalle.cantidad_pedido,
        });
        await supabase.from('movimiento').insert({
          id_producto: detalle.pk_producto_pedido,
          tipo_movimiento: 'RECHAZADO',
          cantidad: detalle.cantidad_pedido,
          observacion: `Rechazado - Pedido #${id}`,
        });
      }
    }

    loadOrders();
  };

  const statusBadge = (estado: string) => {
    const colors: Record<string, string> = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      PAGADO: 'bg-green-100 text-green-800',
      atendido: 'bg-blue-100 text-blue-800',
      rechazado: 'bg-red-100 text-red-800',
    };
    return colors[estado] || 'bg-muted text-muted-foreground';
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-foreground">Pedidos</h1>
      <div className="mb-4 flex gap-2">
        {['', 'pendiente', 'PAGADO', 'atendido', 'rechazado'].map((est) => (
          <Link
            key={est}
            to={est ? `/admin/pedidos?estado=${est}` : '/admin/pedidos'}
            className={`px-3 py-1 rounded text-sm ${estadoFilter === est || (!estadoFilter && !est) ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}
          >
            {est || 'Todos'}
          </Link>
        ))}
      </div>
      <div className="bg-background rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Usuario</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Fecha</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Total</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((o) => (
              <tr key={o.id_pedido} className="hover:bg-muted">
                <td className="px-4 py-3 text-sm text-foreground">{o.id_pedido}</td>
                <td className="px-4 py-3 text-sm text-foreground">{o.usuario?.nombre_persona}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(o.fecha).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm text-foreground">S/{Number(o.monto_total).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusBadge(o.estado_pago)}`}>
                    {o.estado_pago}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm flex gap-2">
                  <Link to={`/admin/pedidos/${o.id_pedido}`} className="text-primary hover:underline text-sm">
                    Ver
                  </Link>
                  {o.estado_pago === 'pendiente' && (
                    <button
                      onClick={() => cambiarEstado(o.id_pedido, 'PAGADO')}
                      className="text-green-600 hover:underline text-sm"
                    >
                      Pagar
                    </button>
                  )}
                  {o.estado_pago === 'PAGADO' && (
                    <>
                      <button
                        onClick={() => cambiarEstado(o.id_pedido, 'atendido')}
                        className="text-green-600 hover:underline text-sm"
                      >
                        Atender
                      </button>
                      <button
                        onClick={() => cambiarEstado(o.id_pedido, 'rechazado')}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                  {o.estado_pago === 'atendido' && (
                    <button
                      onClick={() => cambiarEstado(o.id_pedido, 'rechazado')}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Anular
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
