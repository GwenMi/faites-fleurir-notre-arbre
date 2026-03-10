import { useState } from "react";
import ShopBanner from "@/components/shop/ShopBanner";
import WizardProgress from "@/components/shop/WizardProgress";
import StepKitOptions from "@/components/shop/StepKitOptions";
import StepPackSelector from "@/components/shop/StepPackSelector";
import StepCustomerForm from "@/components/shop/StepCustomerForm";
import StepOrderSummary from "@/components/shop/StepOrderSummary";
import { createPageUrl } from "@/utils";
import { Sparkles, Star, ArrowRight, Package, Leaf, Heart, Check } from "lucide-react";

const STEPS = ["Kit & options", "Pack invités", "Vos informations", "Récapitulatif"];

export const PRICING = {
  KIT_COMPOSE: 2.50,
  KIT_PRET: 4.50,
  POT_BLANC_EXTRA: 0.50,
  SAC_CADEAU: 0.40,
};

const REVIEWS = [
  { name: "Marie & Thomas", event: "Mariage juin 2024", text: "Un cadeaux d'invité unique et poétique. Tout le monde a adoré !", stars: 5 },
  { name: "Camille R.", event: "Baptême de Léo", text: "Superbe qualité, livraison rapide. Les pots étaient magnifiques.", stars: 5 },
  { name: "Aurélie D.", event: "Anniversaire 40 ans", text: "Original et plein de sens. Je recommande vivement.", stars: 5 },
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
        <p className="font-sans-shop text-xs tracking-[0.3em] uppercase text-rose-400 mb-4">Cadeaux d'invités naturels & poétiques</p>
        <h1 className="font-serif-shop text-5xl md:text-7xl font-bold text-gray-800 leading-tight mb-6">
          Des pots de graines<br />
          <span className="text-rose-400">qui fleurissent</span>
        </h1>
        <div className="gold-line-shop max-w-xs mx-auto mb-6" />
        <p className="font-sans-shop text-gray-500 text-lg max-w-lg mx-auto mb-10 leading-relaxed font-light">
          Offrez à vos invités un souvenir vivant : un petit pot de fleurs à planter chez eux. Personnalisé, éco-responsable, inoubliable.
        </p>
        <button onClick={onStart}
          className="inline-flex items-center gap-2 py-4 px-8 rounded-full font-sans-shop font-bold text-white shadow-lg bg-gradient-to-r from-rose-400 to-pink-500 hover:opacity-90 transition text-sm tracking-wide">
          <Sparkles className="w-4 h-4" /> Créer mon kit de pots
        </button>
        <p className="font-sans-shop text-xs text-gray-400 mt-4">À partir de 2,50 € / pot · Livraison offerte (offre lancement)</p>
      </div>

      {/* Photo band */}
      <div className="grid grid-cols-3 gap-0 max-h-48 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1487530811015-780fbb43a7dd?w=400&q=80" alt="" className="w-full h-48 object-cover" />
        <img src="https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=400&q=80" alt="" className="w-full h-48 object-cover" />
        <img src="https://images.unsplash.com/photo-1490750967868-88df5691cc01?w=400&q=80" alt="" className="w-full h-48 object-cover" />
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
              "🌱 Graines 100% françaises et naturelles",
              "♻️ Emballage éco-responsable",
              "✍️ Personnalisation avec vos prénoms & date",
              "🚚 Livraison soignée à domicile",
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

      {/* Avis */}
      <div className="px-6 md:px-12 py-16 max-w-4xl mx-auto text-center">
        <p className="font-sans-shop text-xs tracking-[0.3em] uppercase text-rose-400 mb-2">Témoignages</p>
        <h2 className="font-serif-shop text-4xl font-bold text-gray-800 mb-10">Ils nous ont fait confiance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {REVIEWS.map((r, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-left">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: r.stars }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="font-sans-shop text-sm text-gray-600 leading-relaxed mb-4 italic">"{r.text}"</p>
              <p className="font-sans-shop text-xs font-bold text-gray-800">{r.name}</p>
              <p className="font-sans-shop text-xs text-gray-400">{r.event}</p>
            </div>
          ))}
        </div>
      </div>

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

export default function Shop() {
  const [step, setStep] = useState(0);
  const [selection, setSelection] = useState({
    kitType: null,
    potType: "verre",
    sacCadeau: false,
    packSize: null,
    packQty: 1,
  });
  const [customerInfo, setCustomerInfo] = useState({
    name: "", email: "", phone: "", address: "", eventDate: ""
  });

  const baseKitPrice = selection.kitType === "pret" ? PRICING.KIT_PRET : PRICING.KIT_COMPOSE;
  const potExtra = selection.potType === "blanc" ? PRICING.POT_BLANC_EXTRA : 0;
  const sacExtra = selection.sacCadeau ? PRICING.SAC_CADEAU : 0;
  const pricePerPot = baseKitPrice + potExtra + sacExtra;
  const totalPots = (selection.packSize || 0) * selection.packQty;
  const subtotal = pricePerPot * totalPots;
  const discount = selection.packQty >= 2 ? subtotal * 0.1 : 0;
  const total = subtotal - discount;
  const pricing = { pricePerPot, totalPots, subtotal, discount, total };

  const updateSelection = (updates) => setSelection(s => ({ ...s, ...updates }));

  if (step === 0) return <ShopHomePage onStart={() => setStep(1)} />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <ShopBanner />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <WizardProgress currentStep={step} steps={STEPS} />
        <div className="mt-8">
          {step === 1 && (
            <StepKitOptions
              selection={selection}
              onUpdate={updateSelection}
              onNext={() => setStep(2)}
              PRICING={PRICING}
            />
          )}
          {step === 2 && (
            <StepPackSelector
              selection={selection}
              onUpdate={updateSelection}
              pricing={pricing}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <StepCustomerForm
              customerInfo={customerInfo}
              onChange={setCustomerInfo}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <StepOrderSummary
              selection={selection}
              customerInfo={customerInfo}
              pricing={pricing}
              PRICING={PRICING}
              onBack={() => setStep(3)}
            />
          )}
        </div>
      </div>
    </div>
  );
}