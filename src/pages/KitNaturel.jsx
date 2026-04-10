import { useState } from "react";
import { createPageUrl } from "@/utils";
import { Check, Leaf, Star } from "lucide-react";

const USAGES = [
  { icon: "🪵", title: "Entretien du bois", desc: "Nourrit et protège les surfaces en bois brut, planches et meubles." },
  { icon: "👞", title: "Imperméabiliser le cuir", desc: "Repousse l'eau et l'humidité sur chaussures, sacs et accessoires cuir." },
  { icon: "🧵", title: "Faciliter la couture", desc: "Passe le fil sur le galet pour éviter qu'il s'emmêle et casse." },
  { icon: "🚪", title: "Grincements portes & tiroirs", desc: "Frotter les gonds et glissières pour un silence retrouvé." },
  { icon: "💋", title: "Lèvres gercées", desc: "Soin naturel doux pour hydrater et protéger les lèvres sèches." },
  { icon: "🌿", title: "Protéger les lames de jardinage", desc: "Enduit les outils pour prévenir rouille et accroche de la terre." },
];

const PACKS = [
  {
    id: "essentiel",
    label: "Pack Essentiel",
    price: "5",
    unit: "€ / unité",
    badge: null,
    color: "border-amber-200 bg-amber-50",
    check: "text-amber-500",
    features: [
      "Galet de cire d'abeille avec logo en relief",
      "Coupelle hexagonale en bois découpée laser",
      "Carte kraft listant les 6 usages du galet",
    ],
  },
  {
    id: "complet",
    label: "Pack Complet",
    price: "11",
    unit: "€ / unité",
    badge: "Le plus complet 🌿",
    color: "border-green-300 bg-green-50",
    check: "text-green-600",
    features: [
      "Tout le Pack Essentiel inclus",
      "Galet de cire d'abeille avec logo en relief",
      "Coupelle hexagonale en bois découpée laser",
      "Carte kraft listant les 6 usages du galet",
      "Sac à dos cordon en coton recyclé avec votre logo",
    ],
  },
];

const ARGS = [
  { icon: "🐝", title: "100% naturel", desc: "Cire d'abeille française, sans additif ni conservateur." },
  { icon: "✍️", title: "Logo en relief", desc: "Chaque galet est marqué à chaud avec votre logo ou vos initiales." },
  { icon: "✅", title: "Zéro réglementation", desc: "Produit non alimentaire, aucune contrainte d'étiquetage obligatoire." },
  { icon: "📦", title: "Sans minimum de commande", desc: "Commandez la quantité exacte dont vous avez besoin." },
];

