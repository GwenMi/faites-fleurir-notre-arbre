import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ProductCard({ product, onAdd, onOrder, compact = false }) {
  if (compact) {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-3">
        <div>
          <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
          {product.quantity && (
            <p className="text-xs text-gray-500 mt-1">{product.quantity} pots</p>
          )}
        </div>
        <p className="text-lg font-bold text-rose-600">{product.price.toFixed(2)}€</p>
        <Button
          onClick={onAdd}
          variant="outline"
          size="sm"
          className="w-full justify-center"
        >
          <Plus className="w-4 h-4 mr-1" />
          Ajouter
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      {product.image && (
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover bg-gray-100"
        />
      )}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
          <p className="text-sm text-gray-600 mt-2 line-clamp-3">{product.description}</p>
        </div>
        <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">À partir de</p>
              <p className="text-2xl font-bold text-rose-600">{product.price.toFixed(2)}€</p>
            </div>
          </div>
          <div className="flex gap-2">
            {onAdd && (
              <Button onClick={onAdd} className="flex-1 bg-rose-600 hover:bg-rose-700 text-sm">
                <Plus className="w-4 h-4 mr-1" />
                Panier
              </Button>
            )}
            {onOrder && (
              <Button onClick={() => onOrder(product)} variant="outline" className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 text-sm">
                Personnaliser
              </Button>
            )}
            {!onAdd && !onOrder && (
              <Button onClick={() => {}} className="flex-1 bg-rose-600 hover:bg-rose-700">
                <Plus className="w-4 h-4 mr-2" />
                Commander
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}