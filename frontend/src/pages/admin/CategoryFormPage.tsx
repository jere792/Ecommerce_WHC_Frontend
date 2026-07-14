import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { CategoriaProducto } from '../../lib/supabaseTypes';
import { LayoutGrid } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { useToast } from '../../components/ui/Toast';

const inputClass = "w-full border rounded-lg px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

function toSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9áéíóúüñ]+/g, '-').replace(/^-+|-+$/g, '');
}

function getAncestors(cat: CategoriaProducto, allCats: CategoriaProducto[]): CategoriaProducto[] {
  const path: CategoriaProducto[] = [];
  let current = cat;
  while (current.pk_categoria_padre) {
    const parent = allCats.find(c => c.id_categoria_producto === current.pk_categoria_padre);
    if (!parent) break;
    path.unshift(parent);
    current = parent;
  }
  return path;
}

export default function CategoryFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState<CategoriaProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nombre, setNombre] = useState('');
  const [slug, setSlug] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState('activo');
  const [orden, setOrden] = useState('');
  const [level1Id, setLevel1Id] = useState<number | null>(null);
  const [level2Id, setLevel2Id] = useState<number | null>(null);
  const [level3Id, setLevel3Id] = useState<number | null>(null);
  const [mostrarEnHome, setMostrarEnHome] = useState(false);
  const [subtituloHome, setSubtituloHome] = useState('');

  useEffect(() => {
    supabase.from('categoria_productos').select('*').order('orden', { ascending: true, nullsFirst: false })
      .then(({ data }) => {
        if (data) setCategories(data as CategoriaProducto[]);
        setLoading(false);
      });
  }, []);

  const roots = useMemo(() =>
    categories.filter(c => !c.pk_categoria_padre && c.id_categoria_producto !== Number(id)),
    [categories, id]
  );

  const level2Options = useMemo(() =>
    level1Id ? categories.filter(c => c.pk_categoria_padre === level1Id && c.id_categoria_producto !== Number(id)) : [],
    [categories, level1Id, id]
  );

  const level3Options = useMemo(() =>
    level2Id ? categories.filter(c => c.pk_categoria_padre === level2Id && c.id_categoria_producto !== Number(id)) : [],
    [categories, level2Id, id]
  );

  const parentId: number | null = level3Id ?? level2Id ?? level1Id ?? null;

  useEffect(() => {
    if (!isEditing) setSlug(toSlug(nombre));
  }, [nombre, isEditing]);

  useEffect(() => {
    if (!isEditing) {
      const siblings = categories.filter(c => c.pk_categoria_padre === parentId);
      const maxOrden = Math.max(...siblings.map(c => c.orden ?? 0), 0);
      setOrden(String(maxOrden + 1));
    }
  }, [parentId, categories, isEditing]);

  useEffect(() => {
    if (id && categories.length > 0) {
      const cat = categories.find(c => c.id_categoria_producto === Number(id));
      if (cat) {
        setNombre(cat.nombre_categoria_producto);
        setSlug(cat.slug ?? toSlug(cat.nombre_categoria_producto));
        setDescripcion(cat.descripcion ?? '');
        setEstado(cat.estado ?? 'activo');
        setOrden(cat.orden != null ? String(cat.orden) : '');
        setMostrarEnHome(cat.mostrar_en_home ?? false);
        setSubtituloHome(cat.subtitulo_home ?? '');
        if (cat.pk_categoria_padre) {
          const parentAncestors = getAncestors({ ...cat, nombre_categoria_producto: '', pk_categoria_padre: undefined } as CategoriaProducto, categories);
          setLevel1Id(parentAncestors[0]?.id_categoria_producto ?? cat.pk_categoria_padre);
          setLevel2Id(parentAncestors[1]?.id_categoria_producto ?? null);
          setLevel3Id(parentAncestors[2]?.id_categoria_producto ?? null);
        }
      }
    }
  }, [id, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) { showToast('El nombre es obligatorio', 'error'); return; }
    setSaving(true);

    const ordenNum = orden ? parseInt(orden) : null;

    if (ordenNum != null) {
      const conflict = categories.find(c =>
        c.id_categoria_producto !== Number(id) &&
        c.pk_categoria_padre === parentId &&
        c.orden === ordenNum
      );
      if (conflict) {
        if (isEditing) {
          const currentCat = categories.find(c => c.id_categoria_producto === Number(id));
          await supabase.from('categoria_productos')
            .update({ orden: currentCat?.orden ?? null })
            .eq('id_categoria_producto', conflict.id_categoria_producto);
        } else {
          const maxOrden = Math.max(
            ...categories
              .filter(c => c.pk_categoria_padre === parentId && c.id_categoria_producto !== conflict.id_categoria_producto)
              .map(c => c.orden ?? 0),
            0
          );
          await supabase.from('categoria_productos')
            .update({ orden: maxOrden + 1 })
            .eq('id_categoria_producto', conflict.id_categoria_producto);
        }
      }
    }

    const payload = {
      nombre_categoria_producto: nombre.trim(),
      slug: slug || toSlug(nombre),
      descripcion: descripcion || null,
      estado,
      orden: ordenNum,
      pk_categoria_padre: parentId,
      mostrar_en_home: mostrarEnHome,
      subtitulo_home: subtituloHome || null,
    };
    const { error } = isEditing
      ? await supabase.from('categoria_productos').update(payload).eq('id_categoria_producto', Number(id))
      : await supabase.from('categoria_productos').insert(payload);
    setSaving(false);
    if (error) {
      showToast('Error al guardar: ' + error.message, 'error');
    } else {
      showToast(isEditing ? 'Categoría actualizada' : 'Categoría creada', 'success');
      navigate('/admin/categorias');
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">Cargando...</div>;

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Editar categoría' : 'Nueva categoría'}
        description={isEditing ? 'Modifica los datos de la categoría' : 'Agrega una nueva categoría'}
        icon={<LayoutGrid className="w-5 h-5" />}
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="border border-border rounded-lg p-5 bg-background space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Información general</h4>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Nombre</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className={inputClass} required placeholder="Ej: Baños" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Slug</label>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className={inputClass} placeholder="se-genera-automaticamente" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Descripción</label>
              <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} className={`${inputClass} min-h-[100px] resize-y`} placeholder="Breve descripción de la categoría..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Subtítulo (Home)</label>
              <input type="text" value={subtituloHome} onChange={e => setSubtituloHome(e.target.value)} className={inputClass} placeholder="Ej: Encuentra los mejores productos para tu baño" />
            </div>
          </div>

          <div className="border border-border rounded-lg p-5 bg-background space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Configuración</h4>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">Categoría padre</label>
              <select value={level1Id ?? ''} onChange={e => { setLevel1Id(e.target.value ? Number(e.target.value) : null); setLevel2Id(null); setLevel3Id(null); }} className={inputClass}>
                <option value="">Ninguna (raíz)</option>
                {roots.map(c => (
                  <option key={c.id_categoria_producto} value={c.id_categoria_producto}>{c.nombre_categoria_producto}</option>
                ))}
              </select>

              {level2Options.length > 0 && (
                <select value={level2Id ?? ''} onChange={e => { setLevel2Id(e.target.value ? Number(e.target.value) : null); setLevel3Id(null); }} className={inputClass}>
                  <option value="">Seleccionar subcategoría</option>
                  {level2Options.map(c => (
                    <option key={c.id_categoria_producto} value={c.id_categoria_producto}>{c.nombre_categoria_producto}</option>
                  ))}
                </select>
              )}

              {level3Options.length > 0 && (
                <select value={level3Id ?? ''} onChange={e => setLevel3Id(e.target.value ? Number(e.target.value) : null)} className={inputClass}>
                  <option value="">Seleccionar sub-subcategoría</option>
                  {level3Options.map(c => (
                    <option key={c.id_categoria_producto} value={c.id_categoria_producto}>{c.nombre_categoria_producto}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card flex-wrap">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50">
            <span className="text-xs font-medium text-muted-foreground">Estado</span>
            <div className="flex rounded-md border border-border overflow-hidden">
              {['activo', 'inactivo'].map(op => (
                <button
                  key={op}
                  type="button"
                  onClick={() => setEstado(op)}
                  className={`px-3 py-1.5 text-xs font-medium transition-all ${
                    estado === op
                      ? op === 'activo'
                        ? 'bg-green-500 text-white shadow-sm'
                        : 'bg-red-500 text-white shadow-sm'
                      : 'bg-background text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {op === 'activo' ? 'Activo' : 'Inactivo'}
                </button>
              ))}
            </div>
          </div>
          <span className="text-muted-foreground/40 text-lg select-none">|</span>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50">
            <span className="text-xs font-medium text-muted-foreground">Mostrar en home</span>
            <button
              type="button"
              onClick={() => setMostrarEnHome(!mostrarEnHome)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                mostrarEnHome ? 'bg-yellow-500' : 'bg-muted'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                mostrarEnHome ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <span className="text-muted-foreground/40 text-lg select-none">|</span>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50">
            <span className="text-xs font-medium text-muted-foreground">Orden</span>
            <input
              type="number"
              value={orden}
              onChange={e => setOrden(e.target.value)}
              className="w-16 border border-border rounded-md px-2 py-1 text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button type="button" onClick={() => navigate('/admin/categorias')} className="px-4 py-2 text-sm font-medium rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
