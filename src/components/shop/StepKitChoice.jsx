import { useState } from "react";
import { Check } from "lucide-react";
import { createPageUrl } from "@/utils";

const EVENT_FILTERS = [
  { id: "mariage", label: "💍 Mariage" },
  { id: "bapteme", label: "👶 Baptême" },
  { id: "communion", label: "✨ Communion" },
  { id: "anniversaire", label: "🎂 Anniversaire" },
  { id: "entreprise", label: "🏢 Entreprise" },
  { id: "maison_hotes", label: "🏡 Maison d'hôtes" },
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
  {
    id: "entreprise_standard",
    emoji: "📋",
    name: 'Pack Standard "Bureau"',
    price: 15,
    unit: "HT / collaborateur",
    badge: null,
    desc: "Clip mémo en bois, carte planning effaçable, timer flip et stylo. Tout pour s'organiser au bureau.",
    features: [
      "Clip mémo en bois naturel",
      "Carte planning A5 plastifiée",
      "Timer flip 4 positions",
      "Stylo effaçable",
    ],
    href: "KitFocusOrganisation",
  },
  {
    id: "entreprise_premium",
    emoji: "🖥️",
    name: 'Pack Premium "Moniteur"',
    price: 20,
    unit: "HT / collaborateur",
    badge: "Premium ✨",
    desc: "Clip moniteur 360° pour écrans, carte planning, timer flip et stylo. La version premium.",
    features: [
      "Clip moniteur orientable 360°",
      "Carte planning A5 plastifiée",
      "Timer flip 4 positions",
      "Stylo effaçable",
    ],
    href: "KitFocusOrganisation",
  },
  {
    id: "naturel_essentiel",
    emoji: "🐝",
    name: "Kit Naturel Essentiel",
    price: 5,
    unit: "/ unité",
    badge: "100% naturel",
    desc: "Galet de cire d'abeille gravé à votre logo, dessous de verre en bois, carte 6 usages.",
    features: [
      "Galet cire d'abeille",
      "Dessous de verre en bois laser",
      "Carte kraft 6 usages",
    ],
    href: "KitNaturel",
  },
  {
    id: "naturel_douceur",
    emoji: "🌿",
    name: "Kit Naturel Douceur",
    price: 13,
    unit: "/ unité",
    badge: "Coup de cœur",
    desc: "Galet de cire gravé, dessous de verre, carte usages et sac en coton recyclé. L'accueil parfait.",
    features: [
      "Galet cire d'abeille",
      "Dessous de verre en bois laser",
      "Carte kraft 6 usages",
      "Sac en coton recyclé",
    ],
    href: "KitNaturel",
  },
];

export default function StepKitChoice({ selection, onUpdate, onNext, onBack }) {
  const [activeEvent, setActiveEvent] = useState(selection.eventType || null);

  const handleSelectKit = (kit) => {
    if (kit.href) {
      window.location.href = createPageUrl(kit.href);
    } else {
      onUpdate({ kitType: kit.id, ...(activeEvent ? { eventType: activeEvent } : {}) });
      onNext();
    }
  };

  return (
    <div>
      <style>{`
        .font-serif-shop { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-shop { font-family: 'Lato', system-ui, sans-serif; }
      `}</style>

      <div className="text-center mb-8">
        <p className="font-sans-shop text-xs tracking-[0.3em] uppercase text-rose-400 mb-2">Étape 1</p>
        <h2 className="font-serif-shop text-3xl font-bold text-gray-800 mb-2">Choisissez votre kit</h2>
        <p className="font-sans-shop text-sm text-gray-400">Sélectionnez le type qui correspond à votre besoin</p>
      </div>

      {/* Filtre événement (optionnel, cosmétique uniquement ici) */}
      <div className="flex flex-wrap gap-2 justify-center mb-9">
        {EVENT_FILTERS.map(ev => (
          <button
            key={ev.id}
            onClick={() => { setActiveEvent(ev.id); onUpdate({ eventType: ev.id }); }}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {KITS.map(kit => (
          <button
            key={kit.id}
            onClick={() => handleSelectKit(kit)}
            className="text-left rounded-2xl border-2 border-gray-200 bg-white hover:border-rose-400 hover:bg-rose-50 hover:shadow-md transition-all p-6 relative group flex flex-col"
          >
            <span className="text-4xl block mb-4">{kit.emoji}</span>
            {kit.badge && (
              <span className="inline-block bg-rose-400 text-white text-xs font-bold px-3 py-1 rounded-full font-sans-shop mb-3 w-fit">
                {kit.badge}
              </span>
            )}
            <h3 className="font-sans-shop font-bold text-gray-900 text-lg mb-1">{kit.name}</h3>
            <p className="font-sans-shop text-2xl font-bold text-rose-500 mb-3">
              {kit.price.toFixed(2)} €<span className="text-sm font-normal text-gray-400"> {kit.unit}</span>
            </p>
            <p className="font-sans-shop text-sm text-gray-600 mb-4 leading-relaxed flex-grow">{kit.desc}</p>
            <ul className="space-y-1.5 mb-5">
              {kit.features.map(f => (
                <li key={f} className="flex items-center gap-2 font-sans-shop text-sm text-gray-700">
                  <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <div className="w-full py-2.5 rounded-xl bg-rose-400 group-hover:bg-rose-500 text-white font-sans-shop font-semibold text-sm text-center transition">
              {kit.href ? "Découvrir →" : "Choisir ce kit →"}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button onClick={onBack} className="font-sans-shop text-sm text-gray-400 hover:text-rose-400 transition">
          ← Retour à la boutique
        </button>
      </div>
    </div>
  );
}