import { Button } from "@/components/ui/button";
import { Check, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const KITS = {
  compose: {
    emoji: "🌱",
    name: "Kit à composer",
    desc: "Un souvenir original pour vos invités : chacun reçoit une petite graine à faire pousser en souvenir de votre mariage. Les éléments sont envoyés séparément afin que vous puissiez préparer facilement vos cadeaux invités.",
    features: [
      "Graines de fleur",
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
      "Graines de fleur",
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
            </button>
          );
        })}
      </div>



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