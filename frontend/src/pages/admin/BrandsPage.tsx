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

  if (loading) return <div className="text-center py-12 text-muted-foreground">Cargando...</div>;

  return (
    <div>
      {modal}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Marcas</h1>
        <button onClick={openNew} className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary-700">Nueva marca</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-background rounded-lg shadow p-6 mb-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">{editing ? 'Editar' : 'Nueva'} marca</h2>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nombre</label>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full border border-border rounded px-3 py-2 bg-background text-foreground" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Logo</label>
            <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} className="w-full text-foreground" />
            {uploading && <p className="text-sm text-primary mt-1">Subiendo...</p>}
            {logoUrl && !uploading && <img src={logoUrl} alt="Logo" className="mt-2 h-16 object-contain rounded border border-border" />}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={mostrarEnHome} onChange={e => setMostrarEnHome(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm font-medium text-foreground">Mostrar en la página principal</span>
          </label>
          <div className="flex gap-3">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Guardar</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-muted text-foreground px-4 py-2 rounded hover:bg-muted/80">Cancelar</button>
          </div>
        </form>
      )}

      <div className="bg-background rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Logo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">En home</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {brands.map((brand) => (
              <tr key={brand.id_marca_producto} className="hover:bg-muted">
                <td className="px-4 py-3 text-sm text-foreground">{brand.id_marca_producto}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">{brand.nombre_marca_producto}</td>
                <td className="px-4 py-3 text-sm">{brand.logo_url ? <img src={brand.logo_url} alt="" className="h-10 object-contain" /> : '-'}</td>
                <td className="px-4 py-3 text-sm">
                  <button onClick={() => toggleHome(brand)} className={`px-2 py-1 rounded text-xs font-medium ${brand.mostrar_en_home ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}>
                    {brand.mostrar_en_home ? 'Sí' : 'No'}
                  </button>
                </td>
                <td className="px-4 py-3 text-sm flex gap-2">
                  <button onClick={() => openEdit(brand)} className="text-primary hover:text-primary-800">Editar</button>
                  <button onClick={() => handleDelete(brand.id_marca_producto)} className="text-destructive hover:text-destructive/80">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
