import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
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
  entreprise_standard: 15,
  entreprise_premium: 20,
  naturel_essentiel: 5,
  naturel_douceur: 13,
};

const SEEDS = [
  { id: "tournesol_nain", label: "🌻 Tournesol nain", description: "Compact et joyeux" },
];

export default function Shop() {
  const { user } = useAuth();
  const urlParams = new URLSearchParams(window.location.search);
  const initEventType = urlParams.get("eventType");
  const initKitType = urlParams.get("kitType");
  const cartIdRef = useRef(null);

  const [step, setStep] = useState(() => {
    if (initKitType && initEventType) return 3;
    if (initKitType) return 2;
    try { const s = localStorage.getItem("shop_step"); if (s) return parseInt(s); } catch {}
    return 1;
  });

  const [selection, setSelection] = useState(() => {
    try {
      const saved = localStorage.getItem("shop_selection");
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...parsed, eventType: initEventType || parsed.eventType || null, kitType: initKitType || parsed.kitType || null };
      }
    } catch {}
    return { eventType: initEventType || null, kitType: initKitType || null, seedType: "tournesol_nain", sacCadeau: false, packs: [], containerType: null };
  });

  const [customerInfo, setCustomerInfo] = useState(() => {
    try {
      const saved = localStorage.getItem("shop_customer_info");
      if (saved) return JSON.parse(saved);
    } catch {}
    return { name: "", email: "", phone: "", address: "", eventDate: "", firstName: "", lastName: "", street: "", zipCode: "", city: "", country: "France" };
  });

  const [shippingMethod, setShippingMethod] = useState(null);

  // Persist to localStorage
  useEffect(() => {
    try { localStorage.setItem("shop_customer_info", JSON.stringify(customerInfo)); } catch {}
  }, [customerInfo]);

  useEffect(() => {
    try { localStorage.setItem("shop_selection", JSON.stringify(selection)); } catch {}
  }, [selection]);

  useEffect(() => {
    try { localStorage.setItem("shop_step", String(step)); } catch {}
  }, [step]);

  // Save cart to DB; for anonymous users save when we have their email (step 6+)
  const reminderSentRef = useRef(false);
  useEffect(() => {
    const cartEmail = user?.email || (step >= 6 && customerInfo.email ? customerInfo.email : null);
    if (!cartEmail || step < 3) return;
    const save = async () => {
      try {
        const payload = { step, selection, customer_info: customerInfo, status: 'active', customer_email: cartEmail };
        if (cartIdRef.current) {
          await base44.entities.AbandonedCart.update(cartIdRef.current, payload);
        } else {
          const existing = await base44.entities.AbandonedCart.filter({ customer_email: cartEmail, status: 'active' });
          if (existing?.length > 0) {
            cartIdRef.current = existing[0].id;
            await base44.entities.AbandonedCart.update(existing[0].id, payload);
          } else {
            const cart = await base44.entities.AbandonedCart.create({ user_email: user?.email || null, ...payload });
            cartIdRef.current = cart.id;
          }
        }
        // Envoyer l'email de relance une seule fois quand on a l'email du client
        if (!reminderSentRef.current && customerInfo.email && step >= 6) {
          reminderSentRef.current = true;
          base44.functions.invoke('sendAbandonedCartEmail', {
            customerEmail: customerInfo.email,
            customerName: customerInfo.firstName || customerInfo.name || "",
            cartStep: step,
            shopUrl: window.location.origin + createPageUrl("Shop"),
          }).catch(() => {});
        }
      } catch {}
    };
    save();
  }, [step, user?.email, customerInfo.email]);

  const handleOrderComplete = async () => {
    try {
      localStorage.removeItem("shop_step");
      localStorage.removeItem("shop_selection");
      if (cartIdRef.current) {
        await base44.entities.AbandonedCart.update(cartIdRef.current, { status: 'completed' });
      } else if (user?.email) {
        const existing = await base44.entities.AbandonedCart.filter({ user_email: user.email, status: 'active' });
        if (existing?.length > 0) await base44.entities.AbandonedCart.update(existing[0].id, { status: 'completed' });
      }
    } catch {}
  };

  const baseKitPrice = PRICING[selection.kitType] ?? (selection.kitType === "pret" ? PRICING.KIT_PRET : PRICING.KIT_COMPOSE);
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
        <span className="font-sans-shop text-xs text-gray-400">Boutique</span>
      </nav>
      <ShopBanner />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <WizardProgress currentStep={step} steps={STEPS} />
        <div className="mt-12">
          {step === 1 && (
            <StepKitChoice selection={selection} onUpdate={updateSelection} onNext={() => setStep(2)} onBack={() => { window.location.href = createPageUrl("Home"); }} />
          )}
          {step === 2 && (
            <StepEventType selection={selection} onUpdate={updateSelection} onNext={() => setStep(3)} onBack={() => setStep(1)} />
          )}
          {step === 3 && (
            <StepPackSelector selection={selection} onUpdate={updateSelection} pricing={pricing} onNext={() => setStep(4)} onBack={() => setStep(2)} />
          )}
          {step === 4 && (
            <StepCustomization
              selection={selection}
              onUpdate={updateSelection}
              onNext={() => {
                // Sauter l'étape slug si déjà défini
                if (selection.slug) setStep(6);
                else setStep(5);
              }}
              onBack={() => setStep(3)}
              seeds={SEEDS}
            />
          )}
          {step === 5 && (
            <StepEventSlug selection={selection} onUpdate={updateSelection} onNext={() => setStep(6)} onBack={() => setStep(4)} />
          )}
          {step === 6 && (
            <StepCustomerForm
              customerInfo={customerInfo}
              onChange={setCustomerInfo}
              selection={selection}
              onNext={() => setStep(7)}
              onBack={() => {
                // Revenir à l'étape slug seulement si elle n'était pas sautée
                if (selection.slug) setStep(4);
                else setStep(5);
              }}
            />
          )}
          {step === 7 && (
            <StepShipping totalPots={pricing.totalPots} shippingMethod={shippingMethod} onSelect={setShippingMethod} onNext={() => setStep(8)} onBack={() => setStep(6)} />
          )}
          {step === 8 && (
            <StepOrderSummary
              selection={selection}
              customerInfo={customerInfo}
              pricing={pricing}
              PRICING={PRICING}
              shippingMethod={shippingMethod}
              onBack={() => setStep(7)}
              onOrderComplete={handleOrderComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}