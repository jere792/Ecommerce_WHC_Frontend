import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import type { CategoriaProducto } from "../../lib/supabaseTypes";
import { ChevronDown, Grid3X3 } from "lucide-react";

function buildTree(cats: CategoriaProducto[]): CategoriaProducto[] {
  const map = new Map<number, CategoriaProducto>();
  const roots: CategoriaProducto[] = [];
  cats.forEach((c) =>
    map.set(c.id_categoria_producto, { ...c, subcategorias: [] }),
  );
  cats.forEach((c) => {
    const node = map.get(c.id_categoria_producto)!;
    if (c.pk_categoria_padre && map.has(c.pk_categoria_padre)) {
      map.get(c.pk_categoria_padre)!.subcategorias!.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

export function CategoryNav() {
  const [categories, setCategories] = useState<CategoriaProducto[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from("categoria_p")
      .select("*")
      .order("id_categoria_producto")
      .then(({ data }) => {
        if (data) setCategories(data as CategoriaProducto[]);
      });
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

  const tree = buildTree(categories);

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
              style={{ width: "750px" }}
            >
              <div className="flex gap-10">
                {tree.map((cat) => (
                  <div
                    key={cat.id_categoria_producto}
                    className="flex-1 min-w-0"
                  >
                    <Link
                      to={`/productos?categoria=${cat.id_categoria_producto}`}
                      onClick={() => setIsOpen(false)}
                      className="block text-sm font-bold text-blue-900 border-b border-blue-100 pb-1.5 mb-3 hover:text-blue-700"
                    >
                      {cat.nombre_categoria_producto}
                    </Link>
                    {categories
                      .filter(
                        (c) =>
                          c.pk_categoria_padre === cat.id_categoria_producto,
                      )
                      .map((sub) => (
                        <div key={sub.id_categoria_producto} className="mb-2">
                          <Link
                            to={`/productos?categoria=${sub.id_categoria_producto}`}
                            onClick={() => setIsOpen(false)}
                            className="block text-sm font-medium text-gray-600 hover:text-blue-700"
                          >
                            {sub.nombre_categoria_producto}
                          </Link>
                          {categories
                            .filter(
                              (c) =>
                                c.pk_categoria_padre ===
                                sub.id_categoria_producto,
                            )
                            .map((subsub) => (
                              <Link
                                key={subsub.id_categoria_producto}
                                to={`/productos?categoria=${subsub.id_categoria_producto}`}
                                onClick={() => setIsOpen(false)}
                                className="block text-xs text-gray-400 hover:text-blue-600 ml-3 py-0.5"
                              >
                                {subsub.nombre_categoria_producto}
                              </Link>
                            ))}
                        </div>
                      ))}
                  </div>
                ))}
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
