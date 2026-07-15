import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { generarCodigoTransaccion } from '../../lib/generateCode';
import type { Producto } from '../../lib/supabaseTypes';
import { Package, Search, Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { useToast } from '../../components/ui/Toast';
import { useAuthContext } from '../../hooks/AuthContext';

interface LineItem {
  producto: Producto;
  cantidad: number;
  precio_compra: number;
}

export default function AdminIngresoMercaderiaForm() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { showToast } = useToast();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoSearch, setProductoSearch] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showDropdown, setShowDropdown] = useState(false);
  const [observacion, setObservacion] = useState('');
  const [saving, setSaving] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from('producto').select('*').eq('estado', 'activo').order('nombre_producto')
      .then(({ data }) => { if (data) setProductos(data as Producto[]); });
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const showResults = productoSearch.length >= 3;
  const filtered = productos.filter(p =>
    p.nombre_producto.toLowerCase().includes(productoSearch.toLowerCase()) &&
    !lineItems.some(li => li.producto.id_producto === p.id_producto)
  );

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const addSelected = () => {
    const toAdd = filtered.filter(p => selectedIds.has(p.id_producto));
    if (toAdd.length === 0) { showToast('Selecciona al menos un producto.', 'error'); return; }
    setLineItems([...lineItems, ...toAdd.map(p => ({ producto: p, cantidad: 1, precio_compra: p.precio_compra || 0 }))]);
    setSelectedIds(new Set());
    setProductoSearch('');
    setShowDropdown(false);
  };

  const update = (idx: number, field: 'cantidad' | 'precio_compra', value: number) => {
    const items = [...lineItems];
    items[idx][field] = value;
    setLineItems(items);
  };

  const removeItem = (idx: number) => setLineItems(lineItems.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.length === 0) { showToast('Debes agregar al menos un producto.', 'error'); return; }

    setSaving(true);

    const codigo = await generarCodigoTransaccion('ING');

    const { data: newIngreso, error: ingresoError } = await supabase
      .from('ingreso_mercaderia')
      .insert({
        codigo_transaccion: codigo,
        observacion: observacion.trim() || null,
        fecha: new Date().toISOString(),
      })
      .select()
      .single();

    if (ingresoError || !newIngreso) {
      showToast('Error al crear ingreso: ' + (ingresoError?.message || ''), 'error');
      setSaving(false);
      return;
    }

    const detalles = lineItems.map(li => ({
      pk_ingreso: (newIngreso as any).id_ingreso,
      pk_producto: li.producto.id_producto,
      cantidad: li.cantidad,
      precio_compra: li.precio_compra || null,
    }));

    const { error: detError } = await supabase.from('ingreso_detalle').insert(detalles);
    if (detError) {
      showToast('Error al guardar detalles: ' + detError.message, 'error');
      setSaving(false);
      return;
    }

    for (const li of lineItems) {
      await supabase.rpc('increment_stock', { p_producto_id: li.producto.id_producto, p_cantidad: li.cantidad });
      await supabase.from('movimiento').insert({
        id_producto: li.producto.id_producto,
        tipo_movimiento: 'ENTRADA',
        cantidad: li.cantidad,
        observacion: codigo,
        responsable: user?.nombres || 'Admin',
      });
    }

    showToast('Ingreso registrado correctamente', 'success');
    navigate('/admin/ingresos');
  };

  const inputClass = "w-full border border-border rounded-lg px-4 py-2.5 bg-background text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

  return (
    <div>
      <PageHeader
        title="Nuevo ingreso de mercadería"
        description="Registra la entrada de productos al inventario"
        icon={<Package className="w-5 h-5" />}
      />

      <form onSubmit={handleSubmit}>
        <div className="border border-border rounded-lg p-5 bg-background mb-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Datos del ingreso</h3>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Observación</label>
            <input type="text" value={observacion} onChange={e => setObservacion(e.target.value)}
              className={inputClass} placeholder="Ej: Compra a proveedor XYZ" />
          </div>

          <div ref={searchRef} className="relative">
            <label className="block text-sm font-medium text-foreground mb-1.5">Productos</label>
            <Search className="absolute left-3 top-[42px] w-4 h-4 text-muted-foreground" />
            <input type="text" value={productoSearch}
              onChange={e => { setProductoSearch(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              className={`${inputClass} pl-10`}
              placeholder="Buscar producto (mínimo 3 caracteres)..." />

            {showResults && showDropdown && filtered.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-background border border-border rounded-lg shadow-lg">
                <div className="max-h-48 overflow-y-auto">
                  {filtered.map(p => (
                    <div key={p.id_producto} onClick={() => toggleSelect(p.id_producto)}
                      className={`flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer border-b border-border last:border-0 ${
                        selectedIds.has(p.id_producto) ? 'bg-primary/5' : 'hover:bg-muted/50'
                      }`}>
                      <input type="checkbox" checked={selectedIds.has(p.id_producto)} readOnly
                        className="rounded border-border accent-primary w-4 h-4 pointer-events-none" />
                      <span className="flex-1 font-medium text-foreground">{p.nombre_producto}</span>
                      <span className="text-muted-foreground text-xs">S/{p.precio_producto.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end p-3 border-t border-border bg-muted/30">
                  <button type="button" onClick={addSelected} disabled={selectedIds.size === 0}
                    className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      selectedIds.size > 0
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}>
                    <Plus className="w-4 h-4" /> Agregar ({selectedIds.size})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {lineItems.length > 0 && (
          <div className="border border-border rounded-lg bg-background overflow-hidden mb-6">
            <div className="p-5">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-2">Producto</th>
                    <th className="text-center text-xs font-medium text-muted-foreground uppercase px-4 py-2 w-24">Cantidad</th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase px-4 py-2 w-32">Precio compra</th>
                    <th className="text-center text-xs font-medium text-muted-foreground uppercase px-4 py-2 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lineItems.map((li, idx) => (
                    <tr key={`${li.producto.id_producto}-${idx}`} className="hover:bg-muted/30">
                      <td className="px-4 py-2 text-sm text-foreground">{li.producto.nombre_producto}</td>
                      <td className="px-4 py-2 text-center">
                        <input type="number" value={li.cantidad} min={1}
                          onChange={e => update(idx, 'cantidad', parseInt(e.target.value) || 1)}
                          className="w-16 border border-border rounded-md px-2 py-1 text-xs text-center bg-background text-foreground" />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <input type="number" step="0.01" min="0" value={li.precio_compra}
                          onChange={e => update(idx, 'precio_compra', parseFloat(e.target.value) || 0)}
                          className="w-28 border border-border rounded-md px-2 py-1 text-xs text-right bg-background text-foreground" />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button type="button" onClick={() => removeItem(idx)}
                          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end mt-6">
          <button type="submit" disabled={saving || lineItems.length === 0}
            className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm font-medium">
            {saving ? 'Guardando...' : 'Registrar ingreso'}
          </button>
          <button type="button" onClick={() => navigate('/admin/ingresos')}
            className="bg-muted text-foreground px-6 py-2.5 rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
