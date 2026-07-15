import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { Upload, Image as ImageIcon } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { useToast } from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const PAGINAS = [
  { value: 'productos', label: 'Productos' },
  { value: 'contacto', label: 'Contacto' },
  { value: 'terminos', label: 'Términos' },
  { value: 'privacidad', label: 'Privacidad' },
];

const inputClass = "w-full border border-border rounded-lg px-4 py-3 bg-background text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

export default function AdminPageHeroForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = !!id;

  const [pagina, setPagina] = useState('');
  const [titulo, setTitulo] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (isEdit) {
      supabase
        .from('page_hero')
        .select('*')
        .eq('id_page_hero', id)
        .single()
        .then(({ data }) => {
          if (data) {
            setPagina(data.pagina);
            setTitulo(data.titulo);
            setSubtitulo(data.subtitulo || '');
            setImagenUrl(data.imagen_url || '');
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
      setImagenUrl(url);
    } catch (err) {
      showToast('Error al subir imagen: ' + err, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pagina) { showToast('Debes seleccionar una página.', 'error'); return; }
    if (isEdit) { setConfirmOpen(true); return; }
    executeSave();
  };

  const executeSave = async () => {
    setSaving(true);

    const payload = { pagina, titulo, subtitulo: subtitulo || null, imagen_url: imagenUrl || null };

    if (isEdit) {
      const { error } = await supabase.from('page_hero').update(payload).eq('id_page_hero', id);
      if (error) { showToast('Error al guardar: ' + error.message, 'error'); setSaving(false); return; }
    } else {
      const { error } = await supabase.from('page_hero').insert(payload);
      if (error) { showToast('Error al guardar: ' + error.message, 'error'); setSaving(false); return; }
    }

    showToast(isEdit ? 'Hero actualizado correctamente' : 'Hero creado correctamente', 'success');
    navigate('/admin/page-hero');
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Editar hero' : 'Nuevo hero'}
        description={isEdit ? 'Modifica los datos del hero de página' : 'Agrega un nuevo hero de página'}
        icon={<ImageIcon className="w-5 h-5" />}
      />

      <form onSubmit={handleSubmit}>
        <div className="border border-border rounded-lg p-8 bg-background max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-start gap-10">
            <div className="flex flex-col items-center gap-3 shrink-0">
              <label className="block text-sm font-medium text-foreground">Imagen de fondo</label>
              {imagenUrl && !uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="h-72 w-72 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden">
                    <img src={imagenUrl} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-1.5 px-5 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground hover:bg-muted cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" />
                      Cambiar
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
                    </label>
                    <button
                      type="button"
                      onClick={() => setImagenUrl('')}
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

            <div className="flex-1 w-full space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Página</label>
                <input
                  type="text"
                  value={PAGINAS.find(p => p.value === pagina)?.label || pagina}
                  className={`${inputClass} bg-muted/50 text-muted-foreground cursor-not-allowed`}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Título</label>
                <input
                  type="text"
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Subtítulo</label>
                <input
                  type="text"
                  value={subtitulo}
                  onChange={e => setSubtitulo(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end max-w-4xl mx-auto mt-6">
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm font-medium"
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/page-hero')}
            className="bg-muted text-foreground px-6 py-2.5 rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
      <ConfirmDialog
        open={confirmOpen}
        title="Guardar cambios"
        message={`¿Estás seguro de guardar los cambios en "${titulo}"?`}
        confirmText="Guardar"
        variant="primary"
        onConfirm={() => { setConfirmOpen(false); executeSave(); }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
