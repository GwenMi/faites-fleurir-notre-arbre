import { useState } from "react";
import ShopBanner from "@/components/shop/ShopBanner";
import WizardProgress from "@/components/shop/WizardProgress";
import StepKitOptions from "@/components/shop/StepKitOptions";
import StepPackSelector from "@/components/shop/StepPackSelector";
import StepCustomization from "@/components/shop/StepCustomization";
import StepEventSlug from "@/components/shop/StepEventSlug";
import StepCustomerForm from "@/components/shop/StepCustomerForm";
import StepShipping from "@/components/shop/StepShipping";
import StepOrderSummary from "@/components/shop/StepOrderSummary";
import ReviewCarousel from "@/components/shop/ReviewCarousel";
import { createPageUrl } from "@/utils";
import { Sparkles, ArrowRight, Package, Leaf, Heart, Check } from "lucide-react";

const STEPS = ["Type d'événement", "Kit & options", "Pack invités", "Personnalisation", "Site personnalisé", "Vos informations", "Livraison", "Récapitulatif"];

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
  KIT_COMPOSE: 3.90,
  KIT_PRET: 5.90,
  SAC_CADEAU: 0.40,
};

const SEEDS = [
  { id: "tournesol_nain", label: "🌻 Tournesol nain", description: "Compact et joyeux" },
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
        <p className="font-sans-shop text-xs tracking-[0.3em] uppercase text-rose-400 mb-4">Cadeaux de mariage · Baptêmes · Anniversaires · Entreprises</p>
        <h1 className="font-serif-shop text-5xl md:text-7xl font-bold text-gray-800 leading-tight mb-6">
          Un souvenir qui continue<br />
          <span className="text-rose-400">à fleurir chez vos invités</span>
        </h1>
        <div className="gold-line-shop max-w-xs mx-auto mb-6" />
        <p className="font-sans-shop text-gray-500 text-lg max-w-lg mx-auto mb-10 leading-relaxed font-light">
          Un petit pot de graines personnalisé, posé sur chaque table. Lorsque la fleur pousse, vos invités pensent encore à votre mariage — et partagent la photo.
        </p>
        <button onClick={onStart}
          className="inline-flex items-center gap-2 py-4 px-8 rounded-full font-sans-shop font-bold text-white shadow-lg bg-gradient-to-r from-rose-400 to-pink-500 hover:opacity-90 transition text-sm tracking-wide">
          <Sparkles className="w-4 h-4" /> Composer mon kit
        </button>
        <p className="font-sans-shop text-xs text-gray-400 mt-4">À partir de 3,90 € / invité · Prénoms & date gravés · Graine au choix</p>
      </div>



      {/* Deux formules */}
      <div className="px-6 md:px-12 py-12 max-w-3xl mx-auto">
        <p className="font-sans-shop text-xs tracking-[0.3em] uppercase text-rose-400 mb-3 text-center">Deux formules, une seule promesse</p>
        <h2 className="font-serif-shop text-3xl font-bold text-gray-800 mb-8 text-center">Choisissez votre façon d'offrir</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="border-2 border-gray-200 rounded-3xl p-7 bg-white">
            <p className="font-sans-shop text-xs tracking-widest uppercase text-gray-400 mb-1">Kit à composer</p>
            <p className="font-serif-shop text-4xl font-bold text-gray-800 mb-1">3,90 €<span className="text-sm font-normal text-gray-400"> / invité</span></p>
            <p className="font-sans-shop text-sm text-gray-500 mb-4 leading-relaxed">Vous assemblez vous-même les éléments à votre rythme — graines, pastille de terre, étiquette personnalisée — pour un résultat fait main et personnel.</p>
            <ul className="space-y-2">{["Graines de fleur","Pastille de semis","Étiquette personnalisée","QR code galerie photos","Notice de plantation"].map(f => <li key={f} className="flex items-center gap-2 font-sans-shop text-sm text-gray-700"><span className="text-green-400 text-xs">✓</span>{f}</li>)}</ul>
          </div>
          <div className="border-2 border-rose-300 rounded-3xl p-7 bg-rose-50 relative">
            <span className="absolute top-4 right-4 bg-rose-400 text-white text-xs font-bold px-2.5 py-1 rounded-full font-sans-shop">Le plus choisi ✨</span>
            <p className="font-sans-shop text-xs tracking-widest uppercase text-rose-400 mb-1">Kit prêt à offrir</p>
            <p className="font-serif-shop text-4xl font-bold text-gray-800 mb-1">5,90 €<span className="text-sm font-normal text-gray-400"> / invité</span></p>
            <p className="font-sans-shop text-sm text-gray-600 mb-4 leading-relaxed">Tout arrive assemblé et emballé. Il suffit de poser les pots sur les tables le jour J — rien à préparer, rien à stresser.</p>
            <ul className="space-y-2">{["Graines de fleur","Pastille de semis","Étiquette personnalisée","QR code galerie photos","Notice de plantation","Assemblé & prêt à poser ✓"].map(f => <li key={f} className="flex items-center gap-2 font-sans-shop text-sm text-gray-700"><span className="text-rose-400 text-xs">✓</span>{f}</li>)}</ul>
          </div>
        </div>
        <div className="text-center mt-6">
          <button onClick={onStart} className="inline-flex items-center gap-2 py-3.5 px-8 rounded-full font-sans-shop font-bold text-white bg-rose-400 hover:bg-rose-500 transition text-sm shadow-sm">
            Composer mon kit <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Frise chronologique */}
      <div className="px-6 md:px-12 py-12 max-w-3xl mx-auto">
        <p className="font-sans-shop text-xs tracking-[0.3em] uppercase text-rose-400 mb-3 text-center">Le voyage du cadeau</p>
        <h2 className="font-serif-shop text-3xl font-bold text-gray-800 mb-8 text-center">De votre table à leur fenêtre</h2>
        <div className="flex flex-col sm:flex-row items-start gap-0">
          {[
            { time: "Jour J", icon: "🌿", desc: "Le pot est posé sur la table, personnalisé à votre image." },
            { time: "J+7", icon: "🏡", desc: "Votre invité le ramène chez lui et le plante." },
            { time: "J+30", icon: "🌱", desc: "Les premières pousses apparaissent." },
            { time: "J+60", icon: "🌸", desc: "La fleur s'épanouit — il scanne le QR code et partage la photo." },
            { time: "1 an après", icon: "💛", desc: "La fleur refleurit. Il pense encore à votre mariage." },
          ].map((step, i) => (
            <div key={i} className="flex sm:flex-col items-start sm:items-center flex-1 gap-3 sm:gap-2 relative mb-6 sm:mb-0">
              <div className="flex sm:flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-lg flex-shrink-0">{step.icon}</div>
                {i < 4 && <div className="hidden sm:block w-full h-0.5 bg-rose-100 absolute top-5 left-1/2" style={{width:'100%', zIndex:0}}></div>}
              </div>
              <div className="sm:text-center">
                <p className="font-sans-shop text-xs font-bold text-rose-400 uppercase tracking-wide mb-1">{step.time}</p>
                <p className="font-sans-shop text-xs text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comment ça marche — par formule */}
      <div className="px-6 md:px-12 py-12 max-w-4xl mx-auto">
        <p className="font-sans-shop text-xs tracking-[0.3em] uppercase text-rose-400 mb-3 text-center">Selon votre formule</p>
        <h2 className="font-serif-shop text-3xl font-bold text-gray-800 mb-10 text-center">Comment ça se passe ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="font-serif-shop text-xl font-bold text-gray-800 mb-5">🌱 Kit à composer</p>
            <div className="space-y-4">
              {[
                { n:"01", t:"Vous commandez les éléments", d:"Pots, graines, étiquettes et pastilles vous sont livrés séparément." },
                { n:"02", t:"Vous assemblez à votre rythme", d:"Un moment zen avant le grand jour, idéal à faire à plusieurs." },
                { n:"03", t:"Vous distribuez le jour J", d:"Posez les pots sur les tables ou glissez-les dans les pochettes invités." },
              ].map(s => (
                <div key={s.n} className="flex gap-4">
                  <span className="font-sans-shop text-xs text-gray-300 font-bold mt-0.5 flex-shrink-0 w-6">{s.n}</span>
                  <div><p className="font-sans-shop font-semibold text-gray-800 text-sm">{s.t}</p><p className="font-sans-shop text-xs text-gray-500 mt-0.5">{s.d}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="font-serif-shop text-xl font-bold text-gray-800 mb-5">🎁 Kit prêt à offrir</p>
            <div className="space-y-4">
              {[
                { n:"01", t:"Vous commandez en quelques clics", d:"Choisissez la quantité, personnalisez l'étiquette, validez." },
                { n:"02", t:"Chaque pot arrive assemblé", d:"Emballé, étiqueté, prêt à poser — aucune préparation nécessaire." },
                { n:"03", t:"Vous posez sur les tables le jour J", d:"C'est tout. Vos invités repartent avec un souvenir vivant." },
              ].map(s => (
                <div key={s.n} className="flex gap-4">
                  <span className="font-sans-shop text-xs text-gray-300 font-bold mt-0.5 flex-shrink-0 w-6">{s.n}</span>
                  <div><p className="font-sans-shop font-semibold text-gray-800 text-sm">{s.t}</p><p className="font-sans-shop text-xs text-gray-500 mt-0.5">{s.d}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Avantages */}
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

      {/* Réassurance */}
      <div className="px-6 md:px-12 py-10 max-w-2xl mx-auto text-center">
        <p className="font-sans-shop text-sm text-gray-500 leading-relaxed italic">
          Chaque commande est préparée avec soin par Gwenaëlle, depuis Nantes. Livraison soignée, emballage éco-responsable, graines certifiées non traitées.
        </p>
      </div>

      {/* CTA final */}
      <div className="bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-16 text-center text-white">
        <h2 className="font-serif-shop text-4xl font-bold mb-4">Un souvenir qui fleurit longtemps après</h2>
        <p className="font-sans-shop text-white/80 text-sm mb-8 max-w-md mx-auto">
          Composez votre kit en quelques minutes. Livraison soignée, graines certifiées, étiquette personnalisée.
        </p>
        <button onClick={onStart}
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

  if (step === 0) return <ShopHomePage onStart={() => setStep(1)} />;

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
              onBack={() => setStep(hasSite ? 6 : 5)}
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