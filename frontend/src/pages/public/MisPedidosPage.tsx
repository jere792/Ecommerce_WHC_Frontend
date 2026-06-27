import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuthContext } from "../../hooks/AuthContext";
import type { Pedido } from "../../lib/supabaseTypes";

type PedidoDisplay = {
  idPedido: number;
  fecha: string;
  montoTotal: number;
  estadoPago: string;
  items: {
    productoId: number;
    nombreProducto: string;
    cantidad: number;
    precioUnitario: number;
  }[];
  historialEstados?: {
    comentario: string;
    estado: string;
    fechaEstado: string;
  }[];
};

const MisPedidosPage: React.FC = () => {
  const { user } = useAuthContext();
  const [pedidos, setPedidos] = useState<PedidoDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPedidos();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadPedidos = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('pedido')
      .select(`
        id_pedido,
        fecha,
        monto_total,
        estado_pago,
        detalles:pedidodetalles(
          pk_producto_pedido,
          cantidad_pedido
        ),
        historial:pedido_estado_pago(
          estado,
          fecha_estado,
          comentario
        )
      `)
      .eq('pk_usuario', user!.id_usuario)
      .order('fecha', { ascending: false });

    if (!data) {
      setLoading(false);
      return;
    }

    const displayPedidos: PedidoDisplay[] = await Promise.all(
      (data as any[]).map(async (p) => {
        let items: PedidoDisplay['items'] = [];
        if (p.detalles && p.detalles.length > 0) {
          const productIds = p.detalles.map((d: any) => d.pk_producto_pedido);
          const { data: productos } = await supabase
            .from('producto')
            .select('id_producto, nombre_producto, precio_producto')
            .in('id_producto', productIds);

          items = p.detalles.map((d: any) => {
            const prod = productos?.find((pr: any) => pr.id_producto === d.pk_producto_pedido);
            return {
              productoId: d.pk_producto_pedido,
              nombreProducto: prod?.nombre_producto || `Producto #${d.pk_producto_pedido}`,
              cantidad: d.cantidad_pedido || 0,
              precioUnitario: Number(prod?.precio_producto || 0),
            };
          });
        }

        return {
          idPedido: p.id_pedido,
          fecha: p.fecha,
          montoTotal: Number(p.monto_total),
          estadoPago: p.estado_pago,
          items,
          historialEstados: (p.historial || []).map((h: any) => ({
            comentario: h.comentario || '',
            estado: h.estado || '',
            fechaEstado: h.fecha_estado || '',
          })),
        };
      })
    );

    setPedidos(displayPedidos);
    setLoading(false);
  };

  const statusBadge = (estado: string) => {
    const colors: Record<string, string> = {
      PAGADO: 'bg-green-100 text-green-700 border-green-200',
      pendiente: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      atendido: 'bg-blue-100 text-blue-700 border-blue-200',
      rechazado: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[estado] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded border border-yellow-200">
          Debes iniciar sesión para ver tus pedidos.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        Cargando pedidos...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Mis Pedidos</h1>

      {pedidos.length === 0 ? (
        <div className="bg-blue-50 text-blue-800 p-8 rounded-lg text-center border border-blue-200">
          <p className="text-lg">No tienes pedidos registrados en tu historial.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pedidos.map((pedido) => (
            <div key={pedido.idPedido} className="border rounded-lg shadow-sm bg-white overflow-hidden">
              <div className="bg-gray-50 p-4 flex flex-col md:flex-row md:justify-between md:items-center border-b">
                <div>
                  <span className="font-bold text-lg text-gray-800">Pedido #{pedido.idPedido}</span>
                  <span className="mx-2 text-gray-400">|</span>
                  <span className="text-sm text-gray-600">
                    {new Date(pedido.fecha).toLocaleDateString()} {new Date(pedido.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <div className="mt-2 md:mt-0 flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusBadge(pedido.estadoPago)}`}>
                    {pedido.estadoPago}
                  </span>
                  <div className="font-bold text-xl text-blue-700">
                    S/ {pedido.montoTotal.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-100">
                        <th className="pb-2 font-medium w-1/2">Producto</th>
                        <th className="pb-2 font-medium text-center">Cantidad</th>
                        <th className="pb-2 font-medium text-right">Precio Unit.</th>
                        <th className="pb-2 font-medium text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pedido.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 pr-2 font-medium text-gray-700">{item.nombreProducto}</td>
                          <td className="py-3 px-2 text-center text-gray-600">{item.cantidad}</td>
                          <td className="py-3 px-2 text-right text-gray-600">S/ {item.precioUnitario.toFixed(2)}</td>
                          <td className="py-3 pl-2 text-right font-semibold text-gray-800">
                            S/ {(item.cantidad * item.precioUnitario).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisPedidosPage;
