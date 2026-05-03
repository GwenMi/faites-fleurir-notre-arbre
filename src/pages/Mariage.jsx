import { useState } from "react";
import { createPageUrl } from "@/utils";
import { Check, Sparkles, ChevronRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import SiteNav from "@/components/SiteNav";

const FEATURES_PREMIUM = [
  "Site événement personnalisé complet",
  "RSVP avec choix de menus",
  "Programme de la journée & timeline",
  "Galerie photos & album collaboratif",
  "Livre d'or, liste de cadeaux, cagnotte",
  "Plan de table interactif",
  "Histoire du couple, FAQ, carte",
  "Thème, couleurs & polices personnalisés",
];

const KITS = [
  {
    id: "pret",
    emoji: "🌻",
    badge: "Le plus commandé ✨",
    badgeColor: "bg-rose-400",
    name: "Kit Fleurs prêt à offrir",
    price: 5.90,
    desc: "Pot avec graines de tournesol, étiquette personnalisée prénoms + date, QR code galerie. Tout arrive assemblé, prêt à poser sur les tables.",
    features: ["Graines de tournesol", "Étiquette personnalisée", "QR code galerie floraison", "Notice de plantation", "Assemblé & prêt à offrir"],
    color: "border-rose-300 bg-gradient-to-br from-rose-50 to-pink-50",
    cta: "Commander ce kit",
    href: "/Shop?kitType=pret&eventType=mariage",
  },
  {
    id: "compose",
    emoji: "🌱",
    badge: null,
    name: "Kit Fleurs à composer",
    price: 3.90,
    desc: "Les éléments arrivent séparément pour que vous assembliez vos cadeaux à votre rythme. Idéal si vous aimez personnaliser chaque détail.",
    features: ["Graines de tournesol", "Étiquette personnalisée", "QR code galerie floraison", "Notice de plantation"],
    color: "border-rose-200 bg-gradient-to-br from-rose-50 to-white",
    cta: "Commander ce kit",
    href: "/Shop?kitType=compose&eventType=mariage",
  },
  {
    id: "crackers",
    emoji: "🫙",
    badge: "🆕 Nouveauté",
    badgeColor: "bg-amber-400",
    name: "Kit Apéro Crackers Italiens",
    price: 5.90,
    desc: "Un mix prêt à cuisiner : farine, épices italiennes, sel. Vos invités font leurs crackers maison et partagent leurs photos. Option sans gluten disponible.",
    features: ["Mix farine + épices italiennes", "Étiquette personnalisée prénoms + date", "QR code galerie cuisine", "Option farine de sarrasin"],
    color: "border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50",
    cta: "Commander ce kit",
    href: "/Shop?kitType=crackers&eventType=mariage",
  },
];

export default function Mariage() {
  const [showPremiumDetails, setShowPremiumDetails] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Cadeaux de mariage — Kits fleurs & crackers personnalisés pour invités"
        description="Pots de graines ou kits crackers italiens personnalisés pour votre mariage. Prénoms, date, QR code galerie. Site événement gratuit inclus. À partir de 3,90€/invité."
        url="https://fleursdefete.fr/Mariage"
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        .font-serif-m { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-m { font-family: 'Lato', system-ui, sans-serif; }
        .gold-line { background: linear-gradient(90deg, transparent, #c9a96e, transparent); height: 1px; }
      `}</style>

      <SiteNav />

      {/* Hero */}
      <div className="bg-gradient-to-b from-rose-50 to-white px-6 md:px-12 py-20 md:py-28 text-center">
        <p className="font-sans-m text-xs tracking-[0.3em] uppercase text-rose-400 mb-4">Mariage · Fiançailles · Anniversaire · Communion · Baptême</p>
        <h1 className="font-serif-m text-5xl md:text-7xl font-bold text-gray-800 leading-tight mb-5">
          Le souvenir que<br />
          <span className="text-rose-400">vos invités garderont</span>
        </h1>
        <div className="gold-line max-w-xs mx-auto mb-6" />
        <p className="font-sans-m text-gray-500 text-lg max-w-lg mx-auto mb-3 leading-relaxed font-light">
          Un kit à poser sur chaque table — personnalisé avec vos prénoms, la date et un QR code pour partager les photos quand la fleur pousse ou les crackers cuisent.
        </p>
        <p className="font-sans-m text-gray-400 text-sm mb-10">
          À partir de <strong className="text-gray-600">3,90 € / invité</strong> · Site événement <strong className="text-gray-600">gratuit</strong> inclus
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
          <a
            href="#kits"
            className="flex-1 py-4 rounded-full font-sans-m font-bold text-white bg-gradient-to-r from-rose-400 to-pink-500 hover:opacity-90 transition text-sm shadow-lg flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Voir les kits
          </a>
          <a
            href={createPageUrl("CreateMyEvent") + "?plan=basic"}
            className="flex-1 py-4 rounded-full font-sans-m font-semibold text-rose-500 border-2 border-rose-200 hover:bg-rose-50 transition text-sm flex items-center justify-center gap-2"
          >
            🌐 Créer mon site gratuit
          </a>
        </div>
      </div>

      {/* Kits */}
      <div id="kits" className="px-6 md:px-12 py-16 max-w-5xl mx-auto">
        <p className="font-sans-m text-xs tracking-[0.3em] uppercase text-rose-400 mb-2 text-center">Vos cadeaux invités</p>
        <h2 className="font-serif-m text-4xl font-bold text-gray-800 mb-3 text-center">Choisissez votre kit</h2>
        <p className="font-sans-m text-gray-400 text-sm text-center max-w-md mx-auto mb-12">Chaque kit arrive avec une étiquette gravée de vos prénoms, la date, et un QR code pour votre galerie privée.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {KITS.map(kit => (
            <div key={kit.id} className={`rounded-3xl border-2 ${kit.color} p-7 flex flex-col`}>
              <div className="text-5xl mb-4">{kit.emoji}</div>
              {kit.badge && (
                <span className={`inline-block ${kit.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full font-sans-m mb-3 w-fit`}>
                  {kit.badge}
                </span>
              )}
              <h3 className="font-serif-m text-xl font-bold text-gray-800 mb-1">{kit.name}</h3>
              <p className="font-sans-m text-2xl font-bold text-rose-500 mb-3">
                {kit.price.toFixed(2)} €<span className="text-sm font-normal text-gray-400"> / invité</span>
              </p>
              <p className="font-sans-m text-sm text-gray-500 leading-relaxed mb-4 flex-1">{kit.desc}</p>
              <ul className="space-y-1.5 mb-6">
                {kit.features.map(f => (
                  <li key={f} className="flex items-center gap-2 font-sans-m text-sm text-gray-700">
                    <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <a
                href={createPageUrl("Shop") + kit.href.replace("/Shop", "")}
                className="w-full text-center py-3 rounded-xl bg-rose-400 hover:bg-rose-500 text-white font-sans-m font-semibold text-sm transition"
              >
                {kit.cta} →
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 px-8 md:px-20">
        <div className="gold-line flex-1" />
        <span className="text-xl">💍</span>
        <div className="gold-line flex-1" />
      </div>

      {/* Site événement — gratuit + upsell premium */}
      <div className="px-6 md:px-12 py-16 max-w-4xl mx-auto">
        <p className="font-sans-m text-xs tracking-[0.3em] uppercase text-rose-400 mb-2 text-center">Site événement</p>
        <h2 className="font-serif-m text-4xl font-bold text-gray-800 mb-3 text-center">Votre page en ligne</h2>
        <p className="font-sans-m text-gray-400 text-sm text-center max-w-md mx-auto mb-10">Partagez votre événement avec vos invités via un lien personnalisé.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gratuit */}
          <div className="border border-gray-200 rounded-3xl p-8 bg-white">
            <p className="font-sans-m text-xs tracking-[0.25em] uppercase text-gray-400 mb-3">Gratuit</p>
            <p className="font-serif-m text-5xl font-bold text-gray-800 mb-1">0 €</p>
            <p className="font-sans-m text-sm text-gray-400 mb-6">Toujours gratuit, inclus avec votre commande</p>
            <ul className="space-y-2.5 mb-7">
              {[
                "Page événement en ligne",
                "Galerie photos partagée",
                "Défi floraison (kits fleurs) ou galerie cuisine (crackers)",
                "Compteur de fleurs en temps réel",
                "Lien personnalisé à partager",
              ].map(f => (
                <li key={f} className="flex items-center gap-2 font-sans-m text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <a
              href={createPageUrl("CreateMyEvent") + "?plan=basic"}
              className="block text-center py-3.5 rounded-full font-sans-m font-semibold text-sm border-2 border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-500 transition"
            >
              Créer mon site gratuit
            </a>
          </div>

          {/* Premium — upsell */}
          <div className="border-2 border-rose-200 rounded-3xl p-8 bg-gradient-to-br from-rose-50 to-pink-50 relative overflow-hidden shadow-md">
            <span className="absolute top-5 right-5 bg-rose-400 text-white text-xs font-bold px-3 py-1 rounded-full font-sans-m">
              Recommandé ✨
            </span>
            <p className="font-sans-m text-xs tracking-[0.25em] uppercase text-rose-400 mb-3">Premium</p>
            <p className="font-serif-m text-5xl font-bold text-gray-800 mb-1">39,99 €</p>
            <p className="font-sans-m text-sm text-gray-400 mb-1">Paiement unique · À vie</p>
            <p className="font-sans-m text-xs text-rose-300 italic mb-6">🌱 Le must pour un mariage inoubliable</p>
            <ul className="space-y-2.5 mb-7">
              {FEATURES_PREMIUM.map(f => (
                <li key={f} className="flex items-center gap-2 font-sans-m text-sm text-gray-700">
                  <Check className="w-4 h-4 text-rose-400 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <a
              href={createPageUrl("CreateMyEvent") + "?plan=premium"}
              className="block text-center py-3.5 rounded-full font-sans-m font-semibold text-sm bg-gradient-to-r from-rose-400 to-pink-500 text-white hover:opacity-90 transition shadow-sm"
            >
              Choisir Premium — 39,99 €
            </a>
            <p className="font-sans-m text-xs text-center text-rose-300 mt-3">Aussi proposé dans votre panier lors de la commande</p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-rose-50 px-6 md:px-12 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-sans-m text-xs tracking-[0.3em] uppercase text-rose-400 mb-2">Comment ça marche</p>
          <h2 className="font-serif-m text-3xl font-bold text-gray-800 mb-10">En 3 étapes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "✏️", step: "01", title: "Personnalisez", desc: "Prénoms, date, kit de votre choix. On s'occupe du reste." },
              { icon: "🌸", step: "02", title: "On livre", desc: "Vos kits arrivent prêts en 5 à 10 jours ouvrés avant votre événement." },
              { icon: "📸", step: "03", title: "Ils partagent", desc: "La fleur pousse ou les crackers cuisent — vos invités scannent et partagent." },
            ].map(item => (
              <div key={item.step} className="flex flex-col items-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <p className="font-sans-m text-xs tracking-widest text-gray-300 mb-1">{item.step}</p>
                <h3 className="font-serif-m text-xl font-bold text-gray-800 mb-1">{item.title}</h3>
                <p className="font-sans-m text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <a
              href="#kits"
              className="inline-flex items-center gap-2 font-sans-m font-bold text-sm text-white bg-rose-400 hover:bg-rose-500 transition px-8 py-4 rounded-full shadow-md"
            >
              Commander mes kits <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-gray-100 text-center">
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-gray-400 font-sans-m mb-4">
          <a href={createPageUrl("Shop")} className="hover:text-rose-400 transition">Boutique</a>
          <span className="text-gray-200">·</span>
          <a href={createPageUrl("Contact")} className="hover:text-rose-400 transition">Contact</a>
          <span className="text-gray-200">·</span>
          <a href={createPageUrl("CGV")} className="hover:text-rose-400 transition">CGV</a>
          <span className="text-gray-200">·</span>
          <a href={createPageUrl("ClientDashboard")} className="hover:text-rose-400 transition">Mon espace</a>
        </div>
        <p className="font-sans-m text-xs text-gray-300">© 2025 Fleurs en fête — Papin Gwenaëlle — contact@fleursdefete.fr</p>
      </footer>
    </div>
  );
}