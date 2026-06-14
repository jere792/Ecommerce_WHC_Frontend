import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, DollarSign, TrendingUp, Clock, BarChart3 } from 'lucide-react';

interface PedidoResumen {
  id_pedido: number;
  usuario: { nombre_persona: string } | null;
  monto_total: number;
  estado_pago: string;
  fecha: string;
}

interface DetalleConCosto {
  cantidad_pedido: number;
  producto: { precio_producto: number; precio_compra: number | null } | null;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    productos: 0,
    pedidosPendientes: 0,
    ventasTotal: 0,
    ingresos: 0,
    gananciaSemanal: 0,
    gananciaMensual: 0,
  });
  const [recentOrders, setRecentOrders] = useState<PedidoResumen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const now = new Date();
    const semanaAtras = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const mesAtras = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [
      productos,
      pendientes,
      atendidos,
      allOrders,
      detallesSemana,
      detallesMes,
    ] = await Promise.all([
      supabase.from('producto').select('*', { count: 'exact', head: true }),
      supabase.from('pedido').select('*', { count: 'exact', head: true }).eq('estado_pago', 'pendiente'),
      supabase.from('pedido').select('monto_total').eq('estado_pago', 'atendido'),
      supabase
        .from('pedido')
        .select('id_pedido, monto_total, estado_pago, fecha, usuario:pk_usuario(nombre_persona)')
        .order('fecha', { ascending: false })
        .limit(5),
      supabase
        .from('pedidodetalles')
        .select('cantidad_pedido, producto:pk_producto_pedido(precio_producto, precio_compra), pedido:pk_pedido!inner(fecha)')
        .gte('pedido.fecha', semanaAtras),
      supabase
        .from('pedidodetalles')
        .select('cantidad_pedido, producto:pk_producto_pedido(precio_producto, precio_compra), pedido:pk_pedido!inner(fecha)')
        .gte('pedido.fecha', mesAtras),
    ]);

    const ingresos = (atendidos.data || []).reduce((sum, p) => sum + Number(p.monto_total || 0), 0);

    const calcGanancia = (detalles: DetalleConCosto[]) =>
      detalles.reduce((sum, d) => {
        const prod = d.producto;
        if (!prod || !prod.precio_compra) return sum;
        const gananciaUnidad = prod.precio_producto - prod.precio_compra;
        return sum + gananciaUnidad * (d.cantidad_pedido || 0);
      }, 0);

    setStats({
      productos: productos.count ?? 0,
      pedidosPendientes: pendientes.count ?? 0,
      ventasTotal: atendidos.count ?? 0,
      ingresos,
      gananciaSemanal: calcGanancia(detallesSemana.data as unknown as DetalleConCosto[]),
      gananciaMensual: calcGanancia(detallesMes.data as unknown as DetalleConCosto[]),
    });
    setRecentOrders(allOrders.data as unknown as PedidoResumen[]);
    setLoading(false);
  };

  const cards = [
    { label: 'Productos', value: stats.productos, icon: Package, color: 'bg-blue-500', link: '/admin/productos' },
    { label: 'Pendientes', value: stats.pedidosPendientes, icon: Clock, color: 'bg-yellow-500', link: '/admin/pedidos?estado=pendiente' },
    { label: 'Ventas', value: stats.ventasTotal, icon: TrendingUp, color: 'bg-green-500', link: '/admin/pedidos?estado=atendido' },
    { label: 'Ingresos', value: `S/${stats.ingresos.toFixed(2)}`, icon: DollarSign, color: 'bg-emerald-600', link: '/admin/pedidos' },
  ];

  const profitCards = [
    { label: 'Ganancia semanal', value: `S/${stats.gananciaSemanal.toFixed(2)}`, icon: BarChart3, color: 'bg-violet-500' },
    { label: 'Ganancia mensual', value: `S/${stats.gananciaMensual.toFixed(2)}`, icon: BarChart3, color: 'bg-indigo-600' },
  ];

  const statusBadge = (estado: string) => {
    const colors: Record<string, string> = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      PAGADO: 'bg-green-100 text-green-800',
      atendido: 'bg-blue-100 text-blue-800',
      rechazado: 'bg-red-100 text-red-800',
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Cargando...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profitCards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{card.label}</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Últimos pedidos</h2>
          <Link to="/admin/pedidos" className="text-sm text-blue-600 hover:underline font-medium">
            Ver todos
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400">
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Cliente</th>
                <th className="px-6 py-3 font-medium">Fecha</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">No hay pedidos aún</td>
                </tr>
              ) : (
                recentOrders.map((o) => (
                  <tr key={o.id_pedido} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm">
                    <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">#{o.id_pedido}</td>
                    <td className="px-6 py-3 text-gray-700 dark:text-gray-300">{o.usuario?.nombre_persona || '-'}</td>
                    <td className="px-6 py-3 text-gray-500 dark:text-gray-400">{new Date(o.fecha).toLocaleDateString()}</td>
                    <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">S/{Number(o.monto_total).toFixed(2)}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge(o.estado_pago)}`}>
                        {o.estado_pago}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
