import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Gift } from "lucide-react";

const MAX_FREE_SHIPPING = 20;

export default function ShopBanner() {
  const [orderCount, setOrderCount] = useState(null);

  useEffect(() => {
    base44.entities.Order.list().then(orders => {
      setOrderCount((orders || []).length);
    });
  }, []);

  // Hide banner once limit is reached
  if (orderCount === null || orderCount >= MAX_FREE_SHIPPING) return null;

  const remaining = MAX_FREE_SHIPPING - orderCount;
  const progress = (orderCount / MAX_FREE_SHIPPING) * 100;

  return (
    <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 px-4">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <Gift className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold text-sm sm:text-base">🚚 Offre de lancement — Livraison offerte</h2>
            <span className="text-white/90 text-xs sm:text-sm font-semibold flex-shrink-0 ml-2">
              {remaining} place{remaining > 1 ? "s" : ""} restante{remaining > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/25 rounded-full h-2 overflow-hidden">
              <div
                className="bg-white h-2 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-white/80 text-xs flex-shrink-0">{orderCount}/{MAX_FREE_SHIPPING}</span>
          </div>
        </div>
      </div>
    </div>
  );
}