export default function KitNaturel() {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", structure: "", qty: "", message: "" });
  const [sent, setSent] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { base44 } = await import("@/api/base44Client");
    await base44.integrations.Core.SendEmail({
      to: "contact@fleursdefete.fr",
      from_name: form.name || form.email,
      subject: `[Kit Naturel] Demande de devis — ${form.structure || form.name}`,
      body: `Nom : ${form.name}\nEmail : ${form.email}\nStructure : ${form.structure}\nQuantité : ${form.qty}\n\nMessage :\n${form.message}`,
    });
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        .font-serif-nat { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-nat { font-family: 'Lato', system-ui, sans-serif; }
        .honey-line { background: linear-gradient(90deg, transparent, #c9a96e, transparent); height: 1px; }
      `}</style>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-amber-100 bg-amber-50/50">
        <a href={createPageUrl("Home")}>
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
            alt="Fleurs de fête" className="h-10"
          />
        </a>
        <div className="flex items-center gap-3">
          <a href={createPageUrl("Shop")} className="font-sans-nat text-sm text-amber-700 hover:text-amber-900 transition hidden sm:block">Boutique</a>
          <button
            onClick={() => setQuoteOpen(true)}
            className="font-sans-nat text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 transition px-5 py-2.5 rounded-full shadow-sm"
          >
            Demander un devis
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-b from-amber-50 to-white px-6 md:px-12 py-16 md:py-24 text-center">
        <p className="font-sans-nat text-xs tracking-[0.3em] uppercase text-amber-600 mb-4">Maisons d'hôtes · Gîtes · Mariages champêtres</p>
        <h1 className="font-serif-nat text-5xl md:text-6xl font-bold text-stone-800 leading-tight mb-5">
          Le Kit Naturel<br />
          <span className="text-amber-600">Cire d'abeille française</span>
        </h1>
        <div className="honey-line max-w-xs mx-auto mb-6" />
        <p className="font-sans-nat text-stone-500 text-lg max-w-lg mx-auto mb-10 leading-relaxed font-light">
          Un galet de cire d'abeille artisanal gravé à votre logo, posé dans une coupelle en bois hexagonale. Un cadeau utile, naturel, mémorable — que vos hôtes garderont longtemps.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => setQuoteOpen(true)}
            className="inline-flex items-center gap-2 py-4 px-8 rounded-full font-sans-nat font-bold text-white shadow-lg bg-gradient-to-r from-amber-500 to-yellow-600 hover:opacity-90 transition text-sm tracking-wide"
          >
            🐝 Demander un devis gratuit
          </button>
          <a href={createPageUrl("Shop")} className="inline-flex items-center gap-2 py-4 px-8 rounded-full font-sans-nat font-semibold text-amber-700 border-2 border-amber-200 hover:border-amber-400 transition text-sm">
            Voir nos autres kits
          </a>
        </div>
        <p className="font-sans-nat text-xs text-stone-400 mt-4">Sans minimum de commande · Logo en relief · 100% naturel</p>
      </div>

      {/* Packs */}
      <div className="px-6 md:px-12 py-14 max-w-3xl mx-auto">
        <p className="font-sans-nat text-xs tracking-[0.3em] uppercase text-amber-600 mb-3 text-center">Nos formules</p>
        <h2 className="font-serif-nat text-3xl font-bold text-stone-800 mb-10 text-center">Choisissez votre pack</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {PACKS.map(pack => (
            <div key={pack.id} className={`border-2 ${pack.color} rounded-3xl p-8 relative flex flex-col`}>
              {pack.badge && (
                <span className="absolute top-4 right-4 bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-full font-sans-nat">{pack.badge}</span>
              )}
              <p className="font-sans-nat text-xs tracking-widest uppercase text-stone-400 mb-1">{pack.label}</p>
              <p className="font-serif-nat text-4xl font-bold text-stone-800 mb-0.5">
                {pack.price}<span className="text-base font-normal text-stone-400"> {pack.unit}</span>
              </p>
              <ul className="space-y-2.5 mt-5 mb-7 flex-1">
                {pack.features.map(f => (
                  <li key={f} className="flex items-start gap-2 font-sans-nat text-sm text-stone-700">
                    <span className={`mt-0.5 flex-shrink-0 ${pack.check}`}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setQuoteOpen(true)}
                className="w-full py-3 rounded-full font-sans-nat font-semibold text-sm bg-amber-600 hover:bg-amber-700 text-white transition shadow-sm"
              >
                Demander ce pack
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 6 usages */}
      <div className="bg-stone-50 px-6 md:px-12 py-14">
        <div className="max-w-3xl mx-auto">
          <p className="font-sans-nat text-xs tracking-[0.3em] uppercase text-amber-600 mb-3 text-center">Polyvalent & pratique</p>
          <h2 className="font-serif-nat text-3xl font-bold text-stone-800 mb-2 text-center">6 usages du galet de cire</h2>
          <p className="font-sans-nat text-sm text-stone-500 text-center mb-10">Imprimés sur la carte kraft glissée dans chaque pack.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {USAGES.map(u => (
              <div key={u.title} className="bg-white rounded-2xl px-5 py-5 border border-amber-100 shadow-sm flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{u.icon}</span>
                <div>
                  <p className="font-sans-nat font-bold text-stone-800 text-sm">{u.title}</p>
                  <p className="font-sans-nat text-xs text-stone-500 mt-0.5 leading-relaxed">{u.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Arguments */}
      <div className="px-6 md:px-12 py-14 max-w-3xl mx-auto">
        <p className="font-sans-nat text-xs tracking-[0.3em] uppercase text-amber-600 mb-3 text-center">Pourquoi ce kit ?</p>
        <h2 className="font-serif-nat text-3xl font-bold text-stone-800 mb-10 text-center">Un cadeau pensé pour durer</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {ARGS.map(a => (
            <div key={a.title} className="flex items-start gap-4 bg-amber-50 rounded-2xl px-5 py-4 border border-amber-100">
              <span className="text-2xl flex-shrink-0 mt-0.5">{a.icon}</span>
              <div>
                <p className="font-sans-nat font-bold text-stone-800 text-sm">{a.title}</p>
                <p className="font-sans-nat text-xs text-stone-500 mt-0.5 leading-relaxed">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-amber-500 to-yellow-600 px-6 py-16 text-center text-white">
        <h2 className="font-serif-nat text-4xl font-bold mb-4">Prêt à offrir la nature à vos hôtes ?</h2>
        <p className="font-sans-nat text-white/80 text-sm mb-8 max-w-md mx-auto">
          Devis gratuit, sans minimum de commande. Réponse sous 24h.
        </p>
        <button
          onClick={() => setQuoteOpen(true)}
          className="inline-flex items-center gap-2 bg-white text-amber-600 font-bold px-8 py-4 rounded-full hover:bg-amber-50 transition shadow-lg font-sans-nat text-sm"
        >
          🐝 Demander un devis gratuit
        </button>
      </div>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-gray-100 text-center">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-gray-400 font-sans-nat">
          <a href={createPageUrl("Shop")} className="hover:text-amber-500 transition">Boutique</a>
          <span className="text-gray-200">·</span>
          <a href={createPageUrl("Contact")} className="hover:text-amber-500 transition">Contact</a>
          <span className="text-gray-200">·</span>
          <a href={createPageUrl("CGV")} className="hover:text-amber-500 transition">CGV</a>
          <span className="text-gray-200">·</span>
          <a href={createPageUrl("MentionsLegales")} className="hover:text-amber-500 transition">Mentions légales</a>
        </div>
        <p className="font-sans-nat text-xs text-gray-300 mt-4">© 2025 Fleurs en fête — Papin Gwenaëlle</p>
      </footer>

      {/* Modal devis */}
      {quoteOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setQuoteOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            {sent ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">🐝</div>
                <h3 className="font-serif-nat text-2xl font-bold text-stone-800 mb-2">Demande envoyée !</h3>
                <p className="font-sans-nat text-sm text-stone-500">Nous vous répondrons sous 24h avec un devis personnalisé.</p>
                <button onClick={() => { setQuoteOpen(false); setSent(false); }} className="mt-6 font-sans-nat text-sm text-amber-600 hover:underline">Fermer</button>
              </div>
            ) : (
              <>
                <h3 className="font-serif-nat text-2xl font-bold text-stone-800 mb-1">Demande de devis</h3>
                <p className="font-sans-nat text-sm text-stone-500 mb-6">Kit Naturel — Cire d'abeille personnalisée</p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input required value={form.name} onChange={e => set("name", e.target.value)} placeholder="Votre nom *" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-sans-nat focus:outline-none focus:ring-1 focus:ring-amber-300" />
                  <input required type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="Votre email *" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-sans-nat focus:outline-none focus:ring-1 focus:ring-amber-300" />
                  <input value={form.structure} onChange={e => set("structure", e.target.value)} placeholder="Nom de votre maison d'hôtes / domaine" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-sans-nat focus:outline-none focus:ring-1 focus:ring-amber-300" />
                  <input value={form.qty} onChange={e => set("qty", e.target.value)} placeholder="Quantité approximative" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-sans-nat focus:outline-none focus:ring-1 focus:ring-amber-300" />
                  <textarea value={form.message} onChange={e => set("message", e.target.value)} rows={3} placeholder="Précisez votre projet (événement, logo, délai...)" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-sans-nat resize-none focus:outline-none focus:ring-1 focus:ring-amber-300" />
                  <button type="submit" className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-sans-nat font-semibold text-sm transition">
                    Envoyer ma demande 🐝
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}