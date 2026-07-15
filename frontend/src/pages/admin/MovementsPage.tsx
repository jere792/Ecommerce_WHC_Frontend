import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { Movimiento, Producto } from '../../lib/supabaseTypes';
import { ArrowDownUp, Eye, ShoppingBag } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import FilterBar from '../../components/ui/FilterBar';
import DataTable, { type Column } from '../../components/ui/DataTable';

interface MovementRow {
  id: number;
  observacion: string | null;
  tipo: string | null;
  cantidadTotal: number;
  productos: number;
  responsable: string | null;
  fecha: string | null;
  ids: number[];
}

export default function AdminMovements() {
  const navigate = useNavigate();
  const [movements, setMovements] = useState<(Movimiento & { producto?: Producto })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState(0);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

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

  const grouped = useMemo(() => {
    const grupos = new Map<string, MovementRow[]>();

    for (const m of movements) {
      const key = m.observacion || `mov_${m.id_movimiento}`;
      if (!grupos.has(key)) grupos.set(key, []);
      grupos.get(key)!.push({
        id: m.id_movimiento,
        observacion: m.observacion,
        tipo: m.tipo_movimiento,
        cantidadTotal: m.cantidad || 0,
        productos: 1,
        responsable: m.responsable,
        fecha: m.fecha,
        ids: [m.id_movimiento],
      });
    }

    const result: MovementRow[] = [];
    for (const [, items] of grupos) {
      if (items.length === 1 && !items[0].observacion) {
        result.push(items[0]);
      } else if (items.length === 1) {
        result.push(items[0]);
      } else {
        result.push({
          id: items[0].id,
          observacion: items[0].observacion,
          tipo: items[0].tipo,
          cantidadTotal: items.reduce((s, i) => s + i.cantidadTotal, 0),
          productos: items.length,
          responsable: items[0].responsable,
          fecha: items[0].fecha,
          ids: items.flatMap(i => i.ids),
        });
      }
    }
    return result.sort((a, b) => {
      if (!a.fecha || !b.fecha) return 0;
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });
  }, [movements]);

  const filtered = useMemo(() => {
    let result = grouped;

    if (search.length >= 3) {
      const q = search.toLowerCase();
      result = result.filter(r => (r.observacion || '').toLowerCase().includes(q));
    }

    if (tipoFiltro === 1) result = result.filter(r => r.tipo === 'entrada');
    else if (tipoFiltro === 2) result = result.filter(r => r.tipo === 'salida');

    if (fechaInicio) {
      const d = new Date(fechaInicio);
      result = result.filter(r => r.fecha && new Date(r.fecha) >= d);
    }
    if (fechaFin) {
      const d = new Date(fechaFin + 'T23:59:59');
      result = result.filter(r => r.fecha && new Date(r.fecha) <= d);
    }

    return result;
  }, [grouped, search, tipoFiltro, fechaInicio, fechaFin]);

  const columns: Column<MovementRow>[] = [
    {
      header: 'Origen',
      render: r => (
        <div className="flex items-center gap-2">
          {r.observacion ? (
            <>
              <ShoppingBag className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="font-medium text-foreground">{r.observacion}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Movimiento #{r.id}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Tipo',
      width: '100px',
      render: r => {
        const isEntrada = r.tipo === 'entrada';
        return (
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
            isEntrada
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {isEntrada ? 'Entrada' : 'Salida'}
          </span>
        );
      },
    },
    {
      header: 'Productos',
      width: '100px',
      align: 'center',
      render: r => <span className="text-foreground font-medium">{r.productos}</span>,
    },
    {
      header: 'Cant. total',
      width: '110px',
      align: 'center',
      render: r => (
        <span className={`font-semibold ${r.tipo === 'salida' ? 'text-red-600' : 'text-emerald-600'}`}>
          {r.tipo === 'salida' ? '-' : '+'}{r.cantidadTotal}
        </span>
      ),
    },
    {
      header: 'Responsable',
      width: '200px',
      render: r => <span className="text-foreground">{r.responsable || '—'}</span>,
    },
    {
      header: 'Fecha',
      width: '200px',
      render: r => (
        <span className="text-muted-foreground text-sm">
          {r.fecha ? new Date(r.fecha).toLocaleString('es-PE') : '-'}
        </span>
      ),
    },
    {
      header: 'Acciones',
      width: '100px',
      align: 'center',
      render: r => (
        <button
          onClick={() => navigate(`/admin/movimientos/${r.id}`)}
          className="p-1.5 rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
          title="Ver detalle"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">Cargando...</div>;

  return (
    <div>
      <PageHeader
        title="Movimientos de inventario"
        description="Control de entradas y salidas de productos"
        icon={<ArrowDownUp className="w-5 h-5" />}
      />

      <FilterBar
        title="movimientos"
        onClear={() => {
          setSearch('');
          setTipoFiltro(0);
          setFechaInicio('');
          setFechaFin('');
        }}
        fields={[
          {
            type: 'search',
            label: 'Buscar por origen',
            value: search,
            onChange: setSearch,
            placeholder: 'Buscar por Venta #...',
          },
          {
            type: 'select',
            label: 'Tipo',
            value: tipoFiltro,
            onChange: setTipoFiltro,
            options: [
              { value: 0, label: 'Todos' },
              { value: 1, label: 'Entrada' },
              { value: 2, label: 'Salida' },
            ],
          },
          { type: 'date', label: 'Desde', value: fechaInicio, onChange: setFechaInicio },
          { type: 'date', label: 'Hasta', value: fechaFin, onChange: setFechaFin },
        ]}
      />

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={r => r.id}
        emptyMessage="No se encontraron movimientos"
      />
    </div>
  );
}
