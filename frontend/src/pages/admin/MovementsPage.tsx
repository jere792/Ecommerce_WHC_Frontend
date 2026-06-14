import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { Movimiento, Producto } from '../../lib/supabaseTypes';

export default function AdminMovements() {
  const [movements, setMovements] = useState<(Movimiento & { producto?: Producto })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovements();
  }, []);

  const loadMovements = async () => {
    const { data } = await supabase
      .from('movimiento')
      .select('*, producto:id_producto(*)')
      .order('fecha', { ascending: false });
    if (data) setMovements(data as unknown as (Movimiento & { producto?: Producto })[]);
    setLoading(false);
  };

  if (loading) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Cargando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Movimientos de inventario</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Producto</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Tipo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Cantidad</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Fecha</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Observación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {movements.map((m) => (
              <tr key={m.id_movimiento} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{m.id_movimiento}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{m.producto?.nombre_producto || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{m.tipo_movimiento}</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{m.cantidad}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{m.fecha ? new Date(m.fecha).toLocaleString() : '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{m.observacion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
