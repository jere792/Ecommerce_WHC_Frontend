import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartContext";

interface ProductCardProps {
  id: number;
  nombre: string;
  descripcion: string;
  imagen?: string;
  slug: string;
  precio: number;
  precioOriginal?: number;
  stock?: number;
  categoria?: string;
}

export default function ProductCard({
  id,
  nombre,
  descripcion,
  imagen,
  slug,
  precio,
  precioOriginal,
  stock,
  categoria,
}: ProductCardProps) {
  const navigate = useNavigate();
  const { addItem, items } = useCart();

  const handleCardClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const target = e.target as HTMLElement;
    if (target.closest(".add-to-cart-btn")) return;
    navigate(`/productos/${slug}`);
  };

  const cartItem = items.find(
    item => item.id === id.toString()
  );
  const cantidadEnCarrito = cartItem?.quantity ?? 0;
  const stockDisponible = typeof stock === "number" ? stock : 0;

  const handleAddToCart = () => {
    if (typeof id !== "number" || isNaN(id)) {
      alert("ID de producto no válido. No se puede agregar al carrito.");
      return;
    }
    if (stockDisponible === 0) {
      alert("Producto sin stock.");
      return;
    }
    if (cantidadEnCarrito >= stockDisponible) {
      alert("Ya tienes el máximo disponible de este producto en el carrito.");
      return;
    }
    addItem({
      id: id.toString(),      // string único para la UI
      productId: id,          // numérico para el backend
      name: nombre,
      price: precio,
      quantity: 1,
      image: imagen,
      stock: stockDisponible,
      description: descripcion,
    });
  };

  return (
    <div
      className="
        bg-white shadow-md border border-blue-100
        transition-transform hover:scale-105 hover:shadow-xl cursor-pointer
        w-full flex flex-col
        mx-auto
      "
      onClick={handleCardClick}
      tabIndex={0}
      role="button"
      aria-label={`Ver detalle de ${nombre}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") navigate(`/productos/${slug}`);
      }}
    >
      <div className="h-48 sm:h-56 w-full flex items-center justify-center bg-white p-3">
        {imagen ? (
          <img
            src={imagen}
            alt={nombre}
            className="object-contain h-full w-full"
            loading="lazy"
            onError={e => { e.currentTarget.src = ""; }}
          />
        ) : (
          <span className="text-blue-200">Sin imagen</span>
        )}
      </div>
      <div className="px-3 sm:px-4 py-2 sm:py-3 flex flex-col gap-1">
        {categoria && (
          <span className="text-[10px] sm:text-xs font-medium text-blue-500 uppercase tracking-wider">{categoria}</span>
        )}
        <h4 className="text-blue-800 font-bold text-sm sm:text-base truncate">{nombre}</h4>
        {precioOriginal && precioOriginal !== precio ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-red-100 text-red-700 font-bold px-2 sm:px-3 py-0.5 text-xs sm:text-sm shadow">
              S/. {precio.toFixed(2)}
            </span>
            <span className="text-gray-400 line-through text-xs">
              S/. {precioOriginal.toFixed(2)}
            </span>
          </div>
        ) : (
          <span className="bg-blue-100 text-blue-800 font-semibold px-2 sm:px-3 py-0.5 text-xs sm:text-sm shadow w-fit">
            S/. {precio.toFixed(2)}
          </span>
        )}
        <div className="flex justify-end mt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            className="
              add-to-cart-btn flex items-center justify-center
              border border-green-500 bg-white
              hover:bg-green-100 active:bg-green-200
              transition-all duration-150
              shadow-sm p-0 w-8 h-8 sm:w-10 sm:h-10
              focus:outline-none focus:ring-2 focus:ring-green-300
              group
            "
            title="Añadir al carrito"
            tabIndex={0}
            aria-label="Añadir al carrito"
            disabled={stockDisponible === 0 || cantidadEnCarrito >= stockDisponible}
          >
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 group-hover:text-green-700 transition" />
          </button>
        </div>
      </div>
    </div>
  );
}