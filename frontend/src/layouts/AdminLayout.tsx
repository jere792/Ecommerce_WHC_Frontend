import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthContext } from '../hooks/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { useToast } from '../components/ui/Toast';
import { LayoutDashboard, Package, ShoppingCart, Users, FileText, Tags, Activity, List, BookMarked, Image, LogOut, Moon, Sun, Menu, X, ChevronRight, Store, Building2, Plus } from 'lucide-react';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/productos', icon: Package, label: 'Productos' },
  { to: '/admin/categorias', icon: List, label: 'Categorías' },
  { to: '/admin/marcas', icon: BookMarked, label: 'Marcas' },
  { to: '/admin/hero-slides', icon: Image, label: 'Hero Slides' },
  { to: '/admin/page-hero', icon: Image, label: 'Hero páginas' },
  { to: '/admin/ventas', icon: ShoppingCart, label: 'Ventas' },
  { to: '/admin/ventas/nueva', icon: Plus, label: 'Generar venta' },
  { to: '/admin/usuarios', icon: Users, label: 'Usuarios' },
  { to: '/admin/formularios', icon: FileText, label: 'Formularios' },
  { to: '/admin/ofertas', icon: Tags, label: 'Ofertas' },
  { to: '/admin/movimientos', icon: Activity, label: 'Movimientos' },
  { to: '/admin/empresa', icon: Building2, label: 'Empresa' },
];

const breadcrumbLabels: Record<string, string> = {}
navItems.forEach((n) => { breadcrumbLabels[n.to] = n.label })

function Breadcrumbs() {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)
  const crumbs: { label: string; path: string }[] = []
  let built = ''

  for (let i = 0; i < segments.length; i++) {
    built += '/' + segments[i]
    if (breadcrumbLabels[built]) {
      crumbs.push({ label: breadcrumbLabels[built], path: built })
    } else if (segments[i] === 'admin') {
      crumbs.push({ label: 'Admin', path: '/admin' })
    } else {
      crumbs.push({ label: segments[i].charAt(0).toUpperCase() + segments[i].slice(1).replace(/-/g, ' '), path: built })
    }
  }

  if (crumbs.length <= 1) return null

  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-0 overflow-x-auto">
      {crumbs.map((cr, i) => {
        const isLast = i === crumbs.length - 1
        return (
          <span key={cr.path} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
            {isLast ? (
              <span className="text-foreground font-medium truncate">{cr.label}</span>
            ) : (
              <Link to={cr.path} className="hover:text-foreground transition truncate">{cr.label}</Link>
            )}
          </span>
        )
      })}
    </div>
  )
}

export default function AdminLayout() {
  const location = useLocation();
  const { logout } = useAuthContext();
  const { isOpenNow, toggleStore, loading: storeLoading, settings } = useStore();
  const { showToast } = useToast();
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

  return (
    <div className="flex min-h-screen bg-muted dark:bg-background transition-colors duration-300">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        bg-background shadow-md flex flex-col border-r border-border
        fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
        lg:sticky lg:top-0 lg:self-start lg:h-screen lg:z-0 lg:transition-none lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarOpen ? '' : 'lg:hidden'}
      `}>
        <div className="shrink-0">
          <div className="relative flex items-center justify-center px-4 py-3">
            <img src="/logo.png" alt="Logo" className="h-10 object-contain" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition lg:hidden"
              title="Cerrar sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <hr className="border-t border-border mx-3" />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={handleNavClick}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-2 border-t border-border shrink-0">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Tienda</span>
            </div>
            <button
              onClick={async () => {
                const result = await toggleStore()
                if (result.success) {
                  showToast(`Tienda ${settings?.esta_abierto ? 'abierta' : 'cerrada'}`, settings?.esta_abierto ? 'success' : 'error')
                } else {
                  showToast(result.error || 'Error al cambiar estado', 'error')
                }
              }}
              disabled={storeLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                settings?.esta_abierto ? 'bg-green-500' : 'bg-muted'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings?.esta_abierto ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <p className={`text-xs mt-1 px-3 ${settings?.esta_abierto ? 'text-green-600' : 'text-destructive'}`}>
            {settings?.esta_abierto ? 'Abierto' : 'Cerrado'}
          </p>
          <p className={`text-[10px] mt-0.5 px-3 ${isOpenNow ? 'text-green-500' : 'text-muted-foreground'}`}>
            {isOpenNow ? 'En horario de atención' : 'Fuera de horario'}
          </p>
        </div>

        <div className="px-3 py-3 border-t border-border shrink-0">
          <Link
            to="/inicio"
            onClick={handleNavClick}
            className="flex items-center gap-2.5 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted rounded-lg"
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span className="truncate">Ver tienda</span>
          </Link>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2.5 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-lg w-full"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="truncate">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen overflow-auto">
        <nav className="sticky top-0 z-20 bg-background border-b border-border">
          <div className="flex items-center justify-between h-14 px-4 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition shrink-0"
                title={sidebarOpen ? 'Cerrar sidebar' : 'Abrir sidebar'}
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-bold text-primary shrink-0 hidden sm:block">Admin WHC</h1>
              <div className="h-4 w-px bg-border shrink-0 hidden sm:block" />
              <Breadcrumbs />
            </div>

            <div className="flex items-center gap-2 shrink-0">
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
            </div>
          </div>
        </nav>

        <div className="flex-1 p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: location.pathname.split('/').length > 3 ? 0 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              transition={{ duration: location.pathname.split('/').length > 3 ? 0.15 : 0.25, ease: 'easeInOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
