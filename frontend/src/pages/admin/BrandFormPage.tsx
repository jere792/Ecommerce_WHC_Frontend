import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { Upload, Tag } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { useToast } from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function AdminBrandForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [mostrarEnHome, setMostrarEnHome] = useState(false);
  const [activo, setActivo] = useState(true);
  const [orden, setOrden] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isEdit) {
      supabase
        .from('marca_producto')
        .select('*')
        .eq('id_marca_producto', id)
        .single()
        .then(({ data }) => {
          if (data) {
            setNombre(data.nombre_marca_producto);
            setDescripcion(data.descripcion_marca || '');
            setLogoUrl(data.logo_url || '');
            setMostrarEnHome(data.mostrar_en_home || false);
            setActivo(data.activo !== false);
            setOrden(data.orden != null ? String(data.orden) : '');
          }
        });
    } else {
      supabase.from('marca_producto').select('orden').order('orden', { ascending: false, nullsFirst: false }).limit(1).then(({ data }) => {
        if (data && data.length > 0) {
          setOrden(String((data[0] as any).orden + 1));
        } else {
          setOrden('1');
        }
      });
    }
  }, [id, isEdit]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setLogoUrl(url);
    } catch (err) {
      showToast('Error al subir logo: ' + err, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) { setConfirmOpen(true); return; }
    executeSave();
  };

  const executeSave = async () => {
    setLoading(true);
    const ordenNum = orden ? parseInt(orden) : null;

    if (ordenNum != null) {
      const { data: existing } = await supabase.from('marca_producto').select('id_marca_producto, orden').eq('orden', ordenNum);
      const conflict = existing?.find((b: any) => isEdit ? b.id_marca_producto !== Number(id) : true);
      if (conflict) {
        if (isEdit) {
          const { data: current } = await supabase.from('marca_producto').select('orden').eq('id_marca_producto', id).single();
          await supabase.from('marca_producto').update({ orden: (current as any)?.orden ?? null }).eq('id_marca_producto', conflict.id_marca_producto);
        } else {
          const { data: maxData } = await supabase.from('marca_producto').select('orden').order('orden', { ascending: false }).limit(1);
          await supabase.from('marca_producto').update({ orden: ((maxData?.[0] as any)?.orden ?? 0) + 1 }).eq('id_marca_producto', conflict.id_marca_producto);
        }
      }
    }

    const payload = { nombre_marca_producto: nombre, descripcion_marca: descripcion || null, logo_url: logoUrl || null, mostrar_en_home: mostrarEnHome, activo, orden: ordenNum };

    if (isEdit) {
      const { error } = await supabase.from('marca_producto').update(payload).eq('id_marca_producto', id);
      if (error) { showToast('Error al guardar: ' + error.message, 'error'); setLoading(false); return; }
    } else {
      const { error } = await supabase.from('marca_producto').insert(payload);
      if (error) { showToast('Error al guardar: ' + error.message, 'error'); setLoading(false); return; }
    }

    showToast(isEdit ? 'Marca actualizada correctamente' : 'Marca creada correctamente', 'success');
    navigate('/admin/marcas');
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Editar marca' : 'Nueva marca'}
        description={isEdit ? 'Modifica los datos de la marca' : 'Agrega una nueva marca'}
        icon={<Tag className="w-5 h-5" />}
      />

      <form onSubmit={handleSubmit}>
        <div className="border border-border rounded-lg p-8 bg-background max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-start gap-10">
            {/* Logo */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              <label className="block text-sm font-medium text-foreground">Logo</label>
              {logoUrl && !uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="h-72 w-72 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden p-4">
                    <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
                  </div>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-1.5 px-5 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground hover:bg-muted cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" />
                      Cambiar
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
                    </label>
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="flex items-center gap-1.5 px-5 py-2.5 text-sm rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-3 h-72 w-72 rounded-xl border-2 border-dashed border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-10 h-10 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{uploading ? 'Subiendo...' : 'Subir imagen'}</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
                </label>
              )}
            </div>

            {/* Fields */}
            <div className="flex-1 w-full space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full border border-border rounded-lg px-5 py-2.5 bg-background text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full border border-border rounded-lg px-5 py-2.5 bg-background text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  rows={4}
                />
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card flex-wrap">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50 shrink-0">
                  <span className="text-xs font-medium text-muted-foreground">Estado</span>
                  <div className="flex rounded-md border border-border overflow-hidden">
                    {['activo', 'inactivo'].map(op => (
                      <button
                        key={op}
                        type="button"
                        onClick={() => setActivo(op === 'activo')}
                        className={`w-20 px-3 py-1.5 text-xs font-medium text-left ${
                          activo === (op === 'activo')
                            ? op === 'activo'
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                            : 'bg-background text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {op === 'activo' ? 'Activo' : 'Inactivo'}
                      </button>
                    ))}
                  </div>
                </div>
                <span className="text-muted-foreground/40 text-lg select-none shrink-0">|</span>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50 shrink-0">
                  <span className="text-xs font-medium text-muted-foreground">Mostrar en home</span>
                  <button
                    type="button"
                    onClick={() => setMostrarEnHome(!mostrarEnHome)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      mostrarEnHome ? 'bg-yellow-500' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                        mostrarEnHome ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <span className="text-muted-foreground/40 text-lg select-none shrink-0">|</span>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50 shrink-0">
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
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end max-w-4xl mx-auto mt-6">
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm font-medium"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/marcas')}
            className="bg-muted text-foreground px-6 py-2.5 rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
      <ConfirmDialog
        open={confirmOpen}
        title="Guardar cambios"
        message={`¿Estás seguro de guardar los cambios en "${nombre}"?`}
        confirmText="Guardar"
        variant="primary"
        onConfirm={() => { setConfirmOpen(false); executeSave(); }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
