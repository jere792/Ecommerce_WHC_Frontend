import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { LibroReclamacion } from '../../lib/supabaseTypes';
import { BookOpen, ArrowLeft, User, Phone, FileText, Home, Mail, AlertCircle } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';

export default function AdminFormDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reclamo, setReclamo] = useState<LibroReclamacion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReclamo();
  }, [id]);

  const loadReclamo = async () => {
    const { data } = await supabase
      .from('libro_reclamacion')
      .select('*')
      .eq('id_reclamo', id)
      .single();
    if (data) setReclamo(data as LibroReclamacion);
    setLoading(false);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">Cargando...</div>;
  if (!reclamo) return <div className="text-center py-12 text-muted-foreground">Reclamo no encontrado</div>;

  return (
    <div>
      <PageHeader
        title="Detalle del reclamo"
        description={`Reclamo #${reclamo.id_reclamo}`}
        icon={<BookOpen className="w-5 h-5" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda: Datos del cliente */}
        <div className="border border-border rounded-lg bg-background overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-border bg-muted/30">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Datos del cliente
            </h3>
          </div>
          <div className="p-5 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Nombre completo</p>
                  <p className="text-sm font-medium text-foreground">{reclamo.nombre} {reclamo.apellidos || ''}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">DNI</p>
                  <p className="text-sm text-foreground">{reclamo.dni || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <p className="text-sm text-foreground">{reclamo.telefono || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Correo</p>
                  <p className="text-sm text-foreground">{reclamo.correo || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Home className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Domicilio</p>
                  <p className="text-sm text-foreground">{reclamo.domicilio || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Tipo</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    reclamo.tipo_reclamo === 'RECLAMO'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {reclamo.tipo_reclamo || '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: Descripción */}
        <div className="border border-border rounded-lg bg-background overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-border bg-muted/30">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Descripción del reclamo
            </h3>
          </div>
          <div className="p-5 flex-1 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Fecha de registro</p>
              <p className="text-sm text-foreground">
                {reclamo.created_at ? new Date(reclamo.created_at).toLocaleString() : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Descripción</p>
              <p className="text-sm text-foreground bg-muted/30 rounded-lg p-3 border border-border">
                {reclamo.descripcion || '—'}
              </p>
            </div>
            {reclamo.responsable && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Responsable de atención</p>
                <p className="text-sm text-foreground">{reclamo.responsable}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={() => navigate('/admin/libro-reclamos')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a libro de reclamos
        </button>
      </div>
    </div>
  );
}
