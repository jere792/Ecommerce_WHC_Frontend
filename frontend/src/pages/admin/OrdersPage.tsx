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
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Pedidos</h1>
      <div className="mb-4 flex gap-2">
        {['', 'pendiente', 'PAGADO', 'atendido', 'rechazado'].map((est) => (
          <Link
            key={est}
            to={est ? `/admin/pedidos?estado=${est}` : '/admin/pedidos'}
            className={`px-3 py-1 rounded text-sm ${estadoFilter === est || (!estadoFilter && !est) ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            {est || 'Todos'}
          </Link>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Usuario</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Fecha</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Total</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {orders.map((o) => (
              <tr key={o.id_pedido} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{o.id_pedido}</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{o.usuario?.nombre_persona}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{new Date(o.fecha).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">S/{Number(o.monto_total).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusBadge(o.estado_pago)}`}>
                    {o.estado_pago}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm flex gap-2">
                  <Link to={`/admin/pedidos/${o.id_pedido}`} className="text-blue-600 hover:underline text-sm">
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
