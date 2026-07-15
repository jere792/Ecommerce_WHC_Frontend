import React, { useState, useEffect, useRef } from "react";
import { ShoppingCart, Search, Menu, X, ChevronDown, ChevronRight, Grid3X3, Phone, Clock, User, LogOut, Shield, Package } from "lucide-react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../ui/CartContext';
import { ShoppingCartModal } from './ShoppingCartModal';
import { useAuthContext } from '../../hooks/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import { supabase } from "../../lib/supabaseClient";
import type { CategoriaProducto } from "../../lib/supabaseTypes";

function getRoots(cats: CategoriaProducto[]): CategoriaProducto[] {
  return cats
    .filter(c => !c.pk_categoria_padre)
    .sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999));
}

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, logout } = useAuthContext();
  const { settings } = useStore();
  const { items } = useCart();
  const [searchText, setSearchText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState<CategoriaProducto[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [expandedSubs, setExpandedSubs] = useState<Set<number>>(new Set());
  const catMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const companyName = settings?.nombre_empresa || 'WHC Representaciones';

  useEffect(() => {
    supabase.from("categoria_productos").select("*").order("orden", { ascending: true, nullsFirst: false })
      .then(({ data }) => { if (data) setCategories(data as CategoriaProducto[]); });
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (catMenuRef.current && !catMenuRef.current.contains(e.target as Node)) {
        setCategoriesOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setIsOpen(false); }, [location]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchText.trim().length > 0) {
      navigate(`/productos?search=${encodeURIComponent(searchText.trim())}`);
      setSearchText("");
      setIsOpen(false);
    }
  };

  const toggleSub = (id: number) => {
    setExpandedSubs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const roots = getRoots(categories);
  const phone = settings?.telefono_empresa || '(+51) 949790715';

  return (
    <>
      <div className="hidden lg:block bg-gray-900 text-gray-300 text-xs">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href={`tel:${phone}`} className="flex items-center gap-1.5 hover:text-white transition">
              <Phone className="w-3 h-3" /> {phone}
            </a>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> {settings?.horario_empresa || 'Lun - Vie: 9:00 a.m. - 6:00 p.m.'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/terminos" className="hover:text-white transition">Términos</Link>
            <Link to="/privacidad" className="hover:text-white transition">Privacidad</Link>
            <Link to="/libro" className="hover:text-white transition">Reclamaciones</Link>
          </div>
        </div>
      </div>

      <header className={`w-full bg-white sticky top-0 z-50 transition-shadow duration-300 ${isScrolled ? "shadow-lg" : "shadow-sm"}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
            <Link to="/inicio" className="flex items-center gap-2 shrink-0">
              <img src="/logo.png" className="h-10 lg:h-12 w-auto" alt="Logo" />
            </Link>

            <div className="hidden md:flex flex-1 max-w-xl mx-4">
              <form onSubmit={handleSearchSubmit} className="w-full relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 text-sm border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 transition"
                />
                <button type="submit" className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-blue-600">
                  <Search className="w-5 h-5" />
                </button>
              </form>
            </div>

            <div className="flex items-center gap-1 sm:gap-3">
              <div ref={userMenuRef} className="relative">
                {user ? (
                  <>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-1.5 p-2 hover:bg-gray-100 transition text-sm font-medium text-gray-700"
                    >
                      <User className="w-5 h-5" />
                      <span className="hidden sm:inline">{user.nombres}</span>
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white shadow-lg border border-gray-200 z-50 py-1">
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                            <Shield className="w-4 h-4" /> Panel admin
                          </Link>
                        )}
                        <Link to="/mis-pedidos" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                          <Package className="w-4 h-4" /> Mis pedidos
                        </Link>
                        <button onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition">
                          <LogOut className="w-4 h-4" /> Cerrar sesión
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link to="/login" className="flex items-center gap-1.5 p-2 hover:bg-gray-100 transition text-sm font-medium text-gray-700">
                    <User className="w-5 h-5" />
                    <span className="hidden sm:inline">Ingresar</span>
                  </Link>
                )}
              </div>
              <button onClick={() => setIsCartOpen(true)} className="relative p-2 hover:bg-gray-100 transition">
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
              <button
                className="lg:hidden p-2 hover:bg-gray-100 transition"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        <nav className="hidden lg:block border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 flex items-center">
            <div ref={catMenuRef} className="relative">
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                onMouseEnter={() => setCategoriesOpen(true)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors ${
                  categoriesOpen ? "bg-blue-900 text-white" : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                Productos
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${categoriesOpen ? "rotate-180" : ""}`} />
              </button>

              {categoriesOpen && (
                <div
                  className="absolute left-0 top-full bg-white shadow-xl border border-gray-200 z-50 py-6 px-8 min-w-[700px]"
                  onMouseLeave={() => setCategoriesOpen(false)}
                >
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                    {roots.map((cat) => (
                      <div key={cat.id_categoria_producto}>
                        <Link
                          to={`/productos?categoria=${cat.id_categoria_producto}`}
                          onClick={() => setCategoriesOpen(false)}
                          className="block text-sm font-bold text-blue-900 border-b border-blue-100 pb-2 mb-3 hover:text-blue-700"
                        >
                          {cat.nombre_categoria_producto}
                        </Link>
                        {categories
                          .filter(c => c.pk_categoria_padre === cat.id_categoria_producto)
                          .sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999))
                          .map(sub => {
                            const grandchildren = categories
                              .filter(c => c.pk_categoria_padre === sub.id_categoria_producto)
                              .sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999));
                            const isExpanded = expandedSubs.has(sub.id_categoria_producto);
                            return (
                              <div key={sub.id_categoria_producto} className="mb-1">
                                <div className="flex items-center gap-1">
                                  {grandchildren.length > 0 ? (
                                    <button
                                      onClick={() => toggleSub(sub.id_categoria_producto)}
                                      className="p-0.5 text-gray-400 hover:text-blue-600 shrink-0"
                                    >
                                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                    </button>
                                  ) : (
                                    <span className="w-4 shrink-0" />
                                  )}
                                  <Link
                                    to={`/productos?categoria=${sub.id_categoria_producto}`}
                                    onClick={() => setCategoriesOpen(false)}
                                    className="text-sm text-gray-600 hover:text-blue-700"
                                  >
                                    {sub.nombre_categoria_producto}
                                  </Link>
                                </div>
                                {grandchildren.length > 0 && isExpanded && (
                                  <div className="ml-4 mt-0.5 space-y-0.5">
                                    {grandchildren.map(gg => (
                                      <Link
                                        key={gg.id_categoria_producto}
                                        to={`/productos?categoria=${gg.id_categoria_producto}`}
                                        onClick={() => setCategoriesOpen(false)}
                                        className="block text-xs text-gray-400 hover:text-blue-600 py-0.5"
                                      >
                                        {gg.nombre_categoria_producto}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 mt-5 pt-4">
                    <Link
                      to="/productos"
                      onClick={() => setCategoriesOpen(false)}
                      className="text-sm font-semibold text-blue-700 hover:text-blue-500"
                    >
                      Ver todos los productos →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link to="/inicio" className={`px-5 py-3 text-sm font-semibold transition-colors ${location.pathname === '/inicio' || location.pathname === '/' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:text-blue-700'}`}>
              Inicio
            </Link>
            <Link to="/productos" className={`px-5 py-3 text-sm font-semibold transition-colors ${location.pathname.startsWith('/productos') ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:text-blue-700'}`}>
              Catálogo
            </Link>
            <Link to="/contacto" className={`px-5 py-3 text-sm font-semibold transition-colors ${location.pathname === '/contacto' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:text-blue-700'}`}>
              Contacto
            </Link>
            <div className="ml-auto flex items-center gap-4">
              <Link to="/instalacion" className="text-sm text-gray-500 hover:text-blue-700 transition">Instalación</Link>
              <Link to="/mantenimiento" className="text-sm text-gray-500 hover:text-blue-700 transition">Mantenimiento</Link>
            </div>
          </div>
        </nav>

        {isOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-4 py-3">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 text-sm border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500"
                />
                <button type="submit" className="absolute right-0 top-0 h-full px-3 text-gray-400">
                  <Search className="w-5 h-5" />
                </button>
              </form>
            </div>

            <nav className="px-4 pb-4 space-y-1">
              <Link to="/inicio" className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Inicio</Link>
              <Link to="/productos" className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Catálogo</Link>

              <div className="border-t border-gray-100 my-1" />
              <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Categorías</p>
              {roots.map(cat => {
                const children = categories
                  .filter(c => c.pk_categoria_padre === cat.id_categoria_producto)
                  .sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999));
                return (
                  <div key={cat.id_categoria_producto}>
                    <Link
                      to={`/productos?categoria=${cat.id_categoria_producto}`}
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                      {cat.nombre_categoria_producto}
                    </Link>
                    {children.length > 0 && children.map(sub => {
                      const grandchildren = categories
                        .filter(c => c.pk_categoria_padre === sub.id_categoria_producto)
                        .sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999));
                      const isExpanded = expandedSubs.has(sub.id_categoria_producto);
                      return (
                        <div key={sub.id_categoria_producto}>
                          <div className="flex items-center pl-8 pr-3">
                            {grandchildren.length > 0 ? (
                              <button
                                onClick={() => toggleSub(sub.id_categoria_producto)}
                                className="p-1 text-gray-400 hover:text-blue-600 shrink-0"
                              >
                                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                              </button>
                            ) : (
                              <span className="w-5 shrink-0" />
                            )}
                            <Link
                              to={`/productos?categoria=${sub.id_categoria_producto}`}
                              onClick={() => setIsOpen(false)}
                              className="block py-2 text-sm text-gray-500 hover:text-blue-700 transition"
                            >
                              {sub.nombre_categoria_producto}
                            </Link>
                          </div>
                          {grandchildren.length > 0 && isExpanded && (
                            <div className="pl-12">
                              {grandchildren.map(gg => (
                                <Link
                                  key={gg.id_categoria_producto}
                                  to={`/productos?categoria=${gg.id_categoria_producto}`}
                                  onClick={() => setIsOpen(false)}
                                  className="block py-1.5 text-sm text-gray-400 hover:text-blue-600 transition"
                                >
                                  {gg.nombre_categoria_producto}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              <div className="border-t border-gray-100 my-2" />
              <Link to="/contacto" className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Contacto</Link>
              <Link to="/instalacion" className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Instalación</Link>
              <Link to="/mantenimiento" className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Mantenimiento</Link>

              <div className="border-t border-gray-100 my-2 pt-2">
                <p className="px-3 text-xs text-gray-500 flex items-center gap-1.5">
                  <Phone className="w-3 h-3" /> {phone}
                </p>
              </div>
            </nav>
          </div>
        )}
      </header>

      {isCartOpen && <ShoppingCartModal onClose={() => setIsCartOpen(false)} />}
    </>
  );
}
