import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { Usuario } from '../../lib/supabaseTypes';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useAlert } from '../../components/ui/AlertModal';

export default function AdminUsers() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { alert, modal } = useAlert();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data } = await supabase
      .from('usuarios')
      .select('*, rol:pk_rol_usuario(*)')
      .order('id_usuario', { ascending: false });
    if (data) setUsers(data as unknown as Usuario[]);
    setLoading(false);
  };

  const handleDelete = async (id: number, authUserId?: string) => {
    if (!confirm('Eliminar este usuario?')) return;
    if (authUserId) {
      const { error } = await supabase.auth.admin.deleteUser(authUserId);
      if (error) { alert('Error al eliminar de auth: ' + error.message, 'error'); return; }
    }
    const { error } = await supabase.from('usuarios').delete().eq('id_usuario', id);
    if (error) { alert('Error al eliminar: ' + error.message, 'error'); return; }
    loadUsers();
  };

  if (loading) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Cargando...</div>;

  return (
    <div>
      {modal}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Usuarios</h1>
        <Link to="/admin/usuarios/nuevo" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Nuevo usuario
        </Link>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Rol</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((u) => (
              <tr key={u.id_usuario} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{u.nombre_persona}</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{u.correo_persona}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">{u.rol?.nombre_rol}</span>
                </td>
                <td className="px-4 py-3 text-sm flex gap-2">
                  <button onClick={() => navigate(`/admin/usuarios/editar/${u.id_usuario}`)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(u.id_usuario, u.auth_user_id)} className="text-red-600 dark:text-red-400 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
