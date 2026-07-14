import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { RolUsuario } from '../../lib/supabaseTypes';
import { Users, UserPlus } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { useToast } from '../../components/ui/Toast';

const inputClass = "w-full border border-border rounded-lg px-4 py-2.5 bg-background text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

export default function AdminUserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = !!id;

  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pkRol, setPkRol] = useState<number>(2);
  const [roles, setRoles] = useState<RolUsuario[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('rol_usuario').select('*').then(({ data }) => {
      if (data) setRoles(data as RolUsuario[]);
    });
    if (isEdit) {
      supabase.from('usuarios').select('*').eq('id_usuario', id).single().then(({ data }) => {
        if (data) {
          setNombres(data.nombres || '');
          setApellidos(data.apellidos || '');
          setCorreo(data.correo_persona);
          setTelefono(data.telefono || '');
          setPkRol(data.pk_rol_usuario);
        }
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      showToast('Las contraseñas no coinciden.', 'error');
      return;
    }

    setLoading(true);

    if (isEdit) {
      const updates: Record<string, unknown> = {
        nombres,
        apellidos: apellidos || null,
        correo_persona: correo,
        telefono: telefono || null,
        pk_rol_usuario: pkRol,
      };
      if (password) updates.password = password;
      const { error } = await supabase.from('usuarios').update(updates).eq('id_usuario', id);
      if (error) { showToast('Error al guardar: ' + error.message, 'error'); setLoading(false); return; }
      showToast('Usuario actualizado correctamente', 'success');
    } else {
      if (!password) { showToast('Debes ingresar una contraseña.', 'error'); setLoading(false); return; }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: correo,
        password,
        options: {
          data: { nombrePersona: `${nombres} ${apellidos}`.trim(), role: roles.find(r => r.id_rol_usuario === pkRol)?.nombre_rol },
        },
      });
      if (authError) { showToast('Error al crear: ' + authError.message, 'error'); setLoading(false); return; }
      if (authData.user) {
        await supabase.from('usuarios').update({ pk_rol_usuario: pkRol }).eq('auth_user_id', authData.user.id);
      }
      showToast('Usuario creado correctamente', 'success');
    }

    navigate('/admin/usuarios');
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Editar usuario' : 'Nuevo usuario'}
        description={isEdit ? 'Modifica los datos del usuario' : 'Agrega un nuevo usuario al sistema'}
        icon={<Users className="w-5 h-5" />}
      />

      <form onSubmit={handleSubmit}>
        <div className="border border-border rounded-lg p-8 bg-background max-w-4xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nombres</label>
              <input
                type="text"
                value={nombres}
                onChange={e => setNombres(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Apellidos</label>
              <input
                type="text"
                value={apellidos}
                onChange={e => setApellidos(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={correo}
                onChange={e => setCorreo(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Teléfono</label>
              <input
                type="text"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                className={inputClass}
                placeholder="Ej: 999 888 777"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {isEdit ? 'Nueva contraseña (dejar vacío para mantener)' : 'Contraseña'}
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={inputClass}
                required={!isEdit}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Confirmar contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className={inputClass}
                required={!isEdit || !!password}
                placeholder="Repite la contraseña"
              />
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Rol</label>
            <select
              value={pkRol}
              onChange={e => setPkRol(Number(e.target.value))}
              className={inputClass}
            >
              {roles.map(r => (
                <option key={r.id_rol_usuario} value={r.id_rol_usuario}>{r.nombre_rol}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 justify-end max-w-4xl mx-auto mt-6">
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm font-medium"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/usuarios')}
            className="bg-muted text-foreground px-6 py-2.5 rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
