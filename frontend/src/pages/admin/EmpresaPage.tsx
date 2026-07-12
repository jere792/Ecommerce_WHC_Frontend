import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useStore } from '../../contexts/StoreContext';
import type { ConfiguracionTienda } from '../../lib/supabaseTypes';

const emptySettings: Partial<ConfiguracionTienda> = {
  nombre_empresa: '',
  telefono_empresa: '',
  whatsapp_empresa: '',
  correo_empresa: '',
  direccion_empresa: '',
  horario_empresa: '',
  url_google_maps: '',
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
  const [msg, setMsg] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');

    const { error } = await supabase
      .from('configuracion_tienda')
      .upsert({
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
      });

    setSaving(false);
    if (error) {
      setMsg('Error: ' + error.message);
    } else {
      setMsg('Datos guardados correctamente');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">Cargando...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-6">Datos de la Empresa</h1>

      <form onSubmit={handleSubmit} className="bg-background shadow p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nombre de la empresa</label>
            <input type="text" value={form.nombre_empresa ?? ''} onChange={e => set('nombre_empresa', e.target.value)}
              className="w-full border px-3 py-2 bg-background text-foreground" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Teléfono</label>
            <input type="text" value={form.telefono_empresa ?? ''} onChange={e => set('telefono_empresa', e.target.value)}
              className="w-full border px-3 py-2 bg-background text-foreground" placeholder="(+51) 949790715" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">WhatsApp (sin +)</label>
            <input type="text" value={form.whatsapp_empresa ?? ''} onChange={e => set('whatsapp_empresa', e.target.value)}
              className="w-full border px-3 py-2 bg-background text-foreground" placeholder="51949790715" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Correo</label>
            <input type="text" value={form.correo_empresa ?? ''} onChange={e => set('correo_empresa', e.target.value)}
              className="w-full border px-3 py-2 bg-background text-foreground" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">Dirección</label>
            <input type="text" value={form.direccion_empresa ?? ''} onChange={e => set('direccion_empresa', e.target.value)}
              className="w-full border px-3 py-2 bg-background text-foreground" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Horario</label>
            <input type="text" value={form.horario_empresa ?? ''} onChange={e => set('horario_empresa', e.target.value)}
              className="w-full border px-3 py-2 bg-background text-foreground" placeholder="Lun - Vie: 9:00 a.m. - 6:00 p.m." />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Google Maps URL</label>
            <input type="text" value={form.url_google_maps ?? ''} onChange={e => set('url_google_maps', e.target.value)}
              className="w-full border px-3 py-2 bg-background text-foreground" placeholder="URL del embed de Google Maps" />
          </div>
        </div>

        <hr className="border-border" />
        <h2 className="text-lg font-semibold text-foreground">Horarios de atención</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">L-V Apertura</label>
            <input type="time" value={form.apertura_semana?.slice(0, 5) ?? '09:00'} onChange={e => set('apertura_semana', e.target.value + ':00')}
              className="w-full border px-2 py-1.5 bg-background text-foreground text-sm" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">L-V Cierre</label>
            <input type="time" value={form.cierre_semana?.slice(0, 5) ?? '18:00'} onChange={e => set('cierre_semana', e.target.value + ':00')}
              className="w-full border px-2 py-1.5 bg-background text-foreground text-sm" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Sáb Apertura</label>
            <input type="time" value={form.apertura_sabado?.slice(0, 5) ?? '09:00'} onChange={e => set('apertura_sabado', e.target.value + ':00')}
              className="w-full border px-2 py-1.5 bg-background text-foreground text-sm" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Sáb Cierre</label>
            <input type="time" value={form.cierre_sabado?.slice(0, 5) ?? '13:00'} onChange={e => set('cierre_sabado', e.target.value + ':00')}
              className="w-full border px-2 py-1.5 bg-background text-foreground text-sm" />
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <button type="submit" disabled={saving}
            className="bg-green-600 text-white px-4 py-2 hover:bg-green-700 disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          {msg && <span className={`text-sm ${msg.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>{msg}</span>}
        </div>
      </form>
    </div>
  );
}
