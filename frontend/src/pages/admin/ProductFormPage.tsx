import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { uploadPdf } from '../../lib/supabaseStorage';
import type { CategoriaProducto, MarcaProducto, Producto, ProductoImagen } from '../../lib/supabaseTypes';
import { Trash2, Upload, Package, ChevronUp, ChevronDown } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';

interface AdditionalImage {
  id?: number;
  url: string;
  orden: number;
}

export default function AdminProductForm() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isEdit = !!slug;

  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [precioCompra, setPrecioCompra] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState('');
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [stock, setStock] = useState('');
  const [slugField, setSlugField] = useState('');
  const [pkCategoria, setPkCategoria] = useState<number>(0);
  const [selectedMain, setSelectedMain] = useState<number>(0);
  const [selectedSub, setSelectedSub] = useState<number>(0);
  const [pkMarca, setPkMarca] = useState<number>(0);
  const [estado, setEstado] = useState('activo');
  const [destacado, setDestacado] = useState(false);
  const [nuevo, setNuevo] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaProducto[]>([]);
  const [marcas, setMarcas] = useState<MarcaProducto[]>([]);
  const [loading, setLoading] = useState(false);
  const [additionalImages, setAdditionalImages] = useState<AdditionalImage[]>([]);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);
  const [fichaTecnicaUrl, setFichaTecnicaUrl] = useState('');
  const [fichaTecnicaFile, setFichaTecnicaFile] = useState<File | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const [editCatId, setEditCatId] = useState<number | null>(null);

  const mainCats = categorias.filter(c => !c.pk_categoria_padre);
  const subCats = selectedMain ? categorias.filter(c => c.pk_categoria_padre === selectedMain) : [];
  const subSubCats = selectedSub ? categorias.filter(c => c.pk_categoria_padre === selectedSub) : [];

  useEffect(() => {
    Promise.all([
      supabase.from('categoria_productos').select('*'),
      supabase.from('marca_producto').select('*'),
    ]).then(([catData, marData]) => {
      if (catData.data) setCategorias(catData.data as CategoriaProducto[]);
      if (marData.data) setMarcas(marData.data as MarcaProducto[]);
    });

    if (isEdit) {
      supabase
        .from('producto')
        .select('*, imagenes:producto_imagen(*), inventario:inventario!pk_producto!left(stock_actual)')
        .eq('slug', slug)
        .single()
        .then(({ data }) => {
          if (data) {
            const p = data as Producto & { imagenes: ProductoImagen[] };
            setNombre(p.nombre_producto);
            setPrecio(String(p.precio_producto));
            setPrecioCompra(p.precio_compra ? String(p.precio_compra) : '');
            setDescripcion(p.descripcion_producto || '');
            setImagen(p.imagen_producto || '');
            setSlugField(p.slug);
            setPkCategoria(p.pk_categoria_producto || 0);
            setEditCatId(p.pk_categoria_producto || null);
            setFichaTecnicaUrl(p.ficha_tecnica_url || '');
            setPkMarca(p.pk_marca_producto || 0);
            setStock(String((p as any).inventario?.stock_actual ?? ''));
            setEstado(p.estado || 'activo');
            setDestacado(p.destacado || false);
            setNuevo(p.nuevo || false);
            if (p.imagenes) {
              setAdditionalImages(
                p.imagenes
                  .map(img => ({ id: img.id_producto_imagen, url: img.url, orden: img.orden }))
                  .sort((a, b) => a.orden - b.orden)
              );
            }
          }
        });
    }
  }, [slug, isEdit]);

  useEffect(() => {
    if (!editCatId || categorias.length === 0) return;
    const resolveChain = (catId: number): [number, number, number] => {
      const cat = categorias.find(c => c.id_categoria_producto === catId);
      if (!cat) return [0, 0, catId];
      const parent = cat.pk_categoria_padre ? categorias.find(c => c.id_categoria_producto === cat.pk_categoria_padre) : null;
      if (!parent) return [catId, 0, catId];
      const grandparent = parent.pk_categoria_padre ? categorias.find(c => c.id_categoria_producto === parent.pk_categoria_padre) : null;
      if (!grandparent) return [parent.id_categoria_producto, catId, catId];
      return [grandparent.id_categoria_producto, parent.id_categoria_producto, catId];
    };
    const [mainId, subId, catId] = resolveChain(editCatId);
    setSelectedMain(mainId);
    setSelectedSub(subId);
    setPkCategoria(catId);
  }, [editCatId, categorias]);

  const toSlug = (text: string) =>
    text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');

  const handleNombreChange = (value: string) => {
    setNombre(value);
    if (!isEdit) {
      setSlugField(toSlug(value));
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagenFile(file);
    setUploadingImg(true);
    try {
      const url = await uploadToCloudinary(file);
      setImagen(url);
    } catch (err) {
      alert('Error al subir imagen: ' + err);
    } finally {
      setUploadingImg(false);
    }
  };

  const handleAdditionalImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingAdditional(true);
    try {
      const uploads = Array.from(files).map(async (file) => {
        const url = await uploadToCloudinary(file);
        return { url, orden: additionalImages.length + 1 };
      });
      const results = await Promise.all(uploads);
      setAdditionalImages(prev => [...prev, ...results.map(r => ({ url: r.url, orden: r.orden }))]);
    } catch (err) {
      alert('Error al subir imágenes: ' + err);
    } finally {
      setUploadingAdditional(false);
      e.target.value = '';
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    setAdditionalImages(prev => {
      const next = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((img, i) => ({ ...img, orden: i + 1 }));
    });
  };

  const handleFichaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFichaTecnicaFile(file);
    setUploadingPdf(true);
    try {
      const url = await uploadPdf(file);
      setFichaTecnicaUrl(url);
    } catch (err) {
      alert('Error al subir PDF: ' + err);
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!imagen && !imagenFile) {
      alert('Debes seleccionar una imagen.');
      setLoading(false);
      return;
    }

    let imagenUrl = imagen;
    if (imagenFile && !imagenUrl) {
      try {
        imagenUrl = await uploadToCloudinary(imagenFile);
      } catch (err) {
        alert('Error al subir imagen: ' + err);
        setLoading(false);
        return;
      }
    }

    const productData = {
      nombre_producto: nombre,
      precio_producto: parseFloat(precio),
      precio_compra: precioCompra ? parseFloat(precioCompra) : null,
      descripcion_producto: descripcion,
      imagen_producto: imagenUrl,
      slug: slugField || toSlug(nombre),
      pk_categoria_producto: pkCategoria || null,
      pk_marca_producto: pkMarca || null,
      ficha_tecnica_url: fichaTecnicaUrl || null,
      estado,
      destacado,
      nuevo,
    };

    if (isEdit) {
      const { data: existingProd, error: prodError } = await supabase
        .from('producto')
        .update(productData)
        .eq('slug', slug)
        .select('id_producto')
        .single();
      if (prodError) { alert(prodError.message); setLoading(false); return; }

      const productId = existingProd.id_producto;

      const { error: invErr } = await supabase
        .from('inventario')
        .upsert({ pk_producto: productId, stock_actual: parseInt(stock) || 0, stock_minimo: 0 }, { onConflict: 'pk_producto' });
      if (invErr) { alert('Error al guardar stock: ' + invErr.message); setLoading(false); return; }

      const existingIds = (await supabase.from('producto_imagen').select('id_producto_imagen').eq('id_producto', productId)).data?.map(i => i.id_producto_imagen) || [];
      const keepIds = additionalImages.filter(img => img.id).map(img => img.id!);
      const toDelete = existingIds.filter(id => !keepIds.includes(id));
      if (toDelete.length > 0) {
        await supabase.from('producto_imagen').delete().in('id_producto_imagen', toDelete);
      }
      const toInsert = additionalImages.filter(img => !img.id).map(img => ({ id_producto: productId, url: img.url, orden: img.orden }));
      if (toInsert.length > 0) {
        const { error: insError } = await supabase.from('producto_imagen').insert(toInsert);
        if (insError) { alert('Error al guardar imágenes adicionales: ' + insError.message); setLoading(false); return; }
      }
    } else {
      const { data: newProd, error: prodError } = await supabase
        .from('producto')
        .insert(productData)
        .select('id_producto')
        .single();
      if (prodError) { alert(prodError.message); setLoading(false); return; }

      if (newProd) {
        const { error: invErr } = await supabase
          .from('inventario')
          .upsert({ pk_producto: newProd.id_producto, stock_actual: parseInt(stock) || 0, stock_minimo: 0 }, { onConflict: 'pk_producto' });
        if (invErr) { alert('Error al guardar stock: ' + invErr.message); setLoading(false); return; }
      }

      if (additionalImages.length > 0 && newProd) {
        const inserts = additionalImages.map(img => ({
          id_producto: newProd.id_producto,
          url: img.url,
          orden: img.orden,
        }));
        const { error: imgError } = await supabase.from('producto_imagen').insert(inserts);
        if (imgError) { alert('Error al guardar imágenes adicionales: ' + imgError.message); setLoading(false); return; }
      }
    }

    navigate('/admin/productos');
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Editar producto' : 'Nuevo producto'}
        description={isEdit ? 'Modifica los datos del producto' : 'Agrega un nuevo producto a la tienda'}
        icon={<Package className="w-5 h-5" />}
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* LEFT COLUMN - Images & PDF */}
          <div className="flex flex-col gap-5">
            {/* Main Image */}
            <div className="flex-none border border-border rounded-lg p-4 bg-background space-y-3">
              <label className="block text-sm font-semibold text-foreground">Imagen principal</label>
              {imagen && !uploadingImg ? (
                <div>
                  <img
                    src={imagen}
                    alt="Vista previa"
                    className="w-full h-48 object-cover rounded-lg border border-border"
                  />
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-48 rounded-lg border-2 border-dashed border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                  {uploadingImg ? (
                    <p className="text-sm text-primary">Subiendo imagen...</p>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="w-8 h-8" />
                      <span className="text-sm">Subir imagen</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={uploadingImg}
                  />
                </label>
              )}
              <hr className="border-t border-border" />
              <div className="flex gap-2">
                <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm rounded border border-border bg-background text-foreground hover:bg-muted cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  Cambiar
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={uploadingImg}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => { setImagen(''); setImagenFile(null); }}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm rounded border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Quitar
                </button>
              </div>
            </div>

            {/* Gallery */}
            <div className="flex-none border border-border rounded-lg p-4 bg-background space-y-3">
              <label className="block text-sm font-semibold text-foreground">Carrusel de fotos</label>
              {additionalImages.length > 0 && (
                <div className="space-y-2">
                  {additionalImages.map((img, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <img
                        src={img.url}
                        alt={`Foto ${idx + 1}`}
                        className="h-14 w-14 object-cover rounded-lg border border-border shrink-0"
                      />
                      <span className="text-xs text-muted-foreground flex-1 truncate">Foto {idx + 1}</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => moveImage(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(idx, 'down')}
                          disabled={idx === additionalImages.length - 1}
                          className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeAdditionalImage(idx)}
                          className="p-1 rounded text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <hr className="border-t border-border" />
              <label className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm rounded border border-border bg-background text-foreground hover:bg-muted cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                Subir fotos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAdditionalImageChange}
                  className="hidden"
                  disabled={uploadingAdditional}
                />
              </label>
              {uploadingAdditional && <p className="text-sm text-primary">Subiendo imágenes...</p>}
            </div>

            {/* PDF */}
            <div className="flex-none border border-border rounded-lg p-4 bg-background space-y-3">
              <label className="block text-sm font-semibold text-foreground">Ficha técnica</label>
              {fichaTecnicaUrl ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-green-600">&#10003; PDF cargado</span>
                  <a href={fichaTecnicaUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    Ver
                  </a>
                  <button
                    type="button"
                    onClick={() => { setFichaTecnicaUrl(''); setFichaTecnicaFile(null); }}
                    className="text-sm text-destructive hover:underline ml-auto"
                  >
                    Eliminar
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm rounded border border-border bg-background text-foreground hover:bg-muted cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  {uploadingPdf ? 'Subiendo PDF...' : 'Subir PDF'}
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFichaChange}
                    className="hidden"
                    disabled={uploadingPdf}
                  />
                </label>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - Fields */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="flex-1 border border-border rounded-lg p-4 bg-background space-y-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => handleNombreChange(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Precio venta</label>
                  <input
                    type="number"
                    step="0.01"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Precio compra</label>
                  <input
                    type="number"
                    step="0.01"
                    value={precioCompra}
                    onChange={(e) => setPrecioCompra(e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Stock</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Slug</label>
                  <input
                    type="text"
                    value={slugField}
                    onChange={(e) => setSlugField(e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex-1 border border-border rounded-lg p-4 bg-background space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Categoría</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Categoría</label>
                    <select
                      value={selectedMain}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setSelectedMain(val);
                        setSelectedSub(0);
                        setPkCategoria(val);
                      }}
                      className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    >
                      <option value={0}>Seleccionar</option>
                      {mainCats.map((c) => (
                        <option key={c.id_categoria_producto} value={c.id_categoria_producto}>
                          {c.nombre_categoria_producto}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Subcategoría</label>
                    <select
                      value={selectedSub}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setSelectedSub(val);
                        setPkCategoria(val || selectedMain);
                      }}
                      className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!selectedMain}
                    >
                      <option value={0}>{subCats.length ? 'Seleccionar' : 'Sin subcategorías'}</option>
                      {subCats.map((c) => (
                        <option key={c.id_categoria_producto} value={c.id_categoria_producto}>
                          {c.nombre_categoria_producto}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Sub-subcategoría</label>
                    <select
                      value={subSubCats.some((c) => c.id_categoria_producto === pkCategoria) ? pkCategoria : selectedSub}
                      onChange={(e) => setPkCategoria(Number(e.target.value))}
                      className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!selectedSub || subSubCats.length === 0}
                    >
                      <option value={selectedSub}>{subSubCats.length ? 'Seleccionar' : 'Sin sub-subcategorías'}</option>
                      {subSubCats.map((c) => (
                        <option key={c.id_categoria_producto} value={c.id_categoria_producto}>
                          {c.nombre_categoria_producto}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Marca</label>
                    <select
                      value={pkMarca}
                      onChange={(e) => setPkMarca(Number(e.target.value))}
                      className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    >
                      <option value={0}>Seleccionar</option>
                      {marcas.map((m) => (
                        <option key={m.id_marca_producto} value={m.id_marca_producto}>
                          {m.nombre_marca_producto}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card flex-wrap">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50">
                  <span className="text-xs font-medium text-muted-foreground">Estado</span>
                  <div className="flex rounded-md border border-border overflow-hidden">
                    {['activo', 'inactivo'].map((op) => (
                      <button
                        key={op}
                        type="button"
                        onClick={() => setEstado(op)}
                        className={`px-3 py-1.5 text-xs font-medium transition-all ${
                          estado === op
                            ? op === 'activo'
                              ? 'bg-green-500 text-white shadow-sm'
                              : 'bg-red-500 text-white shadow-sm'
                            : 'bg-background text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {op === 'activo' ? 'Activo' : 'Inactivo'}
                      </button>
                    ))}
                  </div>
                </div>
                <span className="text-muted-foreground/40 text-lg select-none">|</span>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50">
                  <span className="text-xs font-medium text-muted-foreground">Destacado</span>
                  <button
                    type="button"
                    onClick={() => setDestacado(!destacado)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      destacado ? 'bg-yellow-500' : 'bg-muted'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                      destacado ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50">
                  <span className="text-xs font-medium text-muted-foreground">Nuevo</span>
                  <button
                    type="button"
                    onClick={() => setNuevo(!nuevo)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      nuevo ? 'bg-blue-500' : 'bg-muted'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                      nuevo ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            type="submit"
            className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm font-medium"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/productos')}
            className="bg-muted text-foreground px-5 py-2 rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}


