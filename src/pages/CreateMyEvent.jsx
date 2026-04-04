import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Loader2, Lock, Download, Link2, LogIn } from "lucide-react";
import EventForm from "@/components/admin/EventForm";

export default function CreateMyEvent() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createdEvent, setCreatedEvent] = useState(null);

  // standalone mode (no order_id)
  const [user, setUser] = useState(null);
  const [unlinkableOrders, setUnlinkableOrders] = useState([]);
  const [linkedOrderId, setLinkedOrderId] = useState("");

  const urlParams = new URLSearchParams(window.location.search);
  const planFromUrl = urlParams.get("plan") || "basic";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order_id");
    if (orderId) {
      fetchOrder(orderId);
    } else {
      loadUserStandalone();
    }
  }, []);

  const fetchOrder = async (orderId) => {
    const orders = await base44.entities.Order.filter({ id: orderId });
    if (orders.length > 0) setOrder(orders[0]);
    setLoading(false);
  };

  const loadUserStandalone = async () => {
    try {
      const me = await base44.auth.me();
      setUser(me);
      const allOrders = await base44.entities.Order.filter({ customer_email: me.email });
      setUnlinkableOrders((allOrders || []).filter(o => !o.event_id && o.payment_status === "paid"));
    } catch {
      // not authenticated — user will be shown login prompt
    } finally {
      setLoading(false);
    }
  };

  const handleEventSaved = async () => {
    const events = await base44.entities.Event.list("-created_date", 1);
    if (events.length > 0) {
      const ev = events[0];
      setCreatedEvent(ev);
      if (order) {
        // linked via order_id param
        await base44.entities.Order.update(order.id, {
          event_id: ev.id,
          options_selected: {
            ...(order.options_selected || {}),
            site_public_url: ev.public_url,
          },
        });
      } else if (linkedOrderId) {
        // standalone: user chose an order to link
        const targetOrder = unlinkableOrders.find(o => o.id === linkedOrderId);
        if (targetOrder) {
          await base44.entities.Order.update(targetOrder.id, {
            event_id: ev.id,
            options_selected: {
              ...(targetOrder.options_selected || {}),
              site_public_url: ev.public_url,
            },
          });
        }
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
    </div>
  );

  // No order_id AND not authenticated → prompt login
  if (!order && !user) return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col items-center justify-center p-8 text-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap');
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
      `}</style>
      <span className="text-5xl block mb-4">🌸</span>
      <h1 className="font-serif-elegant text-3xl font-bold text-gray-800 mb-2">Créez votre site événementiel</h1>
      <p className="text-gray-500 text-sm max-w-xs mb-8">
        Connectez-vous pour créer votre site et relier votre commande à votre espace personnalisé.
      </p>
      <button
        onClick={() => base44.auth.redirectToLogin(window.location.href)}
        className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full px-6 py-3 font-semibold text-sm transition"
      >
        <LogIn className="w-4 h-4" />
        Se connecter / Créer un compte
      </button>
      <a href={createPageUrl("Shop")} className="mt-4 text-sm text-gray-400 hover:text-rose-400 underline">
        Passer une commande d'abord
      </a>
    </div>
  );

  if (order && order.payment_status !== "paid") return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 bg-gray-50">
      <Lock className="w-12 h-12 text-gray-300 mb-4" />
      <h2 className="text-xl font-bold text-gray-700 mb-2">Accès restreint</h2>
      <p className="text-gray-500 text-sm max-w-xs">
        La création de votre site de mariage est disponible uniquement après confirmation du paiement.
      </p>
    </div>
  );

  // Event created — show QR code + links
  if (createdEvent) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(createdEvent.public_url)}&margin=10`;
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col items-center justify-center p-8">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap');
          .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
        `}</style>
        <div className="max-w-md w-full text-center space-y-6">
          <span className="text-5xl block">🌸</span>
          <h1 className="font-serif-elegant text-4xl font-bold text-gray-800">Votre site est prêt !</h1>
          <p className="text-gray-500 text-sm">Partagez votre QR code avec vos invités. Quand leur fleur pousse, ils le scannent et partagent leur photo.</p>
          <img src={qrUrl} alt="QR Code" className="w-52 h-52 mx-auto rounded-2xl border border-gray-100 shadow-md" />
          <p className="text-xs text-gray-400 font-mono break-all">{createdEvent.public_url}</p>
          <div className="flex flex-col gap-3">
            <a
              href={createdEvent.public_url}
              target="_blank"
              rel="noreferrer"
              className="py-3 px-6 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-semibold transition text-sm"
            >
              Voir mon site →
            </a>
            <a
              href={qrUrl}
              download={`qrcode-${createdEvent.slug}.png`}
              target="_blank"
              rel="noreferrer"
              className="py-3 px-6 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-full font-semibold transition text-sm flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Télécharger le QR code
            </a>
            <a
              href={createPageUrl("ClientDashboard")}
              className="py-3 px-6 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-full font-semibold transition text-sm"
            >
              Mon espace client →
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Prefill from order (if present) or empty defaults for standalone
  const prefill = {
    couple_names: order?.customer_name || "",
    event_date: order?.options_selected?.event_date || "",
    event_type: "mariage",
    primary_color: "#c084fc",
    secondary_color: "#86efac",
    template: "classique",
    plan: planFromUrl === "premium" ? "premium" : "basic",
    welcome_message: "",
    seed_type: "",
    event_name: "",
    cover_image: "",
    status: "active",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap');
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
      `}</style>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <span className="text-4xl block mb-3">🌸</span>
          <h1 className="font-serif-elegant text-4xl font-bold text-gray-800 mb-2">Créez votre site de mariage</h1>
          <p className="text-gray-500 text-sm">Personnalisez votre page, choisissez votre template et générez votre QR code</p>
        </div>

        {/* Standalone: optional order linking */}
        {!order && unlinkableOrders.length > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Link2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-amber-900 text-sm mb-1">Relier à une commande existante</p>
                <p className="text-amber-700 text-xs mb-3">
                  Vous avez {unlinkableOrders.length === 1 ? "une commande" : `${unlinkableOrders.length} commandes`} non reliée{unlinkableOrders.length > 1 ? "s" : ""}. Vous pouvez lier votre nouveau site à l'une d'elles.
                </p>
                <select
                  value={linkedOrderId}
                  onChange={e => setLinkedOrderId(e.target.value)}
                  className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="">— Ne pas lier à une commande —</option>
                  {unlinkableOrders.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.product_name || "Commande"} — FEF-{(o.id || "").slice(-8).toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <EventForm
            event={prefill}
            onSave={handleEventSaved}
          />
        </div>
      </div>
    </div>
  );
}
