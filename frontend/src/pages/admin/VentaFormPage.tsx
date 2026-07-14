import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { Producto } from '../../lib/supabaseTypes';
import { Trash2, ShoppingCart, Search, User, Phone, Plus, Check } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { useToast } from '../../components/ui/Toast';

interface LineItem {
  producto: Producto;
  cantidad: number;
}

const inputClass = "w-full border border-border rounded-lg px-4 py-2.5 bg-background text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";
const labelClass = "block text-sm font-medium text-foreground mb-1.5";

export default function AdminVentaForm() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [productos, setProductos] = useState<(Producto & { stock?: number })[]>([]);
  const [productoSearch, setProductoSearch] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showDropdown, setShowDropdown] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from('producto')
      .select('*, inventario:inventario!pk_producto(*)')
      .eq('estado', 'activo')
      .then(({ data }) => {
        if (data) {
          const mapped = (data as any[]).map(p => ({
            ...p,
            stock: p.inventario?.stock_actual ?? 0,
          }));
          setProductos(mapped);
        }
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showResults = productoSearch.length >= 3;
  const filteredProductos = productos.filter(p =>
    p.nombre_producto.toLowerCase().includes(productoSearch.toLowerCase()) &&
    !lineItems.some(li => li.producto.id_producto === p.id_producto)
  );

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const addSelectedToCart = () => {
    const toAdd = filteredProductos.filter(p => selectedIds.has(p.id_producto));
    if (toAdd.length === 0) { showToast('Selecciona al menos un producto.', 'error'); return; }
    setLineItems([...lineItems, ...toAdd.map(p => ({ producto: p, cantidad: 1 }))]);
    setSelectedIds(new Set());
    setProductoSearch('');
    setShowDropdown(false);
  };

  const updateCantidad = (idx: number, cantidad: number) => {
    if (confirmed) return;
    const items = [...lineItems];
    items[idx].cantidad = Math.max(1, cantidad);
    setLineItems(items);
  };

  const removeItem = (idx: number) => {
    setLineItems(lineItems.filter((_, i) => i !== idx));
  };

  const confirmCart = () => {
    if (lineItems.length === 0) { showToast('El carrito está vacío.', 'error'); return; }
    setConfirmed(true);
    showToast('Carrito confirmado', 'success');
  };

  const total = lineItems.reduce((sum, li) => sum + li.producto.precio_producto * li.cantidad, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) { showToast('Debes ingresar el nombre del cliente.', 'error'); return; }
    if (lineItems.length === 0) { showToast('Debes agregar al menos un producto.', 'error'); return; }

    setSaving(true);

    const { data: newPedido, error: pedidoError } = await supabase
      .from('pedido')
      .insert({
        pk_usuario: 1,
        nombre: nombre.trim(),
        telefono: telefono.trim() || null,
        estado_pago: 'pendiente',
        monto_total: total,
        fecha: new Date().toISOString(),
      })
      .select()
      .single();

    if (pedidoError || !newPedido) {
      showToast('Error al crear la venta: ' + (pedidoError?.message || ''), 'error');
      setSaving(false);
      return;
    }

    const detalles = lineItems.map(li => ({
      pk_pedido: (newPedido as any).id_pedido,
      pk_producto_pedido: li.producto.id_producto,
      cantidad_pedido: li.cantidad,
    }));

    const { error: detalleError } = await supabase.from('pedido_detalles').insert(detalles);
    if (detalleError) {
      showToast('Error al guardar detalles: ' + detalleError.message, 'error');
      setSaving(false);
      return;
    }

    showToast('Venta creada correctamente', 'success');
    navigate('/admin/ventas');
  };

  return (
    <div>
      <PageHeader
        title="Generar venta"
        description="Registra una nueva venta en el sistema"
        icon={<ShoppingCart className="w-5 h-5" />}
      />

      <form onSubmit={handleSubmit}>
        <div className="border border-border rounded-lg p-5 bg-background mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Datos de venta</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className={labelClass}>
                <User className="w-3.5 h-3.5 inline mr-1.5 text-muted-foreground" />
                Nombres completos
              </label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                className={inputClass}
                placeholder="Ej: Juan Pérez"
                required
              />
            </div>
            <div>
              <label className={labelClass}>
                <Phone className="w-3.5 h-3.5 inline mr-1.5 text-muted-foreground" />
                Teléfono
              </label>
              <input
                type="text"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                className={inputClass}
                placeholder="Ej: 999 888 777"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className={labelClass}>Productos</label>

            <div ref={searchRef} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={productoSearch}
                onChange={e => { setProductoSearch(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                className={`${inputClass} pl-10`}
                placeholder="Buscar producto (mínimo 3 caracteres)..."
              />

              {showResults && showDropdown && filteredProductos.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-background border border-border rounded-lg shadow-lg">
                  <div className="max-h-48 overflow-y-auto">
                    {filteredProductos.map(p => (
                      <div
                        key={p.id_producto}
                        onClick={() => toggleSelect(p.id_producto)}
                        className={`flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer transition-colors border-b border-border last:border-0 ${
                          selectedIds.has(p.id_producto) ? 'bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(p.id_producto)}
                          readOnly
                          className="rounded border-border accent-primary w-4 h-4 pointer-events-none"
                        />
                        <span className="flex-1 font-medium text-foreground">{p.nombre_producto}</span>
                        <span className="text-muted-foreground text-xs">
                          S/{p.precio_producto.toFixed(2)} — Stock: {p.stock ?? 0}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end p-3 border-t border-border bg-muted/30">
                    <button
                      type="button"
                      onClick={addSelectedToCart}
                      disabled={selectedIds.size === 0}
                      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        selectedIds.size > 0
                          ? 'bg-primary text-white hover:bg-primary/90'
                          : 'bg-muted text-muted-foreground cursor-not-allowed'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      Añadir al carrito ({selectedIds.size})
                    </button>
                  </div>
                </div>
              )}

              {showResults && showDropdown && filteredProductos.length === 0 && (
                <div className="absolute z-10 mt-1 w-full bg-background border border-border rounded-lg shadow-lg p-4 text-sm text-muted-foreground text-center">
                  No se encontraron productos.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border border-border rounded-lg bg-background overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Carrito de compras</h3>
            {lineItems.length > 0 && !confirmed && (
              <button
                type="button"
                onClick={confirmCart}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Confirmar
              </button>
            )}
            {confirmed && (
              <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Confirmado
              </span>
            )}
          </div>

          {lineItems.length > 0 && (
            <div className="p-5">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2">Producto</th>
                    <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2 w-24">Cantidad</th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2 w-28">Precio</th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2 w-28">Subtotal</th>
                    <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lineItems.map((li, idx) => (
                    <tr key={`cart-${li.producto.id_producto}-${idx}`} className="hover:bg-muted/30">
                      <td className="px-4 py-2 text-sm text-foreground">{li.producto.nombre_producto}</td>
                      <td className="px-4 py-2 text-center">
                        <input
                          type="number"
                          value={li.cantidad}
                          onChange={e => updateCantidad(idx, parseInt(e.target.value) || 1)}
                          min={1}
                          disabled={confirmed}
                          className={`w-16 border border-border rounded-md px-2 py-1 text-xs text-center bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                            confirmed ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                        />
                      </td>
                      <td className="px-4 py-2 text-sm text-right text-foreground">S/{Number(li.producto.precio_producto).toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm text-right font-medium text-foreground">
                        S/{(li.producto.precio_producto * li.cantidad).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mt-4 pt-4 border-t border-border">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-foreground">S/{total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {lineItems.length === 0 && (
            <div className="p-5 text-center py-8 text-sm text-muted-foreground">
              <p>Busca productos desde el panel de arriba y agrégalos al carrito</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm font-medium"
            disabled={saving || !confirmed}
          >
            {saving ? 'Guardando...' : 'Guardar venta'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/ventas')}
            className="bg-muted text-foreground px-6 py-2.5 rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
