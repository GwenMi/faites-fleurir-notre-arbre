import { useState } from "react";
import { Check } from "lucide-react";

const EVENT_FILTERS = [
  { id: "mariage", label: "💍 Mariage" },
  { id: "bapteme", label: "👶 Baptême" },
  { id: "communion", label: "✨ Communion" },
  { id: "anniversaire", label: "🎂 Anniversaire" },
];

const KITS = [
  {
    id: "compose",
    emoji: "🌱",
    name: "Kit à composer",
    price: 3.90,
    unit: "/ invité",
    badge: null,
    desc: "Les éléments sont envoyés séparément pour que vous puissiez assembler vos cadeaux à votre rythme.",
    features: [
      "Graines de fleur",
      "Pastille de semis",
      "Étiquette personnalisée",
      "QR code galerie photos",
      "Notice de plantation",
    ],
  },
  {
    id: "pret",
    emoji: "🎁",
    name: "Kit prêt à offrir",
    price: 5.90,
    unit: "/ invité",
    badge: "Le plus choisi ✨",
    desc: "Tout arrive assemblé et emballé. Posez simplement les pots sur les tables le jour J.",
    features: [
      "Graines de fleur",
      "Pastille de semis",
      "Étiquette personnalisée",
      "QR code galerie photos",
      "Notice de plantation",
      "Assemblé & prêt à offrir ✓",
    ],
  },
];

export default function StepKitChoice({ selection, onUpdate, onNext, onBack }) {
  const [activeEvent, setActiveEvent] = useState(selection.eventType || null);

  const handleSelectKit = (kitId) => {
    onUpdate({
      kitType: kitId,
      eventType: activeEvent || "mariage",
    });
    onNext();
  };

  return (
    <div>
      <style>{`
        .font-serif-shop { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-shop { font-family: 'Lato', system-ui, sans-serif; }
      `}</style>

      <div className="text-center mb-6">
        <p className="font-sans-shop text-xs tracking-[0.3em] uppercase text-rose-400 mb-2">Étape 1</p>
        <h2 className="font-serif-shop text-3xl font-bold text-gray-800 mb-2">Choisissez votre kit</h2>
        <p className="font-sans-shop text-sm text-gray-400">Cliquez sur un kit pour passer à l'étape suivante</p>
      </div>

      {/* Filtre événement (optionnel, cosmétique uniquement ici) */}
      <div className="flex flex-wrap gap-2 justify-center mb-7">
        {EVENT_FILTERS.map(ev => (
          <button
            key={ev.id}
            onClick={() => setActiveEvent(ev.id)}
            className={`px-4 py-1.5 rounded-full font-sans-shop text-sm font-semibold border transition ${
              activeEvent === ev.id
                ? "bg-rose-400 text-white border-rose-400"
                : "bg-white text-gray-500 border-gray-200 hover:border-rose-300 hover:text-rose-400"
            }`}
          >
            {ev.label}
          </button>
        ))}
      </div>

      {/* Cartes kits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {KITS.map(kit => (
          <button
            key={kit.id}
            onClick={() => handleSelectKit(kit.id)}
            className="text-left rounded-2xl border-2 border-gray-200 bg-white hover:border-rose-400 hover:bg-rose-50 hover:shadow-md transition-all p-6 relative group"
          >
            {kit.badge && (
              <span className="absolute top-3 right-3 bg-rose-400 text-white text-xs font-bold px-2.5 py-1 rounded-full font-sans-shop">
                {kit.badge}
              </span>
            )}
            <span className="text-3xl block mb-3">{kit.emoji}</span>
            <h3 className="font-sans-shop font-bold text-gray-900 text-lg mb-1">{kit.name}</h3>
            <p className="font-sans-shop text-2xl font-bold text-rose-500 mb-3">
              {kit.price.toFixed(2)} €<span className="text-sm font-normal text-gray-400"> {kit.unit}</span>
            </p>
            <p className="font-sans-shop text-sm text-gray-600 mb-4 leading-relaxed">{kit.desc}</p>
            <ul className="space-y-1.5 mb-4">
              {kit.features.map(f => (
                <li key={f} className="flex items-center gap-2 font-sans-shop text-sm text-gray-700">
                  <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <div className="w-full py-2.5 rounded-xl bg-rose-400 group-hover:bg-rose-500 text-white font-sans-shop font-semibold text-sm text-center transition">
              Choisir ce kit →
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button onClick={onBack} className="font-sans-shop text-sm text-gray-400 hover:text-rose-400 transition">
          ← Retour à la boutique
        </button>
      </div>
    </div>
  );
}