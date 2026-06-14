import { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../hooks/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, Users, FileText, Tags, Activity, List, BookMarked, Image, SlidersHorizontal, LogOut, Moon, Sun } from 'lucide-react';

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
