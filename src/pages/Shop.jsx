import { useState } from "react";
import ShopBanner from "@/components/shop/ShopBanner";
import WizardProgress from "@/components/shop/WizardProgress";
import StepKitChoice from "@/components/shop/StepKitChoice";
import StepEventType from "@/components/shop/StepEventType";
import StepPackSelector from "@/components/shop/StepPackSelector";
import StepCustomization from "@/components/shop/StepCustomization";
import StepEventSlug from "@/components/shop/StepEventSlug";
import StepCustomerForm from "@/components/shop/StepCustomerForm";
import StepShipping from "@/components/shop/StepShipping";
import StepOrderSummary from "@/components/shop/StepOrderSummary";
import { createPageUrl } from "@/utils";

const STEPS = ["Votre kit", "Votre événement", "Pack invités", "Personnalisation", "Site personnalisé", "Vos informations", "Livraison", "Récapitulatif"];

export const PRICING = {
  KIT_COMPOSE: 3.90,
  KIT_PRET: 5.90,
  SAC_CADEAU: 0.40,
};

const SEEDS = [
  { id: "tournesol_nain", label: "🌻 Tournesol nain", description: "Compact et joyeux" },
];

export default function Shop() {
  const urlParams = new URLSearchParams(window.location.search);
  const initEventType = urlParams.get("eventType");
  const initKitType = urlParams.get("kitType");

  const [step, setStep] = useState(() => {
    if (initKitType && initEventType) return 3;
    if (initKitType) return 2;
    return 1;
  });

  const [selection, setSelection] = useState({
    eventType: initEventType || null,
    kitType: initKitType || null,
    seedType: "tournesol_nain",
    sacCadeau: false,
    packs: [],
    containerType: null,
  });

  const [customerInfo, setCustomerInfo] = useState({
    name: "", email: "", phone: "", address: "", eventDate: ""
  });
  const [shippingMethod, setShippingMethod] = useState(null);

  const baseKitPrice = selection.kitType === "pret" ? PRICING.KIT_PRET : PRICING.KIT_COMPOSE;
  const totalPots = (selection.packs || []).reduce((sum, p) => sum + p.size * p.qty, 0);
  const totalPackCount = (selection.packs || []).reduce((sum, p) => sum + p.qty, 0);
  const subtotal = baseKitPrice * totalPots;
  const sacCadeauTotal = selection.sacCadeau ? PRICING.SAC_CADEAU * totalPots : 0;
  const discount = totalPackCount >= 2 ? (subtotal + sacCadeauTotal) * 0.1 : 0;
  const shippingCost = shippingMethod?.price ?? 0;
  const total = subtotal + sacCadeauTotal - discount + shippingCost;
  const pricing = { pricePerPot: baseKitPrice, totalPots, subtotal, sacCadeauTotal, discount, shippingCost, total };

  const updateSelection = (updates) => setSelection(s => ({ ...s, ...updates }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 bg-white border-b border-gray-100">
        <a href={createPageUrl("Home")}>
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
            alt="Fleurs de fête"
            className="h-10"
          />
        </a>
        <a href={createPageUrl("Home")} className="font-sans-shop text-xs text-gray-400 hover:text-rose-400 transition">← Retour à l'accueil</a>
      </nav>
      <ShopBanner />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <WizardProgress currentStep={step} steps={STEPS} />
        <div className="mt-12">
          {step === 1 && (
            <StepKitChoice
              selection={selection}
              onUpdate={updateSelection}
              onNext={() => setStep(2)}
              onBack={() => { window.location.href = createPageUrl("Home"); }}
            />
          )}
          {step === 2 && (
            <StepEventType
              selection={selection}
              onUpdate={updateSelection}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <StepPackSelector
              selection={selection}
              onUpdate={updateSelection}
              pricing={pricing}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <StepCustomization
              selection={selection}
              onUpdate={updateSelection}
              onNext={() => setStep(5)}
              onBack={() => setStep(3)}
              seeds={SEEDS}
            />
          )}
          {step === 5 && (
            <StepEventSlug
              selection={selection}
              onUpdate={updateSelection}
              onNext={() => setStep(6)}
              onBack={() => setStep(4)}
            />
          )}
          {step === 6 && (
            <StepCustomerForm
              customerInfo={customerInfo}
              onChange={setCustomerInfo}
              selection={selection}
              onNext={() => setStep(7)}
              onBack={() => setStep(5)}
            />
          )}
          {step === 7 && (
            <StepShipping
              totalPots={pricing.totalPots}
              shippingMethod={shippingMethod}
              onSelect={setShippingMethod}
              onNext={() => setStep(8)}
              onBack={() => setStep(6)}
            />
          )}
          {step === 8 && (
            <StepOrderSummary
              selection={selection}
              customerInfo={customerInfo}
              pricing={pricing}
              PRICING={PRICING}
              shippingMethod={shippingMethod}
              onBack={() => setStep(7)}
            />
          )}
        </div>
      </div>
    </div>
  );
}