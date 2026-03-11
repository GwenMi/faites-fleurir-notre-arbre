import { useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, CheckCircle2, ChevronLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function StripePaymentSection({
  order,
  paymentOption,
  setPaymentOption,
  total,
  depositAmount,
  onPaymentSuccess,
  onBack,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [succeeded, setSucceeded] = useState(false);

  const amountToPay = paymentOption === "full" ? parseFloat(total) : depositAmount;
  const amountCents = Math.round(amountToPay * 100);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    const cardElement = elements.getElement(CardElement);

    try {
      // Créer le Payment Intent via le backend sécurisé
      const response = await base44.functions.invoke("createPaymentIntent", {
        amount: amountToPay,
        orderId: order.id,
        customerEmail: order.customer_email,
        customerName: order.customer_name,
      });

      const { clientSecret, paymentIntentId } = response.data;

      // Confirmer le paiement avec Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: order.customer_email,
            name: order.customer_name,
          },
        },
      });

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
        return;
      }

      if (result.paymentIntent.status !== "succeeded") {
        setError("Le paiement n'a pas pu être finalisé. Veuillez réessayer.");
        setLoading(false);
        return;
      }

      // Sauvegarder le paiement dans la DB
      await base44.entities.StripePayment.create({
        order_id: order.id,
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        stripe_payment_intent_id: result.paymentIntent.id,
        amount_cents: Math.round(amountToPay * 100),
        payment_type: paymentOption,
        status: "succeeded",
        receipt_url: result.paymentIntent.charges?.data?.[0]?.receipt_url || "",
        charge_id: result.paymentIntent.charges?.data?.[0]?.id || "",
      });

      // Mettre à jour le statut de paiement de la commande
      const newPaymentStatus = paymentOption === "full" ? "paid" : "partial";
      await base44.entities.Order.update(order.id, {
        payment_status: newPaymentStatus,
        ...(paymentOption === "deposit" && { deposit_amount: depositAmount }),
      });

      // Notifier l'admin du paiement
      const { notifyAdminPaymentReceived, notifyCustomerPaymentConfirmation, notifyCustomerPaymentReminder } = await import("@/components/admin/AdminNotifier");
      await notifyAdminPaymentReceived(order, amountToPay, paymentOption);

      // Envoyer confirmation au client
      await notifyCustomerPaymentConfirmation(order, amountToPay, paymentOption);

      // Si acompte, envoyer aussi rappel du solde
      if (paymentOption === "deposit") {
        await notifyCustomerPaymentReminder(order);
      }

      setSucceeded(true);
      toast.success(`Paiement de ${amountToPay.toFixed(2)}€ confirmé ✓`);

      // Callback après succès (redirection vers page confirmation)
      setTimeout(() => onPaymentSuccess?.(), 1500);
    } catch (err) {
      setError("Erreur lors du paiement : " + err.message);
    }

    setLoading(false);
  };

  if (succeeded) {
    return (
      <div className="px-6 py-10 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <p className="text-green-600 font-semibold mb-1">Paiement confirmé ✓</p>
        <p className="text-sm text-gray-500">{amountToPay.toFixed(2)}€ débité avec succès</p>
      </div>
    );
  }

  return (
    <form onSubmit={handlePayment} className="px-6 py-5 space-y-4">
      <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
        <button
          type="button"
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </button>
        <h3 className="text-sm font-bold text-gray-800">Paiement sécurisé</h3>
      </div>

      {/* Choix acompte ou montant total */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase">Montant à régler</p>
        <div className="space-y-2">
          <label className={`block p-3 border-2 rounded-xl cursor-pointer transition ${
            paymentOption === "full"
              ? "border-rose-400 bg-rose-50"
              : "border-gray-200 hover:border-gray-300"
          }`}>
            <input
              type="radio"
              name="paymentOption"
              value="full"
              checked={paymentOption === "full"}
              onChange={(e) => setPaymentOption(e.target.value)}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-800">
              Montant total : <strong className="text-rose-600">{total}€</strong>
            </span>
          </label>

          <label className={`block p-3 border-2 rounded-xl cursor-pointer transition ${
            paymentOption === "deposit"
              ? "border-rose-400 bg-rose-50"
              : "border-gray-200 hover:border-gray-300"
          }`}>
            <input
              type="radio"
              name="paymentOption"
              value="deposit"
              checked={paymentOption === "deposit"}
              onChange={(e) => setPaymentOption(e.target.value)}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-800">
              Acompte (50%) : <strong className="text-rose-600">{depositAmount.toFixed(2)}€</strong>
              <br />
              <span className="text-xs text-gray-500">Solde à régler à la livraison</span>
            </span>
          </label>
        </div>
      </div>

      {/* Détail */}
      <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Montant à payer :</span>
          <strong className="text-gray-900">{amountToPay.toFixed(2)}€</strong>
        </div>
        {paymentOption === "deposit" && (
          <div className="flex justify-between text-gray-500">
            <span>Solde après livraison :</span>
            <span>{(parseFloat(total) - depositAmount).toFixed(2)}€</span>
          </div>
        )}
      </div>

      {/* Formulaire Stripe */}
      <div className="pt-2">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Données bancaires</p>
        <div className="border border-gray-200 rounded-xl p-3 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "14px",
                  fontFamily: "inherit",
                  color: "#424770",
                  "::placeholder": { color: "#aab7c4" },
                },
                invalid: { color: "#fa755a" },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || !stripe || !elements}
        className="w-full rounded-xl bg-rose-500 hover:bg-rose-600 text-white h-11"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Traitement...
          </>
        ) : (
          <>💳 Payer {amountToPay.toFixed(2)}€</>
        )}
      </Button>

      <p className="text-xs text-gray-400 text-center">
        Paiement sécurisé par Stripe — Aucune donnée bancaire stockée
      </p>
    </form>
  );
}