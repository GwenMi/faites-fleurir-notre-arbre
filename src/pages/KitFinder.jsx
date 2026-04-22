import { useState } from "react";
import { createPageUrl } from "@/utils";
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles, Check } from "lucide-react";

const STEPS = [
  { id: "event", title: "Votre événement", subtitle: "Quel est le type d'événement ?" },
  { id: "recipient", title: "Le destinataire", subtitle: "À qui s'adresse ce cadeau ?" },
  { id: "budget", title: "Votre budget", subtitle: "Quel est votre budget par personne ?" },
];

const EVENT_OPTIONS = [
  { id: "mariage", label: "Mariage", icon: "💍" },
  { id: "bapteme", label: "Baptême", icon: "👶" },
  { id: "communion", label: "Communion", icon: "✨" },
  { id: "anniversaire", label: "Anniversaire", icon: "🎂" },
  { id: "entreprise", label: "Entreprise", icon: "🏢" },
  { id: "maison_hotes", label: "Maison d'hôtes", icon: "🏡" },
];

const RECIPIENT_OPTIONS = {
  mariage: [
    { id: "invites", label: "Mes invités", icon: "👥" },
    { id: "temoins", label: "Mes témoins / proches", icon: "💛" },
  ],
  bapteme: [
    { id: "invites", label: "Tous les invités", icon: "👥" },
    { id: "famille", label: "La famille proche", icon: "👨‍👩‍👧" },
  ],
  communion: [
    { id: "invites", label: "Tous les invités", icon: "👥" },
    { id: "enfants", label: "Les enfants", icon: "🧒" },
  ],
  anniversaire: [
    { id: "invites", label: "Tous les invités", icon: "👥" },
    { id: "amis", label: "Les amis proches", icon: "🎉" },
  ],
  entreprise: [
    { id: "collaborateurs", label: "Mes collaborateurs", icon: "👔" },
    { id: "clients", label: "Mes clients", icon: "🤝" },
  ],
  maison_hotes: [
    { id: "hotes", label: "Mes hôtes / voyageurs", icon: "🛎️" },
    { id: "fidelite", label: "Clients fidèles", icon: "⭐" },
  ],
};

const BUDGET_OPTIONS = [
  { id: "low", label: "Moins de 5 €", icon: "💚", max: 5 },
  { id: "mid", label: "5 € – 10 €", icon: "💛", min: 5, max: 10 },
  { id: "high", label: "Plus de 10 €", icon: "🏆", min: 10 },
];

// Recommendation logic
function getRecommendation({ event, recipient, budget }) {
  if (event === "entreprise") {
    if (budget === "high") return {
      title: 'Pack Premium "Moniteur"',
      price: "20 € HT / collaborateur",
      icon: "🖥️",
      desc: "Clip moniteur orientable 360°, carte planning effaçable, timer flip et stylo — la version haut de gamme pour vos équipes.",
      tag: "Premium entreprise ✨",
      href: "KitFocusOrganisation",
      params: null,
      color: "from-emerald-400 to-teal-500",
    };
    return {
      title: 'Pack Standard "Bureau"',
      price: "15 € HT / collaborateur",
      icon: "📋",
      desc: "Clip mémo en bois, carte planning effaçable, timer flip et stylo effaçable — tout le nécessaire pour s'organiser au bureau.",
      tag: "Idéal entreprise",
      href: "KitFocusOrganisation",
      params: null,
      color: "from-blue-400 to-cyan-500",
    };
  }

  if (event === "maison_hotes") {
    if (budget === "high" || budget === "mid") return {
      title: "Kit Naturel Douceur",
      price: "13 € / unité",
      icon: "🌿",
      desc: "Galet de cire d'abeille, dessous de verre bois, carte 6 usages et sac coton recyclé. L'accueil parfait pour vos hôtes.",
      tag: "Coup de cœur 🌿",
      href: "KitNaturel",
      params: null,
      color: "from-yellow-400 to-amber-500",
    };
    return {
      title: "Kit Naturel Essentiel",
      price: "5 € / unité",
      icon: "🐝",
      desc: "Galet de cire d'abeille posé sur son dessous de verre bois. 6 usages du quotidien, 100% naturel.",
      tag: "100% naturel 🐝",
      href: "KitNaturel",
      params: null,
      color: "from-yellow-300 to-amber-400",
    };
  }

  // Floral events
  if (budget === "low") return {
    title: "Kit à composer",
    price: "3,90 € / invité",
    icon: "🌱",
    desc: "Vous assemblez vous-même les éléments à votre rythme — graines, pastille de terre, étiquette personnalisée. Fait main et personnel.",
    tag: "Le plus économique",
    href: "Shop",
    params: `eventType=${event}&kitType=compose`,
    color: "from-rose-400 to-pink-500",
  };

  return {
    title: "Kit prêt à offrir",
    price: "5,90 € / invité",
    icon: "🌸",
    desc: "Tout arrive assemblé et emballé. Il suffit de poser les pots sur les tables le jour J — rien à préparer, rien à stresser.",
    tag: "Le plus choisi ✨",
    href: "Shop",
    params: `eventType=${event}&kitType=pret`,
    color: "from-rose-500 to-pink-600",
  };
}

