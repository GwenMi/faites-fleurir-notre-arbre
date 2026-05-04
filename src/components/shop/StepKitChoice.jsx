import { useState } from "react";
import { Check } from "lucide-react";

const KIT_VARIANTS = {
  compose: [
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
      desc: "Marque-place le jour J, kit apéro à faire soi-même le lendemain. Farine, épices italiennes, sel — il ne manque que l'huile d'olive et l'eau. En 20 minutes, des crackers maison dignes d'une trattoria. 🌾 Intolérance au gluten ? Remplacez par de la farine de sarrasin.",
    },
  ],
  pret: [
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
      desc: "Marque-place le jour J, kit apéro à faire soi-même le lendemain. Farine, épices italiennes, sel — il ne manque que l'huile d'olive et l'eau. En 20 minutes, des crackers maison dignes d'une trattoria. 🌾 Intolérance au gluten ? Remplacez par de la farine de sarrasin.",
    },
  ],
};

const MARIAGE_KITS = ["compose", "pret"];

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
    desc: "Un marque-place qui fleurit. Chaque invité trouve son prénom sur la table, repart avec son pot, arrose — et des semaines plus tard, un tournesol éclot dans son salon. Vous assemblez les pots avant le jour J : même magie, prix allégé.",
    features: ["Graines de tournesol faciles à faire pousser", "Étiquette personnalisée (marque-place + souvenir)", "QR code galerie floraison", "Notice de plantation", "Assemblage simple & accessible"],
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
    desc: "Leur prénom marque leur place à table. Ils repartent avec leur pot, arrosent, et des semaines après votre fête, un tournesol éclot dans leur salon. Ils scannent le QR code, ajoutent leur photo — et votre album continue de grandir.",
    features: ["Graines de tournesol faciles à faire pousser", "Étiquette personnalisée (marque-place + souvenir)", "QR code galerie floraison", "Notice de plantation simple", "Assemblé & prêt à offrir ✓"],
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
    desc: "Une attention qui se remarque. Le galet de cire d'abeille, le dessous de verre en bois, la carte aux six usages — trois objets qui transforment un accueil ordinaire en souvenir de séjour.",
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
    desc: "L'accueil qui reste. Dans un sac en coton recyclé : un galet de cire d'abeille, un dessous de verre en bois, une carte kraft aux six usages. Vos hôtes repartent avec — et se souviennent de votre établissement.",
    features: ["Galet cire d'abeille", "Dessous de verre", "Carte kraft 6 usages", "Sac en coton recyclé"],
  },
  {
    id: "terrarium",
    emoji: "🫙",
    name: "Terrarium Souvenir",
    popular: "💍 Activité créative & souvenir unique",
    price: 10,
    unit: "/ invité",
    badge: "🌿 Nouveau",
    color: "border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50",
    desc: "Un marque-place qui s'anime pendant le repas. Chaque invité crée son propre terrarium à table — cristaux hydrogel, fleurs séchées, petits galets — et repart avec une pièce faite de ses mains, unique et inoubliable.",
    features: ["Pot en verre 80ml + bouchon liège", "Cristaux hydrogel (gel transparent qui retient l'eau)", "Fleurs séchées (3-4 variétés)", "Étiquette personnalisée (marque-place + souvenir)", "Notice d'animation simple", "Prêt à poser sur les tables"],
  },
];

export default function StepKitChoice({ selection, onUpdate, onNext, onBack }) {
  const [variantModal, setVariantModal] = useState(null); // kit.id en cours de sélection de variante

  const handleSelectKit = (kit) => {
    if (MARIAGE_KITS.includes(kit.id)) {
      // Ouvrir le sélecteur de variante fleurs uniquement
      setVariantModal(kit.id);
    } else {
      // crackers et autres kits : sélection directe
      onUpdate({ kitType: kit.id, kitVariant: kit.id === "crackers" ? "crackers" : null });
      onNext();
    }
  };

  const handleSelectVariant = (variantId) => {
    onUpdate({ kitType: variantModal, kitVariant: variantId });
    setVariantModal(null);
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
              {MARIAGE_KITS.includes(kit.id) ? "Choisir la variante →" : "Choisir ce kit →"}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button onClick={onBack} className="font-sans-shop text-sm text-gray-400 hover:text-rose-400 transition">
          ← Retour à la boutique
        </button>
      </div>

      {/* Modal sélecteur de variante */}
      {variantModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl">
            <h3 className="font-serif-shop text-2xl font-bold text-gray-800 mb-1">Quelle variante ?</h3>
            <p className="font-sans-shop text-sm text-gray-400 mb-6">Choisissez la version de votre kit cadeau invités</p>
            <div className="space-y-3">
              {KIT_VARIANTS[variantModal].map(v => (
                <button
                  key={v.id}
                  onClick={() => handleSelectVariant(v.id)}
                  className="w-full text-left p-4 rounded-2xl border-2 border-gray-200 hover:border-rose-300 hover:bg-rose-50 transition-all flex items-start gap-4"
                >
                  <span className="text-3xl flex-shrink-0">{v.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-sans-shop font-bold text-gray-800 text-sm">{v.label}</span>
                      {v.badge && (
                        <span className="inline-block bg-rose-400 text-white text-xs font-bold px-2 py-0.5 rounded-full font-sans-shop">
                          {v.badge}
                        </span>
                      )}
                    </div>
                    <p className="font-sans-shop text-xs text-gray-500 leading-relaxed">{v.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setVariantModal(null)}
              className="mt-5 w-full text-center font-sans-shop text-sm text-gray-400 hover:text-rose-400 transition"
            >
              ← Retour au choix du kit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}