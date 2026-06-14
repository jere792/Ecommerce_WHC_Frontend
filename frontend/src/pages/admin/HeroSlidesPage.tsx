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

  if (loading) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Cargando...</div>;

  return (
    <div>
      {modal}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Hero Slides</h1>
        <button onClick={openNew} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Nuevo slide</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{editing ? 'Editar' : 'Nuevo'} slide</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Imagen</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" disabled={uploading} />
              {uploading && <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Subiendo...</p>}
              {imageUrl && !uploading && <img src={imageUrl} alt="Preview" className="mt-2 h-24 w-40 object-cover rounded border dark:border-gray-600" />}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Texto</label>
              <input type="text" value={texto} onChange={e => setTexto(e.target.value)} className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enlace (opcional)</label>
              <input type="text" value={enlace} onChange={e => setEnlace(e.target.value)} className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Orden</label>
              <input type="number" value={orden} onChange={e => setOrden(Number(e.target.value))} className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer self-end pb-2">
              <input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} className="w-4 h-4" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Activo</span>
            </label>
          </div>
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
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Orden</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Imagen</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Texto</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Activo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {slides.map((s) => (
              <tr key={s.id_hero_slide} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{s.orden}</td>
                <td className="px-4 py-3 text-sm"><img src={s.image_url} alt="" className="h-12 w-20 object-cover rounded" /></td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{s.texto}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${s.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    {s.activo ? 'Sí' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm flex gap-2">
                  <button onClick={() => openEdit(s)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800">Editar</button>
                  <button onClick={() => handleDelete(s.id_hero_slide)} className="text-red-600 dark:text-red-400 hover:text-red-800">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
