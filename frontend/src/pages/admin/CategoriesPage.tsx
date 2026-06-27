import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { CategoriaProducto } from '../../lib/supabaseTypes';
import { ChevronRight, ChevronDown, Plus, Trash2, Edit3 } from 'lucide-react';

function buildTree(cats: CategoriaProducto[]): CategoriaProducto[] {
  const map = new Map<number, CategoriaProducto>()
  const roots: CategoriaProducto[] = []
  cats.forEach(c => map.set(c.id_categoria_producto, { ...c, subcategorias: [] }))
  cats.forEach(c => {
    const node = map.get(c.id_categoria_producto)!
    if (c.pk_categoria_padre && map.has(c.pk_categoria_padre)) {
      map.get(c.pk_categoria_padre)!.subcategorias!.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

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

function CategoryRow({ cat, categories, depth, onEdit, onAddSub, onDelete, onToggleHome }: {
  cat: CategoriaProducto
  categories: CategoriaProducto[]
  depth: number
  onEdit: (c: CategoriaProducto) => void
  onAddSub: (c: CategoriaProducto) => void
  onDelete: (c: CategoriaProducto) => void
  onToggleHome: (c: CategoriaProducto) => void
}) {
  const children = categories.filter(c => c.pk_categoria_padre === cat.id_categoria_producto)
  const hasChildren = children.length > 0
  const [isOpen, setIsOpen] = useState(depth < 2)
  const breadcrumb = getBreadcrumb(cat, categories)

  return (
    <div>
      <div
        className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
        style={{ paddingLeft: `${12 + depth * 28}px` }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-0.5 rounded transition-colors ${hasChildren ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600' : 'invisible'}`}
        >
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <div className="flex items-center gap-1.5 text-sm min-w-0 flex-1">
          {breadcrumb.map((b, i) => (
            <span key={b.id_categoria_producto} className="flex items-center gap-1.5 whitespace-nowrap">
              {i > 0 && <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />}
              <span className={`${i === breadcrumb.length - 1 ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-400 hidden sm:inline'}`}>
                {b.nombre_categoria_producto}
              </span>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggleHome(cat)}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${cat.mostrar_en_home ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}
            title="Mostrar en home"
          >
            {cat.mostrar_en_home ? 'Home' : '—'}
          </button>
          <button onClick={() => onEdit(cat)} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded opacity-0 group-hover:opacity-100 transition-all" title="Editar">
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onAddSub(cat)} className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded opacity-0 group-hover:opacity-100 transition-all" title="Agregar subcategoría">
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(cat)} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all" title="Eliminar">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {hasChildren && isOpen && (
        <div>
          {children.map(child => (
            <CategoryRow
              key={child.id_categoria_producto}
              cat={child}
              categories={categories}
              depth={depth + 1}
              onEdit={onEdit}
              onAddSub={onAddSub}
              onDelete={onDelete}
              onToggleHome={onToggleHome}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<CategoriaProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CategoriaProducto | null>(null);
  const [nombre, setNombre] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [mostrarEnHome, setMostrarEnHome] = useState(false);
  const [subtituloHome, setSubtituloHome] = useState('');

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    const { data } = await supabase.from('categoria_p').select('*').order('id_categoria_producto', { ascending: true });
    if (data) setCategories(data as CategoriaProducto[]);
    setLoading(false);
  };

  const resetForm = () => { setNombre(''); setParentId(null); setMostrarEnHome(false); setSubtituloHome(''); setEditing(null); };

  const openNew = (parent?: CategoriaProducto) => { resetForm(); if (parent) setParentId(parent.id_categoria_producto); setShowForm(true); };

  const openEdit = (cat: CategoriaProducto) => {
    setEditing(cat); setNombre(cat.nombre_categoria_producto); setParentId(cat.pk_categoria_padre ?? null); setMostrarEnHome(cat.mostrar_en_home ?? false); setSubtituloHome(cat.subtitulo_home ?? '');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { nombre_categoria_producto: nombre, pk_categoria_padre: parentId || null, mostrar_en_home: mostrarEnHome, subtitulo_home: subtituloHome || null };
    if (editing) {
      await supabase.from('categoria_p').update(payload).eq('id_categoria_producto', editing.id_categoria_producto);
    } else {
      await supabase.from('categoria_p').insert(payload);
    }
    setShowForm(false); resetForm(); loadCategories();
  };

  const handleDelete = async (cat: CategoriaProducto) => {
    const hasChildren = categories.some(c => c.pk_categoria_padre === cat.id_categoria_producto);
    if (hasChildren && !confirm(`"${cat.nombre_categoria_producto}" tiene subcategorías. ¿Eliminar también?`)) return;
    if (!hasChildren && !confirm(`Eliminar "${cat.nombre_categoria_producto}"?`)) return;
    await supabase.from('categoria_p').delete().eq('id_categoria_producto', cat.id_categoria_producto);
    loadCategories();
  };

  const toggleHome = async (cat: CategoriaProducto) => {
    await supabase.from('categoria_p').update({ mostrar_en_home: !cat.mostrar_en_home }).eq('id_categoria_producto', cat.id_categoria_producto);
    loadCategories();
  };

  const parentOptions = categories.filter(c =>
    !editing || c.id_categoria_producto !== editing.id_categoria_producto
  );

  const tree = buildTree(categories)

  if (loading) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Categorías</h1>
        <button onClick={() => openNew()} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"><Plus className="w-4 h-4" /> Nueva</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{editing ? 'Editar' : 'Nueva'} categoría</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría padre</label>
            <select value={parentId ?? ''} onChange={e => setParentId(e.target.value ? Number(e.target.value) : null)} className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <option value="">— Ninguna (raíz) —</option>
              {parentOptions.map(c => (
                <option key={c.id_categoria_producto} value={c.id_categoria_producto}>
                  {getBreadcrumb(c, categories).map(b => b.nombre_categoria_producto).join(' > ')}
                </option>
              ))}
            </select>
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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {tree.map(root => (
            <CategoryRow
              key={root.id_categoria_producto}
              cat={root}
              categories={categories}
              depth={0}
              onEdit={openEdit}
              onAddSub={openNew}
              onDelete={handleDelete}
              onToggleHome={toggleHome}
            />
          ))}
        </div>
        {categories.length === 0 && (
          <div className="text-center py-12 text-gray-400">No hay categorías. Crea la primera.</div>
        )}
      </div>
    </div>
  );
}
