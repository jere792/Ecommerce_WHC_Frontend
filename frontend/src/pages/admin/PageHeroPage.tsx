import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { uploadToCloudinary } from '../../lib/cloudinary';
import type { PageHero } from '../../lib/supabaseTypes';
import { useAlert } from '../../components/ui/AlertModal';

const PAGINAS = [
  { value: 'productos', label: 'Productos' },
  { value: 'contacto', label: 'Contacto' },
  { value: 'terminos', label: 'Términos' },
  { value: 'privacidad', label: 'Privacidad' },
];

export default function AdminPageHero() {
  const [heroes, setHeroes] = useState<PageHero[]>([]);
  const [loading, setLoading] = useState(true);
  const { alert, modal } = useAlert();
  const [editing, setEditing] = useState<PageHero | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pagina, setPagina] = useState('');
  const [titulo, setTitulo] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadHeroes();
  }, []);

  const loadHeroes = async () => {
    const { data } = await supabase.from('page_hero').select('*').order('pagina');
    if (data) setHeroes(data as PageHero[]);
    setLoading(false);
  };

  const resetForm = () => {
    setPagina('');
    setTitulo('');
    setSubtitulo('');
    setImagenUrl('');
    setEditing(null);
  };

  const openNew = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (h: PageHero) => {
    setEditing(h);
    setPagina(h.pagina);
    setTitulo(h.titulo);
    setSubtitulo(h.subtitulo);
    setImagenUrl(h.imagen_url || '');
    setShowForm(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setImagenUrl(url);
    } catch (err) {
      alert('Error al subir imagen: ' + err, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { pagina, titulo, subtitulo, imagen_url: imagenUrl || null };

    if (editing) {
      await supabase.from('page_hero').update(payload).eq('id_page_hero', editing.id_page_hero);
    } else {
      await supabase.from('page_hero').insert(payload);
    }

    setShowForm(false);
    resetForm();
    loadHeroes();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminar este hero?')) return;
    await supabase.from('page_hero').delete().eq('id_page_hero', id);
    loadHeroes();
  };

  if (loading) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Cargando...</div>;

  return (
    <div>
      {modal}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Hero de páginas</h1>
        <button onClick={openNew} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Nuevo</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{editing ? 'Editar' : 'Nuevo'} hero</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Página</label>
              <select value={pagina} onChange={e => setPagina(e.target.value)} className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
                <option value="">Seleccionar</option>
                {PAGINAS.filter(p => !editing || p.value === editing.pagina).map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Imagen de fondo</label>
              <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} className="w-full text-gray-900 dark:text-gray-100" />
              {uploading && <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Subiendo...</p>}
              {imagenUrl && !uploading && <img src={imagenUrl} alt="" className="mt-1 h-16 object-cover rounded border dark:border-gray-600" />}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
              <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtítulo</label>
              <input type="text" value={subtitulo} onChange={e => setSubtitulo(e.target.value)} className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            </div>
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
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Página</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Título</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {heroes.map((h) => (
              <tr key={h.id_page_hero} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{h.pagina}</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{h.titulo}</td>
                <td className="px-4 py-3 text-sm flex gap-2">
                  <button onClick={() => openEdit(h)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800">Editar</button>
                  <button onClick={() => handleDelete(h.id_page_hero)} className="text-red-600 dark:text-red-400 hover:text-red-800">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
