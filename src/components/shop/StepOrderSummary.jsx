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

  const kitLabel = selection.kitType === "pret" ? "Kit prêt à offrir" : "Kit à composer";
  const basePrice = selection.kitType === "pret" ? PRICING.KIT_PRET : PRICING.KIT_COMPOSE;
  const containerLabel = selection.containerType === "rond_clip" ? "Pot rond fermoir" : selection.containerType === "carre_liege" ? "Pot carré liège" : null;
  const packs = selection.packs || [];

  const handlePaymentSuccess = async () => {
    setLoading(true);
    try {
      const packsLabel = packs.map(p => `Pack ${p.size} × ${p.qty}`).join(", ");
      const order = await base44.entities.Order.create({
        customer_name: customerInfo.name,
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
          delivery_address: customerInfo.address,
          subtotal: pricing.subtotal,
          discount: pricing.discount,
          shipping_method_id: shippingMethod?.id ?? null,
          shipping_method_name: shippingMethod?.name ?? null,
          shipping_carrier: shippingMethod?.carrier ?? null,
          shipping_cost: pricing.shippingCost,
        }
      });

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

      window.location.href = createPageUrl("OrderConfirmation") + `?order_id=${order.id}`;
    } catch (e) {
      toast.error("Erreur lors de la finalisation de la commande");
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
        <p className="text-gray-700"><strong>Livraison :</strong> {customerInfo.address}</p>
      </div>

      {/* Budget savings block */}
      <BudgetSavings selection={selection} pricing={pricing} PRICING={PRICING} />

      {/* Post-payment note */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-800">
        🌸 <strong>Après le paiement</strong>, vous pourrez créer votre site de mariage avec QR code personnalisé inclus.
      </div>

      {!paymentStarted ? (
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