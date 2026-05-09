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
import StepOrderSummary from "@/components/shop/StepOrderSummary";
import { createPageUrl } from "@/utils";

const STEPS = ["Votre kit", "Votre événement", "Quantité", "Personnalisation", "Site personnalisé", "Vos informations", "Livraison", "Récapitulatif"];

export const PRICING = {
  KIT_COMPOSE: 3.90,
  KIT_PRET: 5.90,
  crackers: 5.90,
  SAC_CADEAU: 0.40,
  entreprise_standard: 15,
  entreprise_premium: 20,
  naturel_essentiel: 5,
  naturel_douceur: 13,
  terrarium: 10,
};



export default function Shop() {
  const { user } = useAuth();
  const urlParams = new URLSearchParams(window.location.search);
  const initEventType = urlParams.get("eventType");
  const initKitType = urlParams.get("kitType");
  const shouldResume = urlParams.get("resume") === "true";
  const cartIdRef = useRef(null);

  const [step, setStep] = useState(() => {
    if (initKitType && initEventType) return 3;
    if (initKitType) return 2;
    if (shouldResume) {
      try { const s = localStorage.getItem("shop_step"); if (s) return parseInt(s); } catch {}
    }
    return 1;
  });

  const [selection, setSelection] = useState(() => {
    if (shouldResume) {
      try {
        const saved = localStorage.getItem("shop_selection");
        if (saved) {
          const parsed = JSON.parse(saved);
          // Si kit mariage sans kitVariant (ancienne session), on repart de zéro sur ce champ
          const kitType = initKitType || parsed.kitType || null;
          const kitVariant = (["compose", "pret"].includes(kitType) && !parsed.kitVariant) ? null : parsed.kitVariant;
          return { ...parsed, eventType: initEventType || parsed.eventType || null, kitType, kitVariant };
        }
      } catch {}
    }
    return { eventType: initEventType || null, kitType: initKitType || null, kitVariant: null, seedType: "tournesol_nain", sacCadeau: false, packs: [], containerType: null };
  });

  const [customerInfo, setCustomerInfo] = useState(() => {
    if (shouldResume) {
      try {
        const saved = localStorage.getItem("shop_customer_info");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return { name: "", email: "", phone: "", address: "", eventDate: "", firstName: "", lastName: "", street: "", zipCode: "", city: "", country: "France" };
  });

  const [shippingMethod, setShippingMethod] = useState(null);
  const [referral, setReferral] = useState(null); // { code, referralId, discountAmount }

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
        // Envoyer l'email de relance max 1 fois par jour
        if (!reminderSentRef.current && customerInfo.email && step >= 6) {
          try {
            const lastSent = parseInt(localStorage.getItem("shop_reminder_sent_at") || "0");
            const oneDayMs = 24 * 60 * 60 * 1000;
            if (Date.now() - lastSent > oneDayMs) {
              reminderSentRef.current = true;
              localStorage.setItem("shop_reminder_sent_at", String(Date.now()));
              base44.functions.invoke('sendAbandonedCartEmail', {
                customerEmail: customerInfo.email,
                customerName: customerInfo.firstName || customerInfo.name || "",
                cartStep: step,
                shopUrl: window.location.origin + createPageUrl("Shop") + "?resume=true",
              }).catch(() => {});
            }
          } catch {}
        }
      } catch {}
    };
    save();
  }, [step, user?.email, customerInfo.email]);

  const handleOrderComplete = async () => {
    try {
      localStorage.removeItem("shop_step");
      localStorage.removeItem("shop_selection");
      localStorage.removeItem("shop_customer_info");
      localStorage.removeItem("shop_reminder_sent_at");
      if (cartIdRef.current) {
        await base44.entities.AbandonedCart.update(cartIdRef.current, { status: 'completed' });
      } else if (user?.email) {
        const existing = await base44.entities.AbandonedCart.filter({ user_email: user.email, status: 'active' });
        if (existing?.length > 0) await base44.entities.AbandonedCart.update(existing[0].id, { status: 'completed' });
      }
    } catch {}
  };

  const baseKitPrice = PRICING[selection.kitType] ?? PRICING.KIT_COMPOSE;
  const totalPots = (selection.packs || []).reduce((sum, p) => sum + p.size * p.qty, 0);
  const subtotal = baseKitPrice * totalPots;
  const sacCadeauTotal = selection.sacCadeau ? PRICING.SAC_CADEAU * totalPots : 0;
  const shippingCost = shippingMethod?.price ?? 0;
  const referralDiscount = referral?.discountAmount || 0;
  const total = Math.max(0, subtotal + sacCadeauTotal + shippingCost - referralDiscount);
  const pricing = { pricePerPot: baseKitPrice, totalPots, subtotal, sacCadeauTotal, discount: 0, referralDiscount, shippingCost, total };

  const updateSelection = (updates) => setSelection(s => ({ ...s, ...updates }));

  const kitType = selection.kitType || "";
  const isFleurKit = kitType === "compose" || kitType === "pret";
  const isCrackersKit = kitType === "crackers";
  const isEventKit = isFleurKit || isCrackersKit;
  const isEntrepriseKit = kitType.startsWith("entreprise");
  const isNaturelKit = kitType.startsWith("naturel");

  // Gestion des sauts d'étapes selon le type de kit
  const goNext = (fromStep) => {
    if (fromStep === 1) {
      // Après choix du kit : événement pour kits event (fleurs + crackers), sinon directement quantité
      if (isEventKit) setStep(2);
      else setStep(3);
    } else if (fromStep === 2) {
      setStep(3);
    } else if (fromStep === 3) {
      // Après quantité : personnalisation pour event & entreprise, sinon coordonnées
      if (isNaturelKit) setStep(6);
      else setStep(4);
    } else if (fromStep === 4) {
      // Après personnalisation : slug pour kits event perso, sinon coordonnées
      const isPersonalEvent = ["mariage", "bapteme", "communion", "anniversaire"].includes(selection.eventType);
      if (isEventKit && isPersonalEvent && !selection.slug) setStep(5);
      else setStep(6);
    } else if (fromStep === 5) {
      setStep(6);
    } else if (fromStep === 6) {
      setStep(7);
    } else if (fromStep === 7) {
      setStep(8);
    }
  };

  const goBack = (fromStep) => {
    if (fromStep === 3) {
      if (isEventKit) setStep(2);
      else setStep(1);
    } else if (fromStep === 4) {
      setStep(3);
    } else if (fromStep === 5) {
      setStep(4);
    } else if (fromStep === 6) {
      if (isNaturelKit) setStep(3);
      else if (selection.slug) setStep(5);
      else setStep(4);
    } else if (fromStep === 7) {
      setStep(6);
    } else if (fromStep === 8) {
      setStep(7);
    }
  };

  const bgGradient = (() => {
    if (selection.kitType?.startsWith("entreprise")) return "bg-gradient-to-b from-emerald-50 to-white";
    if (selection.kitType?.startsWith("naturel")) return "bg-gradient-to-b from-amber-50 to-white";
    return "bg-gradient-to-b from-rose-50 to-white";
  })();

  return (
    <div className={`min-h-screen ${bgGradient}`}>
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
            <StepKitChoice selection={selection} onUpdate={updateSelection} onNext={() => goNext(1)} onBack={() => { window.location.href = createPageUrl("Home"); }} />
          )}
          {step === 2 && (
            <StepEventType selection={selection} onUpdate={updateSelection} onNext={() => goNext(2)} onBack={() => setStep(1)} />
          )}
          {step === 3 && (
            <StepPackSelector selection={selection} onUpdate={updateSelection} pricing={pricing} onNext={() => goNext(3)} onBack={() => goBack(3)} />
          )}
          {step === 4 && (
            <StepCustomization
              selection={selection}
              onUpdate={updateSelection}
              onNext={() => goNext(4)}
              onBack={() => goBack(4)}
            />
          )}
          {step === 5 && (
            <StepEventSlug selection={selection} onUpdate={updateSelection} onNext={() => goNext(5)} onBack={() => goBack(5)} />
          )}
          {step === 6 && (
            <StepCustomerForm
              customerInfo={customerInfo}
              onChange={setCustomerInfo}
              selection={selection}
              referral={referral}
              onReferralChange={setReferral}
              onNext={() => goNext(6)}
              onBack={() => goBack(6)}
            />
          )}
          {step === 7 && (
            <StepOrderSummary
              selection={selection}
              customerInfo={customerInfo}
              pricing={pricing}
              PRICING={PRICING}
              shippingMethod={shippingMethod}
              onShippingChange={setShippingMethod}
              referral={referral}
              onBack={() => goBack(7)}
              onOrderComplete={handleOrderComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}