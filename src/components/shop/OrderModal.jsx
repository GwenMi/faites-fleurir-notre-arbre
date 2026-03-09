import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Minus, Plus, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripePaymentSection from "./StripePaymentSection";
import { generateInvoicePDF } from "@/components/admin/invoiceUtils";
import { notifyAdminNewOrder, notifyAdminPaymentReceived, notifyCustomerPaymentReminder } from "@/components/admin/AdminNotifier";

const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLIC_KEY || "pk_test_placeholder"
);

const RIBBON_COLORS = ["Blanc", "Ivoire", "Rose poudré", "Bordeaux", "Vert sauge", "Bleu ardoise", "Doré", "Noir"];
const SEED_TYPES = ["Lavande", "Tournesol", "Marguerite", "Coquelicot", "Bleuet", "Forget-me-not"];

export default function OrderModal({ product, guestPack, onClose }) {
  const isGuestPack = !!guestPack;
  const [quantity, setQuantity] = useState(isGuestPack ? 1 : 10);
  const [ribbon, setRibbon] = useState(RIBBON_COLORS[0]);
  const [seeds, setSeeds] = useState(SEED_TYPES[0]);
  const [potType, setPotType] = useState("Verre");
  const [customText, setCustomText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [cgvAccepted, setCgvAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showLateWarning, setShowLateWarning] = useState(false);

  const workingProduct = product || guestPack;
  const isPremium = workingProduct?.name?.toLowerCase()?.includes("premium");
  const hasCompose = workingProduct?.name?.toLowerCase()?.includes("composer");
  const itemQuantity = isGuestPack ? guestPack.guests : quantity;
  const basePrice = isGuestPack ? guestPack.totalPrice : (workingProduct.price * quantity);
  const total = basePrice.toFixed(2);

  const daysUntilEvent = eventDate
    ? Math.floor((new Date(eventDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;
  const isLate = daysUntilEvent !== null && daysUntilEvent < 14;

  const [siteUrl, setSiteUrl] = useState("");
  const [orderCreated, setOrderCreated] = useState(null);
  const [paymentStep, setPaymentStep] = useState(false);
  const [paymentOption, setPaymentOption] = useState("full"); // "full" ou "deposit"

  const depositAmount = Math.round(parseFloat(total) * 0.5 * 100) / 100; // 50%

  const createOrder = async () => {
    // 1. Créer automatiquement le site événement gratuit
    const baseSlug = name.trim().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 28);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;
    const publicUrl = `${window.location.origin}/app/EventPublic?slug=${slug}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}`;

    const eventRecord = await base44.entities.Event.create({
      couple_names: name.trim(),
      event_date: eventDate,
      event_type: "mariage",
      slug,
      public_url: publicUrl,
      qr_code_url: qrCodeUrl,
      status: "active",
      plan: "basic",
      template: "floral",
      welcome_message: `Bienvenue sur notre espace événement 🌸`,
    });

    // 2. Créer la commande
    const order = await base44.entities.Order.create({
      customer_name: name.trim(),
      customer_email: email.trim(),
      product_id: isGuestPack ? `guest_pack_${guestPack.guests}` : product.id,
      product_name: isGuestPack ? `Pack ${guestPack.guests} invités - ${guestPack.kitName}` : product.name,
      quantity: itemQuantity,
      options_selected: {
        ...(isGuestPack && { 
          pack_type: "guest_pack",
          pack_guests: guestPack.guests,
          kit_type: guestPack.kitId,
          kit_name: guestPack.kitName,
          pot_type: guestPack.potId,
          pot_name: guestPack.potName,
        }),
        ...(!isGuestPack && {
          ...(hasCompose && { pot_type: potType }),
          ribbon_color: ribbon,
          seed_type: seeds,
          ...(isPremium && customText && { custom_text: customText }),
        }),
        event_date: eventDate,
        delivery_address: address.trim(),
        site_public_url: publicUrl,
        site_slug: slug,
      },
      total_price: parseFloat(total),
      status: "pending",
      event_id: eventRecord.id,
      payment_status: "unpaid",
    });

    setSiteUrl(publicUrl);
    setOrderCreated(order);
    
    // Notifier l'admin
    notifyAdminNewOrder(order, publicUrl);
    
    setPaymentStep(true);
  };

  const doSubmit = async () => {
    setLoading(true);

    const lateNote = isLate
      ? "\n\n⚠️ Rappel délais : Votre événement est dans moins de 14 jours. Nous ferons notre maximum pour préparer et expédier votre commande rapidement, mais la livraison dans les délais ne peut pas être garantie."
      : "\n\nRappel délais : Nous vous recommandons de passer commande jusqu'à 21 jours avant votre événement afin de garantir la livraison dans les délais. Les commandes passées moins de 14 jours avant l'événement peuvent être acceptées mais la livraison à temps ne peut pas être garantie.";

    const productName = isGuestPack ? `Pack ${guestPack.guests} invités - ${guestPack.kitName}` : workingProduct.name;
    
    // Envoyer l'email de confirmation
    await base44.integrations.Core.SendEmail({
      to: email.trim(),
      subject: `🌸 Confirmation de commande — ${productName}`,
      body: `Bonjour ${name.trim()},\n\nNous avons bien reçu votre commande ${isGuestPack ? `du pack ${guestPack.guests} invités (${guestPack.kitName} avec ${guestPack.potName})` : `de ${quantity} kit${quantity > 1 ? "s" : ""} "${workingProduct.name}"`} pour un total de ${total} €.\n\nAdresse de livraison : ${address.trim()}\nDate de votre événement : ${eventDate ? new Date(eventDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "Non renseignée"}\n${lateNote}\n\n🌸 VOTRE ESPACE ÉVÉNEMENT GRATUIT\nNous avons créé un espace en ligne personnalisé pour votre événement. Partagez-le avec vos invités !\n👉 ${siteUrl}\n\nSuivre votre commande : ${window.location.origin}/app/OrderTracking\n\nVous disposez d'un droit de rétractation de 14 jours à compter de la réception (hors produits personnalisés). Pour exercer ce droit : contact@fleursenfete.com\n\nMerci pour votre confiance,\nGwenaëlle — Fleurs en fête 🌸\ncontact@fleursenfete.com`,
    });

    // Générer et envoyer la facture PDF
    const doc = await generateInvoicePDF(orderCreated);
    const pdfBlob = doc.output("blob");
    
    // Note: L'envoi du PDF par email nécessiterait une fonction backend
    // Pour maintenant, le PDF est disponible au téléchargement en ligne
    
    setLoading(false);
    setSuccess(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !eventDate || !address.trim()) return;
    if (!cgvAccepted) return;
    if (isLate && !showLateWarning) {
      setShowLateWarning(true);
      return;
    }
    setLoading(true);
    await createOrder();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-4 sm:pb-0">
      <Elements stripe={stripePromise}>
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
            <div>
              {isGuestPack ? (
                <>
                  <h2 className="font-serif-elegant text-xl font-bold text-gray-800">Pack {guestPack.guests} invités</h2>
                  <p className="text-rose-500 font-semibold text-sm">{guestPack.kitName} avec {guestPack.potName}</p>
                </>
              ) : (
                <>
                  <h2 className="font-serif-elegant text-xl font-bold text-gray-800">{workingProduct.name}</h2>
                  <p className="text-rose-500 font-semibold text-sm">{workingProduct.price?.toFixed(2)} € / unité</p>
                </>
              )}
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

        {paymentStep && orderCreated ? (
          <StripePaymentSection 
            order={orderCreated}
            paymentOption={paymentOption}
            setPaymentOption={setPaymentOption}
            total={total}
            depositAmount={depositAmount}
            onPaymentSuccess={() => {
              setTimeout(() => {
                window.location.href = `${window.location.origin}/app/OrderConfirmation?order_id=${orderCreated?.id}`;
              }, 2000);
            }}
            onBack={() => { setPaymentStep(false); setOrderCreated(null); }}
          />
        ) : success ? (
           <div className="px-6 py-10 text-center space-y-4">
             <CheckCircle className="w-14 h-14 text-green-400 mx-auto" />
             <div>
               <h3 className="text-2xl font-bold text-gray-800 mb-1">Commande reçue !</h3>
               <p className="text-gray-500 text-sm">Email de confirmation envoyé à <span className="font-semibold">{email}</span></p>
             </div>

             {/* Étapes suivantes */}
             <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-left">
               <p className="text-xs font-bold text-blue-600 mb-3">📋 Prochaines étapes :</p>
               <ul className="text-xs text-gray-700 space-y-2">
                 <li className="flex items-start gap-2">
                   <span className="font-bold text-blue-600 flex-shrink-0">1.</span>
                   <span>Consultez votre email pour la facture complète avec QR code</span>
                 </li>
                 <li className="flex items-start gap-2">
                   <span className="font-bold text-blue-600 flex-shrink-0">2.</span>
                   <span>Accédez à votre espace événement (lien dans l'email)</span>
                 </li>
                 <li className="flex items-start gap-2">
                   <span className="font-bold text-blue-600 flex-shrink-0">3.</span>
                   <span>Suivez votre commande en ligne</span>
                 </li>
               </ul>
             </div>

             {siteUrl && (
               <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-left">
                 <p className="text-xs font-bold text-rose-500 mb-2">🌸 Espace événement</p>
                 <a href={siteUrl} target="_blank" rel="noreferrer"
                   className="block text-xs text-rose-600 hover:text-rose-700 underline break-all font-mono mb-3">{siteUrl}</a>
                 <a href={siteUrl} target="_blank" rel="noreferrer"
                   className="inline-block px-3 py-1.5 bg-rose-500 text-white text-xs font-semibold rounded-lg hover:bg-rose-600 transition">
                   Ouvrir →
                 </a>
               </div>
             )}

             {/* Lien suivi */}
             <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left">
               <p className="text-xs font-bold text-amber-600 mb-2">📦 Suivre ma commande</p>
               <a href="/app/OrderTracking"
                 className="inline-block px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition">
                 Accéder au suivi →
               </a>
             </div>

             <button onClick={onClose} className="w-full px-8 py-3 rounded-full bg-gray-800 text-white font-semibold text-sm hover:bg-gray-900 transition">
               Fermer
             </button>
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Pack summary or quantity */}
            {isGuestPack ? (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-2">
                <div>
                  <p className="text-xs text-gray-500 font-semibold">Nombre de pots</p>
                  <p className="text-lg font-bold text-gray-800">{guestPack.guests} pots</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold">Type de kit</p>
                  <p className="text-sm text-gray-700">{guestPack.kitName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold">Type de pot</p>
                  <p className="text-sm text-gray-700">{guestPack.potName}</p>
                </div>
                <div className="border-t border-rose-200 pt-2">
                  <p className="text-xs text-gray-500 font-semibold">Prix total</p>
                  <p className="text-2xl font-bold text-rose-500">{total} €</p>
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Quantité</label>
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-rose-300 transition">
                    <Minus className="w-4 h-4 text-gray-500" />
                  </button>
                  <span className="text-2xl font-bold text-gray-800 w-12 text-center">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(q => q + 1)}
                    className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-rose-300 transition">
                    <Plus className="w-4 h-4 text-gray-500" />
                  </button>
                  <span className="text-sm text-gray-400 ml-2">= <span className="font-bold text-rose-500">{total} €</span></span>
                </div>
              </div>
            )}

            {/* Pot type (compose only) */}
            {!isGuestPack && hasCompose && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Type de pot</label>
                <div className="flex gap-2">
                  {["Verre", "Plastique"].map(p => (
                    <button key={p} type="button" onClick={() => setPotType(p)}
                      className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition ${potType === p ? "border-rose-400 bg-rose-50 text-rose-600" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                      {p === "Verre" ? "🫙 Verre" : "🧴 Plastique"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ribbon color */}
            {!isGuestPack && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Couleur du ruban</label>
                <div className="flex flex-wrap gap-2">
                  {RIBBON_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setRibbon(c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${ribbon === c ? "border-rose-400 bg-rose-50 text-rose-600" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Seed type */}
            {!isGuestPack && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Type de graines</label>
                <div className="flex flex-wrap gap-2">
                  {SEED_TYPES.map(s => (
                    <button key={s} type="button" onClick={() => setSeeds(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${seeds === s ? "border-rose-400 bg-rose-50 text-rose-600" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom text (premium only) */}
            {!isGuestPack && isPremium && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                  Texte personnalisé <span className="text-gray-300 font-normal normal-case">(ex: Sophie & Thomas · 14 juin 2026)</span>
                </label>
                <Input
                  placeholder="Vos prénoms & date"
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
            )}

            {/* Contact */}
            <div className="pt-2 border-t border-gray-100 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Vos coordonnées</p>
              <Input placeholder="Votre prénom & nom *" value={name} onChange={e => setName(e.target.value)} required className="rounded-xl h-11" />
              <Input type="email" placeholder="Votre email *" value={email} onChange={e => setEmail(e.target.value)} required className="rounded-xl h-11" />
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Adresse de livraison complète *
                </label>
                <textarea
                  placeholder={"N° et rue\nCode postal, Ville\nPays"}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  required
                  rows={3}
                  className="w-full rounded-xl border border-input px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-rose-300"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Date de votre événement *
                </label>
                <p className="text-xs text-gray-400 mb-2">Cette information nous permet de vérifier les délais de préparation et de livraison.</p>
                <Input
                  type="date"
                  value={eventDate}
                  onChange={e => { setEventDate(e.target.value); setShowLateWarning(false); }}
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="rounded-xl h-11"
                />
                {daysUntilEvent !== null && daysUntilEvent >= 14 && daysUntilEvent <= 21 && (
                  <p className="mt-2 text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2">
                    ⏱️ Votre événement est dans {daysUntilEvent} jours. Nous ferons de notre mieux pour garantir la livraison.
                  </p>
                )}
              </div>
            </div>

            {/* Late warning */}
            {showLateWarning && isLate && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 font-medium">
                    Attention : votre événement est proche ({daysUntilEvent} jour{daysUntilEvent > 1 ? "s" : ""}). Nous ferons notre maximum pour préparer et expédier votre commande rapidement, mais la livraison dans les délais ne peut pas être garantie.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowLateWarning(false)}
                    className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
                    Annuler
                  </button>
                  <button type="button" onClick={doSubmit} disabled={loading}
                    className="flex-1 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Confirmer quand même"}
                  </button>
                </div>
              </div>
            )}

            {/* CGV */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={cgvAccepted} onChange={e => setCgvAccepted(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-rose-400 focus:ring-rose-300" />
              <span className="text-xs text-gray-500 leading-relaxed">
                J'ai lu et j'accepte les{" "}
                <a href="/app/cgv" target="_blank" className="text-rose-400 underline hover:text-rose-500">
                  conditions générales de vente
                </a>{" "}
                et la{" "}
                <a href="/app/mentionslegales" target="_blank" className="text-rose-400 underline hover:text-rose-500">
                  politique de confidentialité
                </a>. *
              </span>
            </label>

            {/* Submit */}
            {!showLateWarning && (
              <Button
                type="submit"
                disabled={loading || !name.trim() || !email.trim() || !eventDate || !address.trim() || !cgvAccepted}
                className="w-full h-12 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold text-sm hover:opacity-90 transition shadow-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Commander {isGuestPack ? `Pack ${guestPack.guests}` : `${quantity} kit${quantity > 1 ? "s" : ""}`} — {total} €
              </Button>
            )}
          </form>
        )}
        </div>
      </Elements>
    </div>
  );
}