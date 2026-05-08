import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import BudgetSavings from "./BudgetSavings";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import StripePaymentForm from "./StripePaymentForm";

export default function StepOrderSummary({ selection, customerInfo, pricing, PRICING, shippingMethod, referral, onBack, onOrderComplete }) {
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [deliveryAcknowledged, setDeliveryAcknowledged] = useState(false);
  const [showDeliveryError, setShowDeliveryError] = useState(false);

  const KIT_LABELS = {
    pret: "Kit Fleurs prêt à offrir",
    compose: "Kit Fleurs à composer",
    crackers: "Kit Apéro Crackers Italiens",
    entreprise_standard: 'Pack Standard "Bureau"',
    entreprise_premium: 'Pack Premium "Moniteur"',
    naturel_essentiel: "Kit Naturel Essentiel",
    naturel_douceur: "Kit Naturel Douceur",
  };
  const isEventKit = ["pret", "compose", "crackers"].includes(selection.kitType);
  const [wantPremium, setWantPremium] = useState(false);
  const kitLabel = KIT_LABELS[selection.kitType] || "Kit";
  const basePrice = PRICING[selection.kitType] ?? (selection.kitType === "pret" ? PRICING.KIT_PRET : PRICING.KIT_COMPOSE);
  const containerLabel = selection.containerType === "rond_clip" ? "Pot rond fermoir" : selection.containerType === "carre_liege" ? "Pot carré liège" : null;
  const packs = selection.packs || [];

  const handlePaymentSuccess = async () => {
    setLoading(true);
    const fullName = `${customerInfo.firstName || ""} ${customerInfo.lastName || ""}`.trim() || customerInfo.name || "";
    try {
      const packsLabel = packs.map(p => `Pack ${p.size} × ${p.qty}`).join(", ");
      // Résoudre l'event_id depuis le slug si disponible
      let resolvedEventId = null;
      if (selection.slug) {
        try {
          const events = await base44.entities.Event.filter({ slug: selection.slug });
          if (events?.length > 0) resolvedEventId = events[0].id;
        } catch {}
      }

      const order = await base44.entities.Order.create({
        customer_name: fullName,
        customer_email: customerInfo.email,
        product_id: `multi_pack`,
        product_name: `${packsLabel} — ${kitLabel}`,
        quantity: pricing.totalPots,
        total_price: pricing.total,
        status: "confirmed",
        payment_status: "paid",
        event_id: resolvedEventId || undefined,
        event_date: customerInfo.eventDate || undefined,
        options_selected: {
          kitType: selection.kitType,
          kitVariant: selection.kitVariant || null,
          eventType: selection.eventType,
          containerType: selection.containerType,
          sacCadeau: selection.sacCadeau,
          packs: packs,
          customization: selection.customization || {},
          pricePerPot: pricing.pricePerPot,
          event_date: customerInfo.eventDate,
          phone: customerInfo.phone,
          delivery_address: `${customerInfo.street || ""}, ${customerInfo.zipCode || ""} ${customerInfo.city || ""}, ${customerInfo.country || ""}`.trim(),
          billing_street: customerInfo.billingStreet || customerInfo.street,
          billing_city: customerInfo.billingCity || customerInfo.city,
          billing_zip: customerInfo.billingZipCode || customerInfo.zipCode,
          billing_country: customerInfo.billingCountry || customerInfo.country,
          subtotal: pricing.subtotal,
          discount: pricing.discount,
          shipping_method_id: shippingMethod?.id ?? null,
          shipping_method_name: shippingMethod?.name ?? null,
          shipping_carrier: shippingMethod?.carrier ?? null,
          shipping_cost: pricing.shippingCost,
          is_company: customerInfo.isCompany || false,
          company_name: customerInfo.companyName || null,
          vat_number: customerInfo.vatNumber || null,
          siret: customerInfo.siret || null,
          slug: selection.slug || null,
          site_public_url: selection.slug ? `https://fleursdefete.fr/${selection.slug}` : null,
        }
      });

      // Confirmer le parrainage si code utilisé
      if (referral?.code) {
        try {
          await base44.functions.invoke('confirmReferral', {
            referralCode: referral.code,
            refereeEmail: customerInfo.email,
            refereeName: fullName,
            orderId: order.id,
          });
        } catch {}
      }

      // Envoyer l'email de confirmation
      try {
        await base44.functions.invoke('sendOrderConfirmation', {
          orderId: order.id,
          customerInfo,
          selection,
          pricing,
        });
      } catch (emailError) {
        console.log('Email confirmation warning:', emailError.message);
      }

      // Generate and send PDF quote
      try {
        await base44.functions.invoke('generateQuotePDF', {
          orderId: order.id,
          customerInfo,
          selection,
          pricing,
          PRICING
        });
      } catch (pdfError) {
        console.log('PDF generation warning:', pdfError.message);
      }

      // Sauvegarder l'adresse sur le profil pour les prochaines commandes
      try {
        await base44.auth.updateMe({
          phone: customerInfo.phone || undefined,
          street: customerInfo.street || undefined,
          zip_code: customerInfo.zipCode || undefined,
          city: customerInfo.city || undefined,
          country: customerInfo.country || undefined,
        });
      } catch {}

      setCreatedOrderId(order.id);
      setPaymentDone(true);
      if (onOrderComplete) onOrderComplete();
    } catch (e) {
      alert("Erreur lors de la finalisation : " + e.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Récapitulatif</h2>
        <p className="text-sm text-gray-500">Vérifiez votre commande avant de continuer</p>
      </div>

      {/* Order details */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="bg-rose-50 px-6 py-4 border-b border-rose-100">
          <h3 className="font-bold text-gray-800">Votre commande</h3>
        </div>
        <div className="p-6 space-y-3 text-sm">
          <div className="flex justify-between text-sm text-gray-700">
            <span>{kitLabel}</span>
            <span>{basePrice.toFixed(2)}€/invité</span>
          </div>
          {selection.kitVariant && (
            <div className="flex justify-between text-sm text-gray-700">
              <span>Variante</span>
              <span>{selection.kitVariant === "crackers" ? "🫙 Kit Apéro Crackers Italiens" : "🌻 Graines de tournesol"}</span>
            </div>
          )}
          {containerLabel && (
            <div className="flex justify-between text-sm text-gray-700">
              <span>Contenant</span>
              <span>{containerLabel}</span>
            </div>
          )}
          {selection.sacCadeau && (
            <div className="flex justify-between text-sm text-gray-700">
              <span>Sacs cadeaux ({pricing.totalPots} × {PRICING.SAC_CADEAU.toFixed(2)}€)</span>
              <span>+{pricing.sacCadeauTotal?.toFixed(2)}€</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-3">
            <span>Prix par pot</span>
            <span>{pricing.pricePerPot.toFixed(2)}€</span>
          </div>
          {packs.map(p => (
            <div key={p.size} className="flex justify-between text-sm text-gray-700">
              <span>Pack {p.size} invités × {p.qty}</span>
              <span>{p.size * p.qty} pots</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 px-6 py-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-700">
            <span>Sous-total</span>
            <span>{pricing.subtotal.toFixed(2)}€</span>
          </div>
          {pricing.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Réduction 10% multi-packs</span>
              <span>−{pricing.discount.toFixed(2)}€</span>
            </div>
          )}
          {referral && pricing.referralDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>🎁 Code parrainage {referral.code}</span>
              <span>−{pricing.referralDiscount.toFixed(2)}€</span>
            </div>
          )}
          {shippingMethod && (
            <div className="flex justify-between text-sm text-gray-700">
              <span>Livraison — {shippingMethod.name}</span>
              <span className={shippingMethod.price === 0 ? "text-green-600 font-semibold" : ""}>
                {shippingMethod.price === 0
                  ? "Offert 🎁"
                  : shippingMethod.price !== null
                    ? `${shippingMethod.price.toFixed(2)}€`
                    : "Variable"}
              </span>
            </div>
          )}
          {wantPremium === true && (
            <div className="flex justify-between text-sm text-rose-500">
              <span>✨ Site Premium</span>
              <span>+39,99€</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-rose-600 border-t border-gray-100 pt-3">
            <span>Total</span>
            <span>{(pricing.total + (wantPremium === true ? 39.99 : 0)).toFixed(2)}€</span>
          </div>
        </div>
      </div>

      {/* Customer info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-2 text-sm">
        <h3 className="font-semibold text-gray-800 mb-3">Vos informations</h3>
        <p className="text-gray-700"><strong>Nom :</strong> {customerInfo.name}</p>
        <p className="text-gray-700"><strong>Email :</strong> {customerInfo.email}</p>
        {customerInfo.phone && <p className="text-gray-700"><strong>Tél :</strong> {customerInfo.phone}</p>}
        {customerInfo.eventDate && (
          <p className="text-gray-700">
            <strong>Événement :</strong> {new Date(customerInfo.eventDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}
        <p className="text-gray-700"><strong>Livraison :</strong> {[customerInfo.street, customerInfo.zipCode, customerInfo.city, customerInfo.country].filter(Boolean).join(', ') || customerInfo.address || '—'}</p>
        {selection.slug && (
          <p className="text-gray-700"><strong>Site événement :</strong> <a href={`https://fleursdefete.fr/${selection.slug}`} target="_blank" rel="noreferrer" className="text-rose-500 underline">fleursdefete.fr/{selection.slug}</a></p>
        )}
      </div>

      {/* Budget savings block */}
      <BudgetSavings selection={selection} pricing={pricing} PRICING={PRICING} />

      {/* Upsell Premium — uniquement pour kits événement perso */}
      {isEventKit && !wantPremium && (
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">✨</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm mb-0.5">Complétez avec le site Premium — 39,99 €</p>
              <p className="text-xs text-gray-500 mb-3 leading-relaxed">RSVP, programme, plan de table, albums, livre d'or, liste de cadeaux... tout pour un mariage inoubliable.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setWantPremium(true)}
                  className="flex-1 py-2.5 rounded-xl bg-rose-400 hover:bg-rose-500 text-white font-semibold text-sm transition"
                >
                  Ajouter le Premium +39,99 €
                </button>
                <button
                  onClick={() => setWantPremium(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition"
                >
                  Non merci, site gratuit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {wantPremium === true && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-xl">✅</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-800">Site Premium ajouté — +39,99 €</p>
            <p className="text-xs text-green-600">Vous créerez votre site après le paiement</p>
          </div>
          <button onClick={() => setWantPremium(false)} className="text-xs text-gray-400 hover:text-red-400 transition">Retirer</button>
        </div>
      )}



      {paymentDone ? (
        // Étape post-paiement : proposer la création du site
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="font-bold text-gray-900 text-xl mb-2">Commande confirmée !</h3>
            <p className="text-sm text-gray-500">Votre paiement a bien été reçu. Merci pour votre commande 🌸</p>
          </div>

          {["mariage", "bapteme", "communion", "anniversaire"].includes(selection.eventType) && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 space-y-4">
              <div className="text-center">
                <p className="text-lg font-bold text-indigo-900 mb-1">
                  {wantPremium === true ? "✨ Créez votre site Premium" : "🌐 Créez votre site gratuit"}
                </p>
                <p className="text-sm text-indigo-700">
                  {wantPremium === true
                    ? "Votre site Premium est inclus dans votre commande. Personnalisez-le maintenant."
                    : "Partagez les photos et les détails de votre événement — gratuit avec votre commande."}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => window.location.href = createPageUrl("CreateMyEvent") + `?order_id=${createdOrderId}&plan=${wantPremium === true ? "premium" : "basic"}`}
                  className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold"
                >
                  {wantPremium === true ? "✨ Créer mon site Premium" : "🌐 Créer mon site gratuit"}
                </Button>
                <Button
                  onClick={() => window.location.href = createPageUrl("OrderConfirmation") + `?order_id=${createdOrderId}`}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl text-gray-500"
                >
                  Plus tard
                </Button>
              </div>
            </div>
          )}

          {!["mariage", "bapteme", "communion", "anniversaire"].includes(selection.eventType) && (
            <Button
              onClick={() => window.location.href = createPageUrl("OrderConfirmation") + `?order_id=${createdOrderId}`}
              className="w-full h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold"
            >
              Voir ma commande →
            </Button>
          )}
        </div>
      ) : !paymentStarted ? (
        <div className="space-y-4">
          {/* Case à cocher délai livraison — obligatoire */}
          <div
            className={`rounded-2xl border-2 p-4 cursor-pointer transition ${deliveryAcknowledged ? "border-green-300 bg-green-50" : showDeliveryError ? "border-red-400 bg-red-50" : "border-amber-300 bg-amber-50"}`}
            onClick={() => { setDeliveryAcknowledged(v => !v); setShowDeliveryError(false); }}
          >
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition ${deliveryAcknowledged ? "bg-green-500 border-green-500" : showDeliveryError ? "border-red-400" : "border-amber-400"}`}>
                {deliveryAcknowledged && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-sm leading-relaxed font-medium ${showDeliveryError ? "text-red-700" : "text-amber-900"}`}>
                ⚠️ Je comprends que pour garantir la livraison avant mon événement, ma commande doit être passée <strong>au moins 21 jours à l'avance</strong>. En deçà de ce délai, Fleurs en fête ne peut pas garantir la livraison à temps.
              </span>
            </label>
            {showDeliveryError && (
              <p className="mt-2 text-xs text-red-600 font-semibold ml-8">Vous devez cocher cette case pour continuer.</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button onClick={onBack} variant="outline" className="flex-1 h-12 rounded-xl">
              <ChevronLeft className="w-4 h-4 mr-2" /> Retour
            </Button>
            <Button
              onClick={() => {
                if (!deliveryAcknowledged) { setShowDeliveryError(true); return; }
                setPaymentStarted(true);
              }}
              className="flex-1 h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold"
            >
              Procéder au paiement →
            </Button>
          </div>
        </div>
      ) : (
        <StripePaymentForm
          customerInfo={customerInfo}
          total={pricing.total + (wantPremium === true ? 39.99 : 0)}
          onSuccess={handlePaymentSuccess}
          onBack={() => setPaymentStarted(false)}
        />
      )}
    </div>
  );
}