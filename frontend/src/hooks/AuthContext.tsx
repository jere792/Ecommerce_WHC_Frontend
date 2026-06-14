import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './useAuth';
import type { Usuario } from '../lib/supabaseTypes';

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  login: (correo: string, password: string) => Promise<Usuario | null>;
  register: (nombre: string, correo: string, password: string) => Promise<unknown>;
  logout: () => Promise<void>;
  forgotPassword: (correo: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
