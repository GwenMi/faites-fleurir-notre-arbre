import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Package, Truck, CheckCircle2, Clock, ExternalLink, ShoppingBag, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const CARRIERS = {
  "La Poste / Colissimo": "https://www.laposte.fr/outils/suivre-vos-envois?code=",
  "Chronopost": "https://www.chronopost.fr/tracking-no-cms/suivi-page?listeNumerosLT=",
  "DHL": "https://www.dhl.com/fr-fr/home/tracking.html?tracking-id=",
  "UPS": "https://www.ups.com/track?loc=fr_FR&tracknum=",
  "DPD": "https://www.dpd.fr/trace/",
  "Mondial Relay": "https://www.mondialrelay.fr/suivi-de-colis/?numeroExpedition=",
};

const STEPS = [
  { status: "pending",   icon: Clock,        label: "Commande reçue",   desc: "Votre commande a bien été enregistrée." },
  { status: "confirmed", icon: Package,       label: "En préparation",   desc: "Votre kit est en cours de préparation." },
  { status: "shipped",   icon: Truck,         label: "Expédié",          desc: "Votre colis est en route !" },
  { status: "delivered", icon: CheckCircle2,  label: "Livré",            desc: "Votre colis est arrivé. Bonne plantation !" },
];

const STATUS_ORDER = ["pending", "confirmed", "shipped", "delivered"];

function TrackingTimeline({ order }) {
  const currentIdx = STATUS_ORDER.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100" />

      <div className="space-y-4">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const done = !isCancelled && idx <= currentIdx;
          const active = !isCancelled && idx === currentIdx;
          return (
            <div key={step.status} className="flex items-start gap-4 relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 transition-all ${
                active ? "bg-rose-400 border-rose-400 text-white shadow-md shadow-rose-200" :
                done   ? "bg-green-400 border-green-400 text-white" :
                         "bg-white border-gray-200 text-gray-300"
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className={`flex-1 min-w-0 pt-1.5 ${done ? "" : "opacity-40"}`}>
                <p className={`text-sm font-bold ${active ? "text-rose-500" : done ? "text-gray-700" : "text-gray-400"}`}>
                  {step.label}
                  {active && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-rose-400 animate-pulse" />}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>

                {/* Tracking link on shipped step */}
                {step.status === "shipped" && done && order.tracking_number && (
                  <a
                    href={(CARRIERS[order.tracking_carrier] || "") + order.tracking_number}
                    target="_blank" rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-purple-500 hover:bg-purple-600 transition px-3 py-1.5 rounded-full"
                  >
                    <Truck className="w-3 h-3" />
                    Suivre avec {order.tracking_carrier}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {step.status === "shipped" && done && order.tracking_number && (
                  <p className="text-xs text-gray-300 font-mono mt-1">N° {order.tracking_number}</p>
                )}
              </div>
            </div>
          );
        })}

        {isCancelled && (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 bg-red-100 border-2 border-red-200 text-red-400">
              ✕
            </div>
            <div>
              <p className="text-sm font-bold text-red-500">Commande annulée</p>
              <p className="text-xs text-gray-400">Contactez-nous pour toute question.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderTracking({ event }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrders(); }, [event?.id]);

  const loadOrders = async () => {
    setLoading(true);
    const data = await base44.entities.Order.filter({ event_id: event.id });
    setOrders((data || []).sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    setLoading(false);
  };

  if (loading) return <div className="py-10 text-center text-gray-400 text-sm">Chargement...</div>;

  if (orders.length === 0) return (
    <div className="text-center py-10">
      <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
      <p className="text-sm font-semibold text-gray-500">Aucune commande liée à cet événement</p>
      <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
        Passez une commande depuis la boutique en indiquant votre événement pour suivre vos kits ici.
      </p>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-700">{orders.length} commande{orders.length > 1 ? "s" : ""}</p>
        <button onClick={loadOrders} className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 transition">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {orders.map(order => {
        const opts = order.options_selected || {};
        return (
          <div key={order.id} className="border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            {/* Order header */}
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-4 py-3 flex items-center justify-between border-b border-rose-100">
              <div>
                <p className="text-sm font-bold text-gray-800">🌸 {order.product_name} × {order.quantity}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Commandé le {new Date(order.created_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-rose-500">{order.total_price?.toFixed(2)} €</p>
                {(opts.seed_type || opts.ribbon_color) && (
                  <p className="text-xs text-gray-400">{opts.seed_type}{opts.ribbon_color ? ` · ${opts.ribbon_color}` : ""}</p>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="p-4">
              <TrackingTimeline order={order} />
            </div>
          </div>
        );
      })}
    </div>
  );
}