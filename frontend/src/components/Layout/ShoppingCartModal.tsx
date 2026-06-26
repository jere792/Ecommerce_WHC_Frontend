import React from 'react';
import { useCart } from '../ui/CartContext';
import { Link } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

interface ShoppingCartModalProps {
  onClose: () => void;
}

export const ShoppingCartModal: React.FC<ShoppingCartModalProps> = ({ onClose }) => {
  const { items, removeItem, updateQuantity } = useCart();
  const calculateTotal = () => items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div
        className="w-full max-w-md bg-white shadow-2xl flex flex-col"
        style={{ margin: 0 }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Carrito</h2>
              <p className="text-xs text-gray-400">
                {items.length} {items.length === 1 ? 'producto' : 'productos'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium mb-1">Tu carrito está vacío</p>
            <p className="text-xs text-gray-400 mb-6">Agrega productos para continuar</p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition text-sm"
            >
              Seguir comprando
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {items.map(item => (
                <li
                  key={item.id}
                  className="bg-gray-50 rounded-xl p-3 flex gap-3 group"
                >
                  <div className="w-20 h-20 bg-white rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain"
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <span className="text-xs text-gray-300">Sin img</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h6 className="text-sm font-semibold text-gray-800 truncate">{item.name}</h6>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 flex-shrink-0"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-blue-700 mt-1">
                      S/ {Number(item.price).toFixed(2)}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-50 transition rounded-l-lg disabled:opacity-30"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 py-1 text-xs font-medium text-gray-700 border-x border-gray-200 min-w-[32px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-50 transition rounded-r-lg"
                        >
                          <Plus className="w-3.5 h-3.5" />
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

            <div className="border-t border-gray-100 px-6 py-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="text-lg font-bold text-gray-800">S/ {calculateTotal()}</span>
              </div>
              <Link
                to="/cart"
                onClick={() => {
                  onClose();
                  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
                }}
                className="block w-full text-center bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition"
              >
                Ir a mi carrito
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
