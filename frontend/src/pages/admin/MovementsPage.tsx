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

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">Cargando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-foreground">Movimientos de inventario</h1>
      <div className="bg-background rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Producto</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Tipo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Cantidad</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Fecha</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Observación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {movements.map((m) => (
              <tr key={m.id_movimiento} className="hover:bg-muted">
                <td className="px-4 py-3 text-sm text-foreground">{m.id_movimiento}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">{m.producto?.nombre_producto || '-'}</td>
                <td className="px-4 py-3 text-sm text-foreground">{m.tipo_movimiento}</td>
                <td className="px-4 py-3 text-sm text-foreground">{m.cantidad}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{m.fecha ? new Date(m.fecha).toLocaleString() : '-'}</td>
                <td className="px-4 py-3 text-sm text-foreground">{m.observacion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
