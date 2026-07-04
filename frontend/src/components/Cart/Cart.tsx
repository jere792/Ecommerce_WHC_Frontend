import { useCart } from "../ui/CartContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuthContext } from "../../hooks/AuthContext";
import { useStore } from "../../contexts/StoreContext";
import { ShoppingCart, Trash2, Minus, Plus, ArrowLeft, Phone } from "lucide-react";

export function Cart() {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuthContext();
  const { settings } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const whatsappNumber = settings?.company_whatsapp || '51949790715';

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;
    updateQuantity(id, quantity);
  };

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleCheckout = async () => {
    if (items.length === 0) return;

    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
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
        `*Total: S/${total.toFixed(2)}*`,
      ].join("\n");

      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`;

      const extraId = 1;
      const metodoPagoId = 2;

      const { data: pedido } = await supabase
        .from("pedido")
        .insert({
          pk_usuario: user.id_usuario,
          pk_extra: extraId,
          pk_metodopago: metodoPagoId,
          estado_pago: "pendiente",
          monto_total: total,
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/productos')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Seguir comprando
      </button>

      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="w-6 h-6 text-gray-700" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Carrito de compras</h2>
          <p className="text-sm text-gray-500">{totalItems} {totalItems === 1 ? "producto" : "productos"} en tu carrito</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-gray-50">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">Tu carrito está vacío</p>
          <p className="text-gray-400 text-sm mb-6">Agrega productos desde nuestro catálogo</p>
          <button onClick={() => navigate('/productos')} className="px-6 py-2.5 bg-gray-900 text-white hover:bg-black transition text-sm font-medium">
            Ver productos
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 p-4 flex gap-4 shadow-sm">
                <div className="w-20 h-20 bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <ShoppingCart className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                    <button onClick={() => removeItem(item.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-bold text-gray-900 mt-1">S/ {item.price.toFixed(2)}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-xs text-gray-500">Cant:</span>
                    <div className="flex items-center border border-gray-300">
                      <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-100 transition">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-4 py-1.5 text-sm font-medium text-gray-800 border-x border-gray-300 min-w-[40px] text-center">
                        {item.quantity}
                      </span>
                      <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-100 transition"
                        disabled={item.quantity >= (item.stock ?? 99)}>
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
            <div className="bg-white border border-gray-200 p-6 shadow-sm sticky top-28">
              <h3 className="font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">Resumen</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Productos ({totalItems} und.)</span>
                  <span className="font-medium">S/ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Envío</span>
                  <span className="text-green-600 font-medium">Gratis</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Total</span>
                  <span className="text-xl font-bold text-gray-900">S/ {total.toFixed(2)}</span>
                </div>
              </div>
              {!user && (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 mt-3">
                  Inicia sesión para confirmar tu compra
                </p>
              )}
              <button
                className="w-full mt-5 py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={loading || items.length === 0}
                onClick={handleCheckout}
              >
                {loading ? 'Procesando...' : (
                  <>
                    <Phone className="w-4 h-4" />
                    {user ? 'Confirmar por WhatsApp' : 'Iniciar sesión para comprar'}
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
