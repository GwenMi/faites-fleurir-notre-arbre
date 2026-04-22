import { Check } from "lucide-react";



const KITS = [
  {
    id: "compose",
    popular: "💍 Très commandé pour les baptêmes & communions",
    emoji: "🌱",
    name: "Kit à composer",
    price: 3.90,
    unit: "/ invité",
    badge: null,
    color: "border-rose-200 bg-gradient-to-br from-rose-50 to-rose-100",
    desc: "Les éléments sont envoyés séparément pour que vous puissiez assembler vos cadeaux à votre rythme.",
    features: ["Graines de fleur", "Pastille de semis", "Étiquette personnalisée", "QR code galerie photos", "Notice de plantation"],
  },
  {
    id: "pret",
    emoji: "🎁",
    name: "Kit prêt à offrir",
    price: 5.90,
    unit: "/ invité",
    badge: "Le plus choisi ✨",
    popular: "💍 N°1 des mariages & anniversaires",
    color: "border-rose-300 bg-gradient-to-br from-rose-100 to-rose-200",
    desc: "Tout arrive assemblé et emballé. Posez simplement les pots sur les tables le jour J.",
    features: ["Graines de fleur", "Pastille de semis", "Étiquette personnalisée", "QR code galerie photos", "Notice de plantation", "Assemblé & prêt à offrir ✓"],
  },
  {
    id: "entreprise_standard",
    emoji: "📋",
    name: 'Pack Standard “Bureau”',
    popular: "🏢 Idéal pour les équipes & séminaires",
    price: 15,
    unit: "HT / collaborateur",
    badge: null,
    color: "border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100",
    desc: "Clip mémo en bois, carte planning effaçable, timer flip et stylo. Tout pour s'organiser au bureau.",
    features: ["Clip mémo en bois naturel", "Carte planning A5 plastifiée", "Timer flip 4 positions", "Stylo effaçable"],
  },
  {
    id: "entreprise_premium",
    emoji: "🖥️",
    name: 'Pack Premium “Moniteur”',
    popular: "🏢 Le préféré des grandes entreprises",
    price: 20,
    unit: "HT / collaborateur",
    badge: "Premium ✨",
    color: "border-emerald-300 bg-gradient-to-br from-emerald-100 to-emerald-200",
    desc: "Clip moniteur 360° pour écrans, carte planning, timer flip et stylo. La version premium.",
    features: ["Clip moniteur orientable 360°", "Carte planning A5 plastifiée", "Timer flip 4 positions", "Stylo effaçable"],
  },
  {
    id: "naturel_essentiel",
    emoji: "🐝",
    name: "Kit Naturel Essentiel",
    popular: "🏡 Coup de cœur des maisons d'hôtes",
    price: 5,
    unit: "/ unité",
    badge: "100% naturel",
    color: "border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100",
    desc: "Galet de cire d'abeille, dessous de verre en bois, carte 6 usages.",
    features: ["Galet cire d'abeille", "Dessous de verre", "Carte kraft 6 usages"],
  },
  {
    id: "naturel_douceur",
    emoji: "🌿",
    name: "Kit Naturel Douceur",
    popular: "🏡 Le plus offert en maisons d'hôtes & spas",
    price: 13,
    unit: "/ unité",
    badge: "Coup de cœur",
    color: "border-amber-300 bg-gradient-to-br from-amber-100 to-amber-200",
    desc: "Galet de cire d'abeille, dessous de verre, carte usages et sac en coton recyclé. L'accueil parfait.",
    features: ["Galet cire d'abeille", "Dessous de verre", "Carte kraft 6 usages", "Sac en coton recyclé"],
  },
];

export default function StepKitChoice({ selection, onUpdate, onNext, onBack }) {
  const handleSelectKit = (kit) => {
    onUpdate({ kitType: kit.id });
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
        <p className="font-sans-shop text-sm text-gray-400 mb-4">Sélectionnez le type qui correspond à votre besoin</p>
        <div className="inline-flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 text-left max-w-lg">
          <span className="text-base flex-shrink-0">💡</span>
          <p>Les suggestions ci-dessous sont à titre indicatif. Vous êtes libre de choisir n'importe quel kit pour tous les types d'événements !</p>
        </div>
      </div>



      {/* Cartes kits — 2 par 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {KITS.map(kit => (
          <button
            key={kit.id}
            onClick={() => handleSelectKit(kit)}
            className={`text-left rounded-2xl border-2 ${kit.color} hover:shadow-md transition-all p-6 relative group flex flex-col`}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{kit.emoji}</span>
              {kit.popular && (
                <span className="text-xs font-semibold text-gray-400 font-sans-shop leading-tight">{kit.popular}</span>
              )}
            </div>
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