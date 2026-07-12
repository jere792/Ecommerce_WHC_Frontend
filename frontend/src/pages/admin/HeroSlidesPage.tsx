import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { uploadToCloudinary } from '../../lib/cloudinary';
import type { HeroSlide } from '../../lib/supabaseTypes';
import { useAlert } from '../../components/ui/AlertModal';

export default function AdminHeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const { alert, modal } = useAlert();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [texto, setTexto] = useState('');
  const [enlace, setEnlace] = useState('');
  const [orden, setOrden] = useState(0);
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    const { data } = await supabase.from('hero_slide').select('*').order('orden', { ascending: true });
    if (data) setSlides(data as HeroSlide[]);
    setLoading(false);
  };

  const resetForm = () => {
    setImageUrl(''); setTexto(''); setEnlace(''); setOrden(0); setActivo(true); setEditing(null);
  };

  const openNew = () => { resetForm(); setShowForm(true); };

  const openEdit = (s: HeroSlide) => {
    setEditing(s); setImageUrl(s.image_url); setTexto(s.texto); setEnlace(s.enlace || ''); setOrden(s.orden); setActivo(s.activo);
    setShowForm(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setImageUrl(url);
    } catch (err) {
      alert('Error al subir imagen: ' + err, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) { alert('Debes seleccionar una imagen.', 'warning'); return; }

    const payload = { image_url: imageUrl, texto, enlace: enlace || null, orden, activo };
    if (editing) {
      await supabase.from('hero_slide').update(payload).eq('id_hero_slide', editing.id_hero_slide);
    } else {
      await supabase.from('hero_slide').insert(payload);
    }

    setShowForm(false); resetForm(); loadSlides();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminar este slide?')) return;
    await supabase.from('hero_slide').delete().eq('id_hero_slide', id);
    loadSlides();
  };

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">Cargando...</div>;

  return (
    <div>
      {modal}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Hero Slides</h1>
        <button onClick={openNew} className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary-700">Nuevo slide</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-background rounded-lg shadow p-6 mb-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">{editing ? 'Editar' : 'Nuevo'} slide</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">Imagen</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="w-full border border-border rounded px-3 py-2 bg-background text-foreground" disabled={uploading} />
              {uploading && <p className="text-sm text-primary mt-1">Subiendo...</p>}
              {imageUrl && !uploading && <img src={imageUrl} alt="Preview" className="mt-2 h-24 w-40 object-cover rounded border border-border" />}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Texto</label>
              <input type="text" value={texto} onChange={e => setTexto(e.target.value)} className="w-full border border-border rounded px-3 py-2 bg-background text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Enlace (opcional)</label>
              <input type="text" value={enlace} onChange={e => setEnlace(e.target.value)} className="w-full border border-border rounded px-3 py-2 bg-background text-foreground" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Orden</label>
              <input type="number" value={orden} onChange={e => setOrden(Number(e.target.value))} className="w-full border border-border rounded px-3 py-2 bg-background text-foreground" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer self-end pb-2">
              <input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} className="w-4 h-4" />
              <span className="text-sm font-medium text-foreground">Activo</span>
            </label>
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
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Orden</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Imagen</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Texto</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Activo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {slides.map((s) => (
              <tr key={s.id_hero_slide} className="hover:bg-muted">
                <td className="px-4 py-3 text-sm text-foreground">{s.orden}</td>
                <td className="px-4 py-3 text-sm"><img src={s.image_url} alt="" className="h-12 w-20 object-cover rounded" /></td>
                <td className="px-4 py-3 text-sm text-foreground">{s.texto}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${s.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    {s.activo ? 'Sí' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm flex gap-2">
                  <button onClick={() => openEdit(s)} className="text-primary hover:text-primary-800">Editar</button>
                  <button onClick={() => handleDelete(s.id_hero_slide)} className="text-destructive hover:text-destructive/80">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
