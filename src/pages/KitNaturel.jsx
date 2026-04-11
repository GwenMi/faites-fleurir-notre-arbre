import { useState } from "react";
import SEOHead from "@/components/SEOHead";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Plus, Minus, Upload, X } from "lucide-react";

const USAGES = [
  { icon: "🪵", title: "Entretien du bois", desc: "Nourrit et protège les surfaces en bois brut, planches et meubles." },
  { icon: "👞", title: "Imperméabiliser le cuir", desc: "Repousse l'eau et l'humidité sur chaussures, sacs et accessoires cuir." },
  { icon: "🧵", title: "Faciliter la couture", desc: "Passe le fil sur le galet pour éviter qu'il s'emmêle et casse." },
  { icon: "🚪", title: "Grincements portes & tiroirs", desc: "Frotter les gonds et glissières pour un silence retrouvé." },
  { icon: "💋", title: "Lèvres gercées", desc: "Soin naturel doux pour hydrater et protéger les lèvres sèches." },
  { icon: "🌿", title: "Protéger les lames de jardinage", desc: "Enduit les outils pour prévenir rouille et accroche de la terre." },
];

const ARGS = [
  { icon: "🐝", title: "100% naturel", desc: "Cire d'abeille française, sans additif ni conservateur." },
  { icon: "✍️", title: "Logo en relief", desc: "Chaque galet est marqué à chaud avec votre logo ou vos initiales." },
  { icon: "✅", title: "Zéro réglementation", desc: "Produit non alimentaire, aucune contrainte d'étiquetage obligatoire." },
  { icon: "📦", title: "Sans minimum de commande", desc: "Commandez la quantité exacte dont vous avez besoin." },
];

// Prix des suppléments (par pièce)
const SUPPLEMENTS = {
  sousVerre: 1.50, // dégressif à partir de 6
  galet: 0.50,
};

