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

  if (loading) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Cargando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Formularios</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">DNI</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Tipo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Fecha</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {forms.map((f) => (
              <tr key={f.id_formulario} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{f.id_formulario}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{f.nombre_formulario}</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{f.dni_formulario}</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{f.tipo?.nombre_tipo}</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{f.estado?.nombre_estado}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{f.fecha_formulario ? new Date(f.fecha_formulario).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3 text-sm">
                  <Link to={`/admin/formularios/${f.id_formulario}`} className="text-blue-600 dark:text-blue-400 hover:underline">Atender</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
