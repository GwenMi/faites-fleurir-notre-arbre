import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  Loader2, Download, Package, Calendar, MapPin, ExternalLink,
  Truck, CheckCircle2, Clock, XCircle, AlertCircle, LogOut,
  ShoppingBag, Flower2, User, ChevronRight, Eye, Link2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateInvoicePDF } from "@/components/admin/invoiceUtils";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
  .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
  .gold-line { background: linear-gradient(90deg, transparent, #c9a96e, transparent); height: 1px; }
`;

const ORDER_STATUS = {
  pending:   { label: "En attente",  icon: Clock,        color: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Confirmée",   icon: CheckCircle2, color: "bg-blue-100 text-blue-700" },
  shipped:   { label: "Expédiée",    icon: Truck,        color: "bg-indigo-100 text-indigo-700" },
  delivered: { label: "Livrée",      icon: CheckCircle2, color: "bg-green-100 text-green-700" },
  cancelled: { label: "Annulée",     icon: XCircle,      color: "bg-gray-100 text-gray-500" },
};

const PAYMENT_STATUS = {
  unpaid:  { label: "Non payée",     color: "bg-red-100 text-red-600" },
  partial: { label: "Acompte reçu", color: "bg-blue-100 text-blue-600" },
  paid:    { label: "Payée",         color: "bg-green-100 text-green-700" },
};

const EVENT_TYPE_LABELS = {
  mariage: "Mariage",
  fiançailles: "Fiançailles",
  anniversaire: "Anniversaire",
  bapteme: "Baptême",
  fete_entreprise: "Fête d'entreprise",
  maison_hote: "Maison d'hôte",
  autre: "Autre",
};

const TABS = [
  { id: "orders",  label: "Mes commandes",  icon: ShoppingBag },
  { id: "events",  label: "Mes événements", icon: Flower2 },
  { id: "account", label: "Mon compte",     icon: User },
];

function getTrackingUrl(carrier, trackingNumber) {
  const carriers = {
    colissimo:  `https://www.colissimo.fr/en/track-a-parcel?parcelnumber=${trackingNumber}`,
    chronopost: `https://www.chronopost.fr/fr/suivi-colis?livraisonsSearch=${trackingNumber}`,
    ups:        `https://tracking.ups.com/?tracknum=${trackingNumber}`,
    dhl:        `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
    fedex:      `https://tracking.fedex.com/tracking?tracknumbers=${trackingNumber}`,
  };
  return carriers[carrier?.toLowerCase()] || "#";
}

