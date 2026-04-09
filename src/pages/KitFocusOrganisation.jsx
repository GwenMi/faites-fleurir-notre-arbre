import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2, Loader2, AlertCircle, ChevronLeft, X,
  Building2, Mail, Phone, MapPin, Package, Star, Leaf, Clock, Infinity, Banknote, ChevronRight
} from "lucide-react";
import { toast } from "sonner";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const PACKS = {
  standard: {
    id: "standard",
    name: 'Pack Standard "Bureau"',
    priceHigh: 17.90,
    priceLow: 14.90,
    threshold: 20,
    badge: null,
    items: [
      "Clip mémo en bois naturel",
      "Carte planning A5 plastifiée recto/verso effaçable à l'infini",
      "Timer flip 4 positions (5/15/30/60 min)",
      "Stylo effaçable",
    ],
    note: null,
  },
  premium: {
    id: "premium",
    name: 'Pack Premium "Moniteur"',
    priceHigh: 24.90,
    priceLow: 19.90,
    threshold: 20,
    badge: "Le plus populaire",
    items: [
      "Clip moniteur orientable 360° (fixe sur bord d'écran)",
      "Carte planning A5 plastifiée recto/verso effaçable à l'infini",
      "Timer flip 4 positions (5/15/30/60 min)",
      "Stylo effaçable",
    ],
    note: "La carte est à hauteur des yeux — compatible tous moniteurs et laptops, peut accueillir une feuille A4.",
  },
};

function getUnitPrice(pack, qty) {
  return qty >= pack.threshold ? pack.priceLow : pack.priceHigh;
}

