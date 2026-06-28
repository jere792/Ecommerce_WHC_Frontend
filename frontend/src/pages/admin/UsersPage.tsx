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

  if (loading) return <div className="text-center py-12 text-muted-foreground">Cargando...</div>;

  return (
    <div>
      {modal}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
        <Link to="/admin/usuarios/nuevo" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary-700">
          <Plus className="w-4 h-4" /> Nuevo usuario
        </Link>
      </div>
      <div className="bg-background rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Rol</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id_usuario} className="hover:bg-muted">
                <td className="px-4 py-3 text-sm text-foreground">{u.id_usuario}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">{u.nombre_persona}</td>
                <td className="px-4 py-3 text-sm text-foreground">{u.correo_persona}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-primary-100 text-primary-800">{u.rol?.nombre_rol}</span>
                </td>
                <td className="px-4 py-3 text-sm flex gap-2">
                  <button onClick={() => navigate(`/admin/usuarios/editar/${u.id_usuario}`)} className="text-primary hover:text-primary-800"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(u.id_usuario, u.auth_user_id)} className="text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
