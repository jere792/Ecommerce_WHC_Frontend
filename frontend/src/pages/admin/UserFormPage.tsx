import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { RolUsuario } from '../../lib/supabaseTypes';

export default function AdminUserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
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
          setNombre(data.nombre_persona);
          setCorreo(data.correo_persona);
          setPkRol(data.pk_rol_usuario);
        }
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isEdit) {
      const updates: Record<string, unknown> = {
        nombre_persona: nombre,
        correo_persona: correo,
        pk_rol_usuario: pkRol,
      };
      if (password) updates.password = password;
      await supabase.from('usuarios').update(updates).eq('id_usuario', id);
    } else {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: correo,
        password,
        options: {
          data: { nombrePersona: nombre, role: roles.find(r => r.id_rol_usuario === pkRol)?.nombre_rol },
        },
      });
      if (authError) {
        alert(authError.message);
        setLoading(false);
        return;
      }
      if (authData.user) {
        await supabase.from('usuarios').update({ pk_rol_usuario: pkRol }).eq('auth_user_id', authData.user.id);
      }
    }

    navigate('/admin/usuarios');
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={correo}
            onChange={e => setCorreo(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isEdit ? 'Nueva contraseña (dejar vacío para mantener)' : 'Contraseña'}
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required={!isEdit}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
          <select
            value={pkRol}
            onChange={e => setPkRol(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
          >
            {roles.map(r => (
              <option key={r.id_rol_usuario} value={r.id_rol_usuario}>{r.nombre_rol}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/usuarios')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
