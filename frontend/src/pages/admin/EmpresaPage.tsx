import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useStore } from '../../contexts/StoreContext';
import { Upload, Image as ImageIcon, Building2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { useToast } from '../../components/ui/Toast';
import type { ConfiguracionTienda } from '../../lib/supabaseTypes';

const emptySettings: Partial<ConfiguracionTienda> = {
  nombre_empresa: '',
  telefono_empresa: '',
  whatsapp_empresa: '',
  correo_empresa: '',
  direccion_empresa: '',
  horario_empresa: '',
  url_google_maps: '',
  url_logo: '',
  url_facebook: '',
  url_instagram: '',
  url_tiktok: '',
  apertura_semana: '09:00:00',
  cierre_semana: '18:00:00',
  apertura_sabado: '09:00:00',
  cierre_sabado: '13:00:00',
  apertura_domingo: null,
  cierre_domingo: null,
};

export default function EmpresaPage() {
  const [form, setForm] = useState<Partial<ConfiguracionTienda>>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    supabase.from('configuracion_tienda').select('*').eq('id', 1).single()
      .then(({ data }) => {
        if (data) setForm(data as ConfiguracionTienda);
        setLoading(false);
      });
  }, []);

  const set = (key: keyof ConfiguracionTienda, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm(prev => ({ ...prev, url_logo: url }));
    } catch (err) {
      showToast('Error al subir logo: ' + err, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      id: 1,
      esta_abierto: form.esta_abierto ?? false,
      apertura_semana: form.apertura_semana,
      cierre_semana: form.cierre_semana,
      apertura_sabado: form.apertura_sabado,
      cierre_sabado: form.cierre_sabado,
      apertura_domingo: form.apertura_domingo,
      cierre_domingo: form.cierre_domingo,
      nombre_empresa: form.nombre_empresa,
      telefono_empresa: form.telefono_empresa,
      whatsapp_empresa: form.whatsapp_empresa,
      correo_empresa: form.correo_empresa,
      direccion_empresa: form.direccion_empresa,
      horario_empresa: form.horario_empresa,
      url_google_maps: form.url_google_maps,
      url_logo: form.url_logo,
      url_facebook: form.url_facebook,
      url_instagram: form.url_instagram,
      url_tiktok: form.url_tiktok,
    };

    const { error } = await supabase.from('configuracion_tienda').upsert(payload);

    setSaving(false);
    if (error) {
      showToast('Error: ' + error.message, 'error');
    } else {
      showToast('Datos guardados correctamente', 'success');
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">Cargando...</div>;

  const inputClass = "w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

  return (
    <div>
      <PageHeader
        title="Configuración de empresa"
        description="Administra los datos y horarios de tu empresa"
        icon={<Building2 className="w-5 h-5" />}
      />

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Columna izquierda (5/12): Logo + Horarios */}
            <div className="col-span-12 lg:col-span-4 flex flex-col h-full gap-6">
              <div className="border border-border rounded-lg p-6 bg-background flex-1 flex flex-col items-center justify-center">
                <h3 className="text-sm font-semibold text-foreground mb-4 self-start">Logo de la empresa</h3>
                <div className="flex flex-col items-center gap-4">
                  {form.url_logo ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-48 h-48 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden p-4">
                        <img src={form.url_logo} alt="Logo" className="h-full w-full object-contain" />
                      </div>
                      <div className="flex gap-2">
                        <label className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground hover:bg-muted cursor-pointer transition-colors">
                          <Upload className="w-4 h-4" />
                          Cambiar
                          <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" disabled={uploading} />
                        </label>
                        <button
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, url_logo: '' }))}
                          className="px-4 py-2 text-sm rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-3 w-48 h-48 rounded-xl border-2 border-dashed border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                      <ImageIcon className="w-10 h-10 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{uploading ? 'Subiendo...' : 'Subir logo'}</span>
                      <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" disabled={uploading} />
                    </label>
                  )}
                  <p className="text-xs text-muted-foreground text-center max-w-sm">
                    Logo de la empresa para cotizaciones y documentos PDF.
                  </p>
                </div>
              </div>

              <div className="border border-border rounded-lg p-6 bg-background flex-1">
                <h3 className="text-sm font-semibold text-foreground mb-4">Horarios de atención</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">L-V Apertura</label>
                    <input type="time" value={form.apertura_semana?.slice(0, 5) ?? '09:00'} onChange={e => set('apertura_semana', e.target.value + ':00')} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">L-V Cierre</label>
                    <input type="time" value={form.cierre_semana?.slice(0, 5) ?? '18:00'} onChange={e => set('cierre_semana', e.target.value + ':00')} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Sáb Apertura</label>
                    <input type="time" value={form.apertura_sabado?.slice(0, 5) ?? '09:00'} onChange={e => set('apertura_sabado', e.target.value + ':00')} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Sáb Cierre</label>
                    <input type="time" value={form.cierre_sabado?.slice(0, 5) ?? '13:00'} onChange={e => set('cierre_sabado', e.target.value + ':00')} className={inputClass} />
                  </div>
                </div>
              </div>
            </div>

            {/* Columna derecha (7/12): Datos de la empresa */}
            <div className="col-span-12 lg:col-span-8 flex flex-col h-full">
              <div className="border border-border rounded-lg p-6 bg-background flex-1">
                <h3 className="text-sm font-semibold text-foreground mb-4">Datos de la empresa</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Nombre de la empresa</label>
                    <input type="text" value={form.nombre_empresa ?? ''} onChange={e => set('nombre_empresa', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Teléfono</label>
                    <input type="text" value={form.telefono_empresa ?? ''} onChange={e => set('telefono_empresa', e.target.value)} className={inputClass} placeholder="(+51) 949790715" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">WhatsApp (sin +)</label>
                    <input type="text" value={form.whatsapp_empresa ?? ''} onChange={e => set('whatsapp_empresa', e.target.value)} className={inputClass} placeholder="51949790715" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Dirección</label>
                    <input type="text" value={form.direccion_empresa ?? ''} onChange={e => set('direccion_empresa', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Correo</label>
                    <input type="text" value={form.correo_empresa ?? ''} onChange={e => set('correo_empresa', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Google Maps URL</label>
                    <input type="text" value={form.url_google_maps ?? ''} onChange={e => set('url_google_maps', e.target.value)} className={inputClass} placeholder="URL del embed de Google Maps" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Facebook URL</label>
                    <input type="text" value={form.url_facebook ?? ''} onChange={e => set('url_facebook', e.target.value)} className={inputClass} placeholder="https://facebook.com/tu-pagina" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Instagram URL</label>
                    <input type="text" value={form.url_instagram ?? ''} onChange={e => set('url_instagram', e.target.value)} className={inputClass} placeholder="https://instagram.com/tu-cuenta" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">TikTok URL</label>
                    <input type="text" value={form.url_tiktok ?? ''} onChange={e => set('url_tiktok', e.target.value)} className={inputClass} placeholder="https://tiktok.com/@tu-cuenta" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => {
              supabase.from('configuracion_tienda').select('*').eq('id', 1).single()
                .then(({ data }) => {
                    if (data) setForm(data as ConfiguracionTienda);
                });
            }}
            className="bg-muted text-foreground px-6 py-2.5 rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
