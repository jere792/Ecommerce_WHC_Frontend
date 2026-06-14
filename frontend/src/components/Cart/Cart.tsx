import { useCart } from "../ui/CartContext";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuthContext } from "../../hooks/AuthContext";

const WHATSAPP_NUMBER = "51949790715";

export function Cart() {
  const { items, updateQuantity, removeItem } = useCart();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [extraServicio, setExtraServicio] = useState<number>(1);

  const [showDescriptions, setShowDescriptions] = useState<{
    [id: string]: boolean;
  }>({});

  const handleToggleDescription = (id: string) => {
    setShowDescriptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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

      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;

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
    <div className="max-w-4xl mx-auto p-4 md:p-1 bg-white">
      <h2 className="text-2xl font-bold mb-6">Carro de compras</h2>
      <div className="flex flex-col md:flex-row gap-6">
        <div
          className="flex-1 bg-white border rounded-x1 p-8 space-y-7"
          style={{ maxHeight: 520, overflowY: "auto" }}
        >
          {items.length === 0 && (
            <div className="text-gray-500">Tu carrito está vacío.</div>
          )}
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-10 border-b pb-6"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 bg-gray-200 rounded-md object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.brand}</p>
                <button
                  className="text-xs text-blue-700 underline mb-1"
                  onClick={() => handleToggleDescription(item.id)}
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  {showDescriptions[item.id]
                    ? "Ocultar descripción"
                    : "Ver descripción"}
                </button>
                {showDescriptions[item.id] && (
                  <p className="text-sm text-gray-600">{item.description}</p>
                )}
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <span className="font-semibold text-gray-800">
                    S/{item.price.toFixed(2)}
                  </span>
                  {item.originalPrice && (
                    <span className="line-through text-gray-400 text-xs">
                      S/{item.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <label className="text-sm mt-2 block">Cant</label>
                <select
                  className="border rounded px-2 py-1 mt-1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(item.id, Number(e.target.value))
                  }
                >
                  {[...Array(Math.min(item.stock ?? 10, 20)).keys()].map((n) => (
                    <option key={n + 1} value={n + 1}>
                      {n + 1}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="ml-4 text-red-500 hover:text-red-700 font-bold text-xl px-2"
                onClick={() => removeItem(item.id)}
                title="Eliminar producto"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="w-full md:w-80 bg-gray-100 rounded-xl p-4 h-fit">
          <div className="mb-2 flex justify-between">
            <span>
              Artículos ({items.reduce((acc, item) => acc + item.quantity, 0)})
            </span>
            <span className="font-semibold">
              S/ {totalProductos.toFixed(2)}
            </span>
          </div>
          <div className="mb-2 flex justify-between">
            <span>Envío a Lima</span>
            <span className="text-green-600 font-semibold">Gratis</span>
          </div>

          <div className="mb-6">
            <div className="flex flex-col mb-4">
              <label
                htmlFor="extraServicio"
                className="font-semibold mb-1 text-gray-700"
              >
                Servicio extra:
              </label>
              <select
                id="extraServicio"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white transition"
                value={extraServicio}
                onChange={(e) => setExtraServicio(Number(e.target.value))}
              >
                {extraServiciosCatalogo.map((serv) => (
                  <option key={serv.id} value={serv.id}>
                    {serv.nombre}{" "}
                    {serv.costo > 0 ? `(S/ ${serv.costo.toFixed(2)})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <hr className="my-2 border-gray-300" />
          <div className="flex justify-between font-semibold text-lg mb-4">
            <span>Total</span>
            <span>S/ {totalGeneral.toFixed(2)}</span>
          </div>

          <button
            className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg transition transform duration-300 hover:scale-[1.02] hover:shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || items.length === 0}
            onClick={handleCheckout}
          >
            {loading ? (
              <span>Procesando...</span>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Confirmar Compra por WhatsApp
              </>
            )}
          </button>

          <div className="flex justify-center items-center gap-4 mt-4 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
            <div className="text-xs text-gray-500 text-center">
              Te contactaremos para coordinar el pago y envío
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
