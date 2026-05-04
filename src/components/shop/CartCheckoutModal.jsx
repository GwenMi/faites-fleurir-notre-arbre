import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { X, ChevronLeft, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

function PaymentStep({ cart, customerInfo, paymentOption, setPaymentOption, onSuccess, onBack }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [succeeded, setSucceeded] = useState(false);

  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const depositAmount = Math.round(totalAmount * 0.5 * 100) / 100;
  const amountToPay = paymentOption === "deposit" ? depositAmount : totalAmount;

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    const cardElement = elements.getElement(CardElement);

    try {
      // Créer le PaymentIntent via le backend
      const response = await base44.functions.invoke("createPaymentIntent", {
        amount: amountToPay,
        orderId: `cart_${Date.now()}`,
        customerEmail: customerInfo.email,
        customerName: customerInfo.name,
      });

      const { clientSecret } = response.data;

      // Confirmer le paiement
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
          },
        },
      });

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
        return;
      }

      if (result.paymentIntent.status === "succeeded") {
        setSucceeded(true);
        toast.success(`Paiement de ${amountToPay.toFixed(2)}€ confirmé ✓`);
        setTimeout(() => onSuccess({ paymentIntentId: result.paymentIntent.id, amountPaid: amountToPay, paymentOption }), 1500);
      }
    } catch (err) {
      setError("Erreur lors du paiement : " + err.message);
    }

    setLoading(false);
  };

  if (succeeded) {
    return (
      <div className="py-10 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <p className="text-green-600 font-semibold">Paiement confirmé ✓</p>
        <p className="text-sm text-gray-500 mt-1">{amountToPay.toFixed(2)}€ débité avec succès</p>
      </div>
    );
  }

  return (
    <form onSubmit={handlePay} className="space-y-5">
      {/* Options paiement */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase">Montant à régler</p>
        <label className={`block p-3 border-2 rounded-xl cursor-pointer transition ${paymentOption === "full" ? "border-rose-400 bg-rose-50" : "border-gray-200 hover:border-gray-300"}`}>
          <input type="radio" value="full" checked={paymentOption === "full"} onChange={() => setPaymentOption("full")} className="mr-2" />
          <span className="text-sm font-medium text-gray-800">
            Paiement complet : <strong className="text-rose-600">{totalAmount.toFixed(2)} €</strong>
          </span>
        </label>
        <label className={`block p-3 border-2 rounded-xl cursor-pointer transition ${paymentOption === "deposit" ? "border-rose-400 bg-rose-50" : "border-gray-200 hover:border-gray-300"}`}>
          <input type="radio" value="deposit" checked={paymentOption === "deposit"} onChange={() => setPaymentOption("deposit")} className="mr-2" />
          <span className="text-sm font-medium text-gray-800">
            Acompte 50% : <strong className="text-rose-600">{depositAmount.toFixed(2)} €</strong>
            <br />
            <span className="text-xs text-gray-500">Solde ({(totalAmount - depositAmount).toFixed(2)} €) à la livraison</span>
          </span>
        </label>
      </div>

      {/* Résumé montant */}
      <div className="bg-gray-50 rounded-xl p-3 text-sm flex justify-between items-center">
        <span className="text-gray-600">Montant à débiter</span>
        <strong className="text-gray-900">{amountToPay.toFixed(2)} €</strong>
      </div>

      {/* Card input */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Données bancaires</p>
        <div className="border border-gray-200 rounded-xl p-3 bg-white">
          <CardElement options={{ style: { base: { fontSize: "14px", fontFamily: "inherit", color: "#424770", "::placeholder": { color: "#aab7c4" } }, invalid: { color: "#fa755a" } } }} />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" onClick={onBack} variant="outline" className="flex-1">
          <ChevronLeft className="w-4 h-4 mr-1" /> Retour
        </Button>
        <Button
          type="submit"
          disabled={loading || !stripe || !elements}
          className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "💳 "}
          Payer {amountToPay.toFixed(2)} €
        </Button>
      </div>
      <p className="text-xs text-gray-400 text-center">Paiement sécurisé par Stripe</p>
    </form>
  );
}