// ----------- Checkout modal -----------
function CheckoutModal({ pack, onClose }) {
  const [step, setStep] = useState(1); // 1 = infos, 2 = paiement, 3 = confirmation
  const [form, setForm] = useState({
    name: "", company: "", email: "", phone: "",
    quantity: 10,
    address: "", city: "", zip: "", country: "France",
    logo: false, logo_notes: "",
  });
  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const qty = parseInt(form.quantity) || 1;
  const unitPrice = getUnitPrice(pack, qty);
  const total = (qty * unitPrice).toFixed(2);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.address || !form.city || !form.zip) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    setLoadingOrder(true);
    const created = await base44.entities.Order.create({
      customer_name: form.name,
      customer_email: form.email,
      product_id: pack.id,
      product_name: pack.name,
      quantity: qty,
      total_price: parseFloat(total),
      status: "pending",
      payment_status: "unpaid",
      options_selected: {
        company: form.company,
        phone: form.phone,
        logo_requested: form.logo,
        logo_notes: form.logo_notes,
        delivery_address: `${form.address}, ${form.zip} ${form.city}, ${form.country}`,
        unit_price: unitPrice,
        source: "kit-focus-organisation",
      },
    });
    setOrder(created);
    setLoadingOrder(false);
    setStep(2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <p className="text-xs text-[#1D9E75] font-semibold uppercase tracking-wider">Commander</p>
            <h3 className="font-bold text-gray-900 text-base">{pack.name}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {step === 1 && (
            <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
              {/* Quantité + prix */}
              <div className="bg-[#f0faf5] rounded-2xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-[#1D9E75] font-semibold mb-1">Quantité</p>
                  <input
                    type="number"
                    name="quantity"
                    min={1}
                    value={form.quantity}
                    onChange={handleChange}
                    className="w-24 h-9 rounded-xl border border-[#c3e8d8] bg-white text-center font-bold text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30"
                  />
                  {qty >= pack.threshold && (
                    <p className="text-xs text-[#1D9E75] mt-1">🎉 Tarif dégressif appliqué !</p>
                  )}
                  {qty < pack.threshold && (
                    <p className="text-xs text-gray-400 mt-1">À partir de {pack.threshold} kits : {pack.priceLow.toFixed(2)} €/kit</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#1D9E75]">{total} €</p>
                  <p className="text-xs text-gray-500">HT · {unitPrice.toFixed(2)} €/kit</p>
                </div>
              </div>

              {/* Infos */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Nom complet *</label>
                  <Input name="name" value={form.name} onChange={handleChange} placeholder="Marie Dupont" required className="rounded-xl" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Entreprise</label>
                  <Input name="company" value={form.company} onChange={handleChange} placeholder="Acme SAS" className="rounded-xl" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Téléphone</label>
                  <Input name="phone" value={form.phone} onChange={handleChange} placeholder="06 xx xx xx xx" className="rounded-xl" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Email *</label>
                  <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="contact@acme.fr" required className="rounded-xl" />
                </div>
              </div>

              {/* Livraison */}
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />Adresse de livraison</p>
                <div className="space-y-2">
                  <Input name="address" value={form.address} onChange={handleChange} placeholder="Adresse *" required className="rounded-xl" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input name="zip" value={form.zip} onChange={handleChange} placeholder="Code postal *" required className="rounded-xl" />
                    <Input name="city" value={form.city} onChange={handleChange} placeholder="Ville *" required className="rounded-xl" />
                  </div>
                  <Input name="country" value={form.country} onChange={handleChange} placeholder="Pays" className="rounded-xl" />
                </div>
              </div>

              {/* Logo */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-[#c3e8d8] bg-[#f0faf5] cursor-pointer">
                <input type="checkbox" name="logo" checked={form.logo} onChange={handleChange} className="mt-0.5 accent-[#1D9E75]" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Personnalisation logo</p>
                  <p className="text-xs text-gray-500">Ajout de votre logo sur les kits (+délai à convenir)</p>
                </div>
              </label>
              {form.logo && (
                <textarea
                  name="logo_notes"
                  value={form.logo_notes}
                  onChange={handleChange}
                  placeholder="Décrivez votre demande de personnalisation…"
                  rows={2}
                  className="w-full rounded-xl border border-gray-200 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30"
                />
              )}

              <Button
                type="submit"
                disabled={loadingOrder}
                className="w-full h-11 rounded-xl text-white font-semibold"
                style={{ background: "#1D9E75" }}
              >
                {loadingOrder ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Création...</> : <>Continuer vers le paiement <ChevronRight className="w-4 h-4 ml-1" /></>}
              </Button>

              <p className="text-xs text-gray-400 text-center">Sans minimum de commande · Assemblé en France</p>
            </form>
          )}

          {step === 2 && order && (
            <div>
              <div className="px-6 pt-5 pb-2">
                <button onClick={() => setStep(1)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-3">
                  <ChevronLeft className="w-3.5 h-3.5" /> Retour
                </button>
                <div className="bg-[#f0faf5] rounded-xl p-3 text-sm flex justify-between items-center mb-4">
                  <span className="text-gray-600">{qty} × {pack.name}</span>
                  <strong className="text-[#1D9E75]">{total} € HT</strong>
                </div>
              </div>
              {stripePromise ? (
                <Elements stripe={stripePromise}>
                  <KitPaymentForm
                    order={order}
                    total={parseFloat(total)}
                    onSuccess={() => setStep(3)}
                  />
                </Elements>
              ) : (
                <div className="px-6 pb-6 text-center text-red-500 text-sm">Stripe non configuré</div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-14 h-14 text-[#1D9E75] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Commande confirmée !</h3>
              <p className="text-gray-600 text-sm mb-6">
                Merci {form.name} ! Votre commande a bien été reçue. Un email de confirmation vous sera envoyé à <strong>{form.email}</strong>.
              </p>
              <div className="bg-[#f0faf5] rounded-2xl p-4 text-left text-sm mb-6 space-y-1">
                <p className="text-[#1D9E75] font-semibold mb-2">Récapitulatif</p>
                <p className="text-gray-700">{qty} × {pack.name}</p>
                <p className="text-gray-700">Total payé : <strong>{total} € HT</strong></p>
                <p className="text-gray-500 text-xs mt-2">Délai estimé : jusqu'à 2 semaines</p>
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href={createPageUrl("OrderTracking")}
                  className="block w-full py-3 rounded-xl text-white font-semibold text-sm"
                  style={{ background: "#1D9E75" }}
                >
                  Suivre ma commande
                </a>
                <button
                  onClick={onClose}
                  className="block w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KitPaymentForm({ order, total, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError("");

    const cardEl = elements.getElement(CardElement);

    const resp = await base44.functions.invoke("createPaymentIntent", {
      amount: total,
      orderId: order.id,
      customerEmail: order.customer_email,
      customerName: order.customer_name,
    });

    const { clientSecret } = resp.data;

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardEl,
        billing_details: { name: order.customer_name, email: order.customer_email },
      },
    });

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    if (result.paymentIntent.status === "succeeded") {
      await base44.entities.StripePayment.create({
        order_id: order.id,
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        stripe_payment_intent_id: result.paymentIntent.id,
        amount_cents: Math.round(total * 100),
        payment_type: "full",
        status: "succeeded",
      });
      await base44.entities.Order.update(order.id, { payment_status: "paid" });
      toast.success("Paiement confirmé ✓");
      onSuccess();
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handlePay} className="px-6 pb-6 space-y-4">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Données bancaires</p>
        <div className="border border-gray-200 rounded-xl p-3 bg-white">
          <CardElement options={{ style: { base: { fontSize: "14px", color: "#374151", "::placeholder": { color: "#9ca3af" } } } }} />
        </div>
      </div>

      {error && (
        <div className="flex gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || !stripe}
        className="w-full h-11 rounded-xl text-white font-semibold"
        style={{ background: "#1D9E75" }}
      >
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Traitement...</> : <>💳 Payer {total.toFixed(2)} € HT</>}
      </Button>
      <p className="text-xs text-gray-400 text-center">Paiement sécurisé par Stripe · Aucune donnée bancaire stockée</p>
    </form>
  );
}

// ----------- Devis modal -----------
function DevisModal({ onClose }) {
  const [form, setForm] = useState({ name: "", company: "", quantity: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.integrations.Core.SendEmail({
      to: "contact@fleursdefete.fr",
      subject: `Demande de devis Kit Focus & Organisation — ${form.company || form.name}`,
      body: `Nom : ${form.name}\nEntreprise : ${form.company}\nQuantité souhaitée : ${form.quantity}\n\nMessage :\n${form.message}`,
    });
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Demande de devis</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        {sent ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-[#1D9E75] mx-auto mb-3" />
            <p className="font-bold text-gray-900 mb-1">Demande envoyée !</p>
            <p className="text-sm text-gray-500">Nous vous répondrons sous 24h.</p>
            <button onClick={onClose} className="mt-5 px-6 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: "#1D9E75" }}>Fermer</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Nom *</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Marie Dupont" required className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Entreprise</label>
              <Input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Acme SAS" className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Quantité souhaitée</label>
              <Input value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="Ex : 50 kits" className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Message</label>
              <textarea
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Votre projet, vos questions…"
                rows={3}
                className="w-full rounded-xl border border-gray-200 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !form.name}
              className="w-full h-11 rounded-xl text-white font-semibold"
              style={{ background: "#1D9E75" }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Envoyer ma demande
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

// ----------- Main page -----------
export default function KitFocusOrganisation() {
  const [selectedPack, setSelectedPack] = useState(null);
  const [showDevis, setShowDevis] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: "#fafaf8", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
        .font-display { font-family: 'Playfair Display', Georgia, serif; }
      `}</style>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 bg-white border-b border-gray-100">
        <a href={createPageUrl("Home")}>
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
            alt="Fleurs en fête" className="h-10" />
        </a>
        <div className="flex items-center gap-3">
          <a href={createPageUrl("Boutique")} className="text-sm text-gray-500 hover:text-gray-800 transition hidden sm:block">Boutique</a>
          <button
            onClick={() => setShowDevis(true)}
            className="text-sm font-semibold text-white px-4 py-2 rounded-full transition"
            style={{ background: "#1D9E75" }}
          >
            Demander un devis
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-14 pb-10 text-center">
        <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-5 border"
          style={{ color: "#1D9E75", background: "#f0faf5", borderColor: "#c3e8d8" }}>
          <Building2 className="w-3.5 h-3.5" /> Kit cadeau entreprise
        </span>
        <h1 className="font-display text-4xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
          Kit Focus &amp; Organisation
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
          Un kit pensé pour le bureau, utile au quotidien.<br />
          <span className="font-medium text-gray-700">Assemblé à la demande, sans minimum de commande.</span>
        </p>

        {/* Targets */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {["Séminaires d'entreprise", "Onboarding nouveaux salariés", "Team building", "Cadeaux collaborateurs"].map(t => (
            <span key={t} className="text-sm px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Product cards */}
      <div className="max-w-3xl mx-auto px-6 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Standard */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Pack Standard</p>
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">"Bureau"</h2>
            <p className="text-2xl font-bold mb-1" style={{ color: "#1D9E75" }}>
              14,90€ <span className="text-base font-normal text-gray-400">→ 17,90€ HT/kit</span>
            </p>
            <p className="text-xs text-gray-400 mb-5">Tarif dégressif à partir de 20 kits</p>
            <ul className="space-y-2.5 mb-6 flex-1">
              {PACKS.standard.items.map(item => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#1D9E75" }} />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setSelectedPack(PACKS.standard)}
              className="w-full py-3 rounded-2xl font-semibold text-sm transition border-2 hover:bg-[#1D9E75] hover:text-white hover:border-[#1D9E75]"
              style={{ borderColor: "#1D9E75", color: "#1D9E75", background: "transparent" }}
            >
              Commander ce pack
            </button>
          </div>

          {/* Premium */}
          <div className="bg-white rounded-3xl border-2 flex flex-col relative overflow-hidden" style={{ borderColor: "#1D9E75" }}>
            <div className="absolute top-0 right-0">
              <span className="text-xs font-bold text-white px-3 py-1 rounded-bl-2xl" style={{ background: "#1D9E75" }}>
                ⭐ Le plus populaire
              </span>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#1D9E75" }}>Pack Premium</p>
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">"Moniteur"</h2>
              <p className="text-2xl font-bold mb-1" style={{ color: "#1D9E75" }}>
                19,90€ <span className="text-base font-normal text-gray-400">→ 24,90€ HT/kit</span>
              </p>
              <p className="text-xs text-gray-400 mb-5">Tarif dégressif à partir de 20 kits</p>
              <ul className="space-y-2.5 mb-4 flex-1">
                {PACKS.premium.items.map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#1D9E75" }} />
                    {item}
                  </li>
                ))}
              </ul>
              {PACKS.premium.note && (
                <div className="text-xs text-gray-500 bg-[#f0faf5] rounded-xl p-3 mb-5 border border-[#c3e8d8]">
                  <span className="font-semibold text-[#1D9E75]">✦ Différence clé : </span>{PACKS.premium.note}
                </div>
              )}
              <button
                onClick={() => setSelectedPack(PACKS.premium)}
                className="w-full py-3 rounded-2xl font-semibold text-sm text-white transition hover:opacity-90"
                style={{ background: "#1D9E75" }}
              >
                Commander ce pack
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: <Infinity className="w-6 h-6" />, value: "∞", label: "Carte réutilisable à l'infini", sub: "zéro papier gaspillé" },
            { icon: <Package className="w-6 h-6" />, value: "0", label: "Minimum de commande", sub: "dès 1 kit commandé" },
            { icon: <Clock className="w-6 h-6" />, value: "2 sem.", label: "Délai max de livraison", sub: "expédié depuis la France" },
            { icon: <Banknote className="w-6 h-6" />, value: "73€", label: "Plafond fiscal/salarié/an", sub: "cadeaux déductibles" },
          ].map(m => (
            <div key={m.value}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "#f0faf5", color: "#1D9E75" }}>
                {m.icon}
              </div>
              <p className="font-display text-3xl font-bold text-gray-900 mb-1">{m.value}</p>
              <p className="text-sm font-semibold text-gray-700 leading-tight">{m.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{m.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Eco / France banner */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
          style={{ background: "#1D9E75" }}>
          <div className="text-white text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
              <Leaf className="w-4 h-4" />
              <p className="text-sm font-semibold tracking-wide uppercase">Personnalisation logo disponible · Assemblé en France</p>
            </div>
            <p className="text-white/80 text-sm">Nous personnalisons chaque kit avec votre logo et vos couleurs sur demande.</p>
          </div>
          <button
            onClick={() => setShowDevis(true)}
            className="flex-shrink-0 bg-white font-semibold text-sm px-6 py-3 rounded-2xl transition hover:bg-gray-50"
            style={{ color: "#1D9E75" }}
          >
            Demander un devis
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6 text-center">
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-gray-400 mb-2">
          <a href={createPageUrl("CGV")} className="hover:text-gray-700">CGV</a>
          <span>·</span>
          <a href={createPageUrl("MentionsLegales")} className="hover:text-gray-700">Mentions légales</a>
          <span>·</span>
          <a href={createPageUrl("Contact")} className="hover:text-gray-700">Contact</a>
          <span>·</span>
          <a href={createPageUrl("OrderTracking")} className="hover:text-gray-700">Suivi commande</a>
        </div>
        <p className="text-xs text-gray-300">© 2025 Fleurs en fête — Assemblé en France 🌿</p>
      </footer>

      {/* Modals */}
      {selectedPack && (
        <CheckoutModal
          pack={selectedPack}
          onClose={() => setSelectedPack(null)}
        />
      )}
      {showDevis && <DevisModal onClose={() => setShowDevis(false)} />}
    </div>
  );
}