export default function KitFinder() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ event: null, recipient: null, budget: null });

  const currentStep = STEPS[step];
  const progress = ((step) / STEPS.length) * 100;

  const handleSelect = (key, value) => {
    setAnswers(a => ({ ...a, [key]: value }));
  };

  const canNext = () => {
    if (step === 0) return !!answers.event;
    if (step === 1) return !!answers.recipient;
    if (step === 2) return !!answers.budget;
    return false;
  };

  const goNext = () => {
    if (canNext()) setStep(s => s + 1);
  };

  const goBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const reset = () => {
    setStep(0);
    setAnswers({ event: null, recipient: null, budget: null });
  };

  const isDone = step === STEPS.length;
  const recommendation = isDone ? getRecommendation(answers) : null;

  const recipientOptions = answers.event ? RECIPIENT_OPTIONS[answers.event] || [] : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        .font-serif-shop { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-shop { font-family: 'Lato', system-ui, sans-serif; }
      `}</style>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-gray-100 bg-white">
        <a href={createPageUrl("Home")}>
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
            alt="Fleurs de fête" className="h-10" />
        </a>
        <a href={createPageUrl("Shop")} className="font-sans-shop text-xs text-gray-400 hover:text-rose-400 transition">← Voir la boutique</a>
      </nav>

      <div className="max-w-lg mx-auto px-5 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-500 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 font-sans-shop">
            <Sparkles className="w-3.5 h-3.5" /> Trouvez votre kit idéal
          </div>
          <h1 className="font-serif-shop text-4xl font-bold text-gray-800 mb-2">Le kit parfait,<br />en 3 questions</h1>
          <p className="font-sans-shop text-gray-400 text-sm">Répondez à ces quelques questions pour que nous vous recommandions le kit le mieux adapté à votre situation.</p>
        </div>

        {!isDone ? (
          <>
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                {STEPS.map((s, i) => (
                  <span key={s.id} className={`font-sans-shop text-xs font-semibold transition ${i < step ? "text-rose-400" : i === step ? "text-gray-700" : "text-gray-300"}`}>
                    {i + 1}. {s.title}
                  </span>
                ))}
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="h-2 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-500"
                  style={{ width: `${((step + (canNext() ? 0.5 : 0)) / STEPS.length) * 100}%` }} />
              </div>
            </div>

            {/* Step card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">
              <p className="font-sans-shop text-xs tracking-[0.2em] uppercase text-rose-400 mb-1">Étape {step + 1} / {STEPS.length}</p>
              <h2 className="font-serif-shop text-2xl font-bold text-gray-800 mb-5">{currentStep.subtitle}</h2>

              {/* Step 1 — Event */}
              {step === 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {EVENT_OPTIONS.map(opt => (
                    <button key={opt.id} onClick={() => handleSelect("event", opt.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition ${answers.event === opt.id ? "border-rose-400 bg-rose-50" : "border-gray-100 bg-white hover:border-rose-200"}`}>
                      <span className="text-3xl">{opt.icon}</span>
                      <span className={`font-sans-shop text-xs font-semibold ${answers.event === opt.id ? "text-rose-600" : "text-gray-600"}`}>{opt.label}</span>
                      {answers.event === opt.id && <Check className="w-3.5 h-3.5 text-rose-400" />}
                    </button>
                  ))}
                </div>
              )}

              {/* Step 2 — Recipient */}
              {step === 1 && (
                <div className="space-y-3">
                  {recipientOptions.map(opt => (
                    <button key={opt.id} onClick={() => handleSelect("recipient", opt.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition ${answers.recipient === opt.id ? "border-rose-400 bg-rose-50" : "border-gray-100 bg-white hover:border-rose-200"}`}>
                      <span className="text-3xl">{opt.icon}</span>
                      <span className={`font-sans-shop text-sm font-semibold ${answers.recipient === opt.id ? "text-rose-600" : "text-gray-700"}`}>{opt.label}</span>
                      {answers.recipient === opt.id && <Check className="w-4 h-4 text-rose-400 ml-auto" />}
                    </button>
                  ))}
                </div>
              )}

              {/* Step 3 — Budget */}
              {step === 2 && (
                <div className="space-y-3">
                  {BUDGET_OPTIONS.map(opt => (
                    <button key={opt.id} onClick={() => handleSelect("budget", opt.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition ${answers.budget === opt.id ? "border-rose-400 bg-rose-50" : "border-gray-100 bg-white hover:border-rose-200"}`}>
                      <span className="text-3xl">{opt.icon}</span>
                      <span className={`font-sans-shop text-sm font-semibold ${answers.budget === opt.id ? "text-rose-600" : "text-gray-700"}`}>{opt.label}</span>
                      {answers.budget === opt.id && <Check className="w-4 h-4 text-rose-400 ml-auto" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-5">
              <button onClick={goBack} disabled={step === 0}
                className="flex items-center gap-2 font-sans-shop text-sm text-gray-400 hover:text-gray-600 transition disabled:opacity-30 disabled:cursor-not-allowed px-4 py-2.5">
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>
              <button onClick={goNext} disabled={!canNext()}
                className="flex items-center gap-2 font-sans-shop text-sm font-bold text-white bg-gradient-to-r from-rose-400 to-pink-500 px-7 py-3 rounded-full shadow-sm hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed">
                {step === STEPS.length - 1 ? "Voir ma recommandation" : "Suivant"} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          /* Result */
          <div className="space-y-5">
            <div className="text-center mb-2">
              <p className="font-sans-shop text-sm text-gray-400">Voici notre recommandation pour vous 🎉</p>
            </div>

            <div className={`bg-gradient-to-br ${recommendation.color} rounded-3xl p-8 text-white text-center shadow-lg`}>
              <div className="text-5xl mb-4">{recommendation.icon}</div>
              <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full font-sans-shop mb-3">{recommendation.tag}</span>
              <h2 className="font-serif-shop text-3xl font-bold mb-2">{recommendation.title}</h2>
              <p className="font-sans-shop text-white/80 text-sm font-light mb-1">{recommendation.price}</p>
              <p className="font-sans-shop text-white/90 text-sm leading-relaxed mt-4">{recommendation.desc}</p>
            </div>

            <a href={createPageUrl(recommendation.href) + (recommendation.params ? `?${recommendation.params}` : "")}
              className="w-full flex items-center justify-center gap-2 font-sans-shop font-bold text-white bg-gray-800 hover:bg-gray-900 transition py-4 rounded-2xl text-sm shadow-sm">
              <Sparkles className="w-4 h-4" /> Commander ce kit
            </a>

            <a href={createPageUrl("Shop")}
              className="w-full flex items-center justify-center gap-2 font-sans-shop text-sm text-rose-500 font-semibold bg-rose-50 hover:bg-rose-100 transition py-3.5 rounded-2xl border border-rose-100">
              🛍️ Voir tous les produits
            </a>

            <button onClick={reset}
              className="w-full flex items-center justify-center gap-2 font-sans-shop text-sm text-gray-400 hover:text-gray-600 transition py-3 rounded-2xl border border-gray-200 hover:border-gray-300">
              <RotateCcw className="w-4 h-4" /> Recommencer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}