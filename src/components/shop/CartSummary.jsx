import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function CartSummary({
  cart,
  onRemove,
  subtotal,
  discount,
  onCheckout,
  hasItems
}) {
  const total = subtotal - discount;

  if (!hasItems) {
    return (
      <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
        <p className="text-gray-500">Votre panier est vide</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900">Panier ({cart.length} article{cart.length > 1 ? 's' : ''})</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {cart.map(item => (
              <div key={item.cartId} className="px-6 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.category === "pack_invite" && item.quantity ? `${item.quantity} pots` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-semibold text-gray-900">{item.price.toFixed(2)}€</p>
                  <button
                    onClick={() => onRemove(item.cartId)}
                    className="p-2 text-gray-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 h-fit sticky top-6 space-y-4">
        <h3 className="font-bold text-gray-900">Résumé</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Sous-total</span>
            <span className="font-semibold">{subtotal.toFixed(2)}€</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Réduction (10%)</span>
              <span>-{discount.toFixed(2)}€</span>
            </div>
          )}
        </div>
        <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-rose-600">{total.toFixed(2)}€</span>
        </div>
        <Button
          onClick={onCheckout}
          className="w-full bg-rose-600 hover:bg-rose-700 h-11"
        >
          Passer la commande
        </Button>
      </div>
    </div>
  );
}