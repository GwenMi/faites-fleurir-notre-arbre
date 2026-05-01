import { useState, useEffect } from "react";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPageUrl } from "@/utils";
import { ChevronRight, Sparkles, Check, ShoppingCart, Trash2, Menu, X } from "lucide-react";
import ReviewsSlider from "@/components/home/ReviewsSlider";

const SHOP_URL = () => createPageUrl("Shop");

const FEATURES_BASIC = [
  "Page événement en ligne gratuite",
  "Galerie photos & défi fleur interactif",
  "Compteur de fleurs en temps réel",
  "Lien personnalisé à partager avec vos invités",
];

const FEATURES_PREMIUM = [
  "Tout ce qui est inclus dans Gratuit +",
  "Site événement personnalisé complet",
  "RSVP avec choix de menus (mariages, baptêmes, communions)",
  "Programme de la journée & timeline",
  "Album photo & galerie collaborative",
  "Livre d'or avec photos",
  "Liste de cadeaux / cagnotte",
  "Plan de table interactif",
  "Histoire du couple (mariages)",
  "Carte & plan d'accès",
  "FAQ personnalisable",
  "Thème, couleurs & polices personnalisés",
  "Espace admin complet (budget, prestataires, tâches...)",
];

export default function Home() {
  const [slugInput, setSlugInput] = useState("");
  const [cartInProgress, setCartInProgress] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const savedStep = parseInt(localStorage.getItem("shop_step") || "1");
      const savedSelection = JSON.parse(localStorage.getItem("shop_selection") || "{}");
      if (savedStep >= 2 && savedSelection?.kitType) setCartInProgress(true);
    } catch {}
  }, []);

  const handleGoToEvent = () => {
    if (slugInput.trim()) {
      window.location.href = createPageUrl(`EventPublic`) + `?slug=${slugInput.trim()}`;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {cartInProgress && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center gap-3">
          <ShoppingCart className="w-4 h-4 flex-shrink-0 text-amber-700" />
          <span className="flex-1 text-sm text-amber-800 min-w-0 truncate">Panier en cours de création</span>
          <a
            href={createPageUrl("Shop") + "?resume=true"}
            className="text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 transition px-3 py-1.5 rounded-full flex-shrink-0"
          >
            Reprendre →
          </a>
          <button
            onClick={() => {
              try {
                localStorage.removeItem("shop_step");
                localStorage.removeItem("shop_selection");
                localStorage.removeItem("shop_customer_info");
                localStorage.removeItem("shop_reminder_sent_at");
              } catch {}
              setCartInProgress(false);
            }}
            className="p-1 text-amber-500 hover:text-amber-700 transition flex-shrink-0"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <SEOHead
        title="Cadeaux de mariage, baptême & événements — Pots de graines personnalisés"
        description="Offrez un souvenir vivant à vos invités : petits pots de graines personnalisés avec vos prénoms, la date et un QR code galerie photos. À partir de 3,90 € / invité."
        url="https://fleursdefete.fr"
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
        .gold-line { background: linear-gradient(90deg, transparent, #c9a96e, transparent); height: 1px; }
        .hero-bg { background: linear-gradient(160deg, #fff9f5 0%, #fff 50%, #f8f5ff 100%); }
      `}</style>

      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white relative z-50">
        <div className="flex items-center justify-between px-6 md:px-12 py-4">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
            alt="Fleurs de fête"
            className="h-10 md:h-12"
          />
          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-4">
            <a href={createPageUrl("Shop")}
              className="font-sans-clean text-sm font-semibold text-rose-500 hover:text-rose-600 transition">
              Boutique 🌸
            </a>
            <a href={createPageUrl("Shop") + "?kitType=entreprise_standard"}
              className="font-sans-clean text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition">
              Cadeaux entreprise 🏢
            </a>
            <a href={createPageUrl("Shop") + "?kitType=naturel_essentiel"}
              className="font-sans-clean text-sm font-semibold text-amber-600 hover:text-amber-700 transition">
              Maisons d'hôtes 🏡
            </a>
            <a href={createPageUrl("ClientDashboard")}
              className="font-sans-clean text-sm text-gray-500 hover:text-rose-500 transition">
              Mon espace
            </a>
            <a href={createPageUrl("Shop")}
              className="font-sans-clean text-sm font-semibold text-white bg-rose-400 hover:bg-rose-500 transition px-5 py-2.5 rounded-full shadow-sm">
              Créer mon événement
            </a>
          </div>
          {/* Mobile: burger only */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-3">
            <a href={createPageUrl("Shop")}
              onClick={() => setMobileMenuOpen(false)}
              className="font-sans-clean text-sm font-semibold text-rose-500 py-2 border-b border-gray-50">
              Boutique 🌸
            </a>
            <a href={createPageUrl("Shop") + "?kitType=entreprise_standard"}
              onClick={() => setMobileMenuOpen(false)}
              className="font-sans-clean text-sm font-semibold text-emerald-600 py-2 border-b border-gray-50">
              Cadeaux entreprise 🏢
            </a>
            <a href={createPageUrl("Shop") + "?kitType=naturel_essentiel"}
              onClick={() => setMobileMenuOpen(false)}
              className="font-sans-clean text-sm font-semibold text-amber-600 py-2 border-b border-gray-50">
              Maisons d'hôtes 🏡
            </a>
            <a href={createPageUrl("ClientDashboard")}
              onClick={() => setMobileMenuOpen(false)}
              className="font-sans-clean text-sm text-gray-500 py-2 border-b border-gray-50">
              Mon espace
            </a>
            <a href={createPageUrl("Shop")}
              onClick={() => setMobileMenuOpen(false)}
              className="mt-1 font-sans-clean text-sm font-bold text-white bg-rose-400 hover:bg-rose-500 transition py-3 rounded-full text-center shadow-sm">
              Créer mon événement 🌸
            </a>
          </div>
        )}
      </nav>

      {/* Hero */}
      <div className="hero-bg px-6 md:px-12 py-20 md:py-28 text-center">
        <p className="font-sans-clean text-xs tracking-[0.3em] uppercase text-rose-400 mb-4">
          Cadeaux de mariage · Baptêmes · Anniversaires · Entreprises · Maisons d'hôtes
        </p>
        <h1 className="font-serif-elegant text-5xl md:text-7xl font-bold text-gray-800 leading-tight mb-6">
          Le cadeau qu'on<br />
          <span className="text-rose-400">n'oublie pas</span>
        </h1>
        <div className="gold-line max-w-xs mx-auto mb-6" />
        <p className="font-sans-clean text-gray-500 text-lg max-w-lg mx-auto mb-10 leading-relaxed font-light">
          Des petits pots de graines personnalisés à poser sur les tables — chaque invité plante, chaque fleur raconte encore votre histoire.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto mb-8">
          <a href={createPageUrl("Shop")}
            className="flex-1 py-4 rounded-full font-sans-clean font-bold text-white shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-rose-400 to-pink-500 hover:opacity-90 transition text-sm tracking-wide">
            <Sparkles className="w-4 h-4" /> Voir les formules
          </a>
          <a href={createPageUrl("KitFinder")}
            className="flex-1 py-4 rounded-full font-sans-clean font-semibold text-rose-500 border-2 border-rose-200 flex items-center justify-center gap-2 hover:bg-rose-50 transition text-sm">
            🎯 Quel kit pour moi ?
          </a>
        </div>

        {/* 3 arguments courts */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-2xl mx-auto mb-10">
          {[
            { icon: "✍️", text: "Personnalisé avec vos prénoms, la date et la graine de votre choix" },
            { icon: "📱", text: "Un QR code sur chaque pot pour partager les photos des fleurs" },
            { icon: "🌱", text: "Un cadeau vivant qui continue à pousser bien après la fête" },
          ].map(a => (
            <div key={a.icon} className="flex items-start gap-2 text-left max-w-[200px]">
              <span className="text-lg mt-0.5 flex-shrink-0">{a.icon}</span>
              <p className="font-sans-clean text-xs text-gray-500 leading-relaxed">{a.text}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
          <p className="font-sans-clean text-xs text-gray-400 tracking-widest uppercase">Vous avez un lien d'événement ?</p>
          <div className="flex gap-2 w-full">
            <Input
              placeholder="nom-du-couple"
              value={slugInput}
              onChange={e => setSlugInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleGoToEvent()}
              className="rounded-full h-11 text-sm border-gray-200 text-center font-sans-clean"
            />
            <Button onClick={handleGoToEvent}
              className="rounded-full h-11 px-4 bg-rose-400 hover:bg-rose-500 text-white shadow-sm">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bannière Nouveauté Kit Apéro Crackers */}
      <div className="px-6 md:px-12 py-8">
        <a
          href={createPageUrl("Shop")}
          className="block max-w-3xl mx-auto rounded-3xl border-2 border-rose-200 bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 p-6 hover:shadow-md transition-all group"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-shrink-0 w-14 h-14 bg-white rounded-2xl border border-rose-100 flex items-center justify-center text-3xl shadow-sm">
              🫙
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="inline-block bg-rose-400 text-white text-xs font-bold px-3 py-1 rounded-full font-sans-clean">
                  🆕 Nouveauté
                </span>
                <span className="font-sans-clean text-xs text-gray-400">Cadeau invités</span>
              </div>
              <h3 className="font-serif-elegant text-xl font-bold text-gray-800 mb-1">
                Kit Apéro Crackers Italiens
              </h3>
              <p className="font-sans-clean text-sm text-gray-500 leading-relaxed">
                Un mix prêt à cuisiner : farine, sel et épices italiennes (paprika, basilic, tomates, niora, origan, ail, poivre noir). Vos invités réalisent leurs crackers maison et partagent leurs photos dans un album "Vos invités en cuisine".
              </p>
            </div>
            <div className="flex-shrink-0 font-sans-clean text-sm font-semibold text-rose-500 group-hover:text-rose-600 transition whitespace-nowrap">
              Découvrir →
            </div>
          </div>
        </a>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 px-8 md:px-20 py-2">
        <div className="gold-line flex-1" />
        <span className="text-xl">🌸</span>
        <div className="gold-line flex-1" />
      </div>

      {/* How it works */}
      <div className="px-6 md:px-12 py-16 max-w-3xl mx-auto text-center">
        <p className="font-sans-clean text-xs tracking-[0.3em] uppercase text-rose-400 mb-2">Simple & magique</p>
        <h2 className="font-serif-elegant text-4xl font-bold text-gray-800 mb-12">Comment ça marche ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: "🌱", step: "01", title: "Offrez des graines", desc: "Chaque invité reçoit un petit pot avec des graines à planter." },
            { icon: "🌸", step: "02", title: "La fleur pousse", desc: "Quelques semaines plus tard, la fleur s'épanouit chez eux." },
            { icon: "📸", step: "03", title: "Ils partagent", desc: "Ils scannent le QR code et ajoutent leur photo sur votre arbre." },
          ].map(item => (
            <div key={item.step} className="flex flex-col items-center">
              <div className="text-5xl mb-4">{item.icon}</div>
              <p className="font-sans-clean text-xs tracking-widest text-gray-300 font-light mb-2">{item.step}</p>
              <h3 className="font-serif-elegant text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
              <p className="font-sans-clean text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 px-8 md:px-20 py-2">
        <div className="gold-line flex-1" />
        <span className="text-xl">💐</span>
        <div className="gold-line flex-1" />
      </div>

      {/* Plans */}
      <div className="px-6 md:px-12 py-16 max-w-3xl mx-auto text-center">
        <p className="font-sans-clean text-xs tracking-[0.3em] uppercase text-rose-400 mb-2">Tarifs</p>
        <h2 className="font-serif-elegant text-4xl font-bold text-gray-800 mb-12">Nos formules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">

          {/* Essentiel */}
          <div className="border border-gray-200 rounded-3xl p-8 bg-white shadow-sm">
            <p className="font-sans-clean text-xs tracking-[0.25em] uppercase text-gray-400 mb-3">Essentiel</p>
            <p className="font-serif-elegant text-5xl font-bold text-gray-800 mb-1">Gratuit</p>
            <p className="font-sans-clean text-sm text-gray-400 mb-1">Défi fleur simple</p>
            <p className="font-sans-clean text-xs text-rose-300 italic mb-7">🌱 Parfait pour partager les photos de fleurs sans fonctionnalités avancées</p>
            <ul className="space-y-3 mb-8">
              {FEATURES_BASIC.map(f => (
                <li key={f} className="flex items-center gap-3 font-sans-clean text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <a href={createPageUrl("CreateMyEvent") + "?plan=basic"}
              className="block text-center py-3.5 rounded-full font-sans-clean font-semibold text-sm border-2 border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-500 transition">
              Commencer gratuitement
            </a>
          </div>

          {/* Complet */}
          <div className="border-2 border-rose-200 rounded-3xl p-8 bg-gradient-to-br from-rose-50 to-pink-50 shadow-md relative overflow-hidden">
            <span className="absolute top-5 right-5 bg-rose-400 text-white text-xs font-bold px-3 py-1 rounded-full font-sans-clean">
              Le plus choisi ✨
            </span>
            <p className="font-sans-clean text-xs tracking-[0.25em] uppercase text-rose-400 mb-3">Complet</p>
            <p className="font-serif-elegant text-5xl font-bold text-gray-800 mb-1">39,99 €</p>
            <p className="font-sans-clean text-sm text-gray-400 mb-1">Par événement · paiement unique</p>
            <p className="font-sans-clean text-xs text-rose-300 italic mb-7">🌱 Site personnalisé pour mariages, baptêmes, communions & anniversaires</p>
            <ul className="space-y-3 mb-8">
              {FEATURES_PREMIUM.map(f => (
                <li key={f} className="flex items-center gap-3 font-sans-clean text-sm text-gray-700">
                  <Check className="w-4 h-4 text-rose-400 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <a href={createPageUrl("CreateMyEvent") + "?plan=premium"}
              className="block text-center py-3.5 rounded-full font-sans-clean font-semibold text-sm bg-gradient-to-r from-rose-400 to-pink-500 text-white hover:opacity-90 transition shadow-sm">
              Choisir la formule Complète
            </a>
          </div>

        </div>
      </div>

      {/* Avis clients slider */}
      <ReviewsSlider />

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100 text-center">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
          alt="Fleurs de fête"
          className="w-20 mx-auto mb-3 opacity-60"
        />
        <p className="font-sans-clean text-xs text-gray-400 tracking-widest mb-6">"Merci d'avoir partagé ce moment avec nous"</p>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-gray-400 font-sans-clean mb-4">
          <a href={createPageUrl("Contact")} className="hover:text-rose-400 transition">Contact</a>
          <span className="text-gray-200">·</span>
          <a href={createPageUrl("CGV")} className="hover:text-rose-400 transition">CGV</a>
          <span className="text-gray-200">·</span>
          <a href={createPageUrl("CGU")} className="hover:text-rose-400 transition">CGU</a>
          <span className="text-gray-200">·</span>
          <a href={createPageUrl("MentionsLegales")} className="hover:text-rose-400 transition">Mentions légales & RGPD</a>
        </div>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-gray-400 font-sans-clean mb-4">
          <a href={createPageUrl("ClientDashboard")} className="hover:text-rose-400 transition">Mon compte</a>
          <span className="text-gray-200">·</span>
          <a href={createPageUrl("OrderTracking")} className="hover:text-rose-400 transition">Suivi commande</a>
        </div>
        <p className="font-sans-clean text-xs text-gray-300">© 2025 Fleurs en fête — Papin Gwenaëlle — RCS Nantes 848 506 861 — contact@fleursdefete.fr</p>
      </footer>
    </div>
  );
}