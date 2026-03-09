import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

export default function ProductCard({ product, onSelect }) {
  const price = product.basePrice?.toFixed(2) || "0.00";

  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-rose-300 transition group">
      <div className="p-8 text-center">
        <p className="text-5xl mb-4 group-hover:scale-110 transition">{product.icon}</p>
        <h3 className="font-serif-elegant text-2xl font-bold text-gray-800 mb-2">{product.name}</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">{product.description}</p>

        <div className="mb-8">
          <p className="text-4xl font-bold text-rose-500 mb-1">{price} €</p>
          <p className="text-xs text-gray-400">par unité</p>
        </div>

        <div className="space-y-2.5 mb-8 bg-gray-50 rounded-2xl p-5 text-left">
          {product.includes?.map((item, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-gray-600">
              <span className="text-rose-400 font-bold flex-shrink-0">✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        <Button
          onClick={onSelect}
          className="w-full rounded-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold hover:opacity-90 transition h-12 text-base"
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          Configurer mon kit
        </Button>
      </div>
    </div>
  );
}