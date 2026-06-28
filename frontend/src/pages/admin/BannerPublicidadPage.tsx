import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { uploadToCloudinary } from '../../lib/cloudinary';
import type { BannerPublicidad } from '../../lib/supabaseTypes';
import { useAlert } from '../../components/ui/AlertModal';

export default function AdminBannerPublicidad() {
  const [banners, setBanners] = useState<BannerPublicidad[]>([]);
  const [loading, setLoading] = useState(true);
  const { alert, modal } = useAlert();
  const [editing, setEditing] = useState<BannerPublicidad | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [imgPrincipal, setImgPrincipal] = useState('');
  const [imgSecTop, setImgSecTop] = useState('');
  const [imgSecBottom, setImgSecBottom] = useState('');
  const [enlacePrincipal, setEnlacePrincipal] = useState('');
  const [enlaceSecTop, setEnlaceSecTop] = useState('');
  const [enlaceSecBottom, setEnlaceSecBottom] = useState('');
  const [uploading, setUploading] = useState({ principal: false, top: false, bottom: false });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    const { data } = await supabase.from('banner_publicidad').select('*').order('id_banner', { ascending: true });
    if (data) setBanners(data as BannerPublicidad[]);
    setLoading(false);
  };

  const resetForm = () => {
    setTitulo(''); setImgPrincipal(''); setImgSecTop(''); setImgSecBottom('');
    setEnlacePrincipal(''); setEnlaceSecTop(''); setEnlaceSecBottom('');
    setEditing(null);
  };

  const openNew = () => { resetForm(); setShowForm(true); };

  const openEdit = (b: BannerPublicidad) => {
    setEditing(b); setTitulo(b.titulo); setImgPrincipal(b.imagen_principal);
    setImgSecTop(b.imagen_secundaria_top); setImgSecBottom(b.imagen_secundaria_bottom);
    setEnlacePrincipal(b.enlace_principal || ''); setEnlaceSecTop(b.enlace_secundario_top || ''); setEnlaceSecBottom(b.enlace_secundario_bottom || '');
    setShowForm(true);
  };

  const handleFileUpload = async (field: 'principal' | 'top' | 'bottom', file: File) => {
    setUploading(prev => ({ ...prev, [field]: true }));
    try {
      const url = await uploadToCloudinary(file);
      if (field === 'principal') setImgPrincipal(url);
      else if (field === 'top') setImgSecTop(url);
      else setImgSecBottom(url);
    } catch (err) {
      alert('Error al subir imagen: ' + err, 'error');
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imgPrincipal || !imgSecTop || !imgSecBottom) {
      alert('Debes subir las 3 imágenes.', 'warning');
      return;
    }
    const payload = {
      titulo, imagen_principal: imgPrincipal, enlace_principal: enlacePrincipal || null,
      imagen_secundaria_top: imgSecTop, enlace_secundario_top: enlaceSecTop || null,
      imagen_secundaria_bottom: imgSecBottom, enlace_secundario_bottom: enlaceSecBottom || null, activo: true,
    };

    if (editing) {
      await supabase.from('banner_publicidad').update(payload).eq('id_banner', editing.id_banner);
    } else {
      await supabase.from('banner_publicidad').insert(payload);
    }

    setShowForm(false); resetForm(); loadBanners();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminar este banner?')) return;
    await supabase.from('banner_publicidad').delete().eq('id_banner', id);
    loadBanners();
  };

  const toggleActivo = async (b: BannerPublicidad) => {
    await supabase.from('banner_publicidad').update({ activo: !b.activo }).eq('id_banner', b.id_banner);
    loadBanners();
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Cargando...</div>;

  return (
    <div>
      {modal}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Banners Publicidad</h1>
        <button onClick={openNew} className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary-700">Nuevo banner</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-background rounded-lg shadow p-6 mb-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">{editing ? 'Editar' : 'Nuevo'} banner</h2>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Título</label>
            <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full border border-border rounded px-3 py-2 bg-background text-foreground" required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Imagen principal</label>
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleFileUpload('principal', e.target.files[0])} disabled={uploading.principal} className="w-full text-foreground" />
              {uploading.principal && <p className="text-xs text-primary mt-1">Subiendo...</p>}
              {imgPrincipal && !uploading.principal && <img src={imgPrincipal} alt="" className="mt-1 h-16 object-cover rounded border border-border" />}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Secundaria top</label>
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleFileUpload('top', e.target.files[0])} disabled={uploading.top} className="w-full text-foreground" />
              {uploading.top && <p className="text-xs text-primary mt-1">Subiendo...</p>}
              {imgSecTop && !uploading.top && <img src={imgSecTop} alt="" className="mt-1 h-16 object-cover rounded border border-border" />}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Secundaria bottom</label>
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleFileUpload('bottom', e.target.files[0])} disabled={uploading.bottom} className="w-full text-foreground" />
              {uploading.bottom && <p className="text-xs text-primary mt-1">Subiendo...</p>}
              {imgSecBottom && !uploading.bottom && <img src={imgSecBottom} alt="" className="mt-1 h-16 object-cover rounded border border-border" />}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Enlace principal</label>
              <input type="text" value={enlacePrincipal} onChange={e => setEnlacePrincipal(e.target.value)} className="w-full border border-border rounded px-3 py-2 bg-background text-foreground" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Enlace secundario top</label>
              <input type="text" value={enlaceSecTop} onChange={e => setEnlaceSecTop(e.target.value)} className="w-full border border-border rounded px-3 py-2 bg-background text-foreground" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Enlace secundario bottom</label>
              <input type="text" value={enlaceSecBottom} onChange={e => setEnlaceSecBottom(e.target.value)} className="w-full border border-border rounded px-3 py-2 bg-background text-foreground" placeholder="https://..." />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Guardar</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-secondary text-secondary-foreground px-4 py-2 rounded hover:bg-secondary/80">Cancelar</button>
          </div>
        </form>
      )}

      <div className="bg-background rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Título</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Vista previa</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Activo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {banners.map((b) => (
              <tr key={b.id_banner} className="hover:bg-muted">
                <td className="px-4 py-3 text-sm text-foreground">{b.id_banner}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">{b.titulo}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-1">
                    <img src={b.imagen_principal} alt="" className="h-10 w-10 object-cover rounded" />
                    <img src={b.imagen_secundaria_top} alt="" className="h-10 w-10 object-cover rounded" />
                    <img src={b.imagen_secundaria_bottom} alt="" className="h-10 w-10 object-cover rounded" />
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <button onClick={() => toggleActivo(b)} className={`px-2 py-1 rounded text-xs font-medium ${b.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    {b.activo ? 'Sí' : 'No'}
                  </button>
                </td>
                <td className="px-4 py-3 text-sm flex gap-2">
                  <button onClick={() => openEdit(b)} className="text-primary hover:text-primary-800">Editar</button>
                  <button onClick={() => handleDelete(b.id_banner)} className="text-destructive hover:text-destructive/80">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
