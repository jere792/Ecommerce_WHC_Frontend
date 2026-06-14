import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { CategoriaProducto } from '../../lib/supabaseTypes';
import { useAlert } from '../../components/ui/AlertModal';

export default function AdminCategories() {
  const [categories, setCategories] = useState<CategoriaProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const { alert, modal } = useAlert();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CategoriaProducto | null>(null);
  const [nombre, setNombre] = useState('');
  const [mostrarEnHome, setMostrarEnHome] = useState(false);
  const [subtituloHome, setSubtituloHome] = useState('');

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    const { data } = await supabase.from('categoria_p').select('*').order('id_categoria_producto', { ascending: true });
    if (data) setCategories(data as CategoriaProducto[]);
    setLoading(false);
  };

  const resetForm = () => { setNombre(''); setMostrarEnHome(false); setSubtituloHome(''); setEditing(null); };

  const openNew = () => { resetForm(); setShowForm(true); };

  const openEdit = (cat: CategoriaProducto) => {
    setEditing(cat); setNombre(cat.nombre_categoria_producto); setMostrarEnHome(cat.mostrar_en_home ?? false); setSubtituloHome(cat.subtitulo_home ?? '');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { nombre_categoria_producto: nombre, mostrar_en_home: mostrarEnHome, subtitulo_home: subtituloHome || null };
    if (editing) {
      await supabase.from('categoria_p').update(payload).eq('id_categoria_producto', editing.id_categoria_producto);
    } else {
      await supabase.from('categoria_p').insert(payload);
    }
    setShowForm(false); resetForm(); loadCategories();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminar esta categoría?')) return;
    await supabase.from('categoria_p').delete().eq('id_categoria_producto', id);
    loadCategories();
  };

  const toggleHome = async (cat: CategoriaProducto) => {
    await supabase.from('categoria_p').update({ mostrar_en_home: !cat.mostrar_en_home }).eq('id_categoria_producto', cat.id_categoria_producto);
    loadCategories();
  };

  if (loading) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Cargando...</div>;

  return (
    <div>
      {modal}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Categorías</h1>
        <button onClick={openNew} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Nueva categoría</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{editing ? 'Editar' : 'Nueva'} categoría</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtítulo (Home)</label>
            <input type="text" value={subtituloHome} onChange={e => setSubtituloHome(e.target.value)} className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="Ej: Encuentra los mejores productos para tu baño" />
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
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Mostrar en home</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {categories.map((cat) => (
              <tr key={cat.id_categoria_producto} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{cat.id_categoria_producto}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{cat.nombre_categoria_producto}</td>
                <td className="px-4 py-3 text-sm">
                  <button onClick={() => toggleHome(cat)} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${cat.mostrar_en_home ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {cat.mostrar_en_home ? 'Sí' : 'No'}
                  </button>
                </td>
                <td className="px-4 py-3 text-sm flex gap-2">
                  <button onClick={() => openEdit(cat)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800">Editar</button>
                  <button onClick={() => handleDelete(cat.id_categoria_producto)} className="text-red-600 dark:text-red-400 hover:text-red-800">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
