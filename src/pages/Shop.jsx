import { useState } from "react";
import SEOHead from "@/components/SEOHead";
import ShopBanner from "@/components/shop/ShopBanner";
import WizardProgress from "@/components/shop/WizardProgress";
import StepKitChoice from "@/components/shop/StepKitChoice";
import StepEventType from "@/components/shop/StepEventType";
import StepPackSelector from "@/components/shop/StepPackSelector";
import StepCustomization from "@/components/shop/StepCustomization";
import StepEventSlug from "@/components/shop/StepEventSlug";
import StepCustomerForm from "@/components/shop/StepCustomerForm";
import StepShipping from "@/components/shop/StepShipping";
import StepOrderSummary from "@/components/shop/StepOrderSummary";
import ReviewCarousel from "@/components/shop/ReviewCarousel";
import { createPageUrl } from "@/utils";
import { Sparkles, ArrowRight, Package, Leaf, Heart, Check } from "lucide-react";

const STEPS = ["Votre kit", "Votre événement", "Pack invités", "Personnalisation", "Site personnalisé", "Vos informations", "Livraison", "Récapitulatif"];



export const PRICING = {
  KIT_COMPOSE: 3.90,
  KIT_PRET: 5.90,
  SAC_CADEAU: 0.40,
};

const SEEDS = [
  { id: "tournesol_nain", label: "🌻 Tournesol nain", description: "Compact et joyeux" },
];

const CATEGORIES = [
  { id: "all", label: "Tous" },
  { id: "mariage", label: "💍 Mariage" },
  { id: "bapteme", label: "👶 Baptême" },
  { id: "communion", label: "✨ Communion" },
  { id: "anniversaire", label: "🎂 Anniversaire" },
  { id: "entreprise", label: "🏢 Entreprise" },
  { id: "maison_hotes", label: "🏡 Chambre d'hôtes" },
];

const PRODUCTS = [
  {
    id: "kit_compose",
    label: "Kit à composer",
    price: "3,90 €",
    unit: "/ invité",
    badge: null,
    tags: ["mariage", "bapteme", "communion", "anniversaire"],
    desc: "Vous assemblez vous-même les éléments à votre rythme — graines, pastille de terre, étiquette personnalisée — pour un résultat fait main et personnel.",
    features: ["Graines de fleur", "Pastille de semis", "Étiquette personnalisée", "QR code galerie photos", "Notice de plantation"],
    color: "border-rose-200 bg-rose-50",
    check: "text-rose-400",
    cta: "Composer mon kit",
  },
  {
    id: "kit_pret",
    label: "Kit prêt à offrir",
    price: "5,90 €",
    unit: "/ invité",
    badge: "Le plus choisi ✨",
    tags: ["mariage", "bapteme", "communion", "anniversaire"],
    desc: "Tout arrive assemblé et emballé. Il suffit de poser les pots sur les tables le jour J — rien à préparer, rien à stresser.",
    features: ["Graines de fleur", "Pastille de semis", "Étiquette personnalisée", "QR code galerie photos", "Notice de plantation", "Assemblé & prêt à poser ✓"],
    color: "border-rose-300 bg-rose-100",
    check: "text-rose-500",
    cta: "Commander ce kit",
  },
  {
    id: "kit_entreprise_standard",
    label: 'Pack Standard "Bureau"',
    price: "15 € HT",
    unit: "/ collaborateur",
    badge: null,
    tags: ["entreprise"],
    desc: "Tout le nécessaire pour s'organiser au bureau : clip mémo en bois, carte planning effaçable, timer flip et stylo effaçable.",
    features: [
      "Clip mémo en bois naturel (tient la carte debout)",
      "Carte planning A5 plastifiée R/V effaçable à l'infini",
      "Timer flip 4 positions (5, 15, 30 et 60 min)",
      "Stylo effaçable",
    ],
    color: "border-emerald-300 bg-emerald-50",
    check: "text-emerald-500",
    cta: "Découvrir ce pack",
    href: "KitFocusOrganisation",
  },
  {
    id: "kit_entreprise_premium",
    label: 'Pack Premium "Moniteur"',
    price: "20 € HT",
    unit: "/ collaborateur",
    badge: "Premium ✨",
    tags: ["entreprise"],
    desc: "La version haut de gamme avec clip moniteur orientable 360° qui se fixe sur le bord de l'écran, compatible tous moniteurs.",
    features: [
      "Clip moniteur orientable 360° (compatible tous moniteurs)",
      "Carte planning A5 plastifiée R/V effaçable à l'infini",
      "Timer flip 4 positions (5, 15, 30 et 60 min)",
      "Stylo effaçable",
    ],
    color: "border-emerald-400 bg-emerald-100",
    check: "text-emerald-600",
    cta: "Découvrir ce pack",
    href: "KitFocusOrganisation",
  },
  {
    id: "kit_naturel_essentiel",
    label: "Kit Naturel Essentiel",
    price: "5 €",
    unit: "/ unité",
    badge: "100% naturel 🐝",
    tags: ["maison_hotes"],
    desc: "Un galet de cire d'abeille française gravé à votre logo, posé sur son dessous de verre en bois découpé laser. 6 usages du quotidien.",
    features: ["Galet cire d'abeille avec logo en relief", "Dessous de verre en bois laser", "Carte kraft 6 usages"],
    color: "border-yellow-200 bg-yellow-50",
    check: "text-yellow-600",
    cta: "Découvrir ce kit",
    href: "KitNaturel",
  },
  {
    id: "kit_naturel_douceur",
    label: "Kit Naturel Douceur",
    price: "13 €",
    unit: "/ unité",
    badge: "Coup de cœur 🌿",
    tags: ["maison_hotes"],
    desc: "La formule complète : le galet de cire gravé, son dessous de verre en bois, la carte 6 usages et un sac en coton recyclé pour offrir l'ensemble avec élégance.",
    features: ["Galet cire d'abeille avec logo en relief", "Dessous de verre en bois laser", "Carte kraft 6 usages", "Sac en coton recyclé inclus"],
    color: "border-yellow-300 bg-yellow-100",
    check: "text-yellow-700",
    cta: "Découvrir ce kit",
    href: "KitNaturel",
  },
];

