import { X, Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CartDrawer({ cart, onUpdateQty, onRemove, onCheckout, onClose }) {
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm h-full flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-rose-400" />
            <h2 className="font-serif-shop text-xl font-bold text-gray-800">Mon panier</h2>
            {itemCount > 0 && (
              <span className="bg-rose-400 text-white text-xs rounded-full px-2 py-0.5 font-sans-shop">
                {itemCount}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingCart className="w-14 h-14 text-gray-200 mb-4" />
              <p className="text-gray-500 font-sans-shop">Votre panier est vide</p>
              <p className="text-sm text-gray-400 mt-1 font-sans-shop">Ajoutez des produits pour commander</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm font-sans-shop">{item.product.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 font-sans-shop">{item.product.price.toFixed(2)} €/unité</p>
                  </div>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onUpdateQty(item.id, -1)}
                      className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-rose-300 transition"
                    >
                      <Minus className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                    <span className="text-lg font-bold text-gray-800 w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQty(item.id, 1)}
                      className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-rose-300 transition"
                    >
                      <Plus className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                  </div>
                  <p className="font-bold text-rose-500 font-sans-shop">
                    {(item.product.price * item.quantity).toFixed(2)} €
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 space-y-4 bg-white">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700 font-sans-shop">Total</span>
            <span className="text-2xl font-bold text-rose-500 font-sans-shop">{total.toFixed(2)} €</span>
          </div>
          <p className="text-xs text-gray-500 font-sans-shop text-center">Paiement sécurisé Stripe</p>
          <Button
            onClick={onCheckout}
            disabled={cart.length === 0}
            className="w-full h-12 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold text-sm hover:opacity-90 transition shadow-sm font-sans-shop"
          >
            Commander — {total.toFixed(2)} €
          </Button>
        </div>
      </div>
    </div>
  );
}