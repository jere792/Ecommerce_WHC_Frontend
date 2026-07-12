import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        className="flex items-center gap-2 px-4 py-2.5 hover:bg-muted  transition-colors group"
        style={{ paddingLeft: `${12 + depth * 28}px` }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-0.5 rounded transition-colors ${hasChildren ? 'text-muted-foreground hover:text-muted-foreground hover:bg-muted' : 'invisible'}`}
        >
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <div className="flex items-center gap-1.5 text-sm min-w-0 flex-1">
          {breadcrumb.map((b, i) => (
            <span key={b.id_categoria_producto} className="flex items-center gap-1.5 whitespace-nowrap">
              {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />}
              <span className={`${i === breadcrumb.length - 1 ? 'font-semibold text-foreground' : 'text-muted-foreground hidden sm:inline'}`}>
                {b.nombre_categoria_producto}
              </span>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggleHome(cat)}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${cat.mostrar_en_home ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}
            title="Mostrar en home"
          >
            {cat.mostrar_en_home ? 'Home' : '—'}
          </button>
          <button onClick={() => onEdit(cat)} className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded opacity-0 group-hover:opacity-100 transition-all" title="Editar">
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onAddSub(cat)} className="p-1 text-muted-foreground hover:text-green-600 hover:bg-green-50 rounded opacity-0 group-hover:opacity-100 transition-all" title="Agregar subcategoría">
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(cat)} className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded opacity-0 group-hover:opacity-100 transition-all" title="Eliminar">
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
  const navigate = useNavigate();

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    const { data } = await supabase.from('categoria_productos').select('*').order('id_categoria_producto', { ascending: true });
    if (data) setCategories(data as CategoriaProducto[]);
    setLoading(false);
  };

  const openEdit = (cat: CategoriaProducto) => {
    navigate(`/admin/categorias/editar/${cat.id_categoria_producto}`);
  };

  const openNew = () => {
    navigate('/admin/categorias/nuevo');
  };

  const handleDelete = async (cat: CategoriaProducto) => {
    const hasChildren = categories.some(c => c.pk_categoria_padre === cat.id_categoria_producto);
    if (hasChildren && !confirm(`"${cat.nombre_categoria_producto}" tiene subcategorías. ¿Eliminar también?`)) return;
    if (!hasChildren && !confirm(`Eliminar "${cat.nombre_categoria_producto}"?`)) return;
    const { error } = await supabase.from('categoria_productos').delete().eq('id_categoria_producto', cat.id_categoria_producto);
    if (error) { alert('Error al eliminar: ' + error.message); return; }
    loadCategories();
  };

  const toggleHome = async (cat: CategoriaProducto) => {
    const nuevoValor = !(cat.mostrar_en_home ?? false);

    setCategories(prev => prev.map(c =>
      c.id_categoria_producto === cat.id_categoria_producto
        ? { ...c, mostrar_en_home: nuevoValor }
        : c
    ));

    const { error } = await supabase
      .from('categoria_productos')
      .update({ mostrar_en_home: nuevoValor })
      .eq('id_categoria_producto', cat.id_categoria_producto);

    if (error) {
      alert('Error al guardar: ' + error.message);
      loadCategories();
    }
  };

  const tree = buildTree(categories)

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Categorías</h1>
        <button onClick={openNew} className="bg-primary text-white px-4 py-2 hover:bg-primary/90 flex items-center gap-2"><Plus className="w-4 h-4" /> Nueva</button>
      </div>

      <div className="bg-background shadow overflow-hidden">
        <div className="divide-y divide-border">
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
          <div className="text-center py-12 text-muted-foreground">No hay categorías. Crea la primera.</div>
        )}
      </div>
    </div>
  );
}


