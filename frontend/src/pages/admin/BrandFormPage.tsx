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
        .from('marca_p')
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
      const { error } = await supabase.from('marca_p').update(payload).eq('id_marca_producto', id);
      if (error) { alert(error.message); setLoading(false); return; }
    } else {
      const { error } = await supabase.from('marca_p').insert(payload);
      if (error) { alert(error.message); setLoading(false); return; }
    }

    navigate('/admin/marcas');
  };

  return (
    <div>
      <PageHeader title={isEdit ? 'Editar marca' : 'Nueva marca'} />

      <form onSubmit={handleSubmit}>
        <div className="border border-border rounded-lg p-4 bg-background max-w-lg mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Logo */}
            <div className="flex flex-col items-center gap-2">
              <label className="block text-sm font-medium text-foreground">Logo</label>
              {logoUrl && !uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={logoUrl} alt="Logo" className="h-24 w-24 object-contain rounded-lg border border-border" />
                  <label className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border border-border bg-background text-foreground hover:bg-muted cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    Cambiar
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 h-24 w-24 rounded-lg border-2 border-dashed border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{uploading ? 'Subiendo...' : 'Subir'}</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
                </label>
              )}
            </div>

            {/* Fields */}
            <div className="flex-1 w-full space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  rows={3}
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mostrarEnHome}
                  onChange={(e) => setMostrarEnHome(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">Mostrar en la página principal</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6 max-w-lg mx-auto">
          <button
            type="submit"
            className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm font-medium"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/marcas')}
            className="bg-muted text-foreground px-5 py-2 rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
