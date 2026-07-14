import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import type {
  MarcaProducto,
  Producto,
  CategoriaProducto,
} from "../../lib/supabaseTypes";
import { Edit, Trash2, Package, AlertTriangle } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import FilterBar from "../../components/ui/FilterBar";
import DataTable, { type Column } from "../../components/ui/DataTable";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useToast } from "../../components/ui/Toast";

const PAGE_SIZE = 10;
const LOW_STOCK_THRESHOLD = 10;

type ViewMode = "all" | "lowStock";

export default function AdminProducts() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState<number>(0);
  const [categoryFilter, setCategoryFilter] = useState<number>(0);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState(1);
  const [view, setView] = useState<ViewMode>("all");
  const [page, setPage] = useState(1);
  const [brands, setBrands] = useState<MarcaProducto[]>([]);
  const [categories, setCategories] = useState<CategoriaProducto[]>([]);
  const navigate = useNavigate();

  const maxPrice = useMemo(
    () =>
      products.length > 0
        ? Math.max(...products.map((p) => Number(p.precio_producto)))
        : 1000,
    [products],
  );

  useEffect(() => {
    Promise.all([
      supabase
        .from("producto")
        .select(
          "*, categoria:pk_categoria_producto(*), marca:pk_marca_producto(*), inventario:inventario!pk_producto!left(*)",
        )
        .order("id_producto", { ascending: false }),
      supabase
        .from("marca_producto")
        .select("*")
        .order("nombre_marca_producto"),
      supabase
        .from("categoria_producto")
        .select("*")
        .order("nombre_categoria_producto"),
    ]).then(([prodRes, brandRes, catRes]) => {
      if (prodRes.data) setProducts(prodRes.data as unknown as Producto[]);
      if (brandRes.data) setBrands(brandRes.data as MarcaProducto[]);
      if (catRes.data) setCategories(catRes.data as CategoriaProducto[]);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let result = products;

    if (search.length >= 3) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.nombre_producto.toLowerCase().includes(q),
      );
    }

    if (brandFilter) {
      result = result.filter((p) => p.pk_marca_producto === brandFilter);
    }

    if (categoryFilter) {
      result = result.filter((p) => p.pk_categoria_producto === categoryFilter);
    }

    if (priceMin !== "" && Number(priceMin) > 0) {
      result = result.filter(
        (p) => Number(p.precio_producto) >= Number(priceMin),
      );
    }

    if (priceMax !== "" && Number(priceMax) < maxPrice) {
      result = result.filter(
        (p) => Number(p.precio_producto) <= Number(priceMax),
      );
    }

    if (estadoFiltro === 1) {
      result = result.filter((p) => p.estado === "activo");
    } else if (estadoFiltro === 2) {
      result = result.filter((p) => p.estado === "inactivo");
    }

    if (view === "lowStock") {
      result = result.filter(
        (p) => (p.inventario?.stock_actual ?? 0) <= LOW_STOCK_THRESHOLD,
      );
    }

    return result;
  }, [
    products,
    search,
    brandFilter,
    categoryFilter,
    priceMin,
    priceMax,
    view,
    estadoFiltro,
  ]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmProduct, setConfirmProduct] = useState<Producto | null>(null);
  const { showToast } = useToast();

  const handleToggleEstado = async () => {
    if (!confirmProduct) return;
    const newEstado =
      confirmProduct.estado === "activo" ? "inactivo" : "activo";
    const { error } = await supabase
      .from("producto")
      .update({ estado: newEstado })
      .eq("id_producto", confirmProduct.id_producto);
    if (error) {
      showToast("Error al cambiar estado: " + error.message, "error");
    } else {
      setProducts((prev) =>
        prev.map((p) =>
          p.id_producto === confirmProduct.id_producto
            ? { ...p, estado: newEstado }
            : p,
        ),
      );
      showToast(
        `Producto ${newEstado === "activo" ? "activado" : "inactivado"} correctamente`,
        "success",
      );
    }
    setConfirmOpen(false);
    setConfirmProduct(null);
  };

  useEffect(() => {
    setPage(1);
  }, [search, brandFilter, categoryFilter, priceMin, priceMax, view]);

  const columns: Column<Producto>[] = [
    {
      header: "Imagen",
      width: "100px",
      render: (p) =>
        p.imagen_producto ? (
          <img
            src={p.imagen_producto}
            alt=""
            className="h-10 w-10 object-cover rounded border"
          />
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        ),
    },
    {
      header: "Nombre",
      render: (p) => (
        <span className="font-medium text-foreground truncate block">
          {p.nombre_producto}
        </span>
      ),
    },
    {
      header: "Marca",
      width: "120px",
      render: (p) => p.marca?.nombre_marca_producto || "-",
    },
    {
      header: "Precio venta",
      width: "120px",
      align: "right",
      render: (p) => `S/${Number(p.precio_producto).toFixed(2)}`,
    },
    {
      header: "Stock",
      width: "120px",
      align: "center",
      render: (p) => (
        <span
          className={`font-medium ${
            (p.inventario?.stock_actual ?? 0) <= LOW_STOCK_THRESHOLD
              ? "text-destructive"
              : "text-foreground"
          }`}
        >
          {p.inventario?.stock_actual ?? 0}
        </span>
      ),
    },
    {
      header: "Categoria",
      width: "150px",
      render: (p) => p.categoria?.nombre_categoria_producto || "-",
    },
    {
      header: "Estado",
      width: "120px",
      align: "center",
      render: (p) => {
        const colors: Record<string, string> = {
          activo:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
          inactivo:
            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        };
        return (
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[p.estado] || "bg-muted text-muted-foreground"}`}
          >
            {p.estado}
          </span>
        );
      },
    },
    {
      header: "Destacado",
      width: "120px",
      align: "center",
      render: (p) =>
        p.destacado ? (
          <span className="text-yellow-500 text-lg">★</span>
        ) : (
          <span className="text-muted-foreground/30 text-lg">☆</span>
        ),
    },
    {
      header: "Nuevo",
      width: "120px",
      align: "center",
      render: (p) =>
        p.nuevo ? (
          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            Nuevo
          </span>
        ) : null,
    },
    {
      header: "Acciones",
      width: "100px",
      align: "right",
      render: (p) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => navigate(`/admin/productos/editar/${p.slug}`)}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setConfirmProduct(p);
              setConfirmOpen(true);
            }}
            className={`p-1.5 rounded-md transition-colors ${
              p.estado === "activo"
                ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                : "text-muted-foreground hover:bg-green-500/10 hover:text-green-600"
            }`}
            title={p.estado === "activo" ? "Inactivar" : "Activar"}
          >
            {p.estado === "activo" ? (
              <Trash2 className="w-4 h-4" />
            ) : (
              <Package className="w-4 h-4" />
            )}
          </button>
        </div>
      ),
    },
  ];

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] text-muted-foreground">
        Cargando...
      </div>
    );

  return (
    <div>
      <PageHeader
        title="Productos"
        description="Gestiona los productos de tu tienda"
        icon={<Package className="w-5 h-5" />}
        buttonLabel="Agregar producto"
        buttonTo="/admin/productos/nuevo"
      />

      <FilterBar
        title="productos"
        onClear={() => {
          setSearch("");
          setBrandFilter(0);
          setCategoryFilter(0);
          setPriceMin("");
          setPriceMax("");
          setEstadoFiltro(1);
        }}
        fields={[
          {
            type: "search",
            label: "Buscar producto",
            value: search,
            onChange: setSearch,
            placeholder: "Buscar por nombre...",
          },
          {
            type: "range",
            label: "Rango de precio",
            min: priceMin,
            max: priceMax,
            onMinChange: setPriceMin,
            onMaxChange: setPriceMax,
            minLimit: 0,
            maxLimit: maxPrice,
          },
        ]}
        fields2={[
          {
            type: "select",
            label: "Categoría",
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { value: 0, label: "Todas las categorías" },
              ...categories.map((c) => ({
                value: c.id_categoria_producto,
                label: c.nombre_categoria_producto,
              })),
            ],
          },
          {
            type: "select",
            label: "Marca",
            value: brandFilter,
            onChange: setBrandFilter,
            options: [
              { value: 0, label: "Todas las marcas" },
              ...brands.map((b) => ({
                value: b.id_marca_producto,
                label: b.nombre_marca_producto,
              })),
            ],
          },
          {
            type: "select",
            label: "Estado",
            value: estadoFiltro,
            onChange: setEstadoFiltro,
            options: [
              { value: 1, label: "Activo" },
              { value: 2, label: "Inactivo" },
              { value: 0, label: "Todos" },
            ],
          },
        ]}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="relative flex items-center bg-muted rounded-lg p-0.5 w-fit">
          <button
            onClick={() => setView("all")}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-all duration-200 z-10 ${
              view === "all"
                ? "text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package className="w-4 h-4" />
            Listado normal
          </button>
          <button
            onClick={() => setView("lowStock")}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-all duration-200 z-10 ${
              view === "lowStock"
                ? "text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Stock bajo (&le;{LOW_STOCK_THRESHOLD})
          </button>
          <div
            className={`absolute top-0.5 bottom-0.5 rounded-md transition-all duration-200 ${
              view === "all"
                ? "bg-primary left-0.5 right-1/2"
                : "bg-destructive left-1/2 right-0.5"
            }`}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginated}
        keyExtractor={(p) => p.id_producto}
        emptyMessage="No se encontraron productos"
      />

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 p-3 border border-border rounded-lg bg-background">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm rounded border border-border bg-background disabled:opacity-30 hover:bg-muted text-foreground transition-colors"
          >
            &lt; Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                p === page
                  ? "bg-primary text-white border-primary"
                  : "border-border bg-background hover:bg-muted text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm rounded border border-border bg-background disabled:opacity-30 hover:bg-muted text-foreground transition-colors"
          >
            Siguiente &gt;
          </button>
        </div>
      )}
      <ConfirmDialog
        open={confirmOpen}
        title={
          confirmProduct?.estado === "activo"
            ? "Inactivar producto"
            : "Activar producto"
        }
        message={
          confirmProduct?.estado === "activo"
            ? `¿Inactivar "${confirmProduct?.nombre_producto}"?`
            : `¿Activar "${confirmProduct?.nombre_producto}"?`
        }
        confirmText={
          confirmProduct?.estado === "activo" ? "Inactivar" : "Activar"
        }
        variant={
          confirmProduct?.estado === "activo" ? "destructive" : "primary"
        }
        onConfirm={handleToggleEstado}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmProduct(null);
        }}
      />
    </div>
  );
}
