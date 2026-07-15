import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { Upload, Image as ImageIcon } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { useToast } from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const inputClass = "w-full border border-border rounded-lg px-4 py-3 bg-background text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

export default function AdminHeroSlideForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = !!id;

  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [texto, setTexto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [orden, setOrden] = useState('');
  const [activo, setActivo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (isEdit) {
      supabase
        .from('hero_slide')
        .select('*')
        .eq('id_hero_slide', id)
        .single()
        .then(({ data }) => {
          if (data) {
            setImageUrl(data.image_url || '');
            setTexto(data.texto || '');
            setDescripcion(data.descripcion || '');
            setOrden(data.orden != null ? String(data.orden) : '');
            setActivo(data.activo);
          }
        });
    } else {
      supabase.from('hero_slide').select('orden').order('orden', { ascending: false }).limit(1).then(({ data }) => {
        if (data && data.length > 0) {
          setOrden(String(data[0].orden + 1));
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
      setImageUrl(url);
    } catch (err) {
      showToast('Error al subir imagen: ' + err, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) { showToast('Debes seleccionar una imagen.', 'error'); return; }
    if (isEdit) { setConfirmOpen(true); return; }
    executeSave();
  };

  const executeSave = async () => {
    setLoading(true);

    const ordenNum = orden ? parseInt(orden) : 1;
    if (!isEdit) {
      const { data: existing } = await supabase.from('hero_slide').select('id_hero_slide, orden').eq('orden', ordenNum);
      if (existing && existing.length > 0) {
        const maxOrden = await supabase.from('hero_slide').select('orden').order('orden', { ascending: false }).limit(1);
        await supabase.from('hero_slide').update({ orden: (maxOrden.data?.[0]?.orden ?? 0) + 1 }).eq('id_hero_slide', existing[0].id_hero_slide);
      }
    }

    const payload = { image_url: imageUrl, texto, descripcion: descripcion || null, orden: ordenNum, activo };

    if (isEdit) {
      const { error } = await supabase.from('hero_slide').update(payload).eq('id_hero_slide', id);
      if (error) { showToast('Error al guardar: ' + error.message, 'error'); setLoading(false); return; }
    } else {
      const { error } = await supabase.from('hero_slide').insert(payload);
      if (error) { showToast('Error al guardar: ' + error.message, 'error'); setLoading(false); return; }
    }

    showToast(isEdit ? 'Slide actualizado correctamente' : 'Slide creado correctamente', 'success');
    navigate('/admin/hero-slides');
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Editar slide' : 'Nuevo slide'}
        description={isEdit ? 'Modifica los datos del slide' : 'Agrega un nuevo slide al hero principal'}
        icon={<ImageIcon className="w-5 h-5" />}
      />

      <form onSubmit={handleSubmit}>
        <div className="border border-border rounded-lg p-8 bg-background max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-start gap-10">
            {/* Imagen */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              <label className="block text-sm font-medium text-foreground">Imagen</label>
              {imageUrl && !uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="h-72 w-72 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden">
                    <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-1.5 px-5 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground hover:bg-muted cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" />
                      Cambiar
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
                    </label>
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="flex items-center gap-1.5 px-5 py-2.5 text-sm rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-3 h-72 w-72 rounded-xl border-2 border-dashed border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                  <ImageIcon className="w-10 h-10 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{uploading ? 'Subiendo...' : 'Subir imagen'}</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
                </label>
              )}
            </div>

            {/* Campos */}
            <div className="flex-1 w-full space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Texto</label>
                <input
                  type="text"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className={`${inputClass} min-h-[100px] resize-y`}
                />
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card flex-wrap">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50">
                  <span className="text-xs font-medium text-muted-foreground">Estado</span>
                  <div className="flex rounded-md border border-border overflow-hidden">
                    {['activo', 'inactivo'].map(op => (
                      <button
                        key={op}
                        type="button"
                        onClick={() => setActivo(op === 'activo')}
                        className={`px-3 py-1.5 text-xs font-medium transition-all ${
                          activo === (op === 'activo')
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
            onClick={() => navigate('/admin/hero-slides')}
            className="bg-muted text-foreground px-6 py-2.5 rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
      <ConfirmDialog
        open={confirmOpen}
        title="Guardar cambios"
        message={`¿Estás seguro de guardar los cambios en "${texto || 'este slide'}"?`}
        confirmText="Guardar"
        variant="primary"
        onConfirm={() => { setConfirmOpen(false); executeSave(); }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
