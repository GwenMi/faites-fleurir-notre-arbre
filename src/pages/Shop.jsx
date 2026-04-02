import { useState } from "react";
import ShopBanner from "@/components/shop/ShopBanner";
import WizardProgress from "@/components/shop/WizardProgress";
import StepKitOptions from "@/components/shop/StepKitOptions";
import StepPackSelector from "@/components/shop/StepPackSelector";
import StepCustomization from "@/components/shop/StepCustomization";
import StepEventSlug from "@/components/shop/StepEventSlug";
import StepAuthentication from "@/components/shop/StepAuthentication";
import StepCustomerForm from "@/components/shop/StepCustomerForm";
import StepShipping from "@/components/shop/StepShipping";
import StepOrderSummary from "@/components/shop/StepOrderSummary";
import ReviewCarousel from "@/components/shop/ReviewCarousel";
import { createPageUrl } from "@/utils";
import { Sparkles, ArrowRight, Package, Leaf, Heart, Check } from "lucide-react";

const STEPS = ["Type d'événement", "Kit & options", "Pack invités", "Personnalisation", "Site personnalisé", "Votre compte", "Vos informations", "Livraison", "Récapitulatif"];

const EVENT_TYPES = [
  { id: "mariage", label: "💍 Mariage", hasSite: true },
  { id: "bapteme", label: "👶 Baptême", hasSite: true },
  { id: "communion", label: "✨ Communion", hasSite: true },
  { id: "anniversaire", label: "🎂 Anniversaire", hasSite: true },
  { id: "entreprise", label: "🏢 Entreprise", hasSite: false },
  { id: "chambre_hotes", label: "🏡 Chambre d'hôtes", hasSite: false },
  { id: "autre", label: "🎉 Autre", hasSite: false },
];

export const PRICING = {
  KIT_COMPOSE: 2.90,
  KIT_PRET: 4.90,
  SAC_CADEAU: 0.40,
};

const SEEDS = [
  { id: "tournesol_nain", label: "🌻 Tournesol nain", description: "Compact et joyeux" },
  { id: "mignonnette", label: "🌸 Mignonnette", description: "Parfumé et délicat" },
  { id: "coquelicot", label: "🌷 Coquelicot", description: "Rouge éclatant" },
  { id: "bleuet", label: "💙 Bleuet", description: "Bleu profond" },
];

