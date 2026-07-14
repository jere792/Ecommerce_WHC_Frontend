import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import type { CategoriaProducto } from "../../lib/supabaseTypes";
import { ChevronDown, ChevronRight, Grid3X3 } from "lucide-react";

export function CategoryNav() {
  const [categories, setCategories] = useState<CategoriaProducto[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from("categoria_productos")
      .select("*")
      .order("id_categoria_producto")
      .then(({ data }) => { if (data) setCategories(data as CategoriaProducto[]); });
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const [expandedSubs, setExpandedSubs] = useState<Set<number>>(new Set());

  const toggleSub = (id: number) => {
    setExpandedSubs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const roots = categories
    .filter(c => !c.pk_categoria_padre)
    .sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999));

  const getChildren = (parentId: number) =>
    categories
      .filter(c => c.pk_categoria_padre === parentId)
      .sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999));

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-sm hidden md:block">
      <div className="max-w-7xl mx-auto flex items-center px-4">
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            onMouseEnter={() => setIsOpen(true)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-colors ${
              isOpen
                ? "bg-blue-900 text-white"
                : "bg-blue-900 text-white hover:bg-blue-800"
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            Productos
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isOpen && (
            <div
              className="absolute left-0 top-full bg-white shadow-xl border border-gray-200 rounded-b-xl z-50 py-5 px-6"
              onMouseLeave={() => setIsOpen(false)}
              style={{ width: "900px", maxHeight: "80vh", overflowY: "auto" }}
            >
              <div className="grid grid-cols-3 gap-x-8 gap-y-6">
                {roots.map((cat) => {
                  const children = getChildren(cat.id_categoria_producto);
                  return (
                    <div key={cat.id_categoria_producto}>
                      <Link
                        to={`/productos?categoria=${cat.id_categoria_producto}`}
                        onClick={() => setIsOpen(false)}
                        className="block text-sm font-bold text-blue-900 border-b border-blue-100 pb-1.5 mb-2 hover:text-blue-700"
                      >
                        {cat.nombre_categoria_producto}
                      </Link>
                      {children.length > 0 && children.map(sub => {
                        const grandchildren = getChildren(sub.id_categoria_producto);
                        const isExpanded = expandedSubs.has(sub.id_categoria_producto);
                        return (
                          <div key={sub.id_categoria_producto} className="mb-1">
                            <div className="flex items-center gap-1">
                              {grandchildren.length > 0 ? (
                                <button
                                  onClick={() => toggleSub(sub.id_categoria_producto)}
                                  className="p-1 text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded shrink-0"
                                >
                                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                </button>
                              ) : (
                                <span className="w-6 shrink-0" />
                              )}
                              <Link
                                to={`/productos?categoria=${sub.id_categoria_producto}`}
                                onClick={() => setIsOpen(false)}
                                className="text-sm text-gray-600 hover:text-blue-700"
                              >
                                {sub.nombre_categoria_producto}
                              </Link>
                            </div>
                            {grandchildren.length > 0 && isExpanded && (
                              <div className="ml-4 mt-0.5 space-y-0.5">
                                {grandchildren.map(subsub => (
                                  <Link
                                    key={subsub.id_categoria_producto}
                                    to={`/productos?categoria=${subsub.id_categoria_producto}`}
                                    onClick={() => setIsOpen(false)}
                                    className="block text-xs text-gray-400 hover:text-blue-600 py-0.5"
                                  >
                                    {subsub.nombre_categoria_producto}
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
              </div>
              <div className="border-t border-gray-100 mt-4 pt-3">
                <Link
                  to="/productos"
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-semibold text-blue-700 hover:text-blue-500"
                >
                  Ver todos los productos →
                </Link>
              </div>
            </div>
          )}
        </div>
        <Link
          to="/inicio"
          className="px-5 py-3 text-sm font-bold text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-colors ml-auto"
        >
          Inicio
        </Link>

        <Link
          to="/contacto"
          className="px-5 py-3 text-sm font-bold text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-colors ml-auto"
        >
          Contacto
        </Link>
      </div>
    </div>
  );
}
