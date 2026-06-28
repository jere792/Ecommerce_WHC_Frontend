import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Usuario } from '../lib/supabaseTypes';

export function useAuth() {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (authUserId: string) => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*, rol:pk_rol_usuario(*)')
      .eq('auth_user_id', authUserId)
      .single();
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as Usuario;
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      }
      setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const login = async (correo: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo,
      password,
    });
    if (error) throw error;
    if (data.user) {
      const profile = await fetchProfile(data.user.id);
      setUser(profile);
      return profile;
    }
    return null;
  };

  const register = async (nombre: string, correo: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: correo,
      password,
      options: {
        data: {
          nombrePersona: nombre,
          role: 'Cliente',
        },
      },
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  const forgotPassword = async (correo: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(correo, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  };

  const refreshProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const profile = await fetchProfile(session.user.id);
      setUser(profile);
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
