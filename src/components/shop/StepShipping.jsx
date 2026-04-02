import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, Truck, AlertCircle, Gift } from "lucide-react";

const MAX_FREE_SHIPPING = 20;

const CARRIER_LABELS = {
  colissimo: "Colissimo",
  chronopost: "Chronopost",
  dpd: "DPD",
  ups: "UPS",
  dhl: "DHL",
  mondial_relay: "Mondial Relay",
  bpost: "bpost",
};

// Estimated weight per pot kit in grams (glass pot + seeds + packaging)
const WEIGHT_PER_POT_G = 120;

export default function StepShipping({ totalPots, shippingMethod, onSelect, onNext, onBack }) {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFreeShipping, setIsFreeShipping] = useState(false);

  const weightGrams = Math.max(totalPots * WEIGHT_PER_POT_G, 100);

  useEffect(() => {
    base44.entities.Order.list().then(orders => {
      setIsFreeShipping((orders || []).length < MAX_FREE_SHIPPING);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    base44.functions
      .invoke("getSendcloudShippingMethods", { weightGrams, toCountry: "FR" })
      .then((data) => {
        if (cancelled) return;
        if (data?.error) {
          setError(data.error);
        } else {
          setMethods(data?.methods || []);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [weightGrams]);

  const handleSelect = (method) => {
    onSelect(isFreeShipping ? { ...method, price: 0 } : method);
  };

  const handleNext = () => {
    if (!shippingMethod) return;
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Mode de livraison</h2>
        <p className="text-sm text-gray-500">
          Choisissez votre transporteur · Poids estimé&nbsp;: {(weightGrams / 1000).toFixed(2)} kg
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Récupération des options de livraison…</span>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Impossible de charger les options Sendcloud</p>
            <p className="text-red-500 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && methods.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
          Aucune méthode de livraison disponible pour ce poids. Contactez-nous si besoin.
        </div>
      )}

      {!loading && !error && isFreeShipping && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
          <Gift className="w-4 h-4 flex-shrink-0" />
          <p><strong>Livraison offerte</strong> — Offre de lancement pour les 20 premières commandes 🎉</p>
        </div>
      )}

      {!loading && !error && methods.length > 0 && (
        <div className="space-y-3">
          {methods.map((method) => {
            const selected = shippingMethod?.id === method.id;
            return (
              <button
                key={method.id}
                onClick={() => handleSelect(method)}
                className={`w-full text-left flex items-center gap-4 p-4 rounded-2xl border-2 transition ${
                  selected
                    ? "border-rose-400 bg-rose-50"
                    : "border-gray-200 bg-white hover:border-rose-200"
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
                    {CARRIER_LABELS[method.carrier] || method.carrier}
                    {method.deliveryDays
                      ? ` · livraison en ${method.deliveryDays} jour${method.deliveryDays > 1 ? "s" : ""}`
                      : ""}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  {isFreeShipping ? (
                    <p className="font-bold text-green-600 text-sm">OFFERT 🎁</p>
                  ) : method.price !== null ? (
                    <p className="font-bold text-gray-900 text-sm">{method.price.toFixed(2)} €</p>
                  ) : (
                    <p className="text-xs text-gray-400">Prix variable</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button onClick={onBack} variant="outline" className="flex-1 h-12 rounded-xl">
          <ChevronLeft className="w-4 h-4 mr-2" /> Retour
        </Button>
        <Button
          onClick={handleNext}
          disabled={!shippingMethod}
          className={`flex-1 h-12 rounded-xl font-semibold text-white transition ${
            shippingMethod
              ? "bg-rose-500 hover:bg-rose-600"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Continuer <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
