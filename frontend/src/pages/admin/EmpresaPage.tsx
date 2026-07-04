import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useStore } from '../../contexts/StoreContext';
import type { StoreSettings } from '../../lib/supabaseTypes';

const emptySettings: Partial<StoreSettings> = {
  company_name: '',
  company_phone: '',
  company_whatsapp: '',
  company_email: '',
  company_address: '',
  company_schedule: '',
  google_maps_url: '',
  weekday_open: '09:00:00',
  weekday_close: '18:00:00',
  saturday_open: '09:00:00',
  saturday_close: '13:00:00',
  sunday_open: null,
  sunday_close: null,
};

export default function EmpresaPage() {
  const [form, setForm] = useState<Partial<StoreSettings>>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    supabase.from('store_settings').select('*').eq('id', 1).single()
      .then(({ data }) => {
        if (data) setForm(data as StoreSettings);
        setLoading(false);
      });
  }, []);

  const set = (key: keyof StoreSettings, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');

    const { error } = await supabase
      .from('store_settings')
      .upsert({
        id: 1,
        is_open: form.is_open ?? false,
        weekday_open: form.weekday_open,
        weekday_close: form.weekday_close,
        saturday_open: form.saturday_open,
        saturday_close: form.saturday_close,
        sunday_open: form.sunday_open,
        sunday_close: form.sunday_close,
        company_name: form.company_name,
        company_phone: form.company_phone,
        company_whatsapp: form.company_whatsapp,
        company_email: form.company_email,
        company_address: form.company_address,
        company_schedule: form.company_schedule,
        google_maps_url: form.google_maps_url,
      });

    setSaving(false);
    if (error) {
      setMsg('Error: ' + error.message);
    } else {
      setMsg('Datos guardados correctamente');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Cargando...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-6">Datos de la Empresa</h1>

      <form onSubmit={handleSubmit} className="bg-background shadow p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nombre de la empresa</label>
            <input type="text" value={form.company_name ?? ''} onChange={e => set('company_name', e.target.value)}
              className="w-full border px-3 py-2 bg-background text-foreground" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Teléfono</label>
            <input type="text" value={form.company_phone ?? ''} onChange={e => set('company_phone', e.target.value)}
              className="w-full border px-3 py-2 bg-background text-foreground" placeholder="(+51) 949790715" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">WhatsApp (sin +)</label>
            <input type="text" value={form.company_whatsapp ?? ''} onChange={e => set('company_whatsapp', e.target.value)}
              className="w-full border px-3 py-2 bg-background text-foreground" placeholder="51949790715" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Correo</label>
            <input type="text" value={form.company_email ?? ''} onChange={e => set('company_email', e.target.value)}
              className="w-full border px-3 py-2 bg-background text-foreground" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">Dirección</label>
            <input type="text" value={form.company_address ?? ''} onChange={e => set('company_address', e.target.value)}
              className="w-full border px-3 py-2 bg-background text-foreground" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Horario</label>
            <input type="text" value={form.company_schedule ?? ''} onChange={e => set('company_schedule', e.target.value)}
              className="w-full border px-3 py-2 bg-background text-foreground" placeholder="Lun - Vie: 9:00 a.m. - 6:00 p.m." />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Google Maps URL</label>
            <input type="text" value={form.google_maps_url ?? ''} onChange={e => set('google_maps_url', e.target.value)}
              className="w-full border px-3 py-2 bg-background text-foreground" placeholder="URL del embed de Google Maps" />
          </div>
        </div>

        <hr className="border-border" />
        <h2 className="text-lg font-semibold text-foreground">Horarios de atención</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">L-V Apertura</label>
            <input type="time" value={form.weekday_open?.slice(0, 5) ?? '09:00'} onChange={e => set('weekday_open', e.target.value + ':00')}
              className="w-full border px-2 py-1.5 bg-background text-foreground text-sm" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">L-V Cierre</label>
            <input type="time" value={form.weekday_close?.slice(0, 5) ?? '18:00'} onChange={e => set('weekday_close', e.target.value + ':00')}
              className="w-full border px-2 py-1.5 bg-background text-foreground text-sm" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Sáb Apertura</label>
            <input type="time" value={form.saturday_open?.slice(0, 5) ?? '09:00'} onChange={e => set('saturday_open', e.target.value + ':00')}
              className="w-full border px-2 py-1.5 bg-background text-foreground text-sm" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Sáb Cierre</label>
            <input type="time" value={form.saturday_close?.slice(0, 5) ?? '13:00'} onChange={e => set('saturday_close', e.target.value + ':00')}
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
