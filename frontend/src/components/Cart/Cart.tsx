import { useCart } from "../ui/CartContext";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuthContext } from "../../hooks/AuthContext";
import { useStore } from "../../contexts/StoreContext";
import { ShoppingCart, Trash2, Minus, Plus, Check } from "lucide-react";

export function Cart() {
  const { items, updateQuantity, removeItem } = useCart();
  const { user } = useAuthContext();
  const { settings } = useStore();
  const [loading, setLoading] = useState(false);
  const [extraServicio, setExtraServicio] = useState<number>(1);
  const whatsappNumber = settings?.company_whatsapp || '51949790715';

  const handleQuantityChange = (id: string, quantity: number) => {
    updateQuantity(id, quantity);
  };

  const totalProductos = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const extraServiciosCatalogo = [
    { id: 1, nombre: "Sin servicio extra", costo: 0.0 },
    { id: 2, nombre: "Instalación", costo: 50.0 },
    { id: 3, nombre: "Mantenimiento", costo: 30.0 },
    { id: 4, nombre: "Garantía extendida", costo: 25.0 },
  ];
  const costoExtra =
    extraServiciosCatalogo.find((e) => e.id === extraServicio)?.costo ?? 0;
  const totalGeneral = totalProductos + costoExtra;

  const handleCheckout = async () => {
    if (items.length === 0 || !user) {
      alert("Debes tener productos en el carrito y estar logueado.");
      return;
    }

    if (items.some((item) => !item.productId || isNaN(item.productId))) {
      alert("Hay productos con datos inválidos en el carrito.");
      return;
    }

    setLoading(true);

    try {
      const servicioExtra = extraServiciosCatalogo.find((e) => e.id === extraServicio);
      const itemsText = items
        .map((item) => `${item.quantity}x ${item.name} - S/${(item.price * item.quantity).toFixed(2)}`)
        .join("\n");

      const mensaje = [
        `*Nuevo Pedido - ${user.nombre_persona}*`,
        `*Cliente:* ${user.correo_persona}`,
        ``,
        `*Productos:*`,
        itemsText,
        ``,
        servicioExtra && servicioExtra.id !== 1
          ? `*Servicio extra:* ${servicioExtra.nombre} (S/${servicioExtra.costo.toFixed(2)})`
          : "",
        ``,
        `*Total: S/${totalGeneral.toFixed(2)}*`,
      ]
        .filter(Boolean)
        .join("\n");

      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`;

      const extraId = extraServicio;
      const metodoPagoId = 2;

      const { data: pedido } = await supabase
        .from("pedido")
        .insert({
          pk_usuario: user.id_usuario,
          pk_extra: extraId,
          pk_metodopago: metodoPagoId,
          estado_pago: "pendiente",
          monto_total: totalGeneral,
        })
        .select()
        .single();

      if (pedido) {
        const detalles = items.map((item) => ({
          pk_pedido: pedido.id_pedido,
          pk_producto_pedido: item.productId,
          cantidad_pedido: item.quantity,
        }));

        await supabase.from("pedidodetalles").insert(detalles);

        await supabase.from("pedido_estado_pago").insert({
          pk_pedido: pedido.id_pedido,
          estado: "pendiente",
          comentario: "Pedido creado - pendiente de pago",
        });
      }

      window.open(whatsappUrl, "_blank");
    } catch (error) {
      alert("Ocurrió un error al procesar el pedido.\n" + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-100 p-2.5 rounded-xl">
          <ShoppingCart className="w-6 h-6 text-blue-700" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Carrito de compras</h2>
          <p className="text-sm text-gray-500">
            {items.length} {items.length === 1 ? "producto" : "productos"} en tu carrito
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Tu carrito está vacío</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-100 rounded-xl p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 bg-gray-100 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                      {item.brand && (
                        <p className="text-xs text-gray-400">{item.brand}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 p-1"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-bold text-blue-700 text-lg">
                      S/ {item.price.toFixed(2)}
                    </span>
                    {item.originalPrice && (
                      <span className="line-through text-gray-400 text-sm">
                        S/ {item.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-xs text-gray-500">Cant:</span>
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                        className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-100 transition rounded-l-lg"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-4 py-1.5 text-sm font-medium text-gray-800 border-x border-gray-200 min-w-[40px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-100 transition rounded-r-lg"
                        disabled={item.quantity >= (item.stock ?? 99)}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500 ml-auto font-medium">
                      S/ {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full lg:w-80">
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm sticky top-28">
              <h3 className="font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">
                Resumen de compra
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Productos ({items.reduce((acc, item) => acc + item.quantity, 0)} und.)
                  </span>
                  <span className="font-medium text-gray-800">S/ {totalProductos.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Envío a Lima</span>
                  <span className="text-green-600 font-medium">Gratis</span>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <label className="block text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
                    Servicio extra
                  </label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
                    value={extraServicio}
                    onChange={(e) => setExtraServicio(Number(e.target.value))}
                  >
                    {extraServiciosCatalogo.map((serv) => (
                      <option key={serv.id} value={serv.id}>
                        {serv.nombre}
                        {serv.costo > 0 ? ` (+S/ ${serv.costo.toFixed(2)})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {costoExtra > 0 && (
                  <div className="flex justify-between text-sm pt-2">
                    <span className="text-gray-500">Costo extra</span>
                    <span className="font-medium">S/ {costoExtra.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Total</span>
                  <span className="text-xl font-bold text-blue-700">S/ {totalGeneral.toFixed(2)}</span>
                </div>
              </div>

              <button
                className="w-full mt-5 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || items.length === 0}
                onClick={handleCheckout}
              >
                {loading ? (
                  <span>Procesando...</span>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Confirmar Compra
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                Te contactaremos para coordinar el pago y envío
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
