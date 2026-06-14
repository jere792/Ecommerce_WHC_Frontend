import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { uploadToCloudinary } from '../../lib/cloudinary';
import type { MarcaProducto } from '../../lib/supabaseTypes';
import { useAlert } from '../../components/ui/AlertModal';

export default function AdminBrands() {
  const [brands, setBrands] = useState<(MarcaProducto & { logo_url?: string; mostrar_en_home?: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const { alert, modal } = useAlert();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [nombre, setNombre] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [mostrarEnHome, setMostrarEnHome] = useState(false);

  useEffect(() => { loadBrands(); }, []);

  const loadBrands = async () => {
    const { data } = await supabase.from('marca_p').select('*').order('id_marca_producto', { ascending: true });
    if (data) setBrands(data as any);
    setLoading(false);
  };

  const resetForm = () => { setNombre(''); setLogoUrl(''); setMostrarEnHome(false); setEditing(null); };

  const openNew = () => { resetForm(); setShowForm(true); };

  const openEdit = (brand: any) => {
    setEditing(brand); setNombre(brand.nombre_marca_producto); setLogoUrl(brand.logo_url || ''); setMostrarEnHome(brand.mostrar_en_home || false);
    setShowForm(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setLogoUrl(url);
    } catch (err) {
      alert('Error al subir logo: ' + err, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { nombre_marca_producto: nombre, logo_url: logoUrl || null, mostrar_en_home: mostrarEnHome };
    if (editing) {
      await supabase.from('marca_p').update(payload).eq('id_marca_producto', editing.id_marca_producto);
    } else {
      await supabase.from('marca_p').insert(payload);
    }
    setShowForm(false); resetForm(); loadBrands();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminar esta marca?')) return;
    await supabase.from('marca_p').delete().eq('id_marca_producto', id);
    loadBrands();
  };

  const toggleHome = async (brand: any) => {
    await supabase.from('marca_p').update({ mostrar_en_home: !brand.mostrar_en_home }).eq('id_marca_producto', brand.id_marca_producto);
    loadBrands();
  };

  if (loading) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Cargando...</div>;

  return (
    <div>
      {modal}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Marcas</h1>
        <button onClick={openNew} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Nueva marca</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{editing ? 'Editar' : 'Nueva'} marca</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo</label>
            <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} className="w-full text-gray-900 dark:text-gray-100" />
            {uploading && <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Subiendo...</p>}
            {logoUrl && !uploading && <img src={logoUrl} alt="Logo" className="mt-2 h-16 object-contain rounded border dark:border-gray-600" />}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={mostrarEnHome} onChange={e => setMostrarEnHome(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mostrar en la página principal</span>
          </label>
          <div className="flex gap-3">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Guardar</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600">Cancelar</button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Logo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">En home</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {brands.map((brand) => (
              <tr key={brand.id_marca_producto} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{brand.id_marca_producto}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{brand.nombre_marca_producto}</td>
                <td className="px-4 py-3 text-sm">{brand.logo_url ? <img src={brand.logo_url} alt="" className="h-10 object-contain" /> : '-'}</td>
                <td className="px-4 py-3 text-sm">
                  <button onClick={() => toggleHome(brand)} className={`px-2 py-1 rounded text-xs font-medium ${brand.mostrar_en_home ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    {brand.mostrar_en_home ? 'Sí' : 'No'}
                  </button>
                </td>
                <td className="px-4 py-3 text-sm flex gap-2">
                  <button onClick={() => openEdit(brand)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800">Editar</button>
                  <button onClick={() => handleDelete(brand.id_marca_producto)} className="text-red-600 dark:text-red-400 hover:text-red-800">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
