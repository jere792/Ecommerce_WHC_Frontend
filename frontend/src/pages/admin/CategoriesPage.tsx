import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { CategoriaProducto } from '../../lib/supabaseTypes';
import { ChevronRight, ChevronDown, ChevronUp, Plus, Trash2, Edit3, LayoutGrid } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';

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

const estadoColors: Record<string, string> = {
  activo: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  inactivo: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

function CategoryRow({ cat, categories, depth, onEdit, onAddSub, onDelete, onToggleHome, onMove }: {
  cat: CategoriaProducto
  categories: CategoriaProducto[]
  depth: number
  onEdit: (c: CategoriaProducto) => void
  onAddSub: (c: CategoriaProducto) => void
  onDelete: (c: CategoriaProducto) => void
  onToggleHome: (c: CategoriaProducto) => void
  onMove: (c: CategoriaProducto, direction: 'up' | 'down') => void
}) {
  const children = categories.filter(c => c.pk_categoria_padre === cat.id_categoria_producto).sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999))
  const siblings = categories.filter(c => c.pk_categoria_padre === cat.pk_categoria_padre).sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999))
  const sibIdx = siblings.findIndex(c => c.id_categoria_producto === cat.id_categoria_producto)
  const hasChildren = children.length > 0
  const [isOpen, setIsOpen] = useState(depth < 2)
  const breadcrumb = getBreadcrumb(cat, categories)

  return (
    <div>
      <div
        className="flex items-center gap-2 px-4 py-2.5 hover:bg-muted transition-colors group"
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

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
            <span className="font-mono tabular-nums">{cat.orden ?? '-'}</span>
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => onMove(cat, 'up')}
                disabled={sibIdx <= 0}
                className="p-0.5 rounded hover:bg-muted disabled:opacity-20 disabled:cursor-not-allowed transition-colors leading-none"
                title="Subir"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => onMove(cat, 'down')}
                disabled={sibIdx < 0 || sibIdx >= siblings.length - 1}
                className="p-0.5 rounded hover:bg-muted disabled:opacity-20 disabled:cursor-not-allowed transition-colors leading-none"
                title="Bajar"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${estadoColors[cat.estado ?? 'activo'] || 'bg-muted text-muted-foreground'}`}>
            {cat.estado ?? 'activo'}
          </span>
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
              onMove={onMove}
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmCat, setConfirmCat] = useState<CategoriaProducto | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    const { data } = await supabase.from('categoria_productos').select('*').order('orden', { ascending: true, nullsFirst: false });
    if (data) setCategories(data as CategoriaProducto[]);
    setLoading(false);
  };

  const handleDelete = async () => {
    const cat = confirmCat;
    if (!cat) return;
    const { error } = await supabase.from('categoria_productos').delete().eq('id_categoria_producto', cat.id_categoria_producto);
    if (error) { showToast('Error al eliminar: ' + error.message, 'error'); } else { showToast('Categoría eliminada', 'success'); }
    setConfirmOpen(false);
    setConfirmCat(null);
    loadCategories();
  };

  const handleMove = async (cat: CategoriaProducto, direction: 'up' | 'down') => {
    const siblings = categories
      .filter(c => c.pk_categoria_padre === cat.pk_categoria_padre)
      .sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999));
    const idx = siblings.findIndex(c => c.id_categoria_producto === cat.id_categoria_producto);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= siblings.length) return;
    const reordered = [...siblings];
    [reordered[idx], reordered[targetIdx]] = [reordered[targetIdx], reordered[idx]];
    const updates = reordered.map((c, i) => ({ id: c.id_categoria_producto, orden: i + 1 }));
    setCategories(prev => prev.map(c => {
      const upd = updates.find(u => u.id === c.id_categoria_producto);
      return upd ? { ...c, orden: upd.orden } : c;
    }));
    const results = await Promise.all(updates.map(upd =>
      supabase.from('categoria_productos').update({ orden: upd.orden }).eq('id_categoria_producto', upd.id)
    ));
    if (results.some(r => r.error)) { showToast('Error al reordenar', 'error'); loadCategories(); }
  };

  const toggleHome = async (cat: CategoriaProducto) => {
    const nuevoValor = !(cat.mostrar_en_home ?? false);
    setCategories(prev => prev.map(c =>
      c.id_categoria_producto === cat.id_categoria_producto ? { ...c, mostrar_en_home: nuevoValor } : c
    ));
    const { error } = await supabase.from('categoria_productos').update({ mostrar_en_home: nuevoValor }).eq('id_categoria_producto', cat.id_categoria_producto);
    if (error) { showToast('Error al guardar: ' + error.message, 'error'); loadCategories(); }
    else { showToast('Actualizado correctamente', 'success'); }
  };

  const tree = buildTree(categories)

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">Cargando...</div>;

  return (
    <div>
      <PageHeader
        title="Categorías"
        description="Gestiona las categorías y subcategorías de productos"
        icon={<LayoutGrid className="w-5 h-5" />}
        buttonLabel="Nueva categoría"
        buttonTo="/admin/categorias/nuevo"
      />

      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {tree.map(root => (
            <CategoryRow
              key={root.id_categoria_producto}
              cat={root}
              categories={categories}
              depth={0}
              onEdit={(cat) => navigate(`/admin/categorias/editar/${cat.id_categoria_producto}`)}
              onAddSub={(cat) => navigate('/admin/categorias/nuevo')}
              onDelete={(cat) => { setConfirmCat(cat); setConfirmOpen(true); }}
              onToggleHome={toggleHome}
              onMove={handleMove}
            />
          ))}
        </div>
        {categories.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No hay categorías. Crea la primera.</div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar categoría"
        message={confirmCat ? `¿Eliminar "${confirmCat.nombre_categoria_producto}"${categories.some(c => c.pk_categoria_padre === confirmCat.id_categoria_producto) ? ' y todas sus subcategorías' : ''}?` : ''}
        confirmText="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => { setConfirmOpen(false); setConfirmCat(null); }}
      />
    </div>
  );
}
