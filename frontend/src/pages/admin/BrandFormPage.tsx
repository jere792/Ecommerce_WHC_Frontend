import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { Upload } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';

export default function AdminBrandForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [mostrarEnHome, setMostrarEnHome] = useState(false);
  const [loading, setLoading] = useState(false);

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
            setDescripcion(data.descripcion_marca_producto || '');
            setLogoUrl(data.logo_url || '');
            setMostrarEnHome(data.mostrar_en_home || false);
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
      alert('Error al subir logo: ' + err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = { nombre_marca_producto: nombre, descripcion_marca_producto: descripcion || null, logo_url: logoUrl || null, mostrar_en_home: mostrarEnHome };

    if (isEdit) {
      const { error } = await supabase.from('marca_producto').update(payload).eq('id_marca_producto', id);
      if (error) { alert(error.message); setLoading(false); return; }
    } else {
      const { error } = await supabase.from('marca_producto').insert(payload);
      if (error) { alert(error.message); setLoading(false); return; }
    }

    navigate('/admin/marcas');
  };

  return (
    <div>
      <PageHeader title={isEdit ? 'Editar marca' : 'Nueva marca'} />

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
                  <label className="flex items-center gap-1.5 px-5 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground hover:bg-muted cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    Cambiar
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
                  </label>
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
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Mostrar en la página principal</label>
                <button
                  type="button"
                  onClick={() => setMostrarEnHome(!mostrarEnHome)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    mostrarEnHome ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                      mostrarEnHome ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-8 pt-4 border-t border-border">
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
        </div>
      </form>
    </div>
  );
}
