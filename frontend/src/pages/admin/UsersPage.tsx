import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { Usuario } from '../../lib/supabaseTypes';
import { Users, Edit, Package } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import FilterBar from '../../components/ui/FilterBar';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';

export default function AdminUsers() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState(0);
  const [confirmAction, setConfirmAction] = useState<{ id: number; mode: 'delete' | 'recover' } | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => { loadUsers(); }, [estadoFiltro]);

  const loadUsers = async () => {
    let query = supabase
      .from('usuarios')
      .select('*, rol:pk_rol_usuario(*)')
      .order('id_usuario', { ascending: false });

    if (estadoFiltro === 1) query = query.eq('estado', true);
    else if (estadoFiltro === 2) query = query.eq('estado', false);

    const { data } = await query;
    if (data) setUsers(data as unknown as Usuario[]);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    if (!search || search.length < 3) return users;
    const q = search.toLowerCase();
    return users.filter(u =>
      `${u.nombres} ${u.apellidos || ''}`.toLowerCase().includes(q) ||
      u.correo_persona.toLowerCase().includes(q)
    );
  }, [users, search]);

  const handleConfirmAction = async () => {
    if (confirmAction == null) return;
    const { id, mode } = confirmAction;
    setConfirmAction(null);

    if (mode === 'delete') {
      const { error } = await supabase.from('usuarios').update({ estado: false }).eq('id_usuario', id);
      if (error) { showToast('Error al eliminar: ' + error.message, 'error'); } else { showToast('Usuario eliminado correctamente', 'warning'); }
    } else {
      const { error } = await supabase.from('usuarios').update({ estado: true }).eq('id_usuario', id);
      if (error) { showToast('Error al recuperar: ' + error.message, 'error'); } else { showToast('Usuario recuperado correctamente', 'success'); }
    }

    loadUsers();
  };

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">Cargando...</div>;

  return (
    <div>
      <PageHeader
        title="Usuarios"
        description="Gestiona los usuarios del sistema"
        icon={<Users className="w-5 h-5" />}
        buttonLabel="Nuevo usuario"
        onButtonClick={() => navigate('/admin/usuarios/nuevo')}
      />

      <FilterBar
        title="usuarios"
        fields={[
          { type: 'search', label: 'Buscar', value: search, onChange: setSearch, placeholder: 'Buscar por nombre o email (mín 3 caracteres)...' },
          { type: 'select', label: 'Estado', value: estadoFiltro, onChange: setEstadoFiltro, options: [
            { value: 0, label: 'Todos' },
            { value: 1, label: 'Activo' },
            { value: 2, label: 'Inactivo' },
          ]},
        ]}
        onClear={() => { setSearch(''); setEstadoFiltro(0); }}
      />

      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Nombre</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Email</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Teléfono</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Rol</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Estado</th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                  {search ? 'No se encontraron usuarios.' : 'No hay usuarios registrados.'}
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id_usuario} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground">{u.nombres} {u.apellidos || ''}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{u.correo_persona}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{u.telefono || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {u.rol?.nombre_rol || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      u.estado !== false
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {u.estado !== false ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => navigate(`/admin/usuarios/editar/${u.id_usuario}`)}
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {u.estado !== false ? (
                        <button
                          onClick={() => setConfirmAction({ id: u.id_usuario, mode: 'delete' })}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          title="Eliminar"
                        >
                          <Package className="w-4 h-4 rotate-45" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmAction({ id: u.id_usuario, mode: 'recover' })}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                          title="Recuperar"
                        >
                          <Package className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirmAction != null}
        title={confirmAction?.mode === 'delete' ? 'Eliminar usuario' : 'Recuperar usuario'}
        message={confirmAction?.mode === 'delete' ? '¿Estás seguro de eliminar este usuario? Se desactivará de forma lógica.' : '¿Estás seguro de recuperar este usuario?'}
        confirmText={confirmAction?.mode === 'delete' ? 'Eliminar' : 'Recuperar'}
        variant={confirmAction?.mode === 'delete' ? 'destructive' : 'primary'}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
