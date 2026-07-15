import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { generarCodigoTransaccion } from '../../lib/generateCode';
import type { Producto } from '../../lib/supabaseTypes';
import { Package, Search } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { useToast } from '../../components/ui/Toast';
import { useAuthContext } from '../../hooks/AuthContext';

export default function AdminAjusteStockForm() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { showToast } = useToast();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [tipo, setTipo] = useState<'entrada' | 'salida'>('entrada');
  const [cantidad, setCantidad] = useState('');
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

  const filtered = searchText.length >= 3
    ? productos.filter(p => p.nombre_producto.toLowerCase().includes(searchText.toLowerCase()))
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) { showToast('Debes seleccionar un producto.', 'error'); return; }
    if (!cantidad || parseInt(cantidad) <= 0) { showToast('Debes ingresar una cantidad válida.', 'error'); return; }

    setSaving(true);

    const cant = parseInt(cantidad);
    const cantFinal = tipo === 'salida' ? -cant : cant;
    const codigo = await generarCodigoTransaccion('AJU');

    // Obtener stock actual
    const { data: inv } = await supabase
      .from('inventario')
      .select('stock_actual')
      .eq('pk_producto', selectedProduct.id_producto)
      .single();

    const stockActual = (inv as any)?.stock_actual ?? 0;
    const stockPosterior = Math.max(0, stockActual + cantFinal);

    // Actualizar stock
    if (tipo === 'entrada') {
      await supabase.rpc('increment_stock', { p_producto_id: selectedProduct.id_producto, p_cantidad: cant });
    } else {
      await supabase.rpc('decrement_stock', { p_producto_id: selectedProduct.id_producto, p_cantidad: cant });
    }

    // Crear movimiento
    await supabase.from('movimiento').insert({
      id_producto: selectedProduct.id_producto,
      tipo_movimiento: 'AJUSTE',
      cantidad: cantFinal,
      observacion: `${codigo}${observacion ? ` - ${observacion}` : ''}`,
      responsable: user?.nombres || 'Admin',
      stock_anterior: stockActual,
      stock_posterior: stockPosterior,
    });

    showToast('Ajuste de stock registrado correctamente', 'success');
    navigate('/admin/ajustes');
  };

  const inputClass = "w-full border border-border rounded-lg px-4 py-2.5 bg-background text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

  return (
    <div>
      <PageHeader
        title="Nuevo ajuste de stock"
        description="Corrige manualmente el inventario de un producto"
        icon={<Package className="w-5 h-5" />}
      />

      <form onSubmit={handleSubmit}>
        <div className="border border-border rounded-lg p-6 bg-background max-w-2xl mx-auto space-y-5">
          <div ref={searchRef} className="relative">
            <label className="block text-sm font-medium text-foreground mb-1.5">Producto</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={searchText}
                onChange={e => { setSearchText(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Buscar producto..."
                className={`${inputClass} pl-10`} required />
            </div>
            {showDropdown && filtered.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filtered.map(p => (
                  <button key={p.id_producto} type="button" onClick={() => {
                    setSelectedProduct(p);
                    setSearchText(p.nombre_producto);
                    setShowDropdown(false);
                  }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-muted transition-colors border-b border-border last:border-0 ${
                      selectedProduct?.id_producto === p.id_producto ? 'bg-primary/5' : ''
                    }`}>
                    <span className="flex-1 font-medium text-foreground">{p.nombre_producto}</span>
                    <span className="text-xs text-muted-foreground">S/{p.precio_producto.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Tipo de ajuste</label>
            <div className="flex rounded-md border border-border overflow-hidden">
              {(['entrada', 'salida'] as const).map(op => (
                <button key={op} type="button" onClick={() => setTipo(op)}
                  className={`flex-1 px-4 py-2 text-sm font-medium text-center ${
                    tipo === op ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-muted'
                  }`}>
                  {op === 'entrada' ? 'Entrada (+)' : 'Salida (-)'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Cantidad</label>
            <input type="number" min="1" value={cantidad} onChange={e => setCantidad(e.target.value)}
              className={inputClass} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Motivo</label>
            <input type="text" value={observacion} onChange={e => setObservacion(e.target.value)}
              className={inputClass} placeholder="Ej: Producto dañado, sobrante de inventario..." />
          </div>
        </div>

        <div className="flex gap-3 justify-end max-w-2xl mx-auto mt-6">
          <button type="submit" disabled={saving || !selectedProduct}
            className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm font-medium">
            {saving ? 'Guardando...' : 'Registrar ajuste'}
          </button>
          <button type="button" onClick={() => navigate('/admin/ajustes')}
            className="bg-muted text-foreground px-6 py-2.5 rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
