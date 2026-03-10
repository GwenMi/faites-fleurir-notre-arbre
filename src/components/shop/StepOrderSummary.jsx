import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

export default function StepOrderSummary({ selection, customerInfo, pricing, PRICING, onBack }) {
  const [loading, setLoading] = useState(false);

  const kitLabel = selection.kitType === "pret" ? "Kit prêt à offrir" : "Kit à composer";
  const potLabel = selection.potType === "blanc" ? "Pot blanc" : "Pot en verre";
  const basePrice = selection.kitType === "pret" ? PRICING.KIT_PRET : PRICING.KIT_COMPOSE;

  const handleOrder = async () => {
    setLoading(true);
    try {
      const order = await base44.entities.Order.create({
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        product_id: `pack_${selection.packSize}`,
        product_name: `Pack ${selection.packSize} invités × ${selection.packQty} — ${kitLabel}`,
        quantity: pricing.totalPots,
        total_price: pricing.total,
        status: "pending",
        payment_status: "unpaid",
        options_selected: {
          kitType: selection.kitType,
          potType: selection.potType,
          sacCadeau: selection.sacCadeau,
          packSize: selection.packSize,
          packQty: selection.packQty,
          pricePerPot: pricing.pricePerPot,
          event_date: customerInfo.eventDate,
          phone: customerInfo.phone,
          delivery_address: customerInfo.address,
          subtotal: pricing.subtotal,
          discount: pricing.discount,
        }
      });
      window.location.href = createPageUrl("OrderConfirmation") + `?order_id=${order.id}`;
    } catch (e) {
      toast.error("Erreur lors de la commande");
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
          <div className="flex justify-between text-gray-700">
            <span>{kitLabel}</span>
            <span>{basePrice.toFixed(2)}€/pot</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>{potLabel}</span>
            <span>{selection.potType === "blanc" ? `+${PRICING.POT_BLANC_EXTRA.toFixed(2)}€/pot` : "Inclus"}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Sac cadeau</span>
            <span>{selection.sacCadeau ? `+${PRICING.SAC_CADEAU.toFixed(2)}€/pot` : "Non"}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-3">
            <span>Prix par pot</span>
            <span>{pricing.pricePerPot.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between text-gray-700 mt-2">
            <span>Pack {selection.packSize} invités × {selection.packQty}</span>
            <span>{pricing.totalPots} pots</span>
          </div>
        </div>
        <div className="border-t border-gray-100 px-6 py-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-700">
            <span>Sous-total</span>
            <span>{pricing.subtotal.toFixed(2)}€</span>
          </div>
          {pricing.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Réduction 10% (2 packs)</span>
              <span>−{pricing.discount.toFixed(2)}€</span>
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

      {/* Post-payment note */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-800">
        🌸 <strong>Après le paiement</strong>, vous pourrez créer votre site de mariage avec QR code personnalisé inclus.
      </div>

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1 h-12 rounded-xl">
          <ChevronLeft className="w-4 h-4 mr-2" /> Retour
        </Button>
        <Button onClick={handleOrder} disabled={loading} className="flex-1 h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold">
          {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          {loading ? "Enregistrement..." : "Confirmer la commande →"}
        </Button>
      </div>
    </div>
  );
}