import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Percent, Search } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { useToast } from '../../components/ui/Toast';
import type { Producto } from '../../lib/supabaseTypes';

interface Categoria {
  id_categoria_producto: number;
  nombre_categoria_producto: string;
  pk_categoria_padre: number | null;
}

export default function AdminOfferForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [products, setProducts] = useState<Producto[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [formProducto, setFormProducto] = useState<number>(0);

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
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [catFiltroProducto, setCatFiltroProducto] = useState<number>(0);
  const [formTipoDescuento, setFormTipoDescuento] = useState<'fijo' | 'porcentaje'>('fijo');
  const [formValorDescuento, setFormValorDescuento] = useState('');
  const [formInicio, setFormInicio] = useState('');
  const [formFin, setFormFin] = useState('');
  const [formEstado, setFormEstado] = useState('activo');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    (async () => {
      const [productRes, catRes] = await Promise.all([
        supabase.from('producto').select('*, marca:pk_marca_producto(*)').order('nombre_producto'),
        supabase.from('categoria_productos').select('*'),
      ]);
      const allProducts = (productRes.data || []) as unknown as Producto[];
      setProducts(allProducts);
      if (catRes.data) setCategories(catRes.data as Categoria[]);

      if (isEdit && id) {
        const { data: offerData } = await supabase
          .from('oferta')
          .select('*')
          .eq('id_oferta', id)
          .single();
        if (offerData) {
          setFormProducto(offerData.pk_producto);
          const prod = allProducts.find(p => p.id_producto === offerData.pk_producto);
          if (prod) setSearchText(prod.nombre_producto);
          setFormTipoDescuento(offerData.tipo_descuento as 'fijo' | 'porcentaje');
          setFormValorDescuento(String(offerData.valor_descuento));
          setFormInicio(offerData.fecha_inicio);
          setFormFin(offerData.fecha_fin);
          setFormEstado(offerData.estado);
        }
      }

      setPageLoading(false);
    })();

    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [id, isEdit]);

  const selectedProduct = products.find(p => p.id_producto === formProducto);

  const filteredSuggestions = useMemo(() => {
    if (searchText.length < 3) return [];
    const q = searchText.toLowerCase();
    let result = products.filter(p => p.nombre_producto.toLowerCase().includes(q));
    if (catFiltroProducto) {
      result = result.filter(p => p.pk_categoria_producto === catFiltroProducto);
    }
    return result.slice(0, 10);
  }, [products, searchText, catFiltroProducto]);

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

  const descuentoActivo = selectedProduct && formValorDescuento && parseFloat(formValorDescuento) > 0;
  const offerPrice = useMemo(() => {
    if (!selectedProduct || !descuentoActivo) return null;
    if (formTipoDescuento === 'fijo') {
      return parseFloat(formValorDescuento);
    }
    const pct = parseFloat(formValorDescuento);
    return Math.round(selectedProduct.precio_producto * (1 - pct / 100) * 100) / 100;
  }, [selectedProduct, formTipoDescuento, formValorDescuento, descuentoActivo]);

  const savings = offerPrice != null && selectedProduct
    ? Math.round((selectedProduct.precio_producto - offerPrice) * 100) / 100
    : null;

  const selectProduct = (prod: Producto) => {
    setFormProducto(prod.id_producto);
    setSearchText(prod.nombre_producto);
    setShowDropdown(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    setShowDropdown(value.length >= 3);
    if (!value) {
      setFormProducto(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProducto) {
      showToast('Debes seleccionar un producto', 'error');
      return;
    }
    setLoading(true);

    let precio_oferta: number;
    let valor_descuento: number;

    if (formTipoDescuento === 'fijo') {
      valor_descuento = parseFloat(formValorDescuento);
      precio_oferta = valor_descuento;
    } else {
      const pct = parseFloat(formValorDescuento);
      valor_descuento = pct;
      const precioOriginal = selectedProduct?.precio_producto || 0;
      precio_oferta = Math.round(precioOriginal * (1 - pct / 100) * 100) / 100;
    }

    const data = {
      pk_producto: formProducto,
      precio_oferta,
      tipo_descuento: formTipoDescuento,
      valor_descuento,
      fecha_inicio: formInicio,
      fecha_fin: formFin,
      estado: formEstado,
    };

    if (isEdit) {
      const { error } = await supabase.from('oferta').update(data).eq('id_oferta', id);
      if (error) { showToast('Error al guardar: ' + error.message, 'error'); setLoading(false); return; }
    } else {
      const { error } = await supabase.from('oferta').insert(data);
      if (error) { showToast('Error al guardar: ' + error.message, 'error'); setLoading(false); return; }
    }

    showToast(isEdit ? 'Oferta actualizada correctamente' : 'Oferta creada correctamente', 'success');
    navigate('/admin/ofertas');
  };

  if (pageLoading) return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">Cargando...</div>;

  const inputClass = "w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Editar oferta' : 'Nueva oferta'}
        description={isEdit ? 'Modifica los datos de la oferta' : 'Agrega una nueva oferta'}
        icon={<Percent className="w-5 h-5" />}
      />

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Bloque 1: Producto */}
          <div className="border border-border rounded-lg p-6 bg-background">
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

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Bloque 2: Datos del producto */}
            <div className="border border-border rounded-lg p-6 bg-background min-h-[300px]">
              <h3 className="text-base font-semibold text-foreground mb-4">Datos del producto</h3>
              {selectedProduct ? (
              <div className="space-y-4">
                  <div className="flex justify-center">
                    {selectedProduct.imagen_producto ? (
                      <img
                        src={selectedProduct.imagen_producto}
                        alt={selectedProduct.nombre_producto}
                        className="h-32 w-32 object-cover rounded-lg border border-border"
                      />
                    ) : (
                      <div className="h-32 w-32 rounded-lg border border-border bg-muted flex items-center justify-center text-muted-foreground text-xs">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <hr className="border-t border-border" />
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Nombre</span>
                      <p className="text-sm font-medium text-foreground">{selectedProduct.nombre_producto}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Precio producto</span>
                      <p className="text-sm font-semibold text-foreground">S/{Number(selectedProduct.precio_producto).toFixed(2)}</p>
                      {descuentoActivo && savings != null && offerPrice != null && (
                        <p className="text-sm mt-1">
                          <span className="text-foreground">S/{Number(selectedProduct.precio_producto).toFixed(2)}</span>
                          {' - '}
                          <span className="text-red-600 font-semibold">S/{savings.toFixed(2)}</span>
                          {' = '}
                          <span className="text-foreground font-semibold">S/{offerPrice.toFixed(2)}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Marca</span>
                      <p className="text-sm text-foreground">{selectedProduct.marca?.nombre_marca_producto || '—'}</p>
                    </div>
                    {categoryChain.length > 0 && (
                      <div>
                        <span className="text-xs text-muted-foreground">Categoría</span>
                        <p className="text-sm text-foreground">{categoryChain.map(c => c.nombre_categoria_producto).join(' > ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[200px]">
                  <p className="text-sm text-muted-foreground">Selecciona un producto para ver sus datos</p>
                </div>
              )}
            </div>

            {/* Bloque 3: Datos de promociones */}
            <div className="border border-border rounded-lg p-6 bg-background">
              <h3 className="text-base font-semibold text-foreground mb-4">Datos de promociones</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Tipo descuento</label>
                  <div className="flex rounded-md border border-border overflow-hidden">
                    {(['fijo', 'porcentaje'] as const).map(op => (
                      <button
                        key={op}
                        type="button"
                        onClick={() => setFormTipoDescuento(op)}
                        className={`flex-1 px-3 py-1.5 text-sm font-medium text-center ${
                          formTipoDescuento === op
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background text-foreground hover:bg-muted'
                        }`}
                      >
                        {op === 'fijo' ? 'Monto fijo' : 'Porcentaje'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    {formTipoDescuento === 'fijo' ? 'Precio oferta (S/)' : '% Descuento'}
                  </label>
                  <input
                    type="number"
                    step={formTipoDescuento === 'fijo' ? '0.01' : '1'}
                    min="0"
                    max={formTipoDescuento === 'porcentaje' ? '100' : undefined}
                    value={formValorDescuento}
                    onChange={e => setFormValorDescuento(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Fecha inicio</label>
                    <input
                      type="date"
                      value={formInicio}
                      onChange={e => setFormInicio(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Fecha fin</label>
                    <input
                      type="date"
                      value={formFin}
                      onChange={e => setFormFin(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
                  <span className="text-xs font-medium text-muted-foreground">Estado</span>
                  <div className="flex rounded-md border border-border overflow-hidden">
                    {(['activo', 'inactivo'] as const).map(op => (
                      <button
                        key={op}
                        type="button"
                        onClick={() => setFormEstado(op)}
                        className={`w-20 px-3 py-1.5 text-xs font-medium text-left ${
                          formEstado === op
                            ? op === 'activo'
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                            : 'bg-background text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {op === 'activo' ? 'Activo' : 'Inactivo'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm font-medium"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/ofertas')}
            className="bg-muted text-foreground px-6 py-2.5 rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
