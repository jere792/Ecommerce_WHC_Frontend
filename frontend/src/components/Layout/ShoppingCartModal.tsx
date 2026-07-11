import React from 'react';
import { useCart } from '../ui/CartContext';
import { Link } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

interface ShoppingCartModalProps {
  onClose: () => void;
}

export const ShoppingCartModal: React.FC<ShoppingCartModalProps> = ({ onClose }) => {
  const { items, removeItem, updateQuantity } = useCart();
  const { settings } = useStore();
  const whatsappNumber = settings?.whatsapp_empresa || '51949790715';
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleWhatsAppConsult = () => {
    const itemsText = items
      .map(item => `${item.quantity}x ${item.name} - S/ ${(item.price * item.quantity).toFixed(2)}`)
      .join('\n');

    const mensaje = [
      `*Hola! Quiero consultar por los siguientes productos:*`,
      ``,
      itemsText,
      ``,
      `*Total: S/ ${total.toFixed(2)}*`,
    ].join('\n');

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-gray-700" />
            <div>
              <h2 className="text-lg font-bold text-gray-800">Carrito</h2>
              <p className="text-xs text-gray-400">{totalItems} {totalItems === 1 ? 'producto' : 'productos'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
            <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium mb-1">Tu carrito está vacío</p>
            <p className="text-xs text-gray-400 mb-6">Agrega productos para continuar</p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white font-medium transition text-sm"
            >
              Seguir comprando
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {items.map(item => (
                <li key={item.id} className="bg-gray-50 p-3 flex gap-3 group">
                  <div className="w-16 h-16 bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain"
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h6 className="text-sm font-semibold text-gray-800 truncate">{item.name}</h6>
                      <button onClick={() => removeItem(item.id)}
                        className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 flex-shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">
                      S/ {Number(item.price).toFixed(2)}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-300 bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition disabled:opacity-30"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 py-1 text-xs font-medium text-gray-700 border-x border-gray-300 min-w-[28px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs font-medium text-gray-500">
                        S/ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-gray-200 px-6 py-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total</span>
                <span className="text-lg font-bold text-gray-900">S/ {total.toFixed(2)}</span>
              </div>
              <button
                onClick={handleWhatsAppConsult}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 transition text-sm"
              >
                <FaWhatsapp className="w-4 h-4" /> Consultar por WhatsApp
              </button>
              <Link
                to="/cart"
                onClick={() => { onClose(); window.scrollTo({ top: 0, behavior: 'auto' }); }}
                className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2.5 transition text-sm"
              >
                Ver detalle <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
      <style>{`
        @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in { animation: slide-in 0.2s ease-out; }
      `}</style>
    </div>
  );
};
