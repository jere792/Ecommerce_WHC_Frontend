import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { Oferta, Producto, CategoriaProducto, MarcaProducto } from '../../lib/supabaseTypes';
import { Edit, Trash2, Package, Percent } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import FilterBar from '../../components/ui/FilterBar';
import DataTable, { type Column } from '../../components/ui/DataTable';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';

export default function AdminOffers() {
  const [offers, setOffers] = useState<(Oferta & { producto?: Producto })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState(0);
  const [categoriaFiltro, setCategoriaFiltro] = useState(0);
  const [marcaFiltro, setMarcaFiltro] = useState(0);
  const [estadoFiltro, setEstadoFiltro] = useState(1);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [categories, setCategories] = useState<CategoriaProducto[]>([]);
  const [brands, setBrands] = useState<MarcaProducto[]>([]);
  const [confirmAction, setConfirmAction] = useState<{ id: number; mode: 'delete' | 'recover' } | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [offerRes, catRes, brandRes] = await Promise.all([
      supabase
        .from('oferta')
        .select('*, producto:pk_producto(*, categoria:pk_categoria_producto(*), marca:pk_marca_producto(*))')
        .order('id_oferta', { ascending: false }),
      supabase.from('categoria_productos').select('*').order('nombre_categoria_producto'),
      supabase.from('marca_producto').select('*').order('nombre_marca_producto'),
    ]);
    if (offerRes.data) setOffers(offerRes.data as unknown as (Oferta & { producto?: Producto })[]);
    if (catRes.data) setCategories(catRes.data as CategoriaProducto[]);
    if (brandRes.data) setBrands(brandRes.data as MarcaProducto[]);
    setLoading(false);
  };

  const handleConfirmAction = async () => {
    if (confirmAction == null) return;
    const { id, mode } = confirmAction;
    const nuevoEstado = mode === 'delete' ? 'inactivo' : 'activo';
    const { error } = await supabase.from('oferta').update({ estado: nuevoEstado }).eq('id_oferta', id);
    if (error) {
      showToast('Error al cambiar estado: ' + error.message, 'error');
    } else {
      showToast(
        mode === 'delete' ? 'Oferta desactivada correctamente' : 'Oferta activada correctamente',
        mode === 'delete' ? 'warning' : 'success',
      );
    }
    setConfirmAction(null);
    loadData();
  };

  const filtered = useMemo(() => {
    let result = offers;

    if (search.length >= 3) {
      const q = search.toLowerCase();
      result = result.filter(o => o.producto?.nombre_producto?.toLowerCase().includes(q));
    }

    if (tipoFiltro === 1) result = result.filter(o => o.tipo_descuento === 'fijo');
    else if (tipoFiltro === 2) result = result.filter(o => o.tipo_descuento === 'porcentaje');

    if (categoriaFiltro) {
      result = result.filter(o => o.producto?.pk_categoria_producto === categoriaFiltro);
    }

    if (marcaFiltro) {
      result = result.filter(o => o.producto?.pk_marca_producto === marcaFiltro);
    }

    if (estadoFiltro === 1) result = result.filter(o => o.estado === 'activo');
    else if (estadoFiltro === 2) result = result.filter(o => o.estado === 'inactivo');

    if (fechaInicio) result = result.filter(o => o.fecha_inicio >= fechaInicio);
    if (fechaFin) result = result.filter(o => o.fecha_fin <= fechaFin);

    return result;
  }, [offers, search, tipoFiltro, categoriaFiltro, marcaFiltro, estadoFiltro, fechaInicio, fechaFin]);

  const columns: Column<Oferta & { producto?: Producto }>[] = [
    {
      header: 'Imagen',
      width: '80px',
      render: o =>
        o.producto?.imagen_producto ? (
          <img src={o.producto.imagen_producto} alt="" className="h-10 w-10 object-cover rounded border" />
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      header: 'Nombre producto',
      render: o => (
        <span className="font-medium text-foreground truncate block">{o.producto?.nombre_producto || '—'}</span>
      ),
    },
    {
      header: 'Marca',
      width: '160px',
      render: o => <span className="text-foreground">{o.producto?.marca?.nombre_marca_producto || '—'}</span>,
    },
    {
      header: 'Categoría',
      width: '160px',
      render: o => <span className="text-foreground">{o.producto?.categoria?.nombre_categoria_producto || '—'}</span>,
    },
    {
      header: 'Descuento',
      width: '180px',
      render: o => (
        <div className="flex flex-col">
          {o.tipo_descuento === 'porcentaje' ? (
            <>
              <span className="font-medium text-emerald-600">{Number(o.valor_descuento).toFixed(0)}% OFF</span>
              <span className="text-xs text-muted-foreground">S/{Number(o.precio_oferta).toFixed(2)}</span>
            </>
          ) : (
            <>
              <span className="font-medium text-foreground">S/{Number(o.precio_oferta).toFixed(2)}</span>
              <span className="text-xs text-muted-foreground">Monto fijo</span>
            </>
          )}
        </div>
      ),
    },
    {
      header: 'Inicio',
      width: '140px',
      render: o => <span className="text-foreground">{o.fecha_inicio}</span>,
    },
    {
      header: 'Fin promoción',
      width: '140px',
      render: o => <span className="text-foreground">{o.fecha_fin}</span>,
    },
    {
      header: 'Estado',
      width: '140px',
      align: 'center',
      render: o => {
        const isActivo = o.estado === 'activo';
        return (
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
            isActivo
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {isActivo ? 'Activo' : 'Inactivo'}
          </span>
        );
      },
    },
    {
      header: 'Acciones',
      width: '120px',
      align: 'right',
      render: o => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => navigate(`/admin/ofertas/editar/${o.id_oferta}`)}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setConfirmAction({
              id: o.id_oferta,
              mode: o.estado === 'activo' ? 'delete' : 'recover',
            })}
            className={`p-1.5 rounded-md transition-colors ${
              o.estado === 'activo'
                ? 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                : 'text-muted-foreground hover:bg-green-500/10 hover:text-green-600'
            }`}
            title={o.estado === 'activo' ? 'Desactivar' : 'Activar'}
          >
            {o.estado === 'activo' ? (
              <Trash2 className="w-4 h-4" />
            ) : (
              <Package className="w-4 h-4" />
            )}
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">Cargando...</div>;

  return (
    <div>
      <PageHeader
        title="Ofertas"
        description="Gestiona las ofertas y descuentos de productos"
        icon={<Percent className="w-5 h-5" />}
        buttonLabel="Nueva oferta"
        buttonTo="/admin/ofertas/nuevo"
      />

      <FilterBar
        title="ofertas"
        onClear={() => {
          setSearch('');
          setTipoFiltro(0);
          setCategoriaFiltro(0);
          setMarcaFiltro(0);
          setEstadoFiltro(1);
          setFechaInicio('');
          setFechaFin('');
        }}
        fields={[
          {
            type: 'search',
            label: 'Buscar producto',
            value: search,
            onChange: setSearch,
            placeholder: 'Buscar por nombre...',
          },
          {
            type: 'select',
            label: 'Tipo descuento',
            width: 'min-w-[420px] max-w-[420px]',
            value: tipoFiltro,
            onChange: setTipoFiltro,
            options: [
              { value: 0, label: 'Todos' },
              { value: 1, label: 'Monto fijo' },
              { value: 2, label: 'Porcentaje' },
            ],
          },
        ]}
        fields2={[
          {
            type: 'select',
            label: 'Categoría',
            value: categoriaFiltro,
            onChange: setCategoriaFiltro,
            options: [
              { value: 0, label: 'Todas las categorías' },
              ...categories.map(c => ({ value: c.id_categoria_producto, label: c.nombre_categoria_producto })),
            ],
          },
          {
            type: 'select',
            label: 'Marca',
            value: marcaFiltro,
            onChange: setMarcaFiltro,
            options: [
              { value: 0, label: 'Todas las marcas' },
              ...brands.map(b => ({ value: b.id_marca_producto, label: b.nombre_marca_producto })),
            ],
          },
          {
            type: 'select',
            label: 'Estado',
            value: estadoFiltro,
            onChange: setEstadoFiltro,
            options: [
              { value: 1, label: 'Activo' },
              { value: 2, label: 'Inactivo' },
              { value: 0, label: 'Todos' },
            ],
          },
          { type: 'date', label: 'Desde', value: fechaInicio, onChange: setFechaInicio },
          { type: 'date', label: 'Hasta', value: fechaFin, onChange: setFechaFin },
        ]}
        showMoreLabel="Ver segunda fila"
        showLessLabel="Ocultar segunda fila"
      />

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={o => o.id_oferta}
        emptyMessage="No se encontraron ofertas"
      />

      <ConfirmDialog
        open={confirmAction != null}
        title={confirmAction?.mode === 'delete' ? 'Desactivar oferta' : 'Activar oferta'}
        message={
          confirmAction?.mode === 'delete'
            ? '¿Estás seguro de desactivar esta oferta?'
            : '¿Estás seguro de activar esta oferta?'
        }
        confirmText={confirmAction?.mode === 'delete' ? 'Desactivar' : 'Activar'}
        variant={confirmAction?.mode === 'delete' ? 'destructive' : 'primary'}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
