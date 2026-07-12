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

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">Cargando...</div>;

  return (
    <div>
      {modal}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Hero de páginas</h1>
        <button onClick={openNew} className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary-700">Nuevo</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-background rounded-lg shadow p-6 mb-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">{editing ? 'Editar' : 'Nuevo'} hero</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Página</label>
              <select value={pagina} onChange={e => setPagina(e.target.value)} className="w-full border border-border rounded px-3 py-2 bg-background text-foreground" required>
                <option value="">Seleccionar</option>
                {PAGINAS.filter(p => !editing || p.value === editing.pagina).map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Imagen de fondo</label>
              <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} className="w-full text-foreground" />
              {uploading && <p className="text-xs text-primary mt-1">Subiendo...</p>}
              {imagenUrl && !uploading && <img src={imagenUrl} alt="" className="mt-1 h-16 object-cover rounded border border-border" />}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">Título</label>
              <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full border border-border rounded px-3 py-2 bg-background text-foreground" required />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">Subtítulo</label>
              <input type="text" value={subtitulo} onChange={e => setSubtitulo(e.target.value)} className="w-full border border-border rounded px-3 py-2 bg-background text-foreground" />
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
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Página</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Título</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {heroes.map((h) => (
              <tr key={h.id_page_hero} className="hover:bg-muted">
                <td className="px-4 py-3 text-sm font-medium text-foreground">{h.pagina}</td>
                <td className="px-4 py-3 text-sm text-foreground">{h.titulo}</td>
                <td className="px-4 py-3 text-sm flex gap-2">
                  <button onClick={() => openEdit(h)} className="text-primary hover:text-primary-800">Editar</button>
                  <button onClick={() => handleDelete(h.id_page_hero)} className="text-destructive hover:text-destructive/80">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
