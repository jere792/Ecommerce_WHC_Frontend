import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Usuario } from '../lib/supabaseTypes';

const SESSION_KEY = 'session_token';

export function useAuth() {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserByToken = useCallback(async (token: string) => {
    const { data, error } = await supabase.rpc('validar_session', { p_token: token });
    if (error || !data) return null;
    return data as Usuario;
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(SESSION_KEY);
    if (token) {
      fetchUserByToken(token).then(u => {
        if (u) setUser(u);
        else localStorage.removeItem(SESSION_KEY);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [fetchUserByToken]);

  const login = async (correo: string, password: string) => {
    const { data, error } = await supabase.rpc('login_usuario', {
      p_correo: correo,
      p_password: password,
    });
    if (error) throw error;
    const result = data as any;
    if (result.error) throw new Error(result.error);
    localStorage.setItem(SESSION_KEY, result.token);
    setUser(result.user as Usuario);
    return result.user as Usuario;
  };

  const register = async (nombre: string, correo: string, password: string) => {
    const { data, error } = await supabase.rpc('crear_usuario', {
      p_correo: correo,
      p_password: password,
      p_nombres: nombre,
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const token = localStorage.getItem(SESSION_KEY);
    if (token) {
      await supabase.rpc('cerrar_sesion', { p_token: token });
    }
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const forgotPassword = async () => {
    throw new Error('Función no disponible');
  };

  const updatePassword = async () => {
    throw new Error('Función no disponible');
  };

  const refreshProfile = async () => {
    const token = localStorage.getItem(SESSION_KEY);
    if (token) {
      const u = await fetchUserByToken(token);
      setUser(u);
    }
  };

  const isAdmin = user?.rol?.nombre_rol === 'Administrador';

  return {
    user,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    updatePassword,
    refreshProfile,
    isAdmin,
  };
}