export default function CartCheckoutModal({ cart, onClose, onOrderComplete }) {
  const [step, setStep] = useState("info"); // "info" | "payment" | "success"
  const [paymentOption, setPaymentOption] = useState("full");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [daysUntilEvent, setDaysUntilEvent] = useState(null);
  const [showLateWarning, setShowLateWarning] = useState(false);

  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const [info, setInfo] = useState({ name: "", email: "", phone: "", address: "", eventDate: "" });

  const isLate = daysUntilEvent !== null && daysUntilEvent < 15;

  const handleDateChange = (v) => {
    setInfo(p => ({ ...p, eventDate: v }));
    setShowLateWarning(false);
    if (v) {
      const days = Math.floor((new Date(v) - new Date()) / (1000 * 60 * 60 * 24));
      setDaysUntilEvent(days);
    } else {
      setDaysUntilEvent(null);
    }
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!info.name || !info.email || !info.address || !info.eventDate) return;
    if (isLate && !showLateWarning) {
      setShowLateWarning(true);
      return;
    }
    setStep("payment");
  };

  const handlePaymentSuccess = async ({ paymentIntentId, amountPaid, paymentOption: pOpt }) => {
    setLoading(true);
    try {
      // Créer la commande en base
      const productNames = cart.map(item => `${item.quantity}× ${item.product.name}`).join(", ");
      const order = await base44.entities.Order.create({
        customer_name: info.name,
        customer_email: info.email,
        product_id: cart[0]?.product?.id || "cart",
        product_name: productNames,
        quantity: cart.reduce((s, i) => s + i.quantity, 0),
        total_price: totalAmount,
        status: "confirmed",
        payment_status: pOpt === "full" ? "paid" : "partial",
        deposit_amount: pOpt === "deposit" ? Math.round(totalAmount * 0.5 * 100) / 100 : 0,
        options_selected: {
          cart_items: cart.map(item => ({
            product_id: item.product.id,
            product_name: item.product.name,
            quantity: item.quantity,
            unit_price: item.product.price,
            total: item.product.price * item.quantity,
          })),
          delivery_address: info.address,
          event_date: info.eventDate,
          phone: info.phone,
          payment_option: pOpt,
        },
      });

      // Enregistrer le paiement Stripe
      await base44.entities.StripePayment.create({
        order_id: order.id,
        customer_email: info.email,
        customer_name: info.name,
        stripe_payment_intent_id: paymentIntentId,
        amount_cents: Math.round(amountPaid * 100),
        payment_type: pOpt,
        status: "succeeded",
      });

      // Envoyer email de confirmation
      await base44.integrations.Core.SendEmail({
        to: info.email,
        subject: `🌸 Confirmation de commande — Fleurs en fête`,
        body: `Bonjour ${info.name},\n\nMerci pour votre commande !\n\nDétail :\n${cart.map(i => `- ${i.quantity}× ${i.product.name} : ${(i.product.price * i.quantity).toFixed(2)} €`).join("\n")}\n\nTotal : ${totalAmount.toFixed(2)} €\nPaiement reçu : ${amountPaid.toFixed(2)} €${pOpt === "deposit" ? `\nSolde restant : ${(totalAmount - amountPaid).toFixed(2)} €` : ""}\n\nAdresse de livraison : ${info.address}\n\nSuivre votre commande : ${window.location.origin}${createPageUrl("OrderTracking")}\n\nMerci pour votre confiance !\nGwenaëlle — Fleurs en fête 🌸`,
      });

      setOrderId(order.id);
      setStep("success");
      onOrderComplete?.();
    } catch (err) {
      toast.error("Erreur lors de la finalisation : " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <style>{`
        .font-serif-shop { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-shop { font-family: 'Lato', system-ui, sans-serif; }
      `}</style>
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="font-serif-shop text-xl font-bold text-gray-800">
            {step === "info" && "Vos informations"}
            {step === "payment" && "Paiement sécurisé"}
            {step === "success" && "Commande confirmée !"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-5">
          {step === "info" && (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              {/* Récap panier */}
              <div className="bg-rose-50 rounded-xl p-4 space-y-2 text-sm">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-gray-700">
                    <span>{item.quantity}× {item.product.name}</span>
                    <span className="font-semibold">{(item.product.price * item.quantity).toFixed(2)} €</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-gray-900 border-t border-rose-200 pt-2">
                  <span>Total</span>
                  <span className="text-rose-600">{totalAmount.toFixed(2)} €</span>
                </div>
              </div>

              <Input placeholder="Nom & prénom *" value={info.name} onChange={e => setInfo(p => ({ ...p, name: e.target.value }))} required className="rounded-xl h-11" />
              <Input type="email" placeholder="Email *" value={info.email} onChange={e => setInfo(p => ({ ...p, email: e.target.value }))} required className="rounded-xl h-11" />
              <Input type="tel" placeholder="Téléphone (optionnel)" value={info.phone} onChange={e => setInfo(p => ({ ...p, phone: e.target.value }))} className="rounded-xl h-11" />
              <textarea
                placeholder={"Adresse de livraison complète *\nN° et rue, Code postal, Ville"}
                value={info.address}
                onChange={e => setInfo(p => ({ ...p, address: e.target.value }))}
                required
                rows={3}
                className="w-full rounded-xl border border-input px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-rose-300"
              />
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Date de l'événement *
                </label>
                <Input
                  type="date"
                  value={info.eventDate}
                  onChange={e => handleDateChange(e.target.value)}
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="rounded-xl h-11"
                />
                {daysUntilEvent !== null && daysUntilEvent >= 15 && daysUntilEvent <= 21 && (
                  <p className="mt-2 text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2">
                    ⏱️ Votre événement est dans {daysUntilEvent} jours. Nous expédions dès que votre commande est prête.
                  </p>
                )}
              </div>

              {showLateWarning && isLate && (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      Votre événement est dans {daysUntilEvent} jour{daysUntilEvent !== 1 ? "s" : ""}. Nous préparons et expédions votre commande dès que possible, mais nous ne pouvons garantir une livraison dans les temps.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowLateWarning(false)} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                      Modifier la date
                    </button>
                    <button type="submit" className="flex-1 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600">
                      Continuer quand même
                    </button>
                  </div>
                </div>
              )}

              {!showLateWarning && (
                <Button
                  type="submit"
                  disabled={!info.name || !info.email || !info.address || !info.eventDate}
                  className="w-full h-12 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold hover:opacity-90 transition"
                >
                  Continuer vers le paiement →
                </Button>
              )}
            </form>
          )}

          {step === "payment" && (
            stripePromise ? (
              <Elements stripe={stripePromise}>
                <PaymentStep
                  cart={cart}
                  customerInfo={info}
                  paymentOption={paymentOption}
                  setPaymentOption={setPaymentOption}
                  onSuccess={handlePaymentSuccess}
                  onBack={() => setStep("info")}
                />
              </Elements>
            ) : (
              <div className="py-10 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-600">Stripe non configuré. Contactez l'administrateur.</p>
              </div>
            )
          )}

          {step === "success" && (
            <div className="py-10 text-center space-y-5">
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2 font-serif-shop">Merci pour votre commande !</h3>
                <p className="text-gray-500 text-sm">Un email de confirmation a été envoyé à <strong>{info.email}</strong></p>
              </div>
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-sm text-gray-700 text-left space-y-2">
                <p className="font-semibold text-rose-600 mb-1">📦 Votre commande</p>
                {cart.map(item => (
                  <p key={item.id}>{item.quantity}× {item.product.name}</p>
                ))}
              </div>
              <div className="flex gap-3">
                <a href={createPageUrl("OrderTracking")} className="flex-1">
                  <Button variant="outline" className="w-full">Suivre ma commande</Button>
                </a>
                <Button onClick={onClose} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white">
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}