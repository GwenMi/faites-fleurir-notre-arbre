import { Button } from "@/components/ui/button";
import { Check, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const KITS = {
  compose: {
    emoji: "🌱",
    name: "Kit à composer",
    desc: "Envoyé séparément pour préparer vous-mêmes les cadeaux invités",
    features: ["Pot avec graines", "Pastille de semis", "Notice", "Étiquette personnalisée", "QR code événement"],
    priceKey: "KIT_COMPOSE",
  },
  pret: {
    emoji: "🎁",
    name: "Kit prêt à offrir",
    desc: "Souvenir préparé, prêt à poser sur la table des invités",
    features: ["Pot avec graines", "Pastille de semis", "Notice", "Étiquette personnalisée", "QR code événement", "Préparé & prêt à offrir ✓"],
    priceKey: "KIT_PRET",
  },
};

export default function StepKitOptions({ selection, onUpdate, onNext, PRICING }) {
  const handleNext = () => {
    if (!selection.kitType) { toast.error("Veuillez choisir un kit"); return; }
    onNext();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Choisissez votre kit</h2>
        <p className="text-sm text-gray-500">Sélectionnez le kit qui correspond à votre organisation</p>
      </div>

      {/* Kit cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(KITS).map(([key, kit]) => {
          const price = PRICING[kit.priceKey];
          const selected = selection.kitType === key;
          return (
            <button
              key={key}
              onClick={() => onUpdate({ kitType: key })}
              className={`text-left rounded-2xl border-2 p-6 transition-all ${
                selected ? "border-rose-400 bg-rose-50 shadow-md" : "border-gray-200 bg-white hover:border-rose-200"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{kit.emoji}</span>
                {selected && <div className="w-6 h-6 bg-rose-400 rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">{kit.name}</h3>
              <p className="text-2xl font-bold text-rose-600 mb-3">{price.toFixed(2)}€<span className="text-sm font-normal text-gray-500">/pot</span></p>
              <p className="text-sm text-gray-600 mb-4">{kit.desc}</p>
              <ul className="space-y-1">
                {kit.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-400 text-xs">✓</span> {f}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/* Pot options — shown once kit is selected */}
      {selection.kitType && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Choisissez votre pot</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "verre", emoji: "🫙", label: "Pot en verre", sub: "Inclus" },
              { key: "blanc", emoji: "🤍", label: "Pot blanc", sub: `+${PRICING.POT_BLANC_EXTRA.toFixed(2)}€/pot`, highlight: true },
            ].map(pot => (
              <button
                key={pot.key}
                onClick={() => onUpdate({ potType: pot.key })}
                className={`rounded-xl border-2 p-4 text-center transition-all ${
                  selection.potType === pot.key ? "border-rose-400 bg-rose-50" : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span className="text-2xl block mb-2">{pot.emoji}</span>
                <p className="font-semibold text-gray-900 text-sm">{pot.label}</p>
                <p className={`text-xs mt-0.5 ${pot.highlight ? "text-rose-600 font-semibold" : "text-gray-500"}`}>{pot.sub}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sac cadeau — shown once kit is selected */}
      {selection.kitType && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎀</span>
              <div>
                <p className="font-semibold text-gray-900">Sac cadeau mariage</p>
                <p className="text-sm text-gray-500">Petit sac élégant avec poignée corde</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-rose-600 font-semibold">+{PRICING.SAC_CADEAU.toFixed(2)}€/pot</span>
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

      <Button
        onClick={handleNext}
        disabled={!selection.kitType}
        className="w-full h-12 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl"
      >
        Continuer <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}