export default function ClientDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [events, setEvents] = useState([]);
  const [tab, setTab] = useState("orders");
  const [downloadingId, setDownloadingId] = useState(null);
  const [linkingOrderId, setLinkingOrderId] = useState(null);
  const [linkingEventId, setLinkingEventId] = useState(null);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me();
      setUser(me);
      const [ordersData, eventsData] = await Promise.all([
        base44.entities.Order.filter({ customer_email: me.email }, "-created_date", 50),
        base44.entities.Event.filter({ created_by: me.email }, "-created_date", 50),
      ]);
      setOrders(ordersData || []);
      setEvents(eventsData || []);
    } catch {
      base44.auth.redirectToLogin(window.location.href);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (order) => {
    setDownloadingId(order.id);
    const doc = await generateInvoicePDF(order);
    doc.save(`Facture-FEF-${(order.id || "").slice(-8).toUpperCase()}.pdf`);
    setDownloadingId(null);
  };

  const handleLogout = () => {
    base44.auth.logout(createPageUrl("Home"));
  };

  const handleLink = async () => {
    if (!linkingOrderId || !linkingEventId) return;
    setLinking(true);
    const targetOrder = orders.find(o => o.id === linkingOrderId);
    const targetEvent = events.find(e => e.id === linkingEventId);
    if (targetOrder && targetEvent) {
      await base44.entities.Order.update(targetOrder.id, {
        event_id: targetEvent.id,
        options_selected: {
          ...(targetOrder.options_selected || {}),
          site_public_url: targetEvent.public_url,
        },
      });
      // refresh data
      await loadData();
    }
    setLinkingOrderId(null);
    setLinkingEventId(null);
    setLinking(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <style>{STYLES}</style>
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-rose-400 animate-spin mx-auto mb-3" />
          <p className="font-sans-clean text-gray-500">Chargement de votre espace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{STYLES}</style>

      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href={createPageUrl("Home")}>
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
              alt="Fleurs de fête"
              className="h-10"
            />
          </a>
          <div className="flex items-center gap-4">
            <span className="font-sans-clean text-sm text-gray-600 hidden sm:block">
              {user?.full_name || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 font-sans-clean text-sm text-gray-500 hover:text-rose-500 transition"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <p className="font-sans-clean text-xs tracking-[0.25em] uppercase text-rose-400 mb-1">Bienvenue</p>
          <h1 className="font-serif-elegant text-4xl font-bold text-gray-800">
            {user?.full_name ? `Bonjour, ${user.full_name.split(" ")[0]} 🌸` : "Mon espace"}
          </h1>
          <p className="font-sans-clean text-sm text-gray-500 mt-1">{user?.email}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-2xl p-1 mb-8 w-fit shadow-sm">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans-clean text-sm font-semibold transition-all ${
                  active
                    ? "bg-rose-500 text-white shadow-sm"
                    : "text-gray-500 hover:text-rose-500"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.label}</span>
                {t.id === "orders" && orders.length > 0 && (
                  <span className={`text-xs rounded-full px-1.5 py-0.5 ${active ? "bg-white/20" : "bg-rose-100 text-rose-600"}`}>
                    {orders.length}
                  </span>
                )}
                {t.id === "events" && events.length > 0 && (
                  <span className={`text-xs rounded-full px-1.5 py-0.5 ${active ? "bg-white/20" : "bg-indigo-100 text-indigo-600"}`}>
                    {events.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Linking banner — unlinked paid orders + existing events */}
        {(() => {
          const unlinkableOrders = orders.filter(o => !o.event_id && o.payment_status === "paid");
          const linkableEvents = events.filter(e => e.public_url);
          if (unlinkableOrders.length === 0 || linkableEvents.length === 0) return null;
          return (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-start gap-3 mb-4">
                <Link2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-sans-clean font-semibold text-amber-900">Lier une commande à votre site</p>
                  <p className="font-sans-clean text-sm text-amber-700 mt-0.5">
                    Vous avez {unlinkableOrders.length === 1 ? "une commande non liée" : `${unlinkableOrders.length} commandes non liées`} à un site événementiel. Reliez-les pour accéder à votre site depuis votre commande.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="font-sans-clean text-xs font-semibold text-amber-700 block mb-1">Commande</label>
                  <select
                    value={linkingOrderId || ""}
                    onChange={e => setLinkingOrderId(e.target.value)}
                    className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 font-sans-clean text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="">— Choisir une commande —</option>
                    {unlinkableOrders.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.product_name || "Commande"} — FEF-{(o.id || "").slice(-8).toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-sans-clean text-xs font-semibold text-amber-700 block mb-1">Site événementiel</label>
                  <select
                    value={linkingEventId || ""}
                    onChange={e => setLinkingEventId(e.target.value)}
                    className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 font-sans-clean text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="">— Choisir un site —</option>
                    {linkableEvents.map(ev => (
                      <option key={ev.id} value={ev.id}>
                        {ev.couple_names || ev.event_name || ev.slug}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleLink}
                  disabled={!linkingOrderId || !linkingEventId || linking}
                  className="flex items-center justify-center gap-2 py-2 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 text-white rounded-xl font-sans-clean text-sm font-semibold transition"
                >
                  {linking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                  Lier
                </button>
              </div>
            </div>
          );
        })()}

        {/* ORDERS TAB */}
        {tab === "orders" && (
          <div>
            {orders.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-gray-100">
                <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="font-serif-elegant text-2xl text-gray-400 mb-2">Aucune commande</p>
                <p className="font-sans-clean text-sm text-gray-400 mb-6">Vous n'avez pas encore passé de commande.</p>
                <a
                  href={createPageUrl("Boutique")}
                  className="inline-flex items-center gap-2 bg-rose-500 text-white rounded-full px-6 py-3 font-sans-clean text-sm font-semibold hover:bg-rose-600 transition"
                >
                  Découvrir la boutique <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => {
                  const st = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
                  const StatusIcon = st.icon;
                  const pt = PAYMENT_STATUS[order.payment_status] || PAYMENT_STATUS.unpaid;
                  const opts = order.options_selected || {};

                  return (
                    <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      {/* Header */}
                      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100">
                        <div>
                          <h3 className="font-serif-elegant text-lg font-bold text-gray-800">{order.product_name || "Commande"}</h3>
                          <p className="font-sans-clean text-xs text-gray-500 mt-0.5">
                            {new Date(order.created_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                            {" · "}Réf. FEF-{(order.id || "").slice(-8).toUpperCase()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-serif-elegant text-2xl font-bold text-rose-600">{order.total_price?.toFixed(2)}€</p>
                          <p className="font-sans-clean text-xs text-gray-400">{order.quantity} article{order.quantity > 1 ? "s" : ""}</p>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="px-6 py-4 space-y-4">
                        {/* Statuts */}
                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${st.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {st.label}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${pt.color}`}>
                            {pt.label}
                          </span>
                        </div>

                        {/* Détails */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          {opts.event_date && (
                            <div className="flex items-start gap-2">
                              <Calendar className="w-4 h-4 text-rose-300 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-sans-clean text-xs text-gray-400 font-semibold uppercase tracking-wide">Événement</p>
                                <p className="font-sans-clean text-gray-700">
                                  {new Date(opts.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                                </p>
                              </div>
                            </div>
                          )}
                          {opts.delivery_address && (
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-rose-300 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-sans-clean text-xs text-gray-400 font-semibold uppercase tracking-wide">Livraison</p>
                                <p className="font-sans-clean text-gray-700 whitespace-pre-line text-xs">{opts.delivery_address}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Suivi colis */}
                        {order.tracking_number && (
                          <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
                            <Truck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-sans-clean text-xs text-indigo-600 font-semibold">Suivi colis · {order.tracking_number}</p>
                            </div>
                            <a
                              href={getTrackingUrl(order.tracking_carrier, order.tracking_number)}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-xs font-sans-clean font-semibold text-indigo-600 hover:text-indigo-700 flex-shrink-0"
                            >
                              <Eye className="w-3.5 h-3.5" /> Suivre
                            </a>
                          </div>
                        )}

                        {/* Lien site événement */}
                        {opts.site_public_url ? (
                          <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-xl">
                            <Flower2 className="w-4 h-4 text-rose-400 flex-shrink-0" />
                            <p className="font-sans-clean text-xs text-rose-600 font-semibold flex-1">Site événement lié</p>
                            <a
                              href={opts.site_public_url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-xs font-sans-clean font-semibold text-rose-600 hover:text-rose-700"
                            >
                              Accéder <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : ["mariage", "anniversaire", "bapteme", "communion"].includes(opts.eventType) && (
                          <div className="flex flex-col gap-2 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                            <p className="font-sans-clean text-xs font-semibold text-indigo-700">🌸 Créez votre site événement</p>
                            <p className="font-sans-clean text-xs text-indigo-600">Partagez votre programme, gérez vos invités et le défi fleur.</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <a
                                href={createPageUrl("CreateMyEvent") + `?order_id=${order.id}&plan=basic`}
                                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 rounded-xl font-sans-clean text-xs font-semibold transition"
                              >
                                Créer mon site gratuit
                              </a>
                              <a
                                href={createPageUrl("CreateMyEvent") + `?order_id=${order.id}&plan=premium`}
                                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-sans-clean text-xs font-semibold transition"
                              >
                                ✨ Version complète — 39,99€
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-2 border-t border-gray-100">
                          <Button
                            onClick={() => handleDownloadInvoice(order)}
                            variant="outline"
                            size="sm"
                            disabled={downloadingId === order.id}
                            className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 font-sans-clean"
                          >
                            {downloadingId === order.id ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Download className="w-4 h-4 mr-2" />
                            )}
                            Télécharger la facture
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* EVENTS TAB */}
        {tab === "events" && (
          <div>
            {events.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-gray-100">
                <Flower2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="font-serif-elegant text-2xl text-gray-400 mb-2">Aucun événement</p>
                <p className="font-sans-clean text-sm text-gray-400 mb-6">Vous n'avez pas encore créé de site événementiel.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={createPageUrl("CreateMyEvent") + `?plan=basic`}
                    className="inline-flex items-center gap-2 bg-white border-2 border-rose-300 text-rose-600 rounded-full px-6 py-3 font-sans-clean text-sm font-semibold hover:bg-rose-50 transition"
                  >
                    Créer mon site gratuit
                  </a>
                  <a
                    href={createPageUrl("CreateMyEvent") + `?plan=premium`}
                    className="inline-flex items-center gap-2 bg-rose-500 text-white rounded-full px-6 py-3 font-sans-clean text-sm font-semibold hover:bg-rose-600 transition"
                  >
                    ✨ Version complète — 39,99€ <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map(event => (
                  <div key={event.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
                    {event.cover_image ? (
                      <div className="h-32 overflow-hidden">
                        <img src={event.cover_image} alt={event.couple_names} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-32 bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                        <Flower2 className="w-12 h-12 text-rose-300" />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-serif-elegant text-xl font-bold text-gray-800">{event.couple_names}</h3>
                          <p className="font-sans-clean text-xs text-gray-400 mt-0.5">
                            {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
                            {event.event_date && ` · ${new Date(event.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`}
                          </p>
                        </div>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold font-sans-clean ${
                          event.plan === "premium" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {event.plan === "premium" ? "✨ Premium" : "Essentiel"}
                        </span>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {event.public_url && (
                          <a
                            href={event.public_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-sans-clean text-xs font-semibold transition"
                          >
                            <Eye className="w-3.5 h-3.5" /> Voir le site
                          </a>
                        )}
                        <a
                          href={createPageUrl("CoupleDashboard") + `?event_id=${event.id}`}
                          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-sans-clean text-xs font-semibold transition"
                        >
                          Gérer <ChevronRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ACCOUNT TAB */}
        {tab === "account" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md">
            <h2 className="font-serif-elegant text-2xl font-bold text-gray-800 mb-6">Mes informations</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <p className="font-sans-clean text-xs text-gray-400 uppercase tracking-wide">Nom</p>
                  <p className="font-sans-clean font-semibold text-gray-700">{user?.full_name || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <p className="font-sans-clean text-xs text-gray-400 uppercase tracking-wide">Email</p>
                  <p className="font-sans-clean font-semibold text-gray-700">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
              <a
                href={createPageUrl("Contact")}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-rose-200 hover:bg-rose-50 transition"
              >
                <span className="font-sans-clean text-sm font-semibold text-gray-700">Contacter le support</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </a>
              <a
                href={createPageUrl("Boutique")}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-rose-200 hover:bg-rose-50 transition"
              >
                <span className="font-sans-clean text-sm font-semibold text-gray-700">Passer une commande</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </a>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-red-200 hover:bg-red-50 transition"
              >
                <span className="font-sans-clean text-sm font-semibold text-red-500">Se déconnecter</span>
                <LogOut className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 py-10 px-6 border-t border-gray-100 text-center">
        <p className="font-sans-clean text-xs text-gray-400">
          © 2025 Fleurs en fête · <a href={createPageUrl("Contact")} className="hover:text-rose-400">Contact</a> · <a href={createPageUrl("CGV")} className="hover:text-rose-400">CGV</a>
        </p>
      </footer>
    </div>
  );
}