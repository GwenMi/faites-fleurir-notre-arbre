import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Loader2, Lock, Download } from "lucide-react";
import EventForm from "@/components/admin/EventForm";

export default function CreateMyEvent() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createdEvent, setCreatedEvent] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order_id");
    if (orderId) fetchOrder(orderId);
    else setLoading(false);
  }, []);

  const fetchOrder = async (orderId) => {
    const orders = await base44.entities.Order.filter({ id: orderId });
    if (orders.length > 0) setOrder(orders[0]);
    setLoading(false);
  };

  const handleEventSaved = async () => {
    const events = await base44.entities.Event.list("-created_date", 1);
    if (events.length > 0) {
      const ev = events[0];
      setCreatedEvent(ev);
      if (order) {
        await base44.entities.Order.update(order.id, {
          event_id: ev.id,
          options_selected: {
            ...(order.options_selected || {}),
            site_public_url: ev.public_url,
          },
        });
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center text-center p-8">
      <p className="text-gray-600">
        Commande introuvable.{" "}
        <a href={createPageUrl("Shop")} className="text-rose-500 underline">Retour à la boutique</a>
      </p>
    </div>
  );

  if (order.payment_status !== "paid") return (
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
          </div>
        </div>
      </div>
    );
  }

  // Event creation form
  const prefill = {
    couple_names: order.customer_name || "",
    event_date: order.options_selected?.event_date || "",
    event_type: "mariage",
    primary_color: "#c084fc",
    secondary_color: "#86efac",
    template: "classique",
    plan: "basic",
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