const USE_CASES = [
  { id: "mariage", icon: "💍", color: "from-rose-50 to-rose-100 border-rose-200", iconBg: "bg-rose-400", title: "Mariage", desc: "Un souvenir inoubliable. Vos invités planteront cette fleur et penseront à votre grand jour chaque fois qu'elle s'épanouit." },
  { id: "bapteme", icon: "👶", color: "from-sky-50 to-sky-100 border-sky-200", iconBg: "bg-sky-400", title: "Baptême", desc: "Célébrez l'arrivée avec un cadeau qui grandit. Le bébé pourra voir sa fleur s'épanouir en grandissant avec lui." },
  { id: "communion", icon: "✨", color: "from-purple-50 to-purple-100 border-purple-200", iconBg: "bg-purple-400", title: "Communion", desc: "Marquez ce moment important avec un cadeau naturel et poétique, sans oublier l'environnement." },
  { id: "anniversaire", icon: "🎂", color: "from-yellow-50 to-yellow-100 border-yellow-200", iconBg: "bg-yellow-400", title: "Anniversaire", desc: "Offrez une expérience plus qu'un objet. Chaque invité repart avec un petit bout de nature à cultiver." },
  { id: "entreprise", icon: "🏢", color: "from-blue-50 to-blue-100 border-blue-200", iconBg: "bg-blue-400", title: "Entreprise", desc: "Renforcez l'esprit d'équipe avec un cadeau original aux couleurs de votre entreprise." },
  { id: "maison_hotes", icon: "🏡", color: "from-amber-50 to-amber-100 border-amber-200", iconBg: "bg-amber-400", title: "Chambre d'Hôtes", desc: "Un petit pot personnalisé pour vos hôtes — chaque fleur qui s'épanouit les ramène à votre maison." },
];