function ShopHomePage({ onStart }) {
  return (
    <div className="min-h-screen bg-white">
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
          <button onClick={onStart}
            className="font-sans-shop text-sm font-semibold text-white bg-rose-400 hover:bg-rose-500 transition px-5 py-2.5 rounded-full shadow-sm">
            Commander
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-b from-rose-50 to-white px-6 md:px-12 py-16 md:py-24 text-center">
        <p className="font-sans-shop text-xs tracking-[0.3em] uppercase text-rose-400 mb-4">Cadeaux naturels & poétiques</p>
        <h1 className="font-serif-shop text-5xl md:text-7xl font-bold text-gray-800 leading-tight mb-6">
          Des pots de graines<br />
          <span className="text-rose-400">qui fleurissent</span>
        </h1>
        <div className="gold-line-shop max-w-xs mx-auto mb-6" />
        <p className="font-sans-shop text-gray-500 text-lg max-w-lg mx-auto mb-10 leading-relaxed font-light">
          Offrez à vos invités un souvenir vivant : un petit pot de fleurs à faire pousser chez eux. Personnalisé, éco-responsable, inoubliable.
        </p>
        <button onClick={onStart}
          className="inline-flex items-center gap-2 py-4 px-8 rounded-full font-sans-shop font-bold text-white shadow-lg bg-gradient-to-r from-rose-400 to-pink-500 hover:opacity-90 transition text-sm tracking-wide">
          <Sparkles className="w-4 h-4" /> Créer mon kit de pots
        </button>
        <p className="font-sans-shop text-xs text-gray-400 mt-4">À partir de 2,90 € / invité · Pot en verre · Étiquette personnalisée</p>
      </div>



      {/* Comment ça marche */}
      <div className="px-6 md:px-12 py-16 max-w-4xl mx-auto text-center">
        <p className="font-sans-shop text-xs tracking-[0.3em] uppercase text-rose-400 mb-2">Simple & magique</p>
        <h2 className="font-serif-shop text-4xl font-bold text-gray-800 mb-12">Comment ça marche ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { icon: <Package className="w-7 h-7" />, step: "01", title: "Composez votre kit", desc: "Choisissez le type de pot, la graine, les options d'emballage et la quantité." },
            { icon: <Leaf className="w-7 h-7" />, step: "02", title: "Offrez à vos invités", desc: "Chaque invité reçoit son pot à planter. Simple, naturel, touchant." },
            { icon: <Heart className="w-7 h-7" />, step: "03", title: "Ils partagent", desc: "Quand la fleur pousse, ils scannent le QR code et partagent leur photo." },
          ].map(item => (
            <div key={item.step} className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-400 mb-4">{item.icon}</div>
              <p className="font-sans-shop text-xs tracking-widest text-gray-300 mb-2">{item.step}</p>
              <h3 className="font-serif-shop text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
              <p className="font-sans-shop text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Avantages */}
      <div className="bg-rose-50 px-6 md:px-12 py-14">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif-shop text-3xl font-bold text-gray-800 text-center mb-10">Pourquoi choisir Fleurs de fête ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "📦 Format léger avec pastille de terre compressée",
              "♻️ Emballage éco-responsable",
              "✍️ Personnalisation : prénoms, date & logo",
              "🚚 Livraison soignée",
              "🌸 Compatible mariage, baptême, anniversaire…",
              "🤝 Service client disponible et réactif",
            ].map(item => (
              <div key={item} className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3.5 border border-rose-100 shadow-sm">
                <Check className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span className="font-sans-shop text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cas d'usage */}
      <div className="px-6 md:px-12 py-16 max-w-6xl mx-auto">
        <p className="font-sans-shop text-xs tracking-[0.3em] uppercase text-rose-400 mb-2 text-center">Parfait pour chaque occasion</p>
        <h2 className="font-serif-shop text-4xl font-bold text-gray-800 mb-12 text-center">Plus qu'un cadeau, un souvenir vivant</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Mariage */}
          <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-3xl p-8 border border-rose-200">
            <div className="w-12 h-12 rounded-full bg-rose-400 text-white flex items-center justify-center mb-4 text-xl">💍</div>
            <h3 className="font-serif-shop text-xl font-bold text-gray-800 mb-3">Mariage</h3>
            <p className="font-sans-shop text-sm text-gray-700 leading-relaxed">
              Un cadeau de mariage inoubliable. Vos invités planteront cette fleur et penseront à votre grand jour chaque fois qu'elle s'épanouit. Un souvenir vivant de votre amour.
            </p>
          </div>

          {/* Baptême */}
          <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-3xl p-8 border border-sky-200">
            <div className="w-12 h-12 rounded-full bg-sky-400 text-white flex items-center justify-center mb-4 text-xl">👶</div>
            <h3 className="font-serif-shop text-xl font-bold text-gray-800 mb-3">Baptême</h3>
            <p className="font-sans-shop text-sm text-gray-700 leading-relaxed">
              Célébrez l'arrivée avec un cadeau qui grandit. Le bébé pourra voir sa fleur s'épanouir en grandissant avec lui. Une belle métaphore de vie et de croissance.
            </p>
          </div>

          {/* Communion */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-8 border border-purple-200">
            <div className="w-12 h-12 rounded-full bg-purple-400 text-white flex items-center justify-center mb-4 text-xl">✨</div>
            <h3 className="font-serif-shop text-xl font-bold text-gray-800 mb-3">Communion</h3>
            <p className="font-sans-shop text-sm text-gray-700 leading-relaxed">
              Marquez ce moment important avec un cadeau naturel et poétique. Une belle façon de célébrer sans oublier l'environnement et la simplicité.
            </p>
          </div>

          {/* Anniversaire */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-3xl p-8 border border-yellow-200">
            <div className="w-12 h-12 rounded-full bg-yellow-400 text-white flex items-center justify-center mb-4 text-xl">🎂</div>
            <h3 className="font-serif-shop text-xl font-bold text-gray-800 mb-3">Anniversaire</h3>
            <p className="font-sans-shop text-sm text-gray-700 leading-relaxed">
              Offrez une expérience plus qu'un objet. Chaque invité repart avec un petit bout de nature à cultiver, une belle façon de prolonger la magie de la fête.
            </p>
          </div>

          {/* Entreprises */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 border border-blue-200">
            <div className="w-12 h-12 rounded-full bg-blue-400 text-white flex items-center justify-center mb-4 text-xl">🏢</div>
            <h3 className="font-serif-shop text-xl font-bold text-gray-800 mb-3">Entreprises</h3>
            <p className="font-sans-shop text-sm text-gray-700 leading-relaxed">
              Renforcez l'esprit d'équipe avec un cadeau original. Quand chaque collaborateur voit sa fleur s'épanouir sur son bureau, c'est un moment partagé de fierté collective.
            </p>
          </div>

          {/* Chambres d'hôtes */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl p-8 border border-amber-200">
            <div className="w-12 h-12 rounded-full bg-amber-400 text-white flex items-center justify-center mb-4 text-xl">🏡</div>
            <h3 className="font-serif-shop text-xl font-bold text-gray-800 mb-3">Chambres d'Hôtes</h3>
            <p className="font-sans-shop text-sm text-gray-700 leading-relaxed">
              Un petit pot personnalisé pour vos hôtes. Chaque fleur qui s'épanouit les ramène à votre maison et leur donne envie de réserver à nouveau.
            </p>
          </div>
        </div>
      </div>

      {/* Avis */}
      <ReviewCarousel />

      {/* CTA final */}
      <div className="bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-16 text-center text-white">
        <h2 className="font-serif-shop text-4xl font-bold mb-4">Prêt à faire fleurir votre événement ?</h2>
        <p className="font-sans-shop text-white/80 text-sm mb-8 max-w-md mx-auto">
          Créez votre kit en quelques minutes. Livraison rapide, qualité garantie.
        </p>
        <button onClick={onStart}
          className="inline-flex items-center gap-2 bg-white text-rose-500 font-bold px-8 py-4 rounded-full hover:bg-rose-50 transition shadow-lg font-sans-shop text-sm">
          Composer mon kit <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-gray-100 text-center">
        <p className="font-sans-shop text-xs text-gray-400 tracking-widest mb-4">"Merci d'avoir partagé ce moment avec nous"</p>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-gray-400 font-sans-shop">
          <a href={createPageUrl("Contact")} className="hover:text-rose-400 transition">Contact</a>
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

function StepEventType({ selection, onUpdate, onNext, onBack }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl font-bold text-gray-800 mb-2">Quel type d'événement ?</h2>
        <p style={{ fontFamily: "'Lato', sans-serif" }} className="text-gray-500">Sélectionnez votre type d'événement pour une expérience adaptée.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {EVENT_TYPES.map(event => (
          <button
            key={event.id}
            onClick={() => onUpdate({ eventType: event.id })}
            className={`p-4 rounded-2xl border-2 transition text-left ${
              selection.eventType === event.id
                ? 'border-rose-400 bg-rose-50'
                : 'border-gray-200 bg-white hover:border-rose-200'
            }`}
          >
            <p style={{ fontFamily: "'Lato', sans-serif" }} className="font-semibold text-gray-800">{event.label}</p>
            {event.hasSite && <p style={{ fontFamily: "'Lato', sans-serif" }} className="text-xs text-rose-400 mt-1">✓ Site personnalisé possible</p>}
          </button>
        ))}
      </div>

      <div className="flex gap-3 pt-6">
        <button onClick={onBack}
          className="flex-1 py-3 rounded-full font-sans-shop font-semibold text-gray-600 border-2 border-gray-200 hover:border-gray-300 transition text-sm">
          Retour
        </button>
        <button onClick={onNext}
          disabled={!selection.eventType}
          className={`flex-1 py-3 rounded-full font-sans-shop font-semibold text-white transition text-sm ${
            selection.eventType 
              ? 'bg-rose-400 hover:bg-rose-500' 
              : 'bg-gray-300 cursor-not-allowed'
          }`}>
          Suivant
        </button>
      </div>
    </div>
  );
}

export default function Shop() {
  const [step, setStep] = useState(0);
  const [selection, setSelection] = useState({
    eventType: null,
    kitType: null,
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
  const sacExtra = selection.sacCadeau ? PRICING.SAC_CADEAU : 0;
  const pricePerPot = baseKitPrice + sacExtra;
  const totalPots = (selection.packs || []).reduce((sum, p) => sum + p.size * p.qty, 0);
  const totalPackCount = (selection.packs || []).reduce((sum, p) => sum + p.qty, 0);
  const subtotal = pricePerPot * totalPots;
  const discount = totalPackCount >= 2 ? subtotal * 0.1 : 0;
  const shippingCost = shippingMethod?.price ?? 0;
  const total = subtotal - discount + shippingCost;
  const pricing = { pricePerPot, totalPots, subtotal, discount, shippingCost, total };

  const updateSelection = (updates) => setSelection(s => ({ ...s, ...updates }));

  if (step === 0) return <ShopHomePage onStart={() => setStep(1)} />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <ShopBanner />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <WizardProgress currentStep={step} steps={STEPS} />
        <div className="mt-8">
          {step === 1 && (
            <StepEventType
              selection={selection}
              onUpdate={updateSelection}
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <StepKitOptions
              selection={selection}
              onUpdate={updateSelection}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
              PRICING={PRICING}
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
            <StepAuthentication
              onNext={() => setStep(7)}
              onBack={() => setStep(5)}
            />
          )}
          {step === 7 && (
            <StepCustomerForm
              customerInfo={customerInfo}
              onChange={setCustomerInfo}
              onNext={() => setStep(8)}
              onBack={() => setStep(6)}
            />
          )}
          {step === 8 && (
            <StepShipping
              totalPots={pricing.totalPots}
              shippingMethod={shippingMethod}
              onSelect={setShippingMethod}
              onNext={() => setStep(9)}
              onBack={() => setStep(7)}
            />
          )}
          {step === 9 && (
            <StepOrderSummary
              selection={selection}
              customerInfo={customerInfo}
              pricing={pricing}
              PRICING={PRICING}
              shippingMethod={shippingMethod}
              onBack={() => setStep(8)}
            />
          )}
        </div>
      </div>
    </div>
  );
}