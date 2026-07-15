import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { Movimiento, Producto } from '../../lib/supabaseTypes';
import { ArrowDownUp, ArrowLeft, User, Package, Phone, Tag } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';

interface Categoria {
  id_categoria_producto: number;
  nombre_categoria_producto: string;
  pk_categoria_padre: number | null;
}

interface ProductoEnMovimiento {
  id_movimiento: number;
  nombre: string;
  imagen: string | null;
  categoria: string;
  marca: string;
  precio: number;
  cantidad: number;
  tipo: string;
  stock_ant: number | null;
  stock_post: number | null;
}

export default function AdminMovementsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [allMovements, setAllMovements] = useState<(Movimiento & { producto?: Producto })[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [catRes] = await Promise.all([
        supabase.from('categoria_productos').select('*'),
      ]);
      const allCats = (catRes.data || []) as Categoria[];
      setCategories(allCats);

      // Cargar el movimiento actual
      const { data: mov } = await supabase
        .from('movimiento')
        .select('*, producto:id_producto(*)')
        .eq('id_movimiento', id)
        .single();

      if (!mov) { setLoading(false); return; }

      const sourceKey = mov.observacion || null;
      setSource(sourceKey);

      let items: (Movimiento & { producto?: Producto })[] = [mov as any];

      // Si tiene observacion, buscar todos los movimientos con la misma
      if (sourceKey) {
        const { data: siblings } = await supabase
          .from('movimiento')
          .select('*, producto:id_producto(*, categoria:pk_categoria_producto(*), marca:pk_marca_producto(*))')
          .eq('observacion', sourceKey)
          .order('id_movimiento', { ascending: true });

        if (siblings && siblings.length > 0) {
          items = siblings as any;
        }
      }

      setAllMovements(items);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">Cargando...</div>;
  if (allMovements.length === 0) return <div className="text-center py-12 text-muted-foreground">Movimiento no encontrado</div>;

  const first = allMovements[0];
  const totalCantidad = allMovements.reduce((s, m) => s + (m.cantidad || 0), 0);
  const isEntrada = first.tipo_movimiento === 'entrada';

  const productos: ProductoEnMovimiento[] = allMovements.map(m => {
    const p = m.producto;
    const cat = (p as any)?.categoria;
    const chain: string[] = [];
    if (cat) {
      chain.unshift(cat.nombre_categoria_producto);
      let pid: number | null = cat.pk_categoria_padre;
      while (pid) {
        const pc = categories.find(c => c.id_categoria_producto === pid);
        if (!pc) break;
        chain.unshift(pc.nombre_categoria_producto);
        pid = pc.pk_categoria_padre;
      }
    }
    return {
      id_movimiento: m.id_movimiento,
      nombre: p?.nombre_producto || '—',
      imagen: p?.imagen_producto || null,
      categoria: chain.join(' > ') || '—',
      marca: (p as any)?.marca?.nombre_marca_producto || '—',
      precio: Number(p?.precio_producto || 0),
      cantidad: m.cantidad || 0,
      tipo: m.tipo_movimiento || '',
      stock_ant: m.stock_anterior,
      stock_post: m.stock_posterior,
    };
  });

  return (
    <div>
      <PageHeader
        title="Detalle de movimiento"
        description={source
          ? `${source} — ${isEntrada ? 'Entrada' : 'Salida'} — ${productos.length} producto${productos.length > 1 ? 's' : ''}`
          : `#${first.id_movimiento} — ${isEntrada ? 'Entrada' : 'Salida'} de inventario`}
        icon={<ArrowDownUp className="w-5 h-5" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumen del movimiento */}
        <div className="border border-border rounded-lg bg-background overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-muted/30">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ArrowDownUp className="w-4 h-4" />
              Resumen
            </h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <span className="text-xs text-muted-foreground">Origen</span>
                <p className="text-sm font-medium text-foreground">{source || 'Movimiento directo'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Tipo</span>
                <p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-0.5 ${
                    isEntrada
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {isEntrada ? 'Entrada' : 'Salida'}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Total productos</span>
                <p className="text-sm font-semibold text-foreground">{productos.length}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Cantidad total</span>
                <p className={`text-sm font-semibold ${!isEntrada ? 'text-red-600' : 'text-emerald-600'}`}>
                  {!isEntrada ? '-' : '+'}{totalCantidad}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Responsable</span>
                <p className="text-sm text-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  {first.responsable || '—'}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Fecha y hora</span>
                <p className="text-sm text-foreground">
                  {first.fecha ? new Date(first.fecha).toLocaleString('es-PE') : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Datos del cliente (si aplica) */}
        {source && (() => {
          const match = source.match(/(\d+)/);
          if (!match) return null;
          return <ClienteInfo pedidoId={parseInt(match[1])} />;
        })()}
      </div>

      {/* Lista de productos del movimiento */}
      <div className="border border-border rounded-lg bg-background overflow-hidden mt-6">
        <div className="px-5 py-4 border-b border-border bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Package className="w-4 h-4" />
            Productos ({productos.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-medium text-muted-foreground">Producto</th>
                <th className="px-5 py-3.5 text-left text-xs font-medium text-muted-foreground">Categoría</th>
                <th className="px-5 py-3.5 text-left text-xs font-medium text-muted-foreground">Marca</th>
                <th className="px-5 py-3.5 text-right text-xs font-medium text-muted-foreground">Precio</th>
                <th className="px-5 py-3.5 text-center text-xs font-medium text-muted-foreground">Tipo</th>
                <th className="px-5 py-3.5 text-right text-xs font-medium text-muted-foreground">Cant.</th>
                <th className="px-5 py-3.5 text-right text-xs font-medium text-muted-foreground">Stock ant.</th>
                <th className="px-5 py-3.5 text-right text-xs font-medium text-muted-foreground">Stock post.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {productos.map(p => (
                <tr key={p.id_movimiento} className="hover:bg-muted transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {p.imagen ? (
                        <img src={p.imagen} alt="" className="h-10 w-10 object-cover rounded border shrink-0" />
                      ) : (
                        <div className="h-10 w-10 rounded border border-border bg-muted shrink-0" />
                      )}
                      <span className="text-sm font-medium text-foreground">{p.nombre}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground max-w-[200px] truncate">{p.categoria}</td>
                  <td className="px-5 py-3.5 text-sm text-foreground">{p.marca}</td>
                  <td className="px-5 py-3.5 text-sm text-right text-foreground">S/{p.precio.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-sm text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.tipo === 'entrada'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {p.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                    </span>
                  </td>
                  <td className={`px-5 py-3.5 text-sm text-right font-semibold ${p.tipo === 'salida' ? 'text-red-600' : 'text-emerald-600'}`}>
                    {p.tipo === 'salida' ? '-' : '+'}{p.cantidad}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-right text-muted-foreground">{p.stock_ant ?? '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-right text-foreground font-medium">{p.stock_post ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botón volver */}
      <div className="flex items-center justify-end mt-6">
        <button
          onClick={() => navigate('/admin/movimientos')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a movimientos
        </button>
      </div>
    </div>
  );
}

function ClienteInfo({ pedidoId }: { pedidoId: number }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    supabase
      .from('pedido')
      .select('*, usuario:pk_usuario(*)')
      .eq('id_pedido', pedidoId)
      .single()
      .then(({ data: pedido }) => {
        if (pedido) {
          const u = (pedido as any).usuario;
          setData({
            id_pedido: pedido.id_pedido,
            monto_total: pedido.monto_total,
            fecha: pedido.fecha,
            estado_pago: pedido.estado_pago,
            cliente: u ? { nombres: u.nombres, telefono: u.telefono, correo: u.correo_persona } : null,
          });
        }
      });
  }, [pedidoId]);

  if (!data) return null;

  return (
    <div className="border border-border rounded-lg bg-background overflow-hidden">
      <div className="px-5 py-4 border-b border-border bg-muted/30">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Datos de la venta
        </h3>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <span className="text-xs text-muted-foreground">Pedido</span>
            <p className="text-sm font-medium text-foreground">#{data.id_pedido}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Fecha venta</span>
            <p className="text-sm text-foreground">{new Date(data.fecha).toLocaleDateString('es-PE')}</p>
          </div>
          {data.cliente && (
            <>
              <div className="col-span-2">
                <span className="text-xs text-muted-foreground">Cliente</span>
                <p className="text-sm font-medium text-foreground">{data.cliente.nombres}</p>
              </div>
              {data.cliente.telefono && (
                <div>
                  <span className="text-xs text-muted-foreground">Teléfono</span>
                  <p className="text-sm text-foreground flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    {data.cliente.telefono}
                  </p>
                </div>
              )}
              {data.cliente.correo && (
                <div>
                  <span className="text-xs text-muted-foreground">Correo</span>
                  <p className="text-sm text-foreground">{data.cliente.correo}</p>
                </div>
              )}
            </>
          )}
          <div>
            <span className="text-xs text-muted-foreground">Estado pago</span>
            <p>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-0.5 ${
                data.estado_pago === 'pagado' || data.estado_pago === 'PAGADO'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {data.estado_pago}
              </span>
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Total venta</span>
            <p className="text-sm font-bold text-foreground">S/{Number(data.monto_total).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
