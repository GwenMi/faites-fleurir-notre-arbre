import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Truck, MapPin, Gift } from "lucide-react";
import BudgetSavings from "./BudgetSavings";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import StripePaymentForm from "./StripePaymentForm";

const MAX_FREE_SHIPPING = 20;
const WEIGHT_PER_POT_G = 200;

function getShippingMethods(weightKg) {
  const w = weightKg;
  const colissimoPrice = w <= 0.25 ? 5.49 : w <= 0.5 ? 7.59 : w <= 0.75 ? 9.29 : w <= 1 ? 9.59 : w <= 2 ? 11.19 : w <= 5 ? 17.39 : w <= 10 ? 25.29 : 31.99;
  const colissimoRelaisPrice = w <= 0.25 ? 4.79 : w <= 0.5 ? 6.89 : w <= 0.75 ? 8.59 : w <= 1 ? 8.89 : w <= 2 ? 10.49 : 16.69;
  const chronoPrice = w <= 0.5 ? 12.74 : w <= 1 ? 14.99 : w <= 2 ? 17.49 : w <= 5 ? 22.99 : w <= 10 ? 29.99 : 39.99;
  const mondialRelayPrice = w <= 0.5 ? 4.49 : w <= 1 ? 5.49 : w <= 2 ? 6.49 : w <= 5 ? 8.99 : 11.99;
  return [
    { id: "colissimo_home", name: "Colissimo domicile", carrier: "colissimo", description: "48h ouvrées, suivi inclus", price: colissimoPrice, servicePointRequired: false },
    { id: "colissimo_relais", name: "Colissimo point retrait", carrier: "colissimo", description: "48h, bureau de poste / Pickup", price: colissimoRelaisPrice, servicePointRequired: true },
    { id: "chronopost_18", name: "Chronopost Express J+1", carrier: "chronopost", description: "Livraison le lendemain avant 18h", price: chronoPrice, servicePointRequired: false },
    { id: "mondial_relay", name: "Mondial Relay point relais", carrier: "mondial_relay", description: "3-5 jours, retrait en point relais", price: mondialRelayPrice, servicePointRequired: true },
  ];
}

export default function StepOrderSummary({ selection, customerInfo, pricing, PRICING, shippingMethod, onShippingChange, referral, onBack, onOrderComplete }) {
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [deliveryAcknowledged, setDeliveryAcknowledged] = useState(false);
  const [showDeliveryError, setShowDeliveryError] = useState(false);
  const [isFreeShipping, setIsFreeShipping] = useState(false);

  const weightKg = Math.max((pricing.totalPots || 1) * WEIGHT_PER_POT_G, 100) / 1000;
  const allShippingMethods = getShippingMethods(weightKg);

  useEffect(() => {
    base44.entities.Order.list().then(orders => {
      const free = (orders || []).length < MAX_FREE_SHIPPING;
      setIsFreeShipping(free);
      // Pré-sélectionner Colissimo domicile si aucune méthode choisie
      if (!shippingMethod) {
        const colissimo = allShippingMethods[0];
        onShippingChange(free ? { ...colissimo, price: 0, originalPrice: colissimo.price } : colissimo);
      }
    });
  }, []);

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
          marquePlace: selection.customization?.marquePlace || false,
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
          {selection.customization?.marquePlace && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 mb-1">
              <span className="text-base">🪧</span>
              <p className="text-xs font-semibold text-rose-700">Option marque-place activée — prénoms des invités sur les étiquettes</p>
            </div>
          )}
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

      {/* Livraison — intégré dans le récap */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex items-center gap-2">
          <Truck className="w-4 h-4 text-rose-400" />
          <h3 className="font-bold text-gray-800 text-sm">Mode de livraison</h3>
          {isFreeShipping && <span className="ml-auto text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">🎁 Offerte !</span>}
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {allShippingMethods.map(method => {
            const selected = shippingMethod?.id === method.id;
            const price = isFreeShipping ? 0 : method.price;
            return (
              <button
                key={method.id}
                onClick={() => onShippingChange(isFreeShipping ? { ...method, price: 0, originalPrice: method.price } : method)}
                className={`text-left flex items-start gap-3 p-3 rounded-xl border-2 transition ${selected ? "border-rose-400 bg-rose-50" : "border-gray-200 bg-white hover:border-rose-200"}`}
              >
                <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selected ? "border-rose-400 bg-rose-400" : "border-gray-300"}`}>
                  {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800">{method.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{method.description}</p>
                </div>
                <p className={`text-xs font-bold flex-shrink-0 ${price === 0 ? "text-green-600" : "text-gray-700"}`}>
                  {price === 0 ? "OFFERT" : `${price.toFixed(2)}€`}
                </p>
              </button>
            );
          })}
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
      {isEventKit && (
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">✨</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm mb-0.5">Complétez avec le site Premium — 39,99 €</p>
              <p className="text-xs text-gray-500 mb-3 leading-relaxed">RSVP, programme, plan de table, albums, livre d'or, liste de cadeaux... tout pour un mariage inoubliable.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setWantPremium(true)}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition border-2 ${
                    wantPremium === true
                      ? "bg-rose-500 border-rose-500 text-white shadow-md"
                      : "bg-white border-rose-300 text-rose-500 hover:bg-rose-50"
                  }`}
                >
                  {wantPremium === true ? "✅ Premium sélectionné +39,99 €" : "Ajouter le Premium +39,99 €"}
                </button>
                <button
                  onClick={() => setWantPremium(false)}
                  className={`flex-1 py-2.5 rounded-xl text-sm transition border-2 font-semibold ${
                    wantPremium === false
                      ? "bg-rose-500 border-rose-500 text-white shadow-md"
                      : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {wantPremium === false ? "✅ Site gratuit sélectionné" : "Non merci, site gratuit"}
                </button>
              </div>
            </div>
          </div>
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