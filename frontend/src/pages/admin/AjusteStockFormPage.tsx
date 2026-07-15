import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { generarCodigoTransaccion } from '../../lib/generateCode';
import type { Producto } from '../../lib/supabaseTypes';
import { Package, Search } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { useToast } from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useAuthContext } from '../../hooks/AuthContext';

interface Categoria {
  id_categoria_producto: number;
  nombre_categoria_producto: string;
  pk_categoria_padre: number | null;
}

export default function AdminAjusteStockForm() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { showToast } = useToast();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [catFiltroProducto, setCatFiltroProducto] = useState<number>(0);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [tipo, setTipo] = useState<'entrada' | 'salida'>('entrada');
  const [cantidad, setCantidad] = useState('');
  const [observacion, setObservacion] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const getCategoryChainName = useCallback((catId: number | null): string => {
    if (!catId) return '';
    const chain: string[] = [];
    let currentId: number | null = catId;
    while (currentId) {
      const cat = categories.find(c => c.id_categoria_producto === currentId);
      if (!cat) break;
      chain.unshift(cat.nombre_categoria_producto);
      currentId = cat.pk_categoria_padre;
    }
    return chain.join(' > ');
  }, [categories]);

  useEffect(() => {
    Promise.all([
      supabase.from('producto').select('*, marca:pk_marca_producto(*)').eq('estado', 'activo').order('nombre_producto'),
      supabase.from('categoria_productos').select('*'),
    ]).then(([prodRes, catRes]) => {
      if (prodRes.data) setProductos(prodRes.data as unknown as Producto[]);
      if (catRes.data) setCategories(catRes.data as Categoria[]);
    });
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      supabase.from('inventario').select('stock_actual').eq('pk_producto', selectedProduct.id_producto).single()
        .then(({ data }) => setCurrentStock((data as any)?.stock_actual ?? 0));
    }
  }, [selectedProduct]);

  const filteredSuggestions = useMemo(() => {
    if (searchText.length < 3) return [];
    const q = searchText.toLowerCase();
    let result = productos.filter(p => p.nombre_producto.toLowerCase().includes(q));
    if (catFiltroProducto) {
      result = result.filter(p => p.pk_categoria_producto === catFiltroProducto);
    }
    return result.slice(0, 10);
  }, [productos, searchText, catFiltroProducto]);

  const categoryChain = useMemo(() => {
    if (!selectedProduct?.pk_categoria_producto) return [];
    const chain: Categoria[] = [];
    let currentId: number | null = selectedProduct.pk_categoria_producto;
    while (currentId) {
      const cat = categories.find(c => c.id_categoria_producto === currentId);
      if (!cat) break;
      chain.unshift(cat);
      currentId = cat.pk_categoria_padre;
    }
    return chain;
  }, [selectedProduct, categories]);

  const stockPosterior = useMemo(() => {
    if (!selectedProduct || !cantidad || parseInt(cantidad) <= 0) return currentStock;
    const cant = parseInt(cantidad);
    return tipo === 'entrada' ? currentStock + cant : Math.max(0, currentStock - cant);
  }, [tipo, cantidad, currentStock, selectedProduct]);

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    setShowDropdown(value.length >= 3);
    if (!value) setSelectedProduct(null);
  };

  const selectProduct = (prod: Producto) => {
    setSelectedProduct(prod);
    setSearchText(prod.nombre_producto);
    setShowDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) { showToast('Debes seleccionar un producto.', 'error'); return; }
    if (!cantidad || parseInt(cantidad) <= 0) { showToast('Debes ingresar una cantidad válida.', 'error'); return; }
    if (tipo === 'salida') { setConfirmOpen(true); return; }
    executeSave();
  };

  const executeSave = async () => {
    setSaving(true);

    const cant = parseInt(cantidad);
    const cantFinal = tipo === 'salida' ? -cant : cant;
    const codigo = await generarCodigoTransaccion('AJU');

    if (tipo === 'entrada') {
      await supabase.rpc('increment_stock', { p_producto_id: selectedProduct!.id_producto, p_cantidad: cant });
    } else {
      await supabase.rpc('decrement_stock', { p_producto_id: selectedProduct!.id_producto, p_cantidad: cant });
    }

    await supabase.from('movimiento').insert({
      id_producto: selectedProduct!.id_producto,
      tipo_movimiento: 'AJUSTE',
      cantidad: cantFinal,
      observacion: `${codigo}${observacion ? ` - ${observacion}` : ''}`,
      responsable: user?.nombres || 'Admin',
      stock_anterior: currentStock,
      stock_posterior: stockPosterior,
    });

    showToast('Ajuste de stock registrado correctamente', 'success');
    navigate('/admin/ajustes');
  };

  const inputClass = "w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

  if (!categories.length && !productos.length) return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">Cargando...</div>;

  return (
    <div>
      <PageHeader
        title="Nuevo ajuste de stock"
        description="Corrige manualmente el inventario de un producto"
        icon={<Package className="w-5 h-5" />}
      />

      <form onSubmit={handleSubmit}>
        {/* TOP: Product search full width */}
        <div className="border border-border rounded-lg p-6 bg-background mb-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Producto</h3>
          <div className="flex gap-4">
            <div ref={searchRef} className="flex-1 relative">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Buscar producto</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchText}
                  onChange={e => handleSearchChange(e.target.value)}
                  onFocus={() => { if (searchText.length >= 3) setShowDropdown(true); }}
                  placeholder="Escribe al menos 3 caracteres..."
                  className={`${inputClass} pl-9`}
                  required
                />
              </div>
              {showDropdown && filteredSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  {filteredSuggestions.map(p => (
                    <button
                      key={p.id_producto}
                      type="button"
                      onClick={() => selectProduct(p)}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border last:border-0"
                    >
                      {p.imagen_producto ? (
                        <img src={p.imagen_producto} alt="" className="h-10 w-10 object-cover rounded border shrink-0" />
                      ) : (
                        <div className="h-10 w-10 rounded border border-border bg-muted shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{p.nombre_producto}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {getCategoryChainName(p.pk_categoria_producto)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="w-64">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Categoría</label>
              <select
                value={catFiltroProducto}
                onChange={e => setCatFiltroProducto(Number(e.target.value))}
                className={inputClass}
              >
                <option value={0}>Todas las categorías</option>
                {categories.map(c => (
                  <option key={c.id_categoria_producto} value={c.id_categoria_producto}>{c.nombre_categoria_producto}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* BOTTOM: two columns same height */}
        {selectedProduct && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* LEFT: Product data */}
          <div className="border border-border rounded-lg p-6 bg-background flex flex-col">
            <h3 className="text-base font-semibold text-foreground mb-4">Datos del producto</h3>
            <div className="flex flex-col justify-center flex-1 gap-4">
              <div className="flex justify-center">
                {selectedProduct.imagen_producto ? (
                  <img src={selectedProduct.imagen_producto} alt={selectedProduct.nombre_producto} className="h-32 w-32 object-cover rounded-lg border border-border" />
                ) : (
                  <div className="h-32 w-32 rounded-lg border border-border bg-muted flex items-center justify-center text-muted-foreground text-xs">Sin imagen</div>
                )}
              </div>
              <hr className="border-t border-border" />
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <span className="text-xs text-muted-foreground">Nombre</span>
                  <p className="text-sm font-medium text-foreground">{selectedProduct.nombre_producto}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Marca</span>
                  <p className="text-sm text-foreground">{selectedProduct.marca?.nombre_marca_producto || '—'}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Categoría</span>
                  <p className="text-sm text-foreground">{categoryChain.length > 0 ? categoryChain.map(c => c.nombre_categoria_producto).join(' > ') : '—'}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Stock</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm text-muted-foreground">Actual:</span>
                    <span className="text-lg font-bold text-foreground">{currentStock}</span>
                    <span className="text-muted-foreground/30 mx-1">|</span>
                    <span className="text-sm text-muted-foreground">Final:</span>
                    <span className={`text-lg font-bold ${stockPosterior < 0 ? 'text-destructive' : 'text-foreground'}`}>{stockPosterior}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Adjustment fields */}
          <div className="border border-border rounded-lg p-6 bg-background flex flex-col">
            <h3 className="text-base font-semibold text-foreground mb-4">Datos del ajuste</h3>
            <div className="flex flex-col justify-center flex-1 gap-5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Tipo de ajuste</label>
                <div className="flex rounded-md border border-border overflow-hidden">
                  {(['entrada', 'salida'] as const).map(op => (
                    <button key={op} type="button" onClick={() => setTipo(op)}
                      className={`flex-1 px-3 py-1.5 text-sm font-medium text-center ${
                        tipo === op ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-muted'
                      }`}>
                      {op === 'entrada' ? 'Entrada (+)' : 'Salida (-)'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Cantidad</label>
                <input type="number" min="1" value={cantidad} onChange={e => setCantidad(e.target.value)}
                  className={inputClass} required placeholder="Ej: 10" />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Motivo</label>
                <input type="text" value={observacion} onChange={e => setObservacion(e.target.value)}
                  className={inputClass} placeholder="Ej: Producto dañado, sobrante de inventario..." />
              </div>
            </div>
          </div>
        </div>
        )}

        {selectedProduct && (
        <div className="flex gap-3 justify-end mt-6">
          <button type="submit" disabled={saving || !selectedProduct}
            className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm font-medium">
            {saving ? 'Guardando...' : 'Registrar ajuste'}
          </button>
          <button type="button" onClick={() => navigate('/admin/ajustes')}
            className="bg-muted text-foreground px-6 py-2.5 rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium">
            Cancelar
          </button>
        </div>
        )}

        {!selectedProduct && (
          <div className="border border-border rounded-lg p-6 bg-background text-center text-muted-foreground">
            Selecciona un producto para realizar el ajuste
          </div>
        )}
      </form>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar ajuste de salida"
        message={`¿Estás seguro de sacar ${cantidad} unidades de "${selectedProduct?.nombre_producto}"? Esta acción reducirá el inventario de ${currentStock} a ${Math.max(0, currentStock - (parseInt(cantidad) || 0))}.`}
        confirmText="Confirmar salida"
        variant="destructive"
        onConfirm={() => { setConfirmOpen(false); executeSave(); }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
