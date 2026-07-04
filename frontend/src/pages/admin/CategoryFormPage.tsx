import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { CategoriaProducto } from '../../lib/supabaseTypes';

function getBreadcrumb(cat: CategoriaProducto, allCats: CategoriaProducto[]): CategoriaProducto[] {
  const path = [cat]
  let current = cat
  while (current.pk_categoria_padre) {
    const parent = allCats.find(c => c.id_categoria_producto === current.pk_categoria_padre)
    if (!parent) break
    path.unshift(parent)
    current = parent
  }
  return path
}

export default function CategoryFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [categories, setCategories] = useState<CategoriaProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [mostrarEnHome, setMostrarEnHome] = useState(false);
  const [subtituloHome, setSubtituloHome] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('categoria_p').select('*').order('id_categoria_producto', { ascending: true })
      .then(({ data }) => {
        if (data) setCategories(data as CategoriaProducto[]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (id && categories.length > 0) {
      const cat = categories.find(c => c.id_categoria_producto === Number(id));
      if (cat) {
        setNombre(cat.nombre_categoria_producto);
        setParentId(cat.pk_categoria_padre ?? null);
        setMostrarEnHome(cat.mostrar_en_home ?? false);
        setSubtituloHome(cat.subtitulo_home ?? '');
      }
    }
  }, [id, categories]);

  const parentOptions = categories.filter(c =>
    c.id_categoria_producto !== Number(id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      nombre_categoria_producto: nombre,
      pk_categoria_padre: parentId || null,
      mostrar_en_home: mostrarEnHome,
      subtitulo_home: subtituloHome || null,
    };
    if (isEditing) {
      await supabase.from('categoria_p').update(payload).eq('id_categoria_producto', Number(id));
    } else {
      await supabase.from('categoria_p').insert(payload);
    }
    setSaving(false);
    navigate('/admin/categorias');
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Cargando...</div>;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-foreground mb-6">
        {isEditing ? 'Editar categoría' : 'Nueva categoría'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-background shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="w-full border px-3 py-2 bg-background text-foreground"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Categoría padre</label>
          <select
            value={parentId ?? ''}
            onChange={e => setParentId(e.target.value ? Number(e.target.value) : null)}
            className="w-full border px-3 py-2 bg-background text-foreground"
          >
            <option value="">— Ninguna (raíz) —</option>
            {parentOptions.map(c => (
              <option key={c.id_categoria_producto} value={c.id_categoria_producto}>
                {getBreadcrumb(c, categories).map(b => b.nombre_categoria_producto).join(' > ')}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Subtítulo (Home)</label>
          <input
            type="text"
            value={subtituloHome}
            onChange={e => setSubtituloHome(e.target.value)}
            className="w-full border px-3 py-2 bg-background text-foreground"
            placeholder="Ej: Encuentra los mejores productos para tu baño"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={mostrarEnHome}
            onChange={e => setMostrarEnHome(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium text-foreground">Mostrar en la página principal</span>
        </label>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-green-600 text-white px-4 py-2 hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/categorias')}
            className="bg-muted text-foreground px-4 py-2 hover:bg-muted"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
