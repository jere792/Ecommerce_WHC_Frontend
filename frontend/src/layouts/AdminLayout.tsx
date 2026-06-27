import { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../hooks/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { useToast } from '../components/ui/Toast';
import { LayoutDashboard, Package, ShoppingCart, Users, FileText, Tags, Activity, List, BookMarked, Image, SlidersHorizontal, LogOut, Moon, Sun, Store } from 'lucide-react';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/productos', icon: Package, label: 'Productos' },
  { to: '/admin/categorias', icon: List, label: 'Categorías' },
  { to: '/admin/marcas', icon: BookMarked, label: 'Marcas' },
  { to: '/admin/hero-slides', icon: Image, label: 'Hero Slides' },
  { to: '/admin/banners-publicidad', icon: SlidersHorizontal, label: 'Banners Pub.' },
  { to: '/admin/page-hero', icon: Image, label: 'Hero páginas' },
  { to: '/admin/pedidos', icon: ShoppingCart, label: 'Pedidos' },
  { to: '/admin/usuarios', icon: Users, label: 'Usuarios' },
  { to: '/admin/formularios', icon: FileText, label: 'Formularios' },
  { to: '/admin/ofertas', icon: Tags, label: 'Ofertas' },
  { to: '/admin/movimientos', icon: Activity, label: 'Movimientos' },
];

export default function AdminLayout() {
  const { user, isAdmin, loading, logout } = useAuthContext();
  const { isOpenNow, toggleStore, loading: storeLoading, settings } = useStore();
  const { showToast } = useToast();
  const location = useLocation();
  const [dark, setDark] = useState(() => localStorage.getItem('admin-dark') === 'true');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('admin-dark', String(dark));
  }, [dark]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">Cargando...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
      <aside className="w-64 bg-white dark:bg-gray-900 shadow-md dark:shadow-gray-800 flex flex-col border-r border-gray-200 dark:border-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-blue-900 dark:text-blue-400">Admin WHC</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.nombre_persona}</p>
          </div>
          <button
            onClick={() => setDark(d => !d)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition"
            title={dark ? 'Modo claro' : 'Modo oscuro'}
          >
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tienda</span>
            </div>
            <button
              onClick={async () => {
                const result = await toggleStore()
                if (result.success) {
                  showToast(`Tienda ${settings?.is_open ? 'abierta' : 'cerrada'}`, 'success')
                } else {
                  showToast(result.error || 'Error al cambiar estado', 'error')
                }
              }}
              disabled={storeLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings?.is_open ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings?.is_open ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <p className={`text-xs mt-1 px-3 ${settings?.is_open ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {settings?.is_open ? 'Abierto' : 'Cerrado'}
          </p>
          <p className={`text-[10px] mt-0.5 px-3 ${isOpenNow ? 'text-green-500' : 'text-gray-400'}`}>
            {isOpenNow ? 'En horario de atencion' : 'Fuera de horario'}
          </p>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
          >
            <LayoutDashboard className="w-5 h-5" />
            Ver tienda
          </Link>
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg w-full"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