function OrderModal({ packId, onClose }) {
  const [qty, setQty] = useState(1); // nombre de packs de base
  const [extraSousVerre, setExtraSousVerre] = useState(0);
  const [extraGalet, setExtraGalet] = useState(0);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [showLogoConfirm, setShowLogoConfirm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", structure: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const basePrice = packId === "essentiel" ? 4 : 6;

  // Sous-verre dégressif à partir de 6
  const sousVerreUnitPrice = extraSousVerre >= 6 ? 1.20 : SUPPLEMENTS.sousVerre;
  const sousVerreTotal = extraSousVerre * sousVerreUnitPrice;
  const galetTotal = extraGalet * SUPPLEMENTS.galet;
  const totalUnit = basePrice + sousVerreTotal / qty + galetTotal / qty;
  const totalOrder = qty * basePrice + sousVerreTotal + galetTotal;

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSendQuote = async () => {
    setSending(true);
    let logoUrl = "";
    if (logoFile) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: logoFile });
      logoUrl = file_url;
    }
    const packLabel = packId === "essentiel" ? "Pack Essentiel (4€/unité)" : "Pack Complet (6€/unité)";
    const body = [
      `Nom : ${form.name}`,
      `Email : ${form.email}`,
      `Structure : ${form.structure || "—"}`,
      ``,
      `Pack commandé : ${packLabel}`,
      `Quantité de packs : ${qty}`,
      extraSousVerre > 0 ? `Sous-verres supplémentaires : ${extraSousVerre} (${sousVerreUnitPrice.toFixed(2)}€/pièce)` : "",
      extraGalet > 0 ? `Galets supplémentaires : ${extraGalet} (${SUPPLEMENTS.galet.toFixed(2)}€/pièce)` : "",
      `Total estimé : ${totalOrder.toFixed(2)} €`,
      logoUrl ? `Logo fourni : ${logoUrl}` : "Aucun logo fourni",
      ``,
      form.message ? `Message : ${form.message}` : "",
    ].filter(Boolean).join("\n");

    await base44.integrations.Core.SendEmail({
      to: "contact@fleursdefete.fr",
      from_name: form.name || form.email,
      subject: `[Kit Naturel] Devis — ${form.structure || form.name}`,
      body,
    });
    setSent(true);
    setSending(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!logoFile) {
      setShowLogoConfirm(true);
    } else {
      handleSendQuote();
    }
  };

  const adj = (setter, current, delta, min = 0) => setter(Math.max(min, current + delta));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative max-h-[95vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
          <X className="w-5 h-5" />
        </button>

        {sent ? (
          <div className="text-center py-12 px-8">
            <div className="text-5xl mb-4">🐝</div>
            <h3 className="font-serif-nat text-2xl font-bold text-stone-800 mb-2">Demande envoyée !</h3>
            <p className="font-sans-nat text-sm text-stone-500">Nous vous répondrons sous 24h avec un devis confirmé.</p>
            <button onClick={onClose} className="mt-6 font-sans-nat text-sm text-amber-600 hover:underline">Fermer</button>
          </div>
        ) : (
          <>
            <div className="px-6 pt-6 pb-2 border-b border-gray-100 flex-shrink-0">
              <h3 className="font-serif-nat text-xl font-bold text-stone-800">
                {packId === "essentiel" ? "Pack Essentiel — 4 € / unité" : "Pack Complet — 6 € / unité"}
              </h3>
              <p className="font-sans-nat text-xs text-stone-400 mt-0.5">Configurez votre commande</p>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
              {/* Quantité de base */}
              <div>
                <p className="font-sans-nat text-sm font-semibold text-stone-800 mb-3">Nombre de packs</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => adj(setQty, qty, -1, 1)} className="w-9 h-9 rounded-full border-2 border-amber-200 flex items-center justify-center text-amber-700 hover:bg-amber-50 transition">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-sans-nat font-bold text-2xl text-stone-800 w-10 text-center">{qty}</span>
                  <button onClick={() => adj(setQty, qty, 1)} className="w-9 h-9 rounded-full border-2 border-amber-200 flex items-center justify-center text-amber-700 hover:bg-amber-50 transition">
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="font-sans-nat text-sm text-stone-500 ml-2">× {basePrice} € = <strong>{(qty * basePrice).toFixed(2)} €</strong></span>
                </div>
              </div>

              {/* Options à la pièce */}
              <div>
                <p className="font-sans-nat text-sm font-semibold text-stone-800 mb-1">Options à la pièce</p>
                <p className="font-sans-nat text-xs text-stone-400 mb-3">S'ajoutent en supplément à votre commande</p>

                {/* Sous-verre supplémentaire */}
                <div className="flex items-center justify-between bg-amber-50 rounded-2xl px-4 py-3 border border-amber-100 mb-2">
                  <div>
                    <p className="font-sans-nat text-sm font-semibold text-stone-800">Sous-verre bambou supplémentaire</p>
                    <p className="font-sans-nat text-xs text-amber-600">
                      +{SUPPLEMENTS.sousVerre.toFixed(2)} €/pièce
                      {extraSousVerre >= 6 && <span className="ml-1 text-green-600">(dégressif : 1,20€)</span>}
                      <span className="text-stone-400 ml-1">— dégressif à partir de 6</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button onClick={() => adj(setExtraSousVerre, extraSousVerre, -1)} className="w-7 h-7 rounded-full border border-amber-300 flex items-center justify-center text-amber-700 hover:bg-amber-100 transition">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-sans-nat font-bold text-stone-800 w-6 text-center">{extraSousVerre}</span>
                    <button onClick={() => adj(setExtraSousVerre, extraSousVerre, 1)} className="w-7 h-7 rounded-full border border-amber-300 flex items-center justify-center text-amber-700 hover:bg-amber-100 transition">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Galet supplémentaire */}
                <div className="flex items-center justify-between bg-amber-50 rounded-2xl px-4 py-3 border border-amber-100">
                  <div>
                    <p className="font-sans-nat text-sm font-semibold text-stone-800">Galet de cire supplémentaire</p>
                    <p className="font-sans-nat text-xs text-amber-600">+{SUPPLEMENTS.galet.toFixed(2)} €/pièce</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button onClick={() => adj(setExtraGalet, extraGalet, -1)} className="w-7 h-7 rounded-full border border-amber-300 flex items-center justify-center text-amber-700 hover:bg-amber-100 transition">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-sans-nat font-bold text-stone-800 w-6 text-center">{extraGalet}</span>
                    <button onClick={() => adj(setExtraGalet, extraGalet, 1)} className="w-7 h-7 rounded-full border border-amber-300 flex items-center justify-center text-amber-700 hover:bg-amber-100 transition">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="bg-stone-100 rounded-2xl px-4 py-3 flex justify-between items-center">
                <p className="font-sans-nat text-sm text-stone-600">Total estimé</p>
                <p className="font-serif-nat text-2xl font-bold text-amber-700">{totalOrder.toFixed(2)} €</p>
              </div>

              {/* Logo upload */}
              <div>
                <p className="font-sans-nat text-sm font-semibold text-stone-800 mb-2">
                  Télécharger votre logo ou visuel de personnalisation <span className="text-stone-400 font-normal">(facultatif)</span>
                </p>
                <label className="block border-2 border-dashed border-amber-200 rounded-xl p-5 text-center cursor-pointer hover:border-amber-400 transition relative">
                  <input type="file" accept=".jpg,.jpeg,.png,.svg,image/jpeg,image/png,image/svg+xml" onChange={handleLogoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {logoPreview ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={logoPreview} alt="Logo" className="h-14 w-auto mx-auto" />
                      <p className="font-sans-nat text-xs text-amber-600">{logoFile.name} — Cliquez pour changer</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-6 h-6 text-amber-400" />
                      <p className="font-sans-nat text-sm text-stone-600">Glissez votre logo ici ou cliquez</p>
                      <p className="font-sans-nat text-xs text-stone-400">JPG, PNG ou SVG</p>
                    </div>
                  )}
                </label>
              </div>

              {/* Formulaire */}
              <form id="quote-form" onSubmit={handleSubmit} className="space-y-3">
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Votre nom *" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-sans-nat focus:outline-none focus:ring-1 focus:ring-amber-300" />
                <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Votre email *" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-sans-nat focus:outline-none focus:ring-1 focus:ring-amber-300" />
                <input value={form.structure} onChange={e => setForm(f => ({ ...f, structure: e.target.value }))} placeholder="Nom de votre maison d'hôtes / domaine" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-sans-nat focus:outline-none focus:ring-1 focus:ring-amber-300" />
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={2} placeholder="Précisions ou questions..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-sans-nat resize-none focus:outline-none focus:ring-1 focus:ring-amber-300" />
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
              <button
                type="submit"
                form="quote-form"
                disabled={sending}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-sans-nat font-semibold text-sm transition disabled:opacity-60"
              >
                {sending ? "Envoi en cours…" : "Envoyer ma demande 🐝"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Confirmation sans logo */}
      {showLogoConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h4 className="font-serif-nat text-lg font-bold text-stone-800 mb-2">Logo manquant</h4>
            <p className="font-sans-nat text-sm text-stone-600 mb-5">Vous n'avez pas téléchargé de logo pour votre personnalisation. Êtes-vous sûr de vouloir continuer sans personnalisation ?</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setShowLogoConfirm(false); handleSendQuote(); }}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-sans-nat font-semibold text-sm transition"
              >
                Oui, continuer sans logo
              </button>
              <button
                onClick={() => setShowLogoConfirm(false)}
                className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 font-sans-nat text-sm hover:bg-gray-50 transition"
              >
                Non, ajouter un logo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KitNaturel() {
  const [orderPack, setOrderPack] = useState(null); // "essentiel" | "complet" | null

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Kit Naturel — Galet de cire d'abeille personnalisé pour maisons d'hôtes & mariages"
        description="Un galet de cire d'abeille française gravé à votre logo, posé sur son dessous de verre en bambou. Idéal pour maisons d'hôtes, gîtes et mariages champêtres."
        url="https://fleursdefete.fr/KitNaturel"
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        .font-serif-nat { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-nat { font-family: 'Lato', system-ui, sans-serif; }
        .honey-line { background: linear-gradient(90deg, transparent, #c9a96e, transparent); height: 1px; }
      `}</style>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-amber-100 bg-amber-50/50">
        <a href={createPageUrl("Home")}>
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
            alt="Fleurs de fête" className="h-10" />
        </a>
        <div className="flex items-center gap-3">
          <a href={createPageUrl("Shop")} className="font-sans-nat text-sm text-amber-700 hover:text-amber-900 transition hidden sm:block">Boutique</a>
          <button
            onClick={() => setOrderPack("essentiel")}
            className="font-sans-nat text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 transition px-5 py-2.5 rounded-full shadow-sm"
          >
            Commander
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
          Un galet de cire d'abeille artisanal gravé à votre logo, posé sur son dessous de verre en bambou. Un cadeau utile, naturel, mémorable.
        </p>
        <button
          onClick={() => setOrderPack("essentiel")}
          className="inline-flex items-center gap-2 py-4 px-8 rounded-full font-sans-nat font-bold text-white shadow-lg bg-gradient-to-r from-amber-500 to-yellow-600 hover:opacity-90 transition text-sm tracking-wide"
        >
          🐝 Commander / Demander un devis
        </button>
        <p className="font-sans-nat text-xs text-stone-400 mt-4">Sans minimum de commande · Logo en relief · 100% naturel</p>
      </div>

      {/* Packs */}
      <div className="px-6 md:px-12 py-14 max-w-3xl mx-auto">
        <p className="font-sans-nat text-xs tracking-[0.3em] uppercase text-amber-600 mb-3 text-center">Nos formules</p>
        <h2 className="font-serif-nat text-3xl font-bold text-stone-800 mb-10 text-center">Choisissez votre pack</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Pack Essentiel */}
          <div className="border-2 border-amber-200 bg-amber-50 rounded-3xl p-8 flex flex-col">
            <p className="font-sans-nat text-xs tracking-widest uppercase text-stone-400 mb-1">Kit Naturel Essentiel</p>
            <p className="font-serif-nat text-4xl font-bold text-stone-800 mb-0.5">4 €<span className="text-base font-normal text-stone-400"> / unité</span></p>
            <ul className="space-y-2.5 mt-5 mb-5 flex-1">
              {["Galet de cire d'abeille", "1 sous-verre bambou", "Carte", "Boîte fenêtre blanche"].map(f => (
                <li key={f} className="flex items-start gap-2 font-sans-nat text-sm text-stone-700">
                  <span className="text-amber-500 mt-0.5 flex-shrink-0">✓</span>{f}
                </li>
              ))}
            </ul>
            {/* Options à la pièce */}
            <div className="bg-white rounded-xl border border-amber-100 px-4 py-3 mb-5">
              <p className="font-sans-nat text-xs font-semibold text-stone-600 mb-2">Options à la pièce</p>
              <p className="font-sans-nat text-xs text-stone-500">🪵 Sous-verre supplémentaire : <strong>+1,50 €</strong> <span className="text-stone-400">(dégressif à partir de 6)</span></p>
              <p className="font-sans-nat text-xs text-stone-500 mt-1">🐝 Galet supplémentaire : <strong>+0,50 €</strong></p>
            </div>
            <button
              onClick={() => setOrderPack("essentiel")}
              className="w-full py-3 rounded-full font-sans-nat font-semibold text-sm bg-amber-600 hover:bg-amber-700 text-white transition shadow-sm"
            >
              Commander ce pack
            </button>
          </div>

          {/* Pack Complet */}
          <div className="border-2 border-green-300 bg-green-50 rounded-3xl p-8 flex flex-col relative">
            <span className="absolute top-4 right-4 bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-full font-sans-nat">Coup de cœur 🌿</span>
            <p className="font-sans-nat text-xs tracking-widest uppercase text-stone-400 mb-1">Kit Naturel Complet</p>
            <p className="font-serif-nat text-4xl font-bold text-stone-800 mb-0.5">6 €<span className="text-base font-normal text-stone-400"> / unité</span></p>
            <ul className="space-y-2.5 mt-5 mb-5 flex-1">
              {["Galet de cire d'abeille", "1 sous-verre bambou", "Carte", "Boîte fenêtre blanche", "Sac à cordelette coton recyclé avec nom de la maison d'hôte"].map(f => (
                <li key={f} className="flex items-start gap-2 font-sans-nat text-sm text-stone-700">
                  <span className="text-green-600 mt-0.5 flex-shrink-0">✓</span>{f}
                </li>
              ))}
            </ul>
            {/* Options à la pièce */}
            <div className="bg-white rounded-xl border border-green-200 px-4 py-3 mb-5">
              <p className="font-sans-nat text-xs font-semibold text-stone-600 mb-2">Options à la pièce</p>
              <p className="font-sans-nat text-xs text-stone-500">🪵 Sous-verre supplémentaire : <strong>+1,50 €</strong> <span className="text-stone-400">(dégressif à partir de 6)</span></p>
              <p className="font-sans-nat text-xs text-stone-500 mt-1">🐝 Galet supplémentaire : <strong>+0,50 €</strong></p>
            </div>
            <button
              onClick={() => setOrderPack("complet")}
              className="w-full py-3 rounded-full font-sans-nat font-semibold text-sm bg-green-600 hover:bg-green-700 text-white transition shadow-sm"
            >
              Commander ce pack
            </button>
          </div>
        </div>
      </div>

      {/* 6 usages */}
      <div className="bg-stone-50 px-6 md:px-12 py-14">
        <div className="max-w-3xl mx-auto">
          <p className="font-sans-nat text-xs tracking-[0.3em] uppercase text-amber-600 mb-3 text-center">Polyvalent & pratique</p>
          <h2 className="font-serif-nat text-3xl font-bold text-stone-800 mb-2 text-center">6 usages du galet de cire</h2>
          <p className="font-sans-nat text-sm text-stone-500 text-center mb-10">Imprimés sur la carte glissée dans chaque pack.</p>
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
        <p className="font-sans-nat text-white/80 text-sm mb-8 max-w-md mx-auto">Devis gratuit, sans minimum de commande. Réponse sous 24h.</p>
        <button
          onClick={() => setOrderPack("essentiel")}
          className="inline-flex items-center gap-2 bg-white text-amber-600 font-bold px-8 py-4 rounded-full hover:bg-amber-50 transition shadow-lg font-sans-nat text-sm"
        >
          🐝 Commander / Demander un devis gratuit
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

      {/* Order modal */}
      {orderPack && <OrderModal packId={orderPack} onClose={() => setOrderPack(null)} />}
    </div>
  );
}