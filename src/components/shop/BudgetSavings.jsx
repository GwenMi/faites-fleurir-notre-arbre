import { TrendingDown } from "lucide-react";

export default function BudgetSavings({ selection, pricing, PRICING }) {
  const { totalPots, discount, pricePerPot, total } = pricing;
  if (!totalPots) return null;

  const isCompose = selection.kitType === "compose";
  const savedByKitChoice = isCompose
    ? Math.max(0, (PRICING.KIT_PRET - PRICING.KIT_COMPOSE) * totalPots)
    : 0;

  // Ne monter l'écran que s'il y a au moins une économie
  if (discount === 0 && savedByKitChoice === 0) return null;

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <TrendingDown className="w-5 h-5 text-emerald-500" />
        <h3 style={{ fontFamily: "'Lato', sans-serif" }} className="font-bold text-emerald-800 text-sm">
          Vos économies sur cette commande
        </h3>
      </div>

      <div className="space-y-2">
        {/* Économie kit à composer */}
        {isCompose && savedByKitChoice > 0 && (
          <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-emerald-100">
            <div>
              <p style={{ fontFamily: "'Lato', sans-serif" }} className="text-xs text-gray-500">Kit à composer vs. prêt à offrir</p>
              <p style={{ fontFamily: "'Lato', sans-serif" }} className="text-sm font-semibold text-gray-800">
                {PRICING.KIT_COMPOSE.toFixed(2)}€ vs {PRICING.KIT_PRET.toFixed(2)}€/pot
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Économie</p>
              <p className="text-lg font-bold text-emerald-600">−{savedByKitChoice.toFixed(2)}€</p>
            </div>
          </div>
        )}

        {/* Économie multi-packs */}
        {discount > 0 && (
          <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-emerald-100">
            <div>
              <p style={{ fontFamily: "'Lato', sans-serif" }} className="text-xs text-gray-500">Réduction multi-packs</p>
              <p style={{ fontFamily: "'Lato', sans-serif" }} className="text-sm font-semibold text-gray-800">−10% appliqué automatiquement</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Économie</p>
              <p className="text-lg font-bold text-emerald-600">−{discount.toFixed(2)}€</p>
            </div>
          </div>
        )}
      </div>

      {/* Prix final */}
      <div className="bg-emerald-600 rounded-xl px-4 py-3 flex items-center justify-between">
        <p style={{ fontFamily: "'Lato', sans-serif" }} className="text-white font-semibold text-sm">
          Soit {pricePerPot.toFixed(2)}€ / invité seulement 🌻
        </p>
        <p className="text-emerald-100 text-xs font-semibold">
          Total : <span className="text-white font-bold text-base">{total.toFixed(2)}€</span>
        </p>
      </div>
    </div>
  );
}