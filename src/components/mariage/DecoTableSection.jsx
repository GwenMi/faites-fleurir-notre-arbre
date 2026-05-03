import { useState } from "react";
import { Check, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const COLORIS = [
  { id: "ivoire", label: "Ivoire", hex: "#F5F0E8" },
  { id: "creme", label: "Crème", hex: "#FAF3DC" },
  { id: "sauge", label: "Vert Sauge", hex: "#8A9E7B" },
  { id: "terracotta", label: "Terracotta", hex: "#C4714A" },
  { id: "ocre", label: "Ocre", hex: "#C8A05A" },
  { id: "nude", label: "Nude-Beige Lin", hex: "#E8C4B0" },
];

const AMBIANCES = [
  { id: "naturel", label: "Naturel", desc: "Gypsophile, statice blanc, lagurus", preview: "🤍" },
  { id: "sauge", label: "Sauge", desc: "Hortensia blanc, eucalyptus, feuillage", preview: "🌿" },
  { id: "terra", label: "Terra", desc: "Achillée, chardon, statice rose", preview: "🧡" },
];

function ColorSelector({ value, onChange }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-2">Coloris tissu <span className="text-rose-400">*</span></p>
      <div className="flex gap-2 flex-wrap">
        {COLORIS.map(c => (
          <button
            key={c.id}
            type="button"
            title={c.label}
            onClick={() => onChange(c.id)}
            className={`w-8 h-8 rounded-full border-2 transition-all ${value === c.id ? "border-gray-700 scale-110 shadow-md" : "border-transparent hover:border-gray-300"}`}
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>
      {value && (
        <p className="text-xs text-gray-400 mt-1">{COLORIS.find(c => c.id === value)?.label}</p>
      )}
    </div>
  );
}

function AmbianceSelector({ value, onChange }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-2">Ambiance florale <span className="text-rose-400">*</span></p>
      <div className="flex flex-col gap-1.5">
        {AMBIANCES.map(a => (
          <button
            key={a.id}
            type="button"
            onClick={() => onChange(a.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all ${value === a.id ? "border-rose-400 bg-rose-50" : "border-gray-200 hover:border-gray-300"}`}
          >
            <span>{a.preview}</span>
            <div>
              <p className="text-xs font-semibold text-gray-700">{a.label}</p>
              <p className="text-xs text-gray-400">{a.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function OrderModal({ kit, onClose }) {
  const [form, setForm] = useState({
    coloris: "", ambiance: "",
    quantity: kit.minQty || 1,
    date_mariage: "", notes: "", name: "", email: "",
  });
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    if (!form.coloris) return false;
    if (kit.needsAmbiance && !form.ambiance) return false;
    if (!form.date_mariage) return false;
    if (!form.name || !form.email) return false;
    if ((form.quantity || 0) < (kit.minQty || 1)) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setError("Merci de compléter toutes les options avant de commander.");
      return;
    }
    setError("");
    setSending(true);
    const colorisLabel = COLORIS.find(c => c.id === form.coloris)?.label || form.coloris;
    const ambianceLabel = AMBIANCES.find(a => a.id === form.ambiance)?.label || "";
    const body = `Nouvelle demande de commande — ${kit.name}\n\nClient : ${form.name} (${form.email})\nColoris : ${colorisLabel}${form.ambiance ? `\nAmbiance florale : ${ambianceLabel}` : ""}\nQuantité : ${form.quantity} ${kit.unit}\nDate du mariage : ${form.date_mariage}\n${form.notes ? `Notes : ${form.notes}` : ""}`;
    await base44.integrations.Core.SendEmail({
      to: "contact@fleursdefete.fr",
      from_name: form.name,
      subject: `[Déco Mariage] ${kit.name} — ${colorisLabel}`,
      body,
    });
    await base44.integrations.Core.SendEmail({
      to: form.email,
      from_name: "Fleurs de Fête",
      subject: `Votre demande "${kit.name}" a bien été reçue 🌸`,
      body: `Bonjour ${form.name},\n\nNous avons bien reçu votre demande pour : ${kit.name}\nColoris : ${colorisLabel}${form.ambiance ? `\nAmbiance : ${ambianceLabel}` : ""}\nQuantité : ${form.quantity} ${kit.unit}\nDate du mariage : ${form.date_mariage}\n\nNous vous contacterons sous 24h avec un devis précis et les modalités de paiement.\n\nÀ bientôt,\nGwenaëlle — Fleurs de Fête`,
    });
    setSending(false);
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <h3 className="font-serif-m text-2xl font-bold text-gray-800 mb-1">{kit.name}</h3>
        <p className="text-rose-400 font-semibold text-sm mb-4">{kit.priceDisplay}</p>

        {sent ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🌸</div>
            <h4 className="font-bold text-gray-800 text-lg mb-2">Demande envoyée !</h4>
            <p className="text-gray-500 text-sm mb-4">Nous vous répondrons sous 24h avec votre devis.</p>
            <button onClick={onClose} className="px-6 py-2.5 bg-rose-400 text-white rounded-full text-sm font-semibold hover:bg-rose-500 transition">Fermer</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Prénom / Nom <span className="text-rose-400">*</span></label>
                <input value={form.name} onChange={e => set("name", e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-300" placeholder="Marie Dupont" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Email <span className="text-rose-400">*</span></label>
                <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-300" placeholder="vous@mail.com" />
              </div>
            </div>

            <ColorSelector value={form.coloris} onChange={v => set("coloris", v)} />

            {kit.needsAmbiance && (
              <AmbianceSelector value={form.ambiance} onChange={v => set("ambiance", v)} />
            )}

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">{kit.qtyLabel} <span className="text-rose-400">*</span></label>
              <input
                type="number"
                min={kit.minQty || 1}
                value={form.quantity}
                onChange={e => set("quantity", parseInt(e.target.value) || kit.minQty || 1)}
                className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-300"
              />
              {kit.calcNote && form.quantity > 0 && (
                <p className="text-xs text-gray-400 mt-1">{kit.calcNote(form.quantity)}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Date du mariage <span className="text-rose-400">*</span></label>
              <input type="date" value={form.date_mariage} onChange={e => set("date_mariage", e.target.value)}
                className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-300" />
            </div>

            {kit.hasNotes && (
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Précisions / demandes spéciales</label>
                <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-300 resize-none"
                  placeholder="Toute demande particulière…" />
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 rounded-full border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">
                Annuler
              </button>
              <button type="submit" disabled={sending}
                className="flex-1 py-3 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-semibold hover:opacity-90 transition">
                {sending ? "Envoi…" : "Envoyer ma demande"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const DECO_KITS = [
  {
    id: "chemin-nude",
    emoji: "🪢",
    badge: null,
    name: "Chemin de table Nude",
    priceDisplay: "8–10€ / table",
    desc: "Chemin de table effet bohème, bords bruts sans couture. Posez-y vos propres fleurs ou laissez-le tel quel pour un rendu minimaliste élégant.",
    features: ["Chemin 3m x 30cm", "Bords bruts effet bohème", "Vendu à la table", "Délai de traitement 5–7 jours ouvrés"],
    needsAmbiance: false,
    hasNotes: false,
    qtyLabel: "Nombre de tables",
    unit: "tables",
    minQty: 1,
  },
  {
    id: "chemin-pret",
    emoji: "🌸",
    badge: "Populaire",
    badgeColor: "bg-rose-400",
    name: "Chemin de table Prêt à fleurir",
    priceDisplay: "15–18€ / table",
    desc: "Chemin avec mousse florale fixée sur les bordures. Piquez vos fleurs fraîches le matin du mariage ou vos fleurs séchées. Compatible avec votre fleuriste.",
    features: ["Chemin 3m x 30cm", "Mousse sèche sur les bordures humidifiable", "Compatible fleurs fraîches ou séchées", "Vendu à la table", "Délai de traitement 5–7 jours ouvrés"],
    needsAmbiance: false,
    hasNotes: true,
    qtyLabel: "Nombre de tables",
    unit: "tables",
    minQty: 1,
  },
  {
    id: "chemin-fleuri",
    emoji: "💐",
    badge: "Fait main ✨",
    badgeColor: "bg-pink-400",
    name: "Chemin de table Fleuri",
    priceDisplay: "45–55€ / table",
    desc: "Chemin avec composition florale séchée sur les bordures. Centre libre pour vos verres et bougies. Fait main. Expédié prêt à poser.",
    features: ["Chemin 3m x 30cm", "Mousse sèche + fleurs séchées sur les bordures", "Ambiance florale assortie au coloris tissu", "Centre de table libre", "Vendu à la table", "Délai de traitement 7–10 jours ouvrés"],
    needsAmbiance: true,
    hasNotes: true,
    qtyLabel: "Nombre de tables",
    unit: "tables",
    minQty: 1,
  },
  {
    id: "nœud-essentiel",
    emoji: "🎀",
    badge: null,
    name: "Nœud de chaise Essentiel",
    priceDisplay: "8–10€ / pièce — min. 20",
    desc: "Ruban + broche plateau avec mousse. Humidifiez et piquez vos fleurs fraîches le matin du mariage. Compatible fleuriste.",
    features: ["Ruban 1,5m", "Broche plateau dorée avec mousse sèche humidifiable", "Minimum 20 pièces", "Délai de traitement 5–7 jours ouvrés"],
    needsAmbiance: false,
    hasNotes: true,
    qtyLabel: "Quantité (min. 20)",
    unit: "pièces",
    minQty: 20,
  },
  {
    id: "nœud-premium",
    emoji: "🌷",
    badge: "Fait main ✨",
    badgeColor: "bg-pink-400",
    name: "Nœud de chaise Premium",
    priceDisplay: "14–16€ / pièce — min. 20",
    desc: "Ruban + broche florale en fleurs séchées. Prêt à accrocher. Fait main.",
    features: ["Ruban 1,5m", "Broche plateau dorée avec composition florale séchée", "Minimum 20 pièces", "Délai de traitement 7–10 jours ouvrés"],
    needsAmbiance: true,
    hasNotes: true,
    qtyLabel: "Quantité (min. 20)",
    unit: "pièces",
    minQty: 20,
  },
  {
    id: "pack-essentiel",
    emoji: "📦",
    badge: "Ensemble assorti",
    badgeColor: "bg-rose-300",
    name: "Pack Déco Table Essentiel",
    priceDisplay: "95–115€ / table de 10",
    desc: "1 chemin Prêt à fleurir + 10 nœuds Essentiel assortis. Même coloris, même tissu. Compatible fleuriste. Fleurs non incluses.",
    features: ["1 chemin 3m + mousse par table", "10 nœuds avec broche mousse par table", "Même coloris chemin et nœuds", "Compatible fleuriste", "Délai de traitement 7–10 jours ouvrés"],
    needsAmbiance: false,
    hasNotes: true,
    qtyLabel: "Nombre de tables",
    unit: "tables",
    minQty: 1,
    calcNote: (n) => `${n} table${n > 1 ? "s" : ""} = ${n} chemin${n > 1 ? "s" : ""} + ${n * 10} nœuds`,
  },
  {
    id: "pack-premium",
    emoji: "✨",
    badge: "Best-seller 🌟",
    badgeColor: "bg-amber-400",
    name: "Pack Déco Table Premium",
    priceDisplay: "185–205€ / table de 10",
    desc: "1 chemin Fleuri + 10 nœuds Premium assortis. Même ambiance florale, même tissu. Prêt à poser. Fait main.",
    features: ["1 chemin fleuri 3m par table", "10 nœuds Premium avec broche florale par table", "Même ambiance florale chemin et nœuds", "Fait main", "Livraison soignée", "Délai de traitement 7–10 jours ouvrés"],
    needsAmbiance: true,
    hasNotes: true,
    qtyLabel: "Nombre de tables",
    unit: "tables",
    minQty: 1,
    calcNote: (n) => `${n} table${n > 1 ? "s" : ""} = ${n} chemin${n > 1 ? "s" : ""} fleuri${n > 1 ? "s" : ""} + ${n * 10} nœuds Premium`,
  },
];

export default function DecoTableSection() {
  const [openKit, setOpenKit] = useState(null);

  return (
    <div id="deco" className="px-6 md:px-12 py-16 max-w-5xl mx-auto">
      <style>{`
        .font-serif-m { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-m { font-family: 'Lato', system-ui, sans-serif; }
      `}</style>
      <p className="font-sans-m text-xs tracking-[0.3em] uppercase text-rose-400 mb-2 text-center">Décoration de table</p>
      <h2 className="font-serif-m text-4xl font-bold text-gray-800 mb-3 text-center">Chemins de table & Nœuds de chaise</h2>
      <p className="font-sans-m text-gray-400 text-sm text-center max-w-lg mx-auto mb-10">
        Collections sur-mesure en tissu naturel. Choisissez votre coloris parmi 6 teintes, et pour les versions fleuries, votre ambiance florale.
      </p>

      {/* Coloris preview */}
      <div className="flex items-center justify-center gap-3 mb-10">
        {COLORIS.map(c => (
          <div key={c.id} className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: c.hex }} title={c.label} />
            <span className="text-xs text-gray-400 hidden md:block">{c.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DECO_KITS.map(kit => (
          <div key={kit.id} className="rounded-3xl border-2 border-rose-100 bg-gradient-to-br from-rose-50 to-white p-6 flex flex-col">
            <div className="text-4xl mb-3">{kit.emoji}</div>
            {kit.badge && (
              <span className={`inline-block ${kit.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full font-sans-m mb-3 w-fit`}>
                {kit.badge}
              </span>
            )}
            <h3 className="font-serif-m text-xl font-bold text-gray-800 mb-1">{kit.name}</h3>
            <p className="font-sans-m text-lg font-bold text-rose-500 mb-3">{kit.priceDisplay}</p>
            <p className="font-sans-m text-sm text-gray-500 leading-relaxed mb-4 flex-1">{kit.desc}</p>

            {/* Coloris dots preview */}
            <div className="flex gap-1.5 mb-4">
              {COLORIS.map(c => (
                <div key={c.id} className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: c.hex }} title={c.label} />
              ))}
              {kit.needsAmbiance && (
                <span className="ml-1 text-xs text-gray-400 self-center">+ ambiance florale</span>
              )}
            </div>

            <ul className="space-y-1.5 mb-5">
              {kit.features.map(f => (
                <li key={f} className="flex items-start gap-2 font-sans-m text-sm text-gray-700">
                  <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setOpenKit(kit)}
              className="w-full text-center py-3 rounded-xl bg-rose-400 hover:bg-rose-500 text-white font-sans-m font-semibold text-sm transition"
            >
              Commander →
            </button>
          </div>
        ))}
      </div>

      {openKit && <OrderModal kit={openKit} onClose={() => setOpenKit(null)} />}
    </div>
  );
}