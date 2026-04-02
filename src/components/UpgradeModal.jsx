import { useState } from "react";
import { X, Sparkles, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import StripePaymentForm from "@/components/shop/StripePaymentForm";
import { toast } from "sonner";

const PREMIUM_FEATURES = [
  "Suivi RSVP & réponses invités",
  "Relances automatiques",
  "Campagnes email personnalisées",
  "Livre d'or",
  "Programme de la journée",
  "Plan de table",
  "Galerie photos modérée",
  "Liste cadeaux",
  "Budget & suivi prestataires",
  "FAQ, agenda RDV, menu",
  "Tâches & checklist mariage",
  "Éditeur de thème & sections",
  "Cartes mercis personnalisées",
];

export default function UpgradeModal({ event, customerEmail, onClose, onUpgraded }) {
  const [step, setStep] = useState("offer");

  const handlePaymentSuccess = async () => {
    try {
      await base44.entities.Event.update(event.id, { plan: "premium" });
      toast.success("Formule Complète activée !");
      onUpgraded?.();
      onClose();
    } catch {
      toast.error("Erreur lors de l'activation — contactez le support");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-rose-50 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-rose-400" />
              </div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-xl font-bold text-gray-800">
                Formule Complète
              </h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === "offer" && (
            <>
              <p className="text-sm text-gray-500 mb-5">
                Débloquez toutes les fonctionnalités de votre espace événement pour{" "}
                <strong className="text-rose-600">39,99€</strong> (paiement unique).
              </p>
              <ul className="space-y-2 mb-6">
                {PREMIUM_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => setStep("payment")}
                className="w-full h-12 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-xl font-semibold"
              >
                <Sparkles className="w-4 h-4 mr-2" /> Passer à la formule Complète — 39,99€
              </Button>
              <button
                onClick={onClose}
                className="w-full text-center text-xs text-gray-400 mt-3 hover:text-gray-600 transition"
              >
                Non merci, rester sur la formule gratuite
              </button>
            </>
          )}

          {step === "payment" && (
            <StripePaymentForm
              customerInfo={{ name: event.couple_names, email: customerEmail }}
              total={39.99}
              onSuccess={handlePaymentSuccess}
              onBack={() => setStep("offer")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
