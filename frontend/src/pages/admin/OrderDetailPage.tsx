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
      .select('*, usuario:pk_usuario(*), detalles:pedidodetalles(*, producto:pk_producto_pedido(*))')
      .eq('id_pedido', id)
      .single();
    if (data) setOrder(data as unknown as Pedido);
    setLoading(false);
  };

  if (loading) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Cargando...</div>;
  if (!order) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Pedido no encontrado</div>;

  return (
    <div>
      <Link to="/admin/pedidos" className="text-blue-600 dark:text-blue-400 hover:underline mb-4 block">&larr; Volver</Link>
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Pedido #{order.id_pedido}</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Usuario</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{order.usuario?.nombre_persona}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{order.usuario?.correo_persona}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Fecha</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{new Date(order.fecha).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{order.estado_pago}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            <p className="font-medium text-xl text-gray-900 dark:text-gray-100">S/{Number(order.monto_total).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <h2 className="text-lg font-semibold p-4 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">Detalles del pedido</h2>
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Producto</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-300">Cantidad</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-300">Precio</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-300">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {(order.detalles || []).map((d) => (
              <tr key={d.id_pedido_detalle} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{d.producto?.nombre_producto || 'Producto #' + d.pk_producto_pedido}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300">{d.cantidad_pedido}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                  S/{Number(d.producto?.precio_producto || 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
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
