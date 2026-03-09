import React, { useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function StripePaymentForm({
  amount,
  amountFormatted,
  paymentType,
  order,
  onSuccess,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [succeeded, setSucceeded] = useState(false);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    const cardElement = elements.getElement(CardElement);

    // Créer le Payment Intent côté backend
    const response = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        orderId: order.id,
        email: order.customer_email,
        name: order.customer_name,
        paymentType,
      }),
    });

    const { clientSecret, intentId } = await response.json();

    // Confirmer le paiement
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: { email: order.customer_email, name: order.customer_name },
      },
    });

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    if (result.paymentIntent.status === "succeeded") {
      // Sauvegarder le paiement
      await base44.entities.StripePayment.create({
        order_id: order.id,
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        stripe_payment_intent_id: intentId,
        amount_cents: amount,
        payment_type: paymentType,
        status: "succeeded",
        receipt_url: result.paymentIntent.charges.data[0]?.receipt_url,
        charge_id: result.paymentIntent.charges.data[0]?.id,
      });

      // Mettre à jour la commande
      const newPaymentStatus =
        paymentType === "full"
          ? "paid"
          : paymentType === "deposit"
          ? "partial"
          : "partial";

      await base44.entities.Order.update(order.id, {
        payment_status: newPaymentStatus,
        ...(paymentType === "deposit" && { deposit_amount: amount / 100 }),
      });

      setSucceeded(true);
      toast.success(`Paiement de ${amountFormatted}€ confirmé ✓`);
      
      // Callback
      setTimeout(() => onSuccess?.(), 1500);
    }

    setLoading(false);
  };

  if (succeeded) {
    return (
      <div className="text-center py-6">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <p className="text-green-600 font-semibold mb-1">Paiement confirmé</p>
        <p className="text-sm text-gray-500">{amountFormatted}€ débité</p>
      </div>
    );
  }

  return (
    <form onSubmit={handlePayment} className="space-y-4">
      <div className="border border-gray-200 rounded-xl p-4 bg-white">
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

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
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
          <>💳 Payer {amountFormatted}€</>
        )}
      </Button>

      <p className="text-xs text-gray-400 text-center">
        Paiement sécurisé via Stripe — {amountFormatted}€
      </p>
    </form>
  );
}