import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../../hooks/AuthContext';
import { User, Eye, EyeOff, Mail, Lock, Shield, LogOut, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, login, logout } = useAuthContext();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  const validateEmail = (e: string) => {
    const email = e.trim();
    if (!email) return 'El correo es requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Formato de email inválido';
    return '';
  };

  const validatePassword = (p: string) => {
    if (!p) return 'La contraseña es requerida';
    if (p.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    return '';
  };

  const runLoginValidations = () => {
    const eCorreo = validateEmail(correo);
    const ePass = validatePassword(password);
    const errs: Record<string, string> = {};
    if (eCorreo) errs.correo = eCorreo;
    if (ePass) errs.password = ePass;
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    if (!runLoginValidations()) return;
    setIsSubmitting(true);
    try {
      await login(correo.trim(), password);
      navigate('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        const msg = err.message.toLowerCase();
        if (msg.includes('invalid login credentials')) {
          setError('Correo o contraseña incorrectos');
        } else {
          setError(err.message);
        }
      } else setError('Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver a la tienda
        </Link>

        {user ? (
          <div className="bg-white shadow p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">¡Hola, {user.nombre_persona}!</h1>
            <p className="text-gray-500 text-sm mb-6">Has iniciado sesión correctamente</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin')}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
              >
                <Shield className="w-5 h-5" />
                Panel de administración
              </button>
              <button
                onClick={() => navigate('/mis-pedidos')}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium"
              >
                Mis pedidos
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-red-600 hover:bg-red-50 transition font-medium"
              >
                <LogOut className="w-5 h-5" />
                Cerrar sesión
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Iniciar sesión</h1>
            <p className="text-sm text-gray-500 mb-6">Ingresa tus credenciales para acceder</p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    ref={emailRef}
                    type="email"
                    value={correo}
                    onChange={e => { setCorreo(e.target.value); setFieldErrors({}); }}
                    placeholder="Correo electrónico"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50"
                    required
                    autoFocus
                  />
                </div>
                {fieldErrors.correo && <span className="text-red-500 text-sm mt-1 block">{fieldErrors.correo}</span>}
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setFieldErrors({}); }}
                    placeholder="Contraseña"
                    className="w-full pl-11 pr-12 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {fieldErrors.password && <span className="text-red-500 text-sm mt-1 block">{fieldErrors.password}</span>}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white font-semibold py-3 hover:bg-blue-700 transition disabled:opacity-60"
              >
                {isSubmitting ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
