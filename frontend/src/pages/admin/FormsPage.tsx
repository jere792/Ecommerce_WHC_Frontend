import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { Formulario } from '../../lib/supabaseTypes';

export default function AdminForms() {
  const [forms, setForms] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    const { data } = await supabase
      .from('formulario')
      .select('*, tipo:pk_tipo_formulario(*), estado:pk_estado_formulario(*)')
      .order('id_formulario', { ascending: false });

    if (data) setForms(data as unknown as Formulario[]);
    setLoading(false);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">Cargando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-foreground">Formularios</h1>
      <div className="bg-background rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">DNI</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Tipo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Fecha</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {forms.map((f) => (
              <tr key={f.id_formulario} className="hover:bg-muted">
                <td className="px-4 py-3 text-sm text-foreground">{f.id_formulario}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">{f.nombre_formulario}</td>
                <td className="px-4 py-3 text-sm text-foreground">{f.dni_formulario}</td>
                <td className="px-4 py-3 text-sm text-foreground">{f.tipo?.nombre_tipo}</td>
                <td className="px-4 py-3 text-sm text-foreground">{f.estado?.nombre_estado}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{f.fecha_formulario ? new Date(f.fecha_formulario).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3 text-sm">
                  <Link to={`/admin/formularios/${f.id_formulario}`} className="text-primary hover:underline">Atender</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
