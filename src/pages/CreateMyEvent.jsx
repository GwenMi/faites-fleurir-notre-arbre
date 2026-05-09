import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Loader2, Lock, Download, Link2, LogIn, ArrowRight, Flower2, Sparkles, Check } from "lucide-react";
import EventForm from "@/components/admin/EventForm";
import StripePaymentForm from "@/components/shop/StripePaymentForm";
import UpgradeModal from "@/components/UpgradeModal";

export default function CreateMyEvent() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createdEvent, setCreatedEvent] = useState(null);
  const [existingEvent, setExistingEvent] = useState(null);
  const [premiumPaid, setPremiumPaid] = useState(false);

  const [user, setUser] = useState(null);
  const [unlinkableOrders, setUnlinkableOrders] = useState([]);
  const [linkedOrderId, setLinkedOrderId] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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
      const [allOrders, existingEvents] = await Promise.all([
        base44.entities.Order.filter({ customer_email: me.email }, "-created_date", 10),
        me.event_id
          ? base44.entities.Event.filter({ id: me.event_id }, "-created_date", 1)
          : base44.entities.Event.filter({ created_by: me.email }, "-created_date", 1),
      ]);
      if (existingEvents?.length > 0) {
        setExistingEvent(existingEvents[0]);
      }
      setUnlinkableOrders((allOrders || []).filter(o => !o.event_id && o.payment_status === "paid"));
    } catch {
      // not authenticated
    } finally {
      setLoading(false);
    }
  };

  const handleEventSaved = async (ev) => {
    if (!ev?.id) return;
    setCreatedEvent(ev);

    // Sauvegarder le slug et l'event_id sur le profil utilisateur
    if (user) {
      await base44.auth.updateMe({ event_id: ev.id, event_slug: ev.slug });
    }

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
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
    </div>
  );

  // Not authenticated → prompt login/register
  if (!order && !user) return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col items-center justify-center p-8 text-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap');
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
      `}</style>
      <span className="text-5xl block mb-4">{planFromUrl === "premium" ? "✨" : "🌸"}</span>
      <h1 className="font-serif-elegant text-3xl font-bold text-gray-800 mb-2">Créez votre site événementiel</h1>
      {planFromUrl === "premium" ? (
        <p className="text-gray-500 text-sm max-w-xs mb-2">
          Formule <strong>Complète — 39,99€</strong> · Paiement unique · Accès à vie. Connectez-vous pour procéder au paiement.
        </p>
      ) : (
        <p className="text-gray-500 text-sm max-w-xs mb-2">
          Votre site est <strong>gratuit</strong> — il vous suffit d'un compte pour le créer et y accéder à tout moment.
        </p>
      )}
      <p className="text-gray-400 text-xs max-w-xs mb-8">
        Un compte vous permet de gérer votre site, vos invités et vos commandes depuis un seul espace.
      </p>
      <button
        onClick={() => base44.auth.redirectToLogin(window.location.href)}
        className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full px-6 py-3 font-semibold text-sm transition"
      >
        <LogIn className="w-4 h-4" />
        {planFromUrl === "premium" ? "Se connecter / Créer un compte" : "Se connecter / Créer un compte gratuitement"}
      </button>
      <a href={createPageUrl("Home")} className="mt-4 text-sm text-gray-400 hover:text-rose-400 underline">
        ← Retour à l'accueil
      </a>
    </div>
  );

  // User already has an event → redirect to existing
  if (!order && existingEvent) return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col items-center justify-center p-8 text-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap');
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
      `}</style>
      <Flower2 className="w-12 h-12 text-rose-300 mx-auto mb-4" />
      <h1 className="font-serif-elegant text-3xl font-bold text-gray-800 mb-2">Vous avez déjà un site !</h1>
      <p className="text-gray-500 text-sm max-w-sm mb-2">
        Un seul site est inclus par compte. Votre site <strong>{existingEvent.couple_names || existingEvent.event_name}</strong> est déjà actif.
      </p>
      {existingEvent.public_url && (
        <p className="text-xs text-gray-400 font-mono mb-6">{existingEvent.public_url}</p>
      )}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <a href={`${createPageUrl("CoupleDashboard")}?event_id=${existingEvent.id}`}
          className="inline-flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full px-6 py-3 font-semibold text-sm transition">
          Gérer mon site <ArrowRight className="w-4 h-4" />
        </a>
        {existingEvent.public_url && (
          <a href={existingEvent.public_url} target="_blank" rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-full px-6 py-3 font-semibold text-sm transition">
            Voir le site public
          </a>
        )}
        {existingEvent.plan !== "premium" && (
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-white rounded-full px-6 py-3 font-semibold text-sm transition">
            ✨ Passer en Premium
          </button>
        )}
        {showUpgradeModal && (
          <UpgradeModal
            event={existingEvent}
            customerEmail={user?.email}
            onClose={() => setShowUpgradeModal(false)}
            onUpgraded={() => { setShowUpgradeModal(false); window.location.href = `${createPageUrl("CoupleDashboard")}?event_id=${existingEvent.id}`; }}
          />
        )}
      </div>
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

  // Event created — show success screen
  if (createdEvent) {
    const hasOrder = !!(order || linkedOrderId);
    const qrUrl = hasOrder
      ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(createdEvent.public_url)}&margin=10`
      : null;
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col items-center justify-center p-8">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap');
          .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
        `}</style>
        <div className="max-w-md w-full text-center space-y-6">
          <span className="text-5xl block">🌸</span>
          <h1 className="font-serif-elegant text-4xl font-bold text-gray-800">Votre site est prêt !</h1>
          {hasOrder ? (
            <>
              <p className="text-gray-500 text-sm">Partagez votre QR code avec vos invités. Quand leur fleur pousse, ils le scannent et partagent leur photo.</p>
              <img src={qrUrl} alt="QR Code" className="w-52 h-52 mx-auto rounded-2xl border border-gray-100 shadow-md" />
              <p className="text-xs text-gray-400 font-mono break-all">{createdEvent.public_url}</p>
            </>
          ) : (
            <>
              <p className="text-gray-500 text-sm">Votre site est en ligne. Personnalisez-le depuis votre espace et partagez le lien avec vos proches.</p>
              <p className="text-xs text-gray-400 font-mono break-all">{createdEvent.public_url}</p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
                <p className="text-sm font-semibold text-amber-800 mb-1">🌱 Ajoutez les kits fleurs</p>
                <p className="text-xs text-amber-700 mb-3">En commandant des pots, vous recevrez un QR code à glisser dans chaque kit pour que vos invités partagent leurs photos.</p>
                <a
                  href={createPageUrl("Shop")}
                  className="inline-block text-xs font-semibold text-amber-700 border border-amber-300 rounded-full px-4 py-1.5 hover:bg-amber-100 transition"
                >
                  Commander des kits →
                </a>
              </div>
            </>
          )}
          <div className="flex flex-col gap-3">
            <a
              href={createdEvent.public_url}
              target="_blank"
              rel="noreferrer"
              className="py-3 px-6 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-semibold transition text-sm"
            >
              Voir mon site →
            </a>
            {hasOrder && (
              <a
                href={qrUrl}
                download={`qrcode-${createdEvent.slug}.png`}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-6 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-full font-semibold transition text-sm flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Télécharger le QR code
              </a>
            )}
            <a
              href={`${createPageUrl("CoupleDashboard")}?event_id=${createdEvent.id}`}
              className="py-3 px-6 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-full font-semibold transition text-sm"
            >
              Gérer mon site →
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Prefill: try to gather data from order, existing orders, and user profile
  const bestOrder = order || unlinkableOrders[0] || null;
  // options_selected stocke eventType (camelCase) dans les nouvelles commandes
  const eventTypeFromOrder = bestOrder?.options_selected?.eventType || bestOrder?.options_selected?.event_type || "mariage";
  const lockedPlan = planFromUrl === "premium" ? "premium" : "basic";
  const prefill = {
    couple_names: bestOrder?.options_selected?.customization?.names || bestOrder?.customer_name || user?.full_name || "",
    event_date: bestOrder?.options_selected?.event_date || bestOrder?.options_selected?.customization?.date || "",
    event_type: eventTypeFromOrder,
    primary_color: "#c084fc",
    secondary_color: "#86efac",
    template: "classique",
    plan: lockedPlan,
    welcome_message: "",
    seed_type: bestOrder?.options_selected?.seed_type || "",
    event_name: "",
    cover_image: "",
    status: "active",
    slug: bestOrder?.options_selected?.slug || "",
  };

  const EVENT_TYPE_TITLE = {
    mariage: "de mariage", fiançailles: "de fiançailles", anniversaire: "d'anniversaire",
    bapteme: "de baptême", communion: "de communion", fete_entreprise: "d'entreprise",
    maison_hote: "pour votre maison d'hôte", autre: "de votre événement",
  };
  const eventTitle = EVENT_TYPE_TITLE[eventTypeFromOrder] || "de votre événement";

  // Standalone premium sans commande : paiement 39,99€ requis avant création
  if (!order && user && !existingEvent && lockedPlan === "premium" && !premiumPaid) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap');
          .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
        `}</style>
        <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-gray-100 bg-white">
          <a href={createPageUrl("Home")}>
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
              alt="Fleurs de fête" className="h-10" />
          </a>
          <a href={createPageUrl("Home")} className="text-sm text-gray-400 hover:text-rose-400 transition">← Retour à l'accueil</a>
        </nav>
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-50 mb-4">
              <Sparkles className="w-7 h-7 text-rose-400" />
            </div>
            <h1 className="font-serif-elegant text-3xl font-bold text-gray-800 mb-2">Formule Complète</h1>
            <p className="text-gray-500 text-sm">Paiement unique · 39,99€ · Accès à vie</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
            <ul className="space-y-2">
              {["Site événement personnalisé","RSVP & gestion invités","Programme de la journée","Album photo & galerie","Livre d'or","Liste de cadeaux / cagnotte","Plan de table","Thème & couleurs personnalisés","FAQ, carte & plan d'accès"].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <StripePaymentForm
              customerInfo={{ name: user.full_name || user.email, email: user.email }}
              total={39.99}
              onSuccess={() => setPremiumPaid(true)}
              onBack={() => window.location.href = createPageUrl("Home")}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white" style={{ colorScheme: "light", color: "#111827", backgroundColor: "#fff5f5" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap');
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
      `}</style>
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-gray-100 bg-white">
        <a href={createPageUrl("Home")}>
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
            alt="Fleurs de fête" className="h-10" />
        </a>
        <a href={createPageUrl("Home")} className="text-sm text-gray-400 hover:text-rose-400 transition">← Retour à l'accueil</a>
      </nav>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <span className="text-4xl block mb-3">🌸</span>
          <h1 className="font-serif-elegant text-4xl font-bold text-gray-800 mb-2">Créez votre site {eventTitle}</h1>
          <p className="text-gray-500 text-sm">Personnalisez votre page et choisissez votre template</p>
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

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm" style={{ colorScheme: "light", color: "#111827" }}>
          <EventForm
            event={prefill}
            onSave={handleEventSaved}
            lockedPlan={lockedPlan}
          />
        </div>
      </div>
    </div>
  );
}