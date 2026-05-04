import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2, Info, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

const SAC_CADEAU_PRICE = 0.40;

const CONTAINERS = [
  {
    id: "rond_clip",
    name: "Pot rond fermoir",
    desc: "Couvercle hermétique avec fermoir en métal",
    image: "https://i.postimg.cc/66mZn3DV/fermeture_metalique.png",
  },
  {
    id: "carre_liege",
    name: "Pot carré liège",
    desc: "Bouchon en liège naturel",
    image: "https://i.postimg.cc/2yMBDcQC/bouchon-lie-ge.png",
  },
];

export default function StepPackSelector({ selection, onUpdate, pricing, onNext, onBack }) {
  const kitType = selection.kitType || "";
  const isEntreprise = kitType.startsWith("entreprise");
  const isNaturel = kitType.startsWith("naturel");
  const needsContainer = !isEntreprise && !isNaturel;

  // Label contextuel
  const unitLabel = isEntreprise ? "kits bureaux" : isNaturel ? "kits" : "pots";
  const unitLabelSingular = isEntreprise ? "kit bureau" : isNaturel ? "kit" : "pot";

  // Quantité = nombre total commandé (stocké dans packs comme [{size:1, qty: N}])
  const qty = (selection.packs || []).reduce((sum, p) => sum + p.size * p.qty, 0);

  const setQty = (newQty) => {
    if (newQty < 1) return;
    onUpdate({ packs: [{ size: 1, qty: newQty }] });
  };

  const handleNext = () => {
    if (qty < 1) { toast.error("Veuillez indiquer une quantité"); return; }
    if (needsContainer && !selection.containerType) { toast.error("Veuillez choisir un contenant"); return; }
    onNext();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Combien de {unitLabel} ?</h2>
        <p className="text-sm text-gray-500">Prix unitaire : <strong>{pricing.pricePerPot.toFixed(2)} €</strong> / {unitLabelSingular}</p>
      </div>

      {/* Sélecteur de quantité */}
      <div className="flex flex-col items-center gap-6 py-6">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setQty(qty - 1)}
            disabled={qty <= 1}
            className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-rose-300 hover:bg-rose-50 transition disabled:opacity-30"
          >
            <Minus className="w-5 h-5 text-gray-600" />
          </button>

          <div className="text-center">
            <input
              type="number"
              min={1}
              value={qty || ""}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                if (!isNaN(v) && v >= 1) setQty(v);
              }}
              className="w-24 text-center text-4xl font-bold text-gray-900 border-b-2 border-rose-300 focus:outline-none focus:border-rose-500 bg-transparent pb-1"
            />
            <p className="text-sm text-gray-400 mt-1">{unitLabel}</p>
          </div>

          <button
            onClick={() => setQty(qty + 1)}
            className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-rose-300 hover:bg-rose-50 transition"
          >
            <Plus className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Raccourcis */}
        <div className="flex flex-wrap justify-center gap-2">
          {[10, 20, 30, 50, 75, 100].map(n => (
            <button
              key={n}
              onClick={() => setQty(n)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition ${
                qty === n ? "border-rose-400 bg-rose-50 text-rose-600" : "border-gray-200 text-gray-600 hover:border-rose-200"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Sélection du contenant — uniquement pour kits mariage/événement */}
      {needsContainer && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Choisissez votre contenant</p>
          <div className="grid grid-cols-2 gap-4">
            {CONTAINERS.map(c => {
              const selected = selection.containerType === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => onUpdate({ containerType: c.id })}
                  className={`rounded-2xl border-2 overflow-hidden text-left transition-all ${
                    selected ? "border-rose-400 shadow-md" : "border-gray-200 hover:border-rose-200"
                  }`}
                >
                  <div className="aspect-square bg-gray-50 relative">
                    <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                    {selected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-rose-400 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className={`p-3 ${selected ? "bg-rose-50" : "bg-white"}`}>
                    <p className="font-semibold text-sm text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sac cadeau — uniquement pour kits fleurs/apéro */}
      {qty > 0 && needsContainer && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">🎀</span>
              <div>
                <p className="font-semibold text-gray-900">Sac cadeau élégant</p>
                <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                  Petit sac cadeau avec poignée. Le pot est placé dans le sac pour créer un véritable souvenir prêt à offrir.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <span className="text-sm text-rose-600 font-semibold">+{(SAC_CADEAU_PRICE * qty).toFixed(2)} €</span>
              <button
                onClick={() => onUpdate({ sacCadeau: !selection.sacCadeau })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  selection.sacCadeau ? "bg-rose-400" : "bg-gray-200"
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  selection.sacCadeau ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Récapitulatif prix */}
      {qty > 0 && (
        <div className="bg-rose-50 rounded-2xl p-6 space-y-2">
          <div className="flex justify-between text-sm text-gray-700">
            <span>{qty} {unitLabel} × {pricing.pricePerPot.toFixed(2)} €</span>
            <span>{(qty * pricing.pricePerPot).toFixed(2)} €</span>
          </div>
          {needsContainer && selection.sacCadeau && (
            <div className="flex justify-between text-sm text-gray-700">
              <span>Sacs cadeaux ({qty} × {SAC_CADEAU_PRICE.toFixed(2)} €)</span>
              <span>{(SAC_CADEAU_PRICE * qty).toFixed(2)} €</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t border-rose-200 pt-3 mt-1">
            <span>Sous-total</span>
            <span className="text-rose-600">
              {(qty * pricing.pricePerPot + (needsContainer && selection.sacCadeau ? SAC_CADEAU_PRICE * qty : 0)).toFixed(2)} €
            </span>
          </div>
        </div>
      )}

      {/* Délais */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 space-y-1">
          <p>Chaque commande est préparée avec soin.</p>
          <p>Nous vous recommandons de commander <strong>au minimum 15 jours avant votre événement</strong>.</p>
          <p className="text-blue-600">Pour les commandes passées moins de 15 jours avant, nous ferons notre maximum mais ne pouvons garantir une livraison dans les temps.</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1 h-12 rounded-xl">
          <ChevronLeft className="w-4 h-4 mr-2" /> Retour
        </Button>
        <Button onClick={handleNext} disabled={qty < 1 || (needsContainer && !selection.containerType)} className="flex-1 h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold">
          Continuer <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}