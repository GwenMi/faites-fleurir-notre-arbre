import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const KIT_VARIANTS = [
  {
    id: "tournesol",
    emoji: "🌻",
    label: "Graines de tournesol",
    desc: "La version originale : chaque invité plante sa graine et partage sa fleur sur votre galerie photo.",
  },
  {
    id: "crackers",
    emoji: "🫙",
    label: "Kit Apéro Crackers Italiens",
    badge: "🆕 Nouveauté",
    desc: "Un mix prêt à cuisiner : farine, sel et un mélange d'épices italiennes (paprika, basilic, tomates, niora, origan, ail, poivre noir). Vos invités n'ont qu'à ajouter huile d'olive et eau pour réaliser leurs crackers maison.",
  },
];

const KITS = {
  compose: {
    emoji: "🌱",
    name: "Kit à composer",
    desc: "Un souvenir original pour vos invités : chacun reçoit une petite graine à faire pousser en souvenir de votre mariage. Les éléments sont envoyés séparément afin que vous puissiez préparer facilement vos cadeaux invités.",
    features: [
      "Graines de fleur / crackers italiens",
      "Pastille de semis",
      "Notice de plantation",
      "Étiquette personnalisée (prénoms & date)",
      "QR code pour partager les photos des fleurs",
    ],
    badge: null,
    priceKey: "KIT_COMPOSE",
  },
  pret: {
    emoji: "🎁",
    name: "Kit prêt à offrir",
    desc: "Le souvenir est entièrement préparé et prêt à être posé sur la table des invités le jour du mariage. Chaque invité repart avec une graine à planter et pourra partager la photo de sa fleur.",
    features: [
      "Graines de fleur / crackers italiens",
      "Pastille de semis",
      "Notice",
      "Étiquette personnalisée (prénoms & date)",
      "QR code pour partager les photos des fleurs",
      "Préparé & prêt à offrir ✓",
    ],
    badge: "Le plus choisi",
    priceKey: "KIT_PRET",
  },
};

export default function StepKitOptions({ selection, onUpdate, onNext, onBack, PRICING }) {
  const [variantModal, setVariantModal] = useState(null); // kitType en attente de variante

  const handleSelectKit = (key) => {
    onUpdate({ kitType: key });
    setVariantModal(key);
  };

  const handleSelectVariant = (variantId) => {
    onUpdate({ kitVariant: variantId });
    setVariantModal(null);
    onNext();
  };

  const handleNext = () => {
    if (!selection.kitType) { toast.error("Veuillez choisir un kit"); return; }
    if (!selection.kitVariant) { setVariantModal(selection.kitType); return; }
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
              onClick={() => handleSelectKit(key)}
              className={`text-left rounded-2xl border-2 p-6 transition-all relative ${
                selected ? "border-rose-400 bg-rose-50 shadow-md" : "border-gray-200 bg-white hover:border-rose-200"
              }`}
            >
              {kit.badge && (
                <span className="absolute top-3 right-3 bg-rose-400 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {kit.badge} ✨
                </span>
              )}
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{kit.emoji}</span>
                {selected && <div className="w-6 h-6 bg-rose-400 rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">{kit.name}</h3>
              <p className="text-2xl font-bold text-rose-600 mb-3">{price.toFixed(2)}€<span className="text-sm font-normal text-gray-500"> / invité</span></p>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{kit.desc}</p>
              <ul className="space-y-1.5">
                {kit.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-400 text-xs flex-shrink-0">✓</span> {f}
                  </li>
                ))}
              </ul>
              {selected && selection.kitVariant && (
                <div className="mt-3 flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-rose-200">
                  <span className="text-base">{KIT_VARIANTS.find(v => v.id === selection.kitVariant)?.emoji}</span>
                  <span className="text-xs font-semibold text-rose-600">{KIT_VARIANTS.find(v => v.id === selection.kitVariant)?.label}</span>
                  <button onClick={e => { e.stopPropagation(); setVariantModal(key); }} className="ml-auto text-xs text-gray-400 hover:text-rose-500 underline">Changer</button>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Modale variante */}
      {variantModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-1">Quelle variante ?</h3>
            <p className="text-sm text-gray-400 mb-6">Choisissez la version de votre kit cadeau invités</p>
            <div className="space-y-3">
              {KIT_VARIANTS.map(v => (
                <button
                  key={v.id}
                  onClick={() => handleSelectVariant(v.id)}
                  className="w-full text-left p-4 rounded-2xl border-2 border-gray-200 hover:border-rose-300 hover:bg-rose-50 transition-all flex items-start gap-4"
                >
                  <span className="text-3xl flex-shrink-0">{v.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-gray-800 text-sm">{v.label}</span>
                      {v.badge && (
                        <span className="inline-block bg-rose-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {v.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{v.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setVariantModal(null)}
              className="mt-5 w-full text-center text-sm text-gray-400 hover:text-rose-400 transition"
            >
              ← Annuler
            </button>
          </div>
        </div>
      )}



      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1 h-12 rounded-xl">
          ← Retour
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selection.kitType}
          className="flex-1 h-12 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl"
        >
          Continuer <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}