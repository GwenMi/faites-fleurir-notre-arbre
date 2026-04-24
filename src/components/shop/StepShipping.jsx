import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, Truck, MapPin, Gift } from "lucide-react";

const MAX_FREE_SHIPPING = 20;
const WEIGHT_PER_POT_G = 200;

// Tarifs domicile hardcodés (source : tarifs officiels Colissimo & Chronopost 2024)
// Prix en € pour livraison France métropolitaine
function getHomeMethods(weightKg) {
  const w = weightKg;
  return [
    {
      id: "colissimo_home",
      name: "Colissimo — Livraison à domicile",
      carrier: "colissimo",
      description: "Livraison en 48h, sans signature",
      deliveryDays: 2,
      servicePointRequired: false,
      price: w <= 0.25 ? 4.95 : w <= 0.5 ? 6.39 : w <= 1 ? 7.49 : w <= 2 ? 8.75 : w <= 5 ? 11.25 : 15.99,
    },
    {
      id: "colissimo_signature",
      name: "Colissimo — Signature requise",
      carrier: "colissimo",
      description: "Livraison en 48h avec signature",
      deliveryDays: 2,
      servicePointRequired: false,
      price: w <= 0.25 ? 5.99 : w <= 0.5 ? 7.49 : w <= 1 ? 8.65 : w <= 2 ? 9.99 : w <= 5 ? 12.99 : 17.99,
    },
    {
      id: "chronopost_18",
      name: "Chronopost — Livraison le lendemain avant 18h",
      carrier: "chronopost",
      description: "Livraison express J+1 avant 18h",
      deliveryDays: 1,
      servicePointRequired: false,
      price: w <= 0.5 ? 9.99 : w <= 1 ? 11.49 : w <= 2 ? 13.49 : w <= 5 ? 17.49 : 22.99,
    },
  ];
}

export default function StepShipping({ totalPots, shippingMethod, onSelect, onNext, onBack }) {
  const [relayMethods, setRelayMethods] = useState([]);
  const [loadingRelay, setLoadingRelay] = useState(true);
  const [isFreeShipping, setIsFreeShipping] = useState(false);

  const weightGrams = Math.max(totalPots * WEIGHT_PER_POT_G, 100);
  const weightKg = weightGrams / 1000;
  const homeMethods = getHomeMethods(weightKg);

  useEffect(() => {
    base44.entities.Order.list().then(orders => {
      setIsFreeShipping((orders || []).length < MAX_FREE_SHIPPING);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingRelay(true);

    base44.functions
      .invoke("getSendcloudShippingMethods", { weightGrams, toCountry: "FR" })
      .then((data) => {
        if (cancelled) return;
        // Garder uniquement les relais colis (point relay)
        const relays = (data?.methods || []).filter(m => m.servicePointRequired && m.price > 0);
        setRelayMethods(relays);
      })
      .catch(() => {
        if (!cancelled) setRelayMethods([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingRelay(false);
      });

    return () => { cancelled = true; };
  }, [weightGrams]);

  const handleSelect = (method) => {
    onSelect(isFreeShipping ? { ...method, price: 0 } : method);
  };

  const allMethods = [...homeMethods, ...relayMethods];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Mode de livraison</h2>
        <p className="text-sm text-gray-500">
          Choisissez votre transporteur · Poids estimé : {weightKg.toFixed(2)} kg
        </p>
      </div>

      {isFreeShipping && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
          <Gift className="w-4 h-4 flex-shrink-0" />
          <p><strong>Livraison offerte</strong> — Offre de lancement pour les 20 premières commandes 🎉</p>
        </div>
      )}

      {/* Livraisons à domicile */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5" /> Livraison à domicile
        </p>
        <div className="space-y-3">
          {homeMethods.map((method) => {
            const selected = shippingMethod?.id === method.id;
            return (
              <button
                key={method.id}
                onClick={() => handleSelect(method)}
                className={`w-full text-left flex items-center gap-4 p-4 rounded-2xl border-2 transition ${
                  selected ? "border-rose-400 bg-rose-50" : "border-gray-200 bg-white hover:border-rose-200"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  selected ? "bg-rose-400 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  <Truck className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{method.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {method.description} · {method.deliveryDays} jour{method.deliveryDays > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  {isFreeShipping ? (
                    <p className="font-bold text-green-600 text-sm">OFFERT 🎁</p>
                  ) : (
                    <p className="font-bold text-gray-900 text-sm">{method.price.toFixed(2)} €</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Relais colis (Sendcloud) */}
      {(loadingRelay || relayMethods.length > 0) && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> Retrait en point relais
          </p>
          {loadingRelay ? (
            <div className="flex items-center gap-2 text-gray-400 text-sm py-3 px-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Chargement des relais…</span>
            </div>
          ) : (
            <div className="space-y-3">
              {relayMethods.map((method) => {
                const selected = shippingMethod?.id === method.id;
                return (
                  <button
                    key={method.id}
                    onClick={() => handleSelect(method)}
                    className={`w-full text-left flex items-center gap-4 p-4 rounded-2xl border-2 transition ${
                      selected ? "border-rose-400 bg-rose-50" : "border-gray-200 bg-white hover:border-rose-200"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      selected ? "bg-rose-400 text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">{method.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {method.carrier}
                        {method.deliveryDays ? ` · ${method.deliveryDays} jour${method.deliveryDays > 1 ? "s" : ""}` : ""}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {isFreeShipping ? (
                        <p className="font-bold text-green-600 text-sm">OFFERT 🎁</p>
                      ) : (
                        <p className="font-bold text-gray-900 text-sm">{method.price.toFixed(2)} €</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button onClick={onBack} variant="outline" className="flex-1 h-12 rounded-xl">
          <ChevronLeft className="w-4 h-4 mr-2" /> Retour
        </Button>
        <Button
          onClick={() => shippingMethod && onNext()}
          disabled={!shippingMethod}
          className={`flex-1 h-12 rounded-xl font-semibold text-white transition ${
            shippingMethod ? "bg-rose-500 hover:bg-rose-600" : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Continuer <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}