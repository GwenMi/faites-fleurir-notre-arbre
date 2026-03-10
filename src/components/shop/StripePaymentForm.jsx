import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, CheckCircle2, ChevronLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : Promise.reject(new Error("Stripe key not configured"));

function PaymentForm({ customerInfo, total, onSuccess, onBack }) {
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

    try {
      // Créer un Payment Intent via le backend
      const response = await base44.functions.invoke("createPaymentIntent", {
        amount: total,
        orderId: `ord_${Date.now()}`,
        customerEmail: customerInfo.email,
        customerName: customerInfo.name,
      });

      const { clientSecret, paymentIntentId } = response.data;

      // Confirmer le paiement avec Stripe
      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
          },
        },
      });

      if (paymentResult.error) {
        setError(paymentResult.error.message);
        setLoading(false);
        return;
      }

      if (paymentResult.paymentIntent.status === "succeeded") {
        setSucceeded(true);
        toast.success(`Paiement de ${total.toFixed(2)}€ confirmé ✓`);
        setTimeout(() => onSuccess?.(), 1500);
      }
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
        <p className="text-sm text-gray-500">{total.toFixed(2)}€ débité avec succès</p>
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

      <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Montant total :</span>
          <strong className="text-gray-900">{total.toFixed(2)}€</strong>
        </div>
      </div>

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
          <>💳 Payer {total.toFixed(2)}€</>
        )}
      </Button>

      <p className="text-xs text-gray-400 text-center">
        Paiement sécurisé par Stripe — Aucune donnée bancaire stockée
      </p>
    </form>
  );
}

export default function StripePaymentForm({ customerInfo, total, onSuccess, onBack }) {
  if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    return (
      <div className="px-6 py-10 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600 font-semibold">Erreur de configuration</p>
        <p className="text-sm text-gray-500">Stripe n'est pas correctement configuré. Contactez l'administrateur.</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        customerInfo={customerInfo}
        total={total}
        onSuccess={onSuccess}
        onBack={onBack}
      />
    </Elements>
  );
}