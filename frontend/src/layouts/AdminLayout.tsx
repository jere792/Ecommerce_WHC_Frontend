import { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../hooks/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, Users, FileText, Tags, Activity, List, BookMarked, Image, SlidersHorizontal, LogOut, Moon, Sun, Menu, X, ChevronLeft } from 'lucide-react';

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
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('admin-dark', String(dark));
    return () => document.documentElement.classList.remove('dark');
  }, [dark]);

  const handleNavClick = () => {
    if (window.innerWidth < 1024) setSidebarOpen(false)
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-background text-foreground">Cargando...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-muted dark:bg-background transition-colors duration-300">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="hidden lg:flex fixed left-4 top-4 z-50 p-2 bg-background border border-border rounded-lg hover:bg-muted text-muted-foreground shadow-sm transition"
          title="Abrir sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      <aside className={`
        bg-background shadow-md flex flex-col border-r border-border
        fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
        lg:relative lg:z-0 lg:transition-none lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarOpen ? '' : 'lg:hidden'}
      `}>
        <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-primary truncate">Admin WHC</h1>
            <p className="text-sm text-muted-foreground truncate">{user.nombre_persona}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                document.documentElement.classList.add('theme-transition');
                setDark(d => !d);
                setTimeout(() => document.documentElement.classList.remove('theme-transition'), 300);
              }}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition shrink-0"
              title={dark ? 'Modo claro' : 'Modo oscuro'}
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition shrink-0"
              title="Cerrar sidebar"
            >
              <ChevronLeft className="w-5 h-5 hidden lg:block" />
              <X className="w-5 h-5 lg:hidden" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-1 shrink-0">
          <Link
            to="/"
            onClick={handleNavClick}
            className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg"
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            <span className="truncate">Ver tienda</span>
          </Link>
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg w-full"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="truncate">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen overflow-auto">
        <div className="sticky top-0 z-20 bg-background border-b border-border p-3 flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition"
            title="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-primary">Admin WHC</h1>
        </div>

        <div className="flex-1 p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
