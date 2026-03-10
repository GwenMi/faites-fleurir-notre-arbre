import { useState } from "react";
import ShopBanner from "@/components/shop/ShopBanner";
import WizardProgress from "@/components/shop/WizardProgress";
import StepKitOptions from "@/components/shop/StepKitOptions";
import StepPackSelector from "@/components/shop/StepPackSelector";
import StepCustomerForm from "@/components/shop/StepCustomerForm";
import StepOrderSummary from "@/components/shop/StepOrderSummary";

const STEPS = ["Kit & options", "Pack invités", "Vos informations", "Récapitulatif"];

export const PRICING = {
  KIT_COMPOSE: 2.50,
  KIT_PRET: 4.50,
  POT_BLANC_EXTRA: 0.50,
  SAC_CADEAU: 0.40,
};

export default function Shop() {
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState({
    kitType: null,
    potType: "verre",
    sacCadeau: false,
    packSize: null,
    packQty: 1,
  });
  const [customerInfo, setCustomerInfo] = useState({
    name: "", email: "", phone: "", address: "", eventDate: ""
  });

  const baseKitPrice = selection.kitType === "pret" ? PRICING.KIT_PRET : PRICING.KIT_COMPOSE;
  const potExtra = selection.potType === "blanc" ? PRICING.POT_BLANC_EXTRA : 0;
  const sacExtra = selection.sacCadeau ? PRICING.SAC_CADEAU : 0;
  const pricePerPot = baseKitPrice + potExtra + sacExtra;
  const totalPots = (selection.packSize || 0) * selection.packQty;
  const subtotal = pricePerPot * totalPots;
  const discount = selection.packQty >= 2 ? subtotal * 0.1 : 0;
  const total = subtotal - discount;
  const pricing = { pricePerPot, totalPots, subtotal, discount, total };

  const updateSelection = (updates) => setSelection(s => ({ ...s, ...updates }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <ShopBanner />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <WizardProgress currentStep={step} steps={STEPS} />
        <div className="mt-8">
          {step === 1 && (
            <StepKitOptions
              selection={selection}
              onUpdate={updateSelection}
              onNext={() => setStep(2)}
              PRICING={PRICING}
            />
          )}
          {step === 2 && (
            <StepPackSelector
              selection={selection}
              onUpdate={updateSelection}
              pricing={pricing}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <StepCustomerForm
              customerInfo={customerInfo}
              onChange={setCustomerInfo}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <StepOrderSummary
              selection={selection}
              customerInfo={customerInfo}
              pricing={pricing}
              PRICING={PRICING}
              onBack={() => setStep(3)}
            />
          )}
        </div>
      </div>
    </div>
  );
}