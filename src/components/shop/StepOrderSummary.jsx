import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import BudgetSavings from "./BudgetSavings";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import StripePaymentForm from "./StripePaymentForm";

export default function StepOrderSummary({ selection, customerInfo, pricing, PRICING, shippingMethod, onBack }) {
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);

  const kitLabel = selection.kitType === "pret" ? "Kit prêt à offrir" : "Kit à composer";
  const basePrice = selection.kitType === "pret" ? PRICING.KIT_PRET : PRICING.KIT_COMPOSE;
  const containerLabel = selection.containerType === "rond_clip" ? "Pot rond fermoir" : selection.containerType === "carre_liege" ? "Pot carré liège" : null;
  const packs = selection.packs || [];

  const handlePaymentSuccess = async () => {
    setLoading(true);
    const fullName = `${customerInfo.firstName || ""} ${customerInfo.lastName || ""}`.trim() || customerInfo.name || "";
    try {
      const packsLabel = packs.map(p => `Pack ${p.size} × ${p.qty}`).join(", ");
      const order = await base44.entities.Order.create({
        customer_name: fullName,
        customer_email: customerInfo.email,
        product_id: `multi_pack`,
        product_name: `${packsLabel} — ${kitLabel}`,
        quantity: pricing.totalPots,
        total_price: pricing.total,
        status: "confirmed",
        payment_status: "paid",
        options_selected: {
          kitType: selection.kitType,
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

      setCreatedOrderId(order.id);
      setPaymentDone(true);
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
          {shippingMethod && (
            <div className="flex justify-between text-sm text-gray-700">
              <span>Livraison — {shippingMethod.name}</span>
              <span>
                {shippingMethod.price !== null
                  ? `${shippingMethod.price.toFixed(2)}€`
                  : "Variable"}
              </span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-rose-600 border-t border-gray-100 pt-3">
            <span>Total</span>
            <span>{pricing.total.toFixed(2)}€</span>
          </div>
        </div>
      </div>

      {/* Customer info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-2 text-sm">
        <h3 className="font-semibold text-gray-800 mb-3">Vos informations</h3>
        <p className="text-gray-700"><strong>Nom :</strong> {customerInfo.name}</p>
        <p className="text-gray-700"><strong>Email :</strong> {customerInfo.email}</p>
        {customerInfo.phone && <p className="text-gray-700"><strong>Tél :</strong> {customerInfo.phone}</p>}
        <p className="text-gray-700">
          <strong>Événement :</strong> {new Date(customerInfo.eventDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        <p className="text-gray-700"><strong>Livraison :</strong> {[customerInfo.street, customerInfo.zipCode, customerInfo.city, customerInfo.country].filter(Boolean).join(', ') || customerInfo.address || '—'}</p>
        {selection.slug && (
          <p className="text-gray-700"><strong>Site événement :</strong> <a href={`https://fleursdefete.fr/${selection.slug}`} target="_blank" rel="noreferrer" className="text-rose-500 underline">fleursdefete.fr/{selection.slug}</a></p>
        )}
      </div>

      {/* Budget savings block */}
      <BudgetSavings selection={selection} pricing={pricing} PRICING={PRICING} />



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
                <p className="text-lg font-bold text-indigo-900 mb-1">✨ Créez votre site personnalisé</p>
                <p className="text-sm text-indigo-700">Invitez vos convives, partagez les photos, gérez les RSVP… inclus dans votre commande.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => window.location.href = createPageUrl("OrderConfirmation") + `?order_id=${createdOrderId}&create_site=1`}
                  className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold"
                >
                  🌐 Créer mon site événement
                </Button>
                <Button
                  onClick={() => window.location.href = createPageUrl("OrderConfirmation") + `?order_id=${createdOrderId}`}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl text-gray-500"
                >
                  Passer pour l'instant
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
        <div className="flex gap-3">
          <Button onClick={onBack} variant="outline" className="flex-1 h-12 rounded-xl">
            <ChevronLeft className="w-4 h-4 mr-2" /> Retour
          </Button>
          <Button onClick={() => setPaymentStarted(true)} className="flex-1 h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold">
            Procéder au paiement →
          </Button>
        </div>
      ) : (
        <StripePaymentForm
          customerInfo={customerInfo}
          total={pricing.total}
          onSuccess={handlePaymentSuccess}
          onBack={() => setPaymentStarted(false)}
        />
      )}
    </div>
  );
}