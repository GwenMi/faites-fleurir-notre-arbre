import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, Truck, MapPin, Gift } from "lucide-react";

const MAX_FREE_SHIPPING = 20;
const WEIGHT_PER_POT_G = 200;

// Tarifs domicile hardcodés — source : tarifs officiels La Poste 2026
// Colissimo : https://tarifs-postaux.fr/tarif-colissimo.htm
// Chronopost Chrono 18 : tarifs officiels bureau de poste 2026
function getHomeMethods(weightKg) {
  const w = weightKg;

  // Colissimo domicile 2026 (France métropolitaine)
  const colissimoPrice =
    w <= 0.25 ? 5.49 :
    w <= 0.5  ? 7.59 :
    w <= 0.75 ? 9.29 :
    w <= 1    ? 9.59 :
    w <= 2    ? 11.19 :
    w <= 5    ? 17.39 :
    w <= 10   ? 25.29 :
               31.99;

  // Colissimo point de retrait 2026 = domicile - 0,70 €
  const colissimoRelaisPrice =
    w <= 0.25 ? 4.79 :
    w <= 0.5  ? 6.89 :
    w <= 0.75 ? 8.59 :
    w <= 1    ? 8.89 :
    w <= 2    ? 10.49 :
               16.69; // point retrait limité à 5kg

  // Chronopost Chrono 18 2026 (J+1 avant 18h, France métropolitaine)
  const chronoPrice =
    w <= 0.5  ? 12.74 :
    w <= 1    ? 14.99 :
    w <= 2    ? 17.49 :
    w <= 5    ? 22.99 :
    w <= 10   ? 29.99 :
               39.99;

  return [
    {
      id: "colissimo_home",
      name: "Colissimo — Livraison à domicile",
      carrier: "colissimo",
      description: "Livraison en 48h ouvrées, suivi inclus",
      deliveryDays: 2,
      servicePointRequired: false,
      price: colissimoPrice,
    },
    {
      id: "colissimo_relais",
      name: "Colissimo — Point de retrait (bureau de poste / Pickup)",
      carrier: "colissimo",
      description: "Retrait sous 48h, économique",
      deliveryDays: 2,
      servicePointRequired: true,
      price: colissimoRelaisPrice,
    },
    {
      id: "chronopost_18",
      name: "Chronopost — Express J+1 avant 18h",
      carrier: "chronopost",
      description: "Livraison express le lendemain avant 18h",
      deliveryDays: 1,
      servicePointRequired: false,
      price: chronoPrice,
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
    onSelect(isFreeShipping ? { ...method, price: 0, originalPrice: method.price } : method);
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