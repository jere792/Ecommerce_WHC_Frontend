import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { Movimiento, Producto } from '../../lib/supabaseTypes';
import { ArrowDownUp, Eye, Plus, Package } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import FilterBar from '../../components/ui/FilterBar';
import DataTable, { type Column } from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';

const getDefaultFechaDesde = () => {
  const d = new Date();
  d.setDate(d.getDate() - 14);
  return d.toISOString().split('T')[0];
};

export default function AdminAjusteStock() {
  const navigate = useNavigate();
  const [movements, setMovements] = useState<(Movimiento & { producto?: Producto })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState(0);
  const [fechaInicio, setFechaInicio] = useState(getDefaultFechaDesde());
  const [fechaFin, setFechaFin] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    loadAjustes();
  }, []);

  useEffect(() => { setPage(1); }, [search, tipoFiltro, fechaInicio, fechaFin]);

  const loadAjustes = async () => {
    const { data } = await supabase
      .from('movimiento')
      .select('*, producto:id_producto(*)')
      .eq('tipo_movimiento', 'AJUSTE')
      .order('fecha', { ascending: false });
    if (data) setMovements(data as unknown as (Movimiento & { producto?: Producto })[]);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    let result = movements;

    if (search.length >= 3) {
      const q = search.toLowerCase();
      result = result.filter(m => m.producto?.nombre_producto?.toLowerCase().includes(q));
    }

    if (tipoFiltro === 1) result = result.filter(m => (m.cantidad ?? 0) > 0);
    else if (tipoFiltro === 2) result = result.filter(m => (m.cantidad ?? 0) < 0);

    if (fechaInicio) {
      const d = new Date(fechaInicio);
      result = result.filter(m => m.fecha && new Date(m.fecha) >= d);
    }
    if (fechaFin) {
      const d = new Date(fechaFin + 'T23:59:59');
      result = result.filter(m => m.fecha && new Date(m.fecha) <= d);
    }

    return result;
  }, [movements, search, tipoFiltro, fechaInicio, fechaFin]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns: Column<Movimiento & { producto?: Producto }>[] = [
    {
      header: 'Producto',
      render: m => (
        <span className="font-medium text-foreground">{m.producto?.nombre_producto || '—'}</span>
      ),
    },
    {
      header: 'Tipo',
      width: '90px',
      render: m => {
        const esEntrada = (m.cantidad ?? 0) > 0;
        return (
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
            esEntrada
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {esEntrada ? 'Entrada' : 'Salida'}
          </span>
        );
      },
    },
    {
      header: 'Cantidad',
      width: '90px',
      align: 'right',
      render: m => (
        <span className={`font-semibold ${(m.cantidad ?? 0) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
          {(m.cantidad ?? 0) < 0 ? '' : '+'}{m.cantidad}
        </span>
      ),
    },
    {
      header: 'Stock ant.',
      width: '95px',
      align: 'right',
      render: m => <span className="text-muted-foreground">{m.stock_anterior ?? '—'}</span>,
    },
    {
      header: 'Stock post.',
      width: '95px',
      align: 'right',
      render: m => <span className="text-foreground font-medium">{m.stock_posterior ?? '—'}</span>,
    },
    {
      header: 'Responsable',
      width: '160px',
      render: m => <span className="text-foreground">{m.responsable || '—'}</span>,
    },
    {
      header: 'Observación',
      render: m => <span className="text-foreground text-sm">{m.observacion || '—'}</span>,
    },
    {
      header: 'Fecha',
      width: '170px',
      render: m => (
        <span className="text-muted-foreground text-sm">
          {m.fecha ? new Date(m.fecha).toLocaleString('es-PE') : '-'}
        </span>
      ),
    },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">Cargando...</div>;

  return (
    <div>
      <PageHeader
        title="Ajustes de stock"
        description="Correcciones manuales de inventario"
        icon={<Package className="w-5 h-5" />}
        buttonLabel="Nuevo ajuste"
        buttonTo="/admin/ajustes/nuevo"
      />

      <FilterBar
        title="ajustes"
        onClear={() => { setSearch(''); setTipoFiltro(0); setFechaInicio(getDefaultFechaDesde()); setFechaFin(''); }}
        fields={[
          { type: 'search', label: 'Buscar producto', value: search, onChange: setSearch, placeholder: 'Buscar por nombre...' },
          {
            type: 'select', label: 'Tipo', value: tipoFiltro, onChange: setTipoFiltro,
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
        data={paginated}
        keyExtractor={m => m.id_movimiento}
        emptyMessage="No se encontraron ajustes de stock"
      />

      <Pagination
        page={page}
        pageSize={pageSize}
        total={filtered.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
