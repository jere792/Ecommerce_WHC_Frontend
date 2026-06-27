import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { uploadToCloudinary } from '../../lib/cloudinary';
import type { CategoriaProducto, MarcaProducto, EstadoProducto, Producto, ProductoImagen } from '../../lib/supabaseTypes';
import { Trash2, Upload } from 'lucide-react';

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
  const [pkEstado, setPkEstado] = useState<number>(0);
  const [categorias, setCategorias] = useState<CategoriaProducto[]>([]);
  const [marcas, setMarcas] = useState<MarcaProducto[]>([]);
  const [estados, setEstados] = useState<EstadoProducto[]>([]);
  const [loading, setLoading] = useState(false);
  const [additionalImages, setAdditionalImages] = useState<AdditionalImage[]>([]);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);

  const [editCatId, setEditCatId] = useState<number | null>(null);

  const mainCats = categorias.filter(c => !c.pk_categoria_padre);
  const subCats = selectedMain ? categorias.filter(c => c.pk_categoria_padre === selectedMain) : [];
  const subSubCats = selectedSub ? categorias.filter(c => c.pk_categoria_padre === selectedSub) : [];

  useEffect(() => {
    Promise.all([
      supabase.from('categoria_p').select('*'),
      supabase.from('marca_p').select('*'),
      supabase.from('estado_p').select('*'),
    ]).then(([catData, marData, estData]) => {
      if (catData.data) setCategorias(catData.data as CategoriaProducto[]);
      if (marData.data) setMarcas(marData.data as MarcaProducto[]);
      if (estData.data) setEstados(estData.data as EstadoProducto[]);
    });

    if (isEdit) {
      supabase
        .from('producto')
        .select('*, imagenes:producto_imagen(*)')
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
            setStock(String(p.stock_producto));
            setSlugField(p.slug);
            setPkCategoria(p.pk_categoria_producto || 0);
            setEditCatId(p.pk_categoria_producto || null);
            setPkMarca(p.pk_marca_producto || 0);
            setPkEstado(p.pk_estado_producto || 0);
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
      stock_producto: parseInt(stock),
      slug: slugField || toSlug(nombre),
      pk_categoria_producto: pkCategoria || null,
      pk_marca_producto: pkMarca || null,
      pk_estado_producto: pkEstado || null,
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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">{isEdit ? 'Editar producto' : 'Nuevo producto'}</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={e => handleNombreChange(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio venta</label>
            <input
              type="number"
              step="0.01"
              value={precio}
              onChange={e => setPrecio(e.target.value)}
              className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio compra</label>
            <input
              type="number"
              step="0.01"
              value={precioCompra}
              onChange={e => setPrecioCompra(e.target.value)}
              className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock</label>
            <input
              type="number"
              value={stock}
              onChange={e => setStock(e.target.value)}
              className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
            <input
              type="text"
              value={slugField}
              onChange={e => setSlugField(e.target.value)}
              className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Imagen</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={uploadingImg}
            />
            {uploadingImg && <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Subiendo imagen...</p>}
            {imagen && !uploadingImg && (
              <img src={imagen} alt="Vista previa" className="mt-2 h-32 w-32 object-cover rounded border dark:border-gray-600" />
            )}
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Imágenes adicionales (galería)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleAdditionalImageChange}
              className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={uploadingAdditional}
            />
            {uploadingAdditional && <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Subiendo imágenes...</p>}
            {additionalImages.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {additionalImages.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img.url} alt={`Adicional ${idx + 1}`} className="h-24 w-24 object-cover rounded-lg border dark:border-gray-600" />
                    <button
                      type="button"
                      onClick={() => removeAdditionalImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={3}
            />
          </div>
           <div className="col-span-2">
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categoría</label>
             <div className="grid grid-cols-3 gap-3">
               <div>
                 <label className="block text-xs text-gray-500 mb-1">Categoría</label>
                 <select
                   value={selectedMain}
                   onChange={e => {
                     const val = Number(e.target.value);
                     setSelectedMain(val);
                     setSelectedSub(0);
                     setPkCategoria(val);
                   }}
                   className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                 >
                   <option value={0}>Seleccionar</option>
                   {mainCats.map(c => (
                     <option key={c.id_categoria_producto} value={c.id_categoria_producto}>
                       {c.nombre_categoria_producto}
                     </option>
                   ))}
                 </select>
               </div>
               <div>
                 <label className="block text-xs text-gray-500 mb-1">Subcategoría</label>
                 <select
                   value={selectedSub}
                   onChange={e => {
                     const val = Number(e.target.value);
                     setSelectedSub(val);
                     setPkCategoria(val || selectedMain);
                   }}
                   className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                   disabled={!selectedMain}
                 >
                   <option value={0}>{subCats.length ? 'Seleccionar' : 'Sin subcategorías'}</option>
                   {subCats.map(c => (
                     <option key={c.id_categoria_producto} value={c.id_categoria_producto}>
                       {c.nombre_categoria_producto}
                     </option>
                   ))}
                 </select>
               </div>
               <div>
                 <label className="block text-xs text-gray-500 mb-1">Sub-subcategoría</label>
                 <select
                   value={subSubCats.some(c => c.id_categoria_producto === pkCategoria) ? pkCategoria : selectedSub}
                   onChange={e => setPkCategoria(Number(e.target.value))}
                   className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                   disabled={!selectedSub || subSubCats.length === 0}
                 >
                   <option value={selectedSub}>{subSubCats.length ? 'Seleccionar' : 'Sin sub-subcategorías'}</option>
                   {subSubCats.map(c => (
                     <option key={c.id_categoria_producto} value={c.id_categoria_producto}>
                       {c.nombre_categoria_producto}
                     </option>
                   ))}
                 </select>
               </div>
             </div>
           </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marca</label>
            <select
              value={pkMarca}
              onChange={e => setPkMarca(Number(e.target.value))}
              className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value={0}>Seleccionar</option>
              {marcas.map(m => (
                <option key={m.id_marca_producto} value={m.id_marca_producto}>
                  {m.nombre_marca_producto}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
            <select
              value={pkEstado}
              onChange={e => setPkEstado(Number(e.target.value))}
              className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value={0}>Seleccionar</option>
              {estados.map(e => (
                <option key={e.id_estado_producto} value={e.id_estado_producto}>
                  {e.nombre_estado_producto}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/productos')}
            className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
