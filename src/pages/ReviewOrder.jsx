import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Loader2, Star, CheckCircle2 } from "lucide-react";

export default function ReviewOrder() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("order_id");

  const [order, setOrder] = useState(null);
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }
    (async () => {
      const orders = await base44.entities.Order.filter({ id: orderId });
      const o = orders?.[0];
      setOrder(o || null);
      if (o) {
        const reviews = await base44.entities.Review.filter({ order_id: orderId });
        setExisting(reviews?.[0] || null);
      }
      setLoading(false);
    })();
  }, [orderId]);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    await base44.entities.Review.create({
      order_id: order.id,
      product_id: order.product_id,
      product_name: order.product_name,
      customer_name: order.customer_name,
      rating,
      comment: comment.trim(),
    });
    setDone(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center px-4 py-12">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
      `}</style>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 text-center">
        <a href={createPageUrl("Boutique")} className="inline-block mb-6">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
            alt="Fleurs en fête" className="h-10 mx-auto"
          />
        </a>

        {loading ? (
          <Loader2 className="w-8 h-8 animate-spin text-rose-300 mx-auto" />
        ) : !orderId || !order ? (
          <div>
            <p className="text-4xl mb-4">🌸</p>
            <h2 className="font-serif-elegant text-2xl font-bold text-gray-800 mb-2">Lien invalide</h2>
            <p className="font-sans-clean text-sm text-gray-500">Ce lien d'avis n'est pas reconnu.</p>
          </div>
        ) : order.status !== "delivered" ? (
          <div>
            <p className="text-4xl mb-4">📦</p>
            <h2 className="font-serif-elegant text-2xl font-bold text-gray-800 mb-2">Commande en cours</h2>
            <p className="font-sans-clean text-sm text-gray-500">Vous pourrez laisser un avis une fois votre commande livrée.</p>
          </div>
        ) : existing || done ? (
          <div>
            <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto mb-4" />
            <h2 className="font-serif-elegant text-2xl font-bold text-gray-800 mb-2">Merci pour votre avis !</h2>
            <p className="font-sans-clean text-sm text-gray-500 mb-6">
              Votre retour nous aide à améliorer nos kits et inspire d'autres familles 🌷
            </p>
            <a href={createPageUrl("Boutique")}
              className="inline-block bg-rose-400 hover:bg-rose-500 transition text-white text-sm font-semibold px-6 py-2.5 rounded-full">
              Voir la boutique
            </a>
          </div>
        ) : (
          <div>
            <p className="text-4xl mb-4">🌸</p>
            <h2 className="font-serif-elegant text-2xl font-bold text-gray-800 mb-1">
              Donnez votre avis
            </h2>
            <p className="font-sans-clean text-sm text-gray-500 mb-1">
              Commande : <span className="font-semibold text-gray-700">{order.product_name}</span>
            </p>
            <p className="font-sans-clean text-xs text-gray-400 mb-6">par {order.customer_name}</p>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className="w-9 h-9"
                    fill={(hover || rating) >= star ? "#f87171" : "none"}
                    stroke={(hover || rating) >= star ? "#f87171" : "#d1d5db"}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>

            <div className="mb-6 text-left">
              <label className="font-sans-clean text-xs text-gray-500 mb-1.5 block">
                Votre commentaire <span className="text-gray-300">(optionnel)</span>
              </label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={4}
                placeholder="Dites-nous ce que vous avez pensé du kit, de la livraison…"
                className="font-sans-clean w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-200 resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
              className="w-full bg-rose-400 hover:bg-rose-500 transition text-white font-semibold text-sm py-3 rounded-full disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publier mon avis 🌷"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}