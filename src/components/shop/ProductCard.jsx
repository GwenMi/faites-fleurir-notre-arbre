import { StarSummary } from "./ProductReviews";

export default function ProductCard({ product, onOrder, reviews }) {
  const ICONS = {
    "Kit à composer": "🌱",
    "Kit classique prêt à offrir": "🌸",
    "Kit premium personnalisé": "💐",
  };
  const icon = ICONS[product.name] || "🪴";

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Image / placeholder */}
      {product.image ? (
        <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 flex items-center justify-center text-6xl bg-gradient-to-br from-rose-50 to-pink-50">
          {icon}
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <p className="font-serif-elegant text-xl font-bold text-gray-800 mb-1">{product.name}</p>
        <StarSummary productId={product.id} reviews={reviews} />
        <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1 mt-2">{product.description}</p>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-2xl font-bold text-rose-500">{product.price.toFixed(2)} €</span>
            <span className="text-xs text-gray-400 ml-1">/ unité</span>
          </div>
          <button
            onClick={() => onOrder(product)}
            className="bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition shadow-sm"
          >
            Commander
          </button>
        </div>
      </div>
    </div>
  );
}