import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPageUrl } from "@/utils";
import { ChevronRight, Sparkles, Check } from "lucide-react";

const FEATURES_BASIC = [
  "Défi fleur & galerie photos interactive",
  "QR code sur vos pots de fleurs",
  "Compteur de fleurs en temps réel",
  "Accès gratuit (sans site personnalisé)",
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

  const handleGoToEvent = () => {
    if (slugInput.trim()) {
      window.location.href = createPageUrl(`EventPublic`) + `?slug=${slugInput.trim()}`;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
        .gold-line { background: linear-gradient(90deg, transparent, #c9a96e, transparent); height: 1px; }
        .hero-bg { background: linear-gradient(160deg, #fff9f5 0%, #fff 50%, #f8f5ff 100%); }
      `}</style>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-gray-100">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
          alt="Fleurs de fête"
          className="h-12"
        />
        <div className="flex items-center gap-3">
          <a href={createPageUrl("Shop")}
            className="font-sans-clean text-sm font-semibold text-rose-500 hover:text-rose-600 transition hidden sm:block">
            Boutique 🌸
          </a>
          <a href={createPageUrl("ClientDashboard")}
            className="font-sans-clean text-sm text-gray-500 hover:text-rose-500 transition hidden sm:block">
            Mon espace
          </a>
          <a href={createPageUrl("Boutique")}
            className="font-sans-clean text-sm font-semibold text-white bg-rose-400 hover:bg-rose-500 transition px-5 py-2.5 rounded-full shadow-sm">
            Créer mon événement
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div className="hero-bg px-6 md:px-12 py-20 md:py-28 text-center">
        <p className="font-sans-clean text-xs tracking-[0.3em] uppercase text-rose-400 mb-4">
          Mariages · Anniversaires · Baptêmes · Fêtes d'entreprise · Maisons d'hôte
        </p>
        <h1 className="font-serif-elegant text-5xl md:text-7xl font-bold text-gray-800 leading-tight mb-6">
          Faites fleurir<br />
          <span className="text-rose-400">vos souvenirs</span>
        </h1>
        <div className="gold-line max-w-xs mx-auto mb-6" />
        <p className="font-sans-clean text-gray-500 text-lg max-w-lg mx-auto mb-10 leading-relaxed font-light">
          Offrez à vos invités un petit pot de graines. Quand leur fleur pousse, ils partagent leur photo — et votre amour fleurit à l'infini.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto mb-10">
          <a href={createPageUrl("Boutique")}
            className="flex-1 py-4 rounded-full font-sans-clean font-bold text-white shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-rose-400 to-pink-500 hover:opacity-90 transition text-sm tracking-wide">
            <Sparkles className="w-4 h-4" /> Créer mon événement
          </a>
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
            <p className="font-sans-clean text-xs text-rose-300 italic mb-7">🌱 Parfait pour les clients qui ne veulent qu'une galerie partagée</p>
            <ul className="space-y-3 mb-8">
              {FEATURES_BASIC.map(f => (
                <li key={f} className="flex items-center gap-3 font-sans-clean text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <a href={createPageUrl("Boutique")}
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
            <p className="font-sans-clean text-xs text-rose-300 italic mb-7">🌱 Site disponible uniquement avec une commande de pots</p>
            <ul className="space-y-3 mb-8">
              {FEATURES_PREMIUM.map(f => (
                <li key={f} className="flex items-center gap-3 font-sans-clean text-sm text-gray-700">
                  <Check className="w-4 h-4 text-rose-400 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <a href={createPageUrl("Boutique")}
              className="block text-center py-3.5 rounded-full font-sans-clean font-semibold text-sm bg-gradient-to-r from-rose-400 to-pink-500 text-white hover:opacity-90 transition shadow-sm">
              Choisir la formule Complète
            </a>
          </div>

        </div>
      </div>

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
        <p className="font-sans-clean text-xs text-gray-300">© 2025 Fleurs en fête — Papin Gwenaëlle — contact@fleursdefete.fr</p>
      </footer>
    </div>
  );
}