function ShopHomePage({ onStart }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [showOtherKits, setShowOtherKits] = useState(false);

  const filteredProducts = activeCategory === "all"
    ? PRODUCTS
    : PRODUCTS.filter(p => p.tags.includes(activeCategory));

  const filteredUseCases = activeCategory === "all"
    ? USE_CASES
    : USE_CASES.filter(u => u.id === activeCategory);

  const handleProductCta = (product) => {
    if (product.href) {
      window.location.href = createPageUrl(product.href);
    } else {
      const eventType = activeCategory === 'all' ? (product.tags[0] || 'mariage') : activeCategory;
      const kitType = product.id === 'kit_compose' ? 'compose' : 'pret';
      onStart({ eventType, kitType });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Boutique — Kits de graines personnalisés pour mariages, baptêmes & entreprises"
        description="Commandez votre kit de graines personnalisé : étiquette à vos prénoms, QR code galerie photos, graine au choix. Kit à composer 3,90 € ou prêt à offrir 5,90 € par invité."
        url="https://fleursdefete.fr/Shop"
        schema={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Kits de graines personnalisés — Fleurs de Fête",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Kit à composer", "url": "https://fleursdefete.fr/Shop" },
            { "@type": "ListItem", "position": 2, "name": "Kit prêt à offrir", "url": "https://fleursdefete.fr/Shop" },
            { "@type": "ListItem", "position": 3, "name": "Kit Naturel Cire d'Abeille", "url": "https://fleursdefete.fr/KitNaturel" },
            { "@type": "ListItem", "position": 4, "name": "Kit Focus & Organisation", "url": "https://fleursdefete.fr/KitFocusOrganisation" }
          ]
        }}
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        .font-serif-shop { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-shop { font-family: 'Lato', system-ui, sans-serif; }
        .gold-line-shop { background: linear-gradient(90deg, transparent, #c9a96e, transparent); height: 1px; }
      `}</style>

      {/* Bandeau offre de lancement */}
      <div className="bg-gradient-to-r from-rose-400 to-pink-500 text-white text-center py-2.5 px-4">
        <p className="font-sans-shop text-sm font-semibold">🎉 Offre de lancement — Les 20 premières commandes bénéficient de la livraison offerte</p>
      </div>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-gray-100">
        <a href={createPageUrl("Home")}>
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
            alt="Fleurs de fête"
            className="h-10"
          />
        </a>
        <div className="flex items-center gap-3">
          <a href={createPageUrl("Home")} className="font-sans-shop text-sm text-gray-500 hover:text-rose-400 transition hidden sm:block">Accueil</a>
          <button onClick={() => onStart({})}
            className="font-sans-shop text-sm font-semibold text-white bg-rose-400 hover:bg-rose-500 transition px-5 py-2.5 rounded-full shadow-sm">
            Commander
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-b from-rose-50 to-white px-6 md:px-12 py-14 md:py-20 text-center">
        <p className="font-sans-shop text-xs tracking-[0.3em] uppercase text-rose-400 mb-4">Cadeaux de mariage · Baptêmes · Anniversaires · Entreprises</p>
        <h1 className="font-serif-shop text-5xl md:text-7xl font-bold text-gray-800 leading-tight mb-6">
          Un souvenir qui continue<br />
          <span className="text-rose-400">à fleurir chez vos invités</span>
        </h1>
        <div className="gold-line-shop max-w-xs mx-auto mb-6" />
        <p className="font-sans-shop text-gray-500 text-lg max-w-lg mx-auto mb-10 leading-relaxed font-light">
          Un petit pot de graines personnalisé, posé sur chaque table. Lorsque la fleur pousse, vos invités pensent encore à votre événement — et partagent la photo.
        </p>
        <button onClick={() => onStart({})}
          className="inline-flex items-center gap-2 py-4 px-8 rounded-full font-sans-shop font-bold text-white shadow-lg bg-gradient-to-r from-rose-400 to-pink-500 hover:opacity-90 transition text-sm tracking-wide">
          <Sparkles className="w-4 h-4" /> Composer mon kit
        </button>
        <p className="font-sans-shop text-xs text-gray-400 mt-4">À partir de 3,90 € / invité · Prénoms & date gravés · Graine au choix</p>
      </div>

      {/* === SECTION BOUTIQUE FILTRÉE === */}
      <div className="px-6 md:px-12 py-12 max-w-4xl mx-auto">
        <p className="font-sans-shop text-xs tracking-[0.3em] uppercase text-rose-400 mb-3 text-center">Notre catalogue</p>
        <h2 className="font-serif-shop text-3xl font-bold text-gray-800 mb-4 text-center">Trouvez le kit parfait pour votre occasion</h2>
        <p className="font-sans-shop text-sm text-gray-400 text-center max-w-xl mx-auto mb-8 leading-relaxed italic">
          Ces suggestions sont données à titre indicatif. Chaque kit peut bien sûr être commandé pour n'importe quelle occasion — l'essentiel, c'est que cela vous ressemble.
        </p>

        {/* Filtres catégorie */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setShowOtherKits(false); }}
              className={`px-4 py-2 rounded-full font-sans-shop text-sm font-semibold transition border ${
                activeCategory === cat.id
                  ? "bg-rose-400 text-white border-rose-400 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-rose-300 hover:text-rose-400"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Produits filtrés */}
        <div className={`grid gap-5 ${filteredProducts.length === 1 ? "max-w-sm mx-auto" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
          {filteredProducts.map(product => (
            <div key={product.id} className={`border-2 ${product.color} rounded-3xl p-7 relative flex flex-col`}>
              {product.badge && (
                <span className="absolute top-4 right-4 bg-rose-400 text-white text-xs font-bold px-2.5 py-1 rounded-full font-sans-shop">{product.badge}</span>
              )}
              <p className="font-sans-shop text-xs tracking-widest uppercase text-gray-400 mb-1">{product.label}</p>
              <p className="font-serif-shop text-3xl font-bold text-gray-800 mb-0.5">{product.price}<span className="text-sm font-normal text-gray-400"> {product.unit}</span></p>
              <p className="font-sans-shop text-sm text-gray-600 mb-4 leading-relaxed flex-1">{product.desc}</p>
              <ul className="space-y-2 mb-6">
                {product.features.map(f => (
                  <li key={f} className="flex items-center gap-2 font-sans-shop text-sm text-gray-700">
                    <span className={`text-xs ${product.check}`}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleProductCta(product)}
                className="w-full py-3 rounded-full font-sans-shop font-semibold text-sm bg-rose-400 hover:bg-rose-500 text-white transition shadow-sm"
              >
                {product.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Autres kits */}
        {activeCategory !== "all" && (() => {
          const otherProducts = PRODUCTS.filter(p => !p.tags.includes(activeCategory));
          if (otherProducts.length === 0) return null;
          return (
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowOtherKits(v => !v)}
                className="font-sans-shop text-sm text-gray-400 hover:text-rose-400 transition border border-gray-200 hover:border-rose-200 px-5 py-2.5 rounded-full"
              >
                {showOtherKits ? "Masquer les autres kits ✕" : "Voir les autres kits ↓"}
              </button>
              {showOtherKits && (
                <div className="mt-6">
                  <p className="font-sans-shop text-xs tracking-[0.25em] uppercase text-gray-400 mb-5">Nos autres produits disponibles</p>
                  <div className={`grid gap-5 ${otherProducts.length === 1 ? "max-w-sm mx-auto" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
                    {otherProducts.map(product => (
                      <div key={product.id} className={`border-2 ${product.color} rounded-3xl p-7 relative flex flex-col opacity-90`}>
                        {product.badge && (
                          <span className="absolute top-4 right-4 bg-gray-400 text-white text-xs font-bold px-2.5 py-1 rounded-full font-sans-shop">{product.badge}</span>
                        )}
                        <p className="font-sans-shop text-xs tracking-widest uppercase text-gray-400 mb-1">{product.label}</p>
                        <p className="font-serif-shop text-3xl font-bold text-gray-800 mb-0.5">{product.price}<span className="text-sm font-normal text-gray-400"> {product.unit}</span></p>
                        <p className="font-sans-shop text-sm text-gray-600 mb-4 leading-relaxed flex-1">{product.desc}</p>
                        <ul className="space-y-2 mb-6">
                          {product.features.map(f => (
                            <li key={f} className="flex items-center gap-2 font-sans-shop text-sm text-gray-700">
                              <span className={`text-xs ${product.check}`}>✓</span>{f}
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={() => handleProductCta(product)}
                          className="w-full py-3 rounded-full font-sans-shop font-semibold text-sm bg-gray-400 hover:bg-gray-500 text-white transition shadow-sm"
                        >
                          {product.cta}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Frise chronologique — uniquement pour les kits fleurs */}
      {["all", "mariage", "bapteme", "communion", "anniversaire"].includes(activeCategory) && (
      <div className="px-6 md:px-12 py-12 max-w-3xl mx-auto">
        <p className="font-sans-shop text-xs tracking-[0.3em] uppercase text-rose-400 mb-3 text-center">Le voyage du cadeau</p>
        <h2 className="font-serif-shop text-3xl font-bold text-gray-800 mb-8 text-center">De votre table à leur fenêtre</h2>
        <div className="flex flex-col sm:flex-row items-start gap-0">
          {[
            { time: "Jour J", icon: "🌿", desc: "Le pot est posé sur chaque table, personnalisé à votre image." },
            { time: "Le soir même", icon: "🏡", desc: "Vos invités repartent avec leur petit pot — prêt à planter dès le lendemain." },
            { time: "J+14 à J+30", icon: "🌱", desc: "Les premières pousses apparaissent selon la graine et les conditions." },
            { time: "J+45 à J+60", icon: "🌸", desc: "La fleur s'épanouit — il scanne le QR code et partage la photo." },
            { time: "1 an après", icon: "💛", desc: "La fleur refleurit. Il pense encore à votre événement." },
          ].map((step, i) => (
            <div key={i} className="flex sm:flex-col items-start sm:items-center flex-1 gap-3 sm:gap-2 relative mb-6 sm:mb-0">
              <div className="flex sm:flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-lg flex-shrink-0">{step.icon}</div>
              </div>
              <div className="sm:text-center">
                <p className="font-sans-shop text-xs font-bold text-rose-400 uppercase tracking-wide mb-1">{step.time}</p>
                <p className="font-sans-shop text-xs text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Cas d'usage filtrés */}
      <div className="px-6 md:px-12 py-12 max-w-4xl mx-auto">
        <p className="font-sans-shop text-xs tracking-[0.3em] uppercase text-rose-400 mb-2 text-center">Parfait pour chaque occasion</p>
        <h2 className="font-serif-shop text-3xl font-bold text-gray-800 mb-8 text-center">Plus qu'un cadeau, un souvenir vivant</h2>
        <div className={`grid gap-5 ${filteredUseCases.length === 1 ? "max-w-sm mx-auto" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
          {filteredUseCases.map(uc => (
            <div key={uc.id} className={`bg-gradient-to-br ${uc.color} rounded-3xl p-7 border`}>
              <div className={`w-12 h-12 rounded-full ${uc.iconBg} text-white flex items-center justify-center mb-4 text-xl`}>{uc.icon}</div>
              <h3 className="font-serif-shop text-xl font-bold text-gray-800 mb-3">{uc.title}</h3>
              <p className="font-sans-shop text-sm text-gray-700 leading-relaxed">{uc.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Avantages — uniquement pour les kits fleurs */}
      {["all", "mariage", "bapteme", "communion", "anniversaire"].includes(activeCategory) && (
      <div className="bg-rose-50 px-6 md:px-12 py-14">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif-shop text-3xl font-bold text-gray-800 text-center mb-10">Ce qui rend ce cadeau unique</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: "🌿", title: "100 % naturel", desc: "Graines non traitées, pastille de terre compressée, emballage éco-responsable." },
              { icon: "✍️", title: "Entièrement personnalisé", desc: "Prénoms, date, message ou logo — chaque étiquette raconte votre histoire." },
              { icon: "📱", title: "Une dimension digitale", desc: "Le QR code sur chaque pot invite les invités à partager la photo de leur fleur." },
              { icon: "🐝", title: "Mellifère & utile", desc: "Les fleurs choisies nourrissent les abeilles et embellissent les jardins." },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-4 bg-white rounded-2xl px-5 py-4 border border-rose-100 shadow-sm">
                <span className="text-2xl flex-shrink-0 mt-0.5">{item.icon}</span>
                <div>
                  <p className="font-sans-shop font-bold text-gray-800 text-sm">{item.title}</p>
                  <p className="font-sans-shop text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* Avis */}
      <ReviewCarousel />

      {/* CTA final */}
      <div className="bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-16 text-center text-white">
        <h2 className="font-serif-shop text-4xl font-bold mb-4">Un souvenir qui fleurit longtemps après</h2>
        <p className="font-sans-shop text-white/80 text-sm mb-8 max-w-md mx-auto">
          Composez votre kit en quelques minutes. Livraison soignée, graines certifiées, étiquette personnalisée.
        </p>
        <button onClick={() => onStart({})}
          className="inline-flex items-center gap-2 bg-white text-rose-500 font-bold px-8 py-4 rounded-full hover:bg-rose-50 transition shadow-lg font-sans-shop text-sm">
          Découvrir les formules <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-gray-100 text-center">
        <p className="font-sans-shop text-xs text-gray-400 tracking-widest mb-4">"Merci d'avoir partagé ce moment avec nous"</p>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-gray-400 font-sans-shop">
          <a href={createPageUrl("Contact")} className="hover:text-rose-400 transition">Contact</a>
          <span className="text-gray-200">·</span>
          <a href={createPageUrl("FAQ")} className="hover:text-rose-400 transition">FAQ</a>
          <span className="text-gray-200">·</span>
          <a href={createPageUrl("CGV")} className="hover:text-rose-400 transition">CGV</a>
          <span className="text-gray-200">·</span>
          <a href={createPageUrl("MentionsLegales")} className="hover:text-rose-400 transition">Mentions légales</a>
          <span className="text-gray-200">·</span>
          <a href={createPageUrl("OrderTracking")} className="hover:text-rose-400 transition">Suivi commande</a>
        </div>
        <p className="font-sans-shop text-xs text-gray-300 mt-4">© 2025 Fleurs en fête — Papin Gwenaëlle</p>
      </footer>
    </div>
  );
}

export default function Shop() {
  const urlParams = new URLSearchParams(window.location.search);
  const initEventType = urlParams.get("eventType");
  const initKitType = urlParams.get("kitType");

  const [step, setStep] = useState(() => {
    if (initKitType && initEventType) return 3;
    if (initKitType) return 2;
    return 0;
  });
  const [selection, setSelection] = useState({
    eventType: initEventType || null,
    kitType: initKitType || null,
    seedType: "tournesol_nain",
    sacCadeau: false,
    packs: [],
    containerType: null,
  });

  const [customerInfo, setCustomerInfo] = useState({
    name: "", email: "", phone: "", address: "", eventDate: ""
  });
  const [shippingMethod, setShippingMethod] = useState(null);

  const baseKitPrice = selection.kitType === "pret" ? PRICING.KIT_PRET : PRICING.KIT_COMPOSE;
  const pricePerPot = baseKitPrice;
  const totalPots = (selection.packs || []).reduce((sum, p) => sum + p.size * p.qty, 0);
  const totalPackCount = (selection.packs || []).reduce((sum, p) => sum + p.qty, 0);
  const subtotal = pricePerPot * totalPots;
  const sacCadeauTotal = selection.sacCadeau ? PRICING.SAC_CADEAU * totalPots : 0;
  const discount = totalPackCount >= 2 ? (subtotal + sacCadeauTotal) * 0.1 : 0;
  const shippingCost = shippingMethod?.price ?? 0;
  const total = subtotal + sacCadeauTotal - discount + shippingCost;
  const pricing = { pricePerPot, totalPots, subtotal, sacCadeauTotal, discount, shippingCost, total };

  const updateSelection = (updates) => setSelection(s => ({ ...s, ...updates }));

  const handleStart = (preselect = {}) => {
    setSelection(s => ({ ...s, ...preselect }));
    // Si kitType + eventType déjà choisis → direct packs
    // Si kitType seul → étape event type
    // Sinon → étape 1
    if (preselect.kitType && preselect.eventType) {
      setStep(3);
    } else if (preselect.kitType) {
      setStep(2);
    } else {
      setStep(1);
    }
  };

  if (step === 0) return <ShopHomePage onStart={handleStart} />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 bg-white border-b border-gray-100">
        <a href={createPageUrl("Home")}>
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
            alt="Fleurs de fête"
            className="h-10"
          />
        </a>
        <a href={createPageUrl("Home")} className="font-sans-shop text-xs text-gray-400 hover:text-rose-400 transition">← Retour à l'accueil</a>
      </nav>
      <ShopBanner />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <WizardProgress currentStep={step} steps={STEPS} />
        <div className="mt-12">
          {step === 1 && (
            <StepKitChoice
              selection={selection}
              onUpdate={updateSelection}
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <StepEventType
              selection={selection}
              onUpdate={updateSelection}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <StepPackSelector
              selection={selection}
              onUpdate={updateSelection}
              pricing={pricing}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <StepCustomization
              selection={selection}
              onUpdate={updateSelection}
              onNext={() => setStep(5)}
              onBack={() => setStep(3)}
              seeds={SEEDS}
            />
          )}
          {step === 5 && (
            <StepEventSlug
              selection={selection}
              onUpdate={updateSelection}
              onNext={() => setStep(6)}
              onBack={() => setStep(4)}
            />
          )}
          {step === 6 && (
            <StepCustomerForm
              customerInfo={customerInfo}
              onChange={setCustomerInfo}
              onNext={() => setStep(7)}
              onBack={() => setStep(5)}
            />
          )}
          {step === 7 && (
            <StepShipping
              totalPots={pricing.totalPots}
              shippingMethod={shippingMethod}
              onSelect={setShippingMethod}
              onNext={() => setStep(8)}
              onBack={() => setStep(6)}
            />
          )}
          {step === 8 && (
            <StepOrderSummary
              selection={selection}
              customerInfo={customerInfo}
              pricing={pricing}
              PRICING={PRICING}
              shippingMethod={shippingMethod}
              onBack={() => setStep(7)}
            />
          )}
        </div>
      </div>
    </div>
  );
}