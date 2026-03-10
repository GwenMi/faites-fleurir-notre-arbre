import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2, Info } from "lucide-react";
import { toast } from "sonner";

const PACK_SIZES = [30, 50, 70, 100, 120];

export default function StepPackSelector({ selection, onUpdate, pricing, onNext, onBack }) {
  const handleNext = () => {
    if (!selection.packSize) { toast.error("Veuillez sélectionner un pack"); return; }
    onNext();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Choisissez votre pack</h2>
        <p className="text-sm text-gray-500">Prix par pot : <strong>{pricing.pricePerPot.toFixed(2)}€</strong></p>
      </div>

      {/* Pack size selection */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {PACK_SIZES.map(size => {
          const selected = selection.packSize === size;
          const packPrice = pricing.pricePerPot * size;
          return (
            <button
              key={size}
              onClick={() => onUpdate({ packSize: size })}
              className={`rounded-xl border-2 p-3 text-center transition-all ${
                selected ? "border-rose-400 bg-rose-50 shadow-sm" : "border-gray-200 bg-white hover:border-rose-200"
              }`}
            >
              <p className={`text-2xl font-bold ${selected ? "text-rose-600" : "text-gray-800"}`}>{size}</p>
              <p className="text-xs text-gray-500 mb-1">invités</p>
              <p className="text-xs font-semibold text-gray-700">{packPrice.toFixed(2)}€</p>
            </button>
          );
        })}
      </div>

      {/* Quantity */}
      {selection.packSize && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Nombre de packs</p>
              <p className="text-sm text-gray-500">Pack {selection.packSize} invités</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onUpdate({ packQty: Math.max(1, selection.packQty - 1) })}
                className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-lg font-bold text-gray-600"
              >−</button>
              <span className="w-8 text-center font-bold text-xl">{selection.packQty}</span>
              <button
                onClick={() => onUpdate({ packQty: selection.packQty + 1 })}
                className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-lg font-bold text-gray-600"
              >+</button>
            </div>
          </div>
          {selection.packQty >= 2 && (
            <div className="mt-4 flex items-center gap-2 text-green-600 text-sm bg-green-50 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <strong>Réduction 10% appliquée</strong> — {selection.packQty} packs commandés
            </div>
          )}
        </div>
      )}

      {/* Price summary */}
      {selection.packSize && (
        <div className="bg-rose-50 rounded-2xl p-6 space-y-2">
          <div className="flex justify-between text-sm text-gray-700">
            <span>{pricing.totalPots} pots × {pricing.pricePerPot.toFixed(2)}€</span>
            <span>{pricing.subtotal.toFixed(2)}€</span>
          </div>
          {pricing.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Réduction 10%</span>
              <span>−{pricing.discount.toFixed(2)}€</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t border-rose-200 pt-3 mt-1">
            <span>Total</span>
            <span className="text-rose-600">{pricing.total.toFixed(2)}€</span>
          </div>
        </div>
      )}

      {/* Delivery info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          Chaque commande est préparée avec soin. Nous recommandons de commander <strong>au moins 21 jours</strong> avant votre événement.
        </p>
      </div>

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1 h-12 rounded-xl">
          <ChevronLeft className="w-4 h-4 mr-2" /> Retour
        </Button>
        <Button onClick={handleNext} disabled={!selection.packSize} className="flex-1 h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold">
          Continuer <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}