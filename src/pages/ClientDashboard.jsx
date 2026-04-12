import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  Loader2, Download, Package, Calendar, MapPin, ExternalLink,
  Truck, CheckCircle2, Clock, XCircle, AlertCircle, LogOut,
  ShoppingBag, Flower2, User, ChevronRight, Eye, Link2,
  Heart, Star, Euro, TrendingUp, Bell, Settings, LifeBuoy,
  Save, Phone, Home, Globe, Mail, CreditCard, ArrowRight,
  Gift, Sparkles, BarChart2, ChevronDown, ChevronUp, Copy,
  CheckCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateInvoicePDF } from "@/components/admin/invoiceUtils";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
  .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
`;

const ORDER_STATUS = {
  pending:   { label: "En attente",  icon: Clock,        color: "bg-amber-100 text-amber-700",   dot: "bg-amber-400" },
  confirmed: { label: "Confirmée",   icon: CheckCircle2, color: "bg-blue-100 text-blue-700",     dot: "bg-blue-400" },
  shipped:   { label: "Expédiée",    icon: Truck,        color: "bg-indigo-100 text-indigo-700", dot: "bg-indigo-400" },
  delivered: { label: "Livrée",      icon: CheckCircle2, color: "bg-green-100 text-green-700",   dot: "bg-green-400" },
  cancelled: { label: "Annulée",     icon: XCircle,      color: "bg-gray-100 text-gray-500",     dot: "bg-gray-300" },
};

const PAYMENT_STATUS = {
  unpaid:  { label: "Non payée",     color: "bg-red-100 text-red-600",    icon: AlertCircle },
  partial: { label: "Acompte reçu",  color: "bg-amber-100 text-amber-700", icon: Clock },
  paid:    { label: "Payée",         color: "bg-green-100 text-green-700", icon: CheckCircle2 },
};

const EVENT_TYPE_LABELS = {
  mariage: "Mariage", fiançailles: "Fiançailles", anniversaire: "Anniversaire",
  bapteme: "Baptême", fete_entreprise: "Fête d'entreprise", maison_hote: "Maison d'hôte", autre: "Autre",
};

const TABS = [
  { id: "overview",  label: "Vue d'ensemble", icon: BarChart2 },
  { id: "orders",    label: "Commandes",      icon: ShoppingBag },
  { id: "events",    label: "Événements",     icon: Flower2 },
  { id: "profile",   label: "Mon profil",     icon: User },
  { id: "support",   label: "Support",        icon: LifeBuoy },
];

function getTrackingUrl(carrier, trackingNumber) {
  const carriers = {
    colissimo:  `https://www.colissimo.fr/en/track-a-parcel?parcelnumber=${trackingNumber}`,
    chronopost: `https://www.chronopost.fr/fr/suivi-colis?livraisonsSearch=${trackingNumber}`,
    ups:        `https://tracking.ups.com/?tracknum=${trackingNumber}`,
    dhl:        `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
    fedex:      `https://tracking.fedex.com/tracking?tracknumbers=${trackingNumber}`,
    mondial_relay: `https://www.mondialrelay.fr/suivi-de-colis?numeroExpedition=${trackingNumber}`,
  };
  return carriers[carrier?.toLowerCase()] || "#";
}

function StatCard({ icon: Icon, label, value, sub, color = "rose" }) {
  const colors = {
    rose: "from-rose-400 to-pink-500",
    indigo: "from-indigo-400 to-violet-500",
    emerald: "from-emerald-400 to-teal-500",
    amber: "from-amber-400 to-orange-500",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="font-sans-clean text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="font-serif-elegant text-2xl font-bold text-gray-800">{value}</p>
        {sub && <p className="font-sans-clean text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function OrderCard({ order, onDownloadInvoice, downloading }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const st = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
  const StatusIcon = st.icon;
  const pt = PAYMENT_STATUS[order.payment_status] || PAYMENT_STATUS.unpaid;
  const PayIcon = pt.icon;
  const opts = order.options_selected || {};

  const copyRef = () => {
    navigator.clipboard.writeText(`FEF-${(order.id || "").slice(-8).toUpperCase()}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${st.dot}`} />
          <div>
            <h3 className="font-sans-clean font-semibold text-gray-800 text-sm">{order.product_name || "Commande"}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <button
                onClick={e => { e.stopPropagation(); copyRef(); }}
                className="font-sans-clean text-xs text-gray-400 hover:text-rose-500 flex items-center gap-1 transition"
              >
                {copied ? <CheckCheck className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                FEF-{(order.id || "").slice(-8).toUpperCase()}
              </button>
              <span className="text-gray-200">·</span>
              <span className="font-sans-clean text-xs text-gray-400">
                {new Date(order.created_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <p className="font-serif-elegant text-lg font-bold text-rose-600 hidden sm:block">{order.total_price?.toFixed(2)}€</p>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {/* Status pills */}
      <div className="flex items-center gap-2 px-5 pb-3 flex-wrap">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-sans-clean ${st.color}`}>
          <StatusIcon className="w-3 h-3" /> {st.label}
        </span>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-sans-clean ${pt.color}`}>
          <PayIcon className="w-3 h-3" /> {pt.label}
        </span>
        {order.quantity && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold font-sans-clean bg-gray-100 text-gray-600">
            <Package className="w-3 h-3" /> {order.quantity} unité{order.quantity > 1 ? "s" : ""}
          </span>
        )}
        <span className="font-serif-elegant text-base font-bold text-rose-600 sm:hidden ml-auto">{order.total_price?.toFixed(2)}€</span>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4 bg-gray-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {opts.event_date && (
              <div className="flex items-start gap-2 bg-white rounded-xl p-3 border border-gray-100">
                <Calendar className="w-4 h-4 text-rose-300 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-sans-clean text-xs text-gray-400 uppercase tracking-wide font-semibold">Événement</p>
                  <p className="font-sans-clean text-sm text-gray-700">{new Date(opts.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
              </div>
            )}
            {opts.delivery_address && (
              <div className="flex items-start gap-2 bg-white rounded-xl p-3 border border-gray-100">
                <MapPin className="w-4 h-4 text-rose-300 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-sans-clean text-xs text-gray-400 uppercase tracking-wide font-semibold">Livraison</p>
                  <p className="font-sans-clean text-xs text-gray-700 whitespace-pre-line">{opts.delivery_address}</p>
                </div>
              </div>
            )}
            {order.deposit_amount > 0 && (
              <div className="flex items-start gap-2 bg-white rounded-xl p-3 border border-gray-100">
                <CreditCard className="w-4 h-4 text-indigo-300 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-sans-clean text-xs text-gray-400 uppercase tracking-wide font-semibold">Acompte versé</p>
                  <p className="font-sans-clean text-sm text-gray-700">{order.deposit_amount?.toFixed(2)}€ / {order.total_price?.toFixed(2)}€</p>
                </div>
              </div>
            )}
          </div>

          {/* Tracking */}
          {order.tracking_number && (
            <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
              <Truck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-sans-clean text-xs font-semibold text-indigo-700">Numéro de suivi</p>
                <p className="font-sans-clean text-xs text-indigo-600">{order.tracking_number} · {order.tracking_carrier}</p>
              </div>
              <a href={getTrackingUrl(order.tracking_carrier, order.tracking_number)} target="_blank" rel="noreferrer"
                className="flex items-center gap-1 text-xs font-sans-clean font-bold text-indigo-600 hover:text-indigo-700 flex-shrink-0 bg-white px-3 py-1.5 rounded-lg border border-indigo-200">
                <Eye className="w-3.5 h-3.5" /> Suivre
              </a>
            </div>
          )}

          {/* Event link */}
          {opts.site_public_url && (
            <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-xl border border-rose-100">
              <Flower2 className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <p className="font-sans-clean text-xs text-rose-700 font-semibold flex-1">Site événement associé</p>
              <a href={opts.site_public_url} target="_blank" rel="noreferrer"
                className="flex items-center gap-1 text-xs font-sans-clean font-bold text-rose-600 hover:text-rose-700 bg-white px-3 py-1.5 rounded-lg border border-rose-200">
                Voir <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => onDownloadInvoice(order)} variant="outline" size="sm" disabled={downloading}
              className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 font-sans-clean text-xs gap-1.5">
              {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Télécharger la facture
            </Button>
            <a href={createPageUrl("Contact")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 font-sans-clean text-xs font-semibold transition">
              <LifeBuoy className="w-3.5 h-3.5" /> Aide pour cette commande
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function EventCard({ event }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition group">
      {event.cover_image ? (
        <div className="h-36 overflow-hidden relative">
          <img src={event.cover_image} alt={event.couple_names} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <h3 className="font-serif-elegant text-lg font-bold text-white drop-shadow">{event.couple_names}</h3>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full font-sans-clean ${event.plan === "premium" ? "bg-amber-400 text-white" : "bg-white/80 text-gray-700"}`}>
              {event.plan === "premium" ? "✨ Premium" : "Essentiel"}
            </span>
          </div>
        </div>
      ) : (
        <div className="h-36 bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center relative">
          <Flower2 className="w-14 h-14 text-rose-300" />
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <h3 className="font-serif-elegant text-lg font-bold text-rose-800">{event.couple_names}</h3>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full font-sans-clean ${event.plan === "premium" ? "bg-amber-400 text-white" : "bg-white text-gray-600"}`}>
              {event.plan === "premium" ? "✨ Premium" : "Essentiel"}
            </span>
          </div>
        </div>
      )}
      <div className="p-4">
        <p className="font-sans-clean text-xs text-gray-400">
          {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
          {event.event_date && ` · ${new Date(event.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`}
        </p>
        {event.slug && (
          <p className="font-sans-clean text-xs text-gray-300 mt-1 truncate">/{event.slug}</p>
        )}
        <div className="flex gap-2 mt-3 flex-wrap">
          {event.public_url && (
            <a href={event.public_url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-sans-clean text-xs font-semibold transition">
              <Eye className="w-3.5 h-3.5" /> Voir le site
            </a>
          )}
          <a href={`${createPageUrl("CoupleDashboard")}?event_id=${event.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-sans-clean text-xs font-semibold transition">
            Gérer mon site <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
        {event.plan !== "premium" && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="font-sans-clean text-xs text-amber-700 font-semibold">✨ Passer en Premium</p>
            <p className="font-sans-clean text-xs text-amber-600 mt-0.5">Invités, RSVP, plan de table, galerie photos…</p>
            <a href={createPageUrl("CreateMyEvent") + `?plan=premium&event_id=${event.id}`}
              className="inline-flex items-center gap-1 text-xs font-sans-clean font-bold text-amber-600 hover:text-amber-700 mt-1.5">
              Voir les options <ChevronRight className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClientDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [events, setEvents] = useState([]);
  const [tab, setTab] = useState("overview");
  const [downloadingId, setDownloadingId] = useState(null);

  // Profile form
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me();
      setUser(me);
      setForm({
        phone: me.phone || "",
        street: me.street || "",
        zip_code: me.zip_code || "",
        city: me.city || "",
        country: me.country || "France",
      });
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

  const handleSaveProfile = async () => {
    setSaving(true);
    await base44.auth.updateMe(form);
    setUser(u => ({ ...u, ...form }));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = () => base44.auth.logout(createPageUrl("Home"));

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

  const totalSpent = orders.reduce((s, o) => s + (o.total_price || 0), 0);
  const totalPots = orders.reduce((s, o) => s + (o.quantity || 0), 0);
  const unpaidOrders = orders.filter(o => o.payment_status === "unpaid" || o.payment_status === "partial");
  const activeEvents = events.filter(e => e.status !== "archived");
  const recentOrders = orders.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{STYLES}</style>

      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href={createPageUrl("Home")}>
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
              alt="Fleurs de fête" className="h-9" />
          </a>
          <div className="flex items-center gap-3">
            <a href={createPageUrl("Shop")}
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 px-4 py-2 rounded-full transition font-sans-clean">
              <ShoppingBag className="w-3.5 h-3.5" /> Commander
            </a>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
              <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <span className="font-sans-clean text-xs text-gray-600 hidden sm:block max-w-[140px] truncate">
                {user?.full_name || user?.email}
              </span>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition font-sans-clean">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Déco</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <p className="font-sans-clean text-xs tracking-[0.25em] uppercase text-rose-200 mb-1">Mon espace client</p>
          <h1 className="font-serif-elegant text-4xl font-bold">
            {user?.full_name ? `Bonjour, ${user.full_name.split(" ")[0]} 🌸` : "Mon espace"}
          </h1>
          <p className="font-sans-clean text-sm text-rose-100 mt-1">{user?.email}</p>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            {[
              { label: "Commandes", value: orders.length, icon: ShoppingBag },
              { label: "Total dépensé", value: `${totalSpent.toFixed(0)}€`, icon: Euro },
              { label: "Pots commandés", value: totalPots, icon: Gift },
              { label: "Sites créés", value: activeEvents.length, icon: Flower2 },
            ].map(s => (
              <div key={s.label} className="bg-white/15 backdrop-blur rounded-2xl p-4">
                <s.icon className="w-4 h-4 text-white/70 mb-2" />
                <p className="font-serif-elegant text-2xl font-bold text-white">{s.value}</p>
                <p className="font-sans-clean text-xs text-rose-200">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {unpaidOrders.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center gap-3">
            <Bell className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-sans-clean text-sm font-semibold text-amber-800">
                {unpaidOrders.length === 1 ? "Une commande" : `${unpaidOrders.length} commandes`} en attente de paiement
              </p>
              <p className="font-sans-clean text-xs text-amber-600 mt-0.5">Contactez-nous si vous avez des questions.</p>
            </div>
            <button onClick={() => setTab("orders")}
              className="flex-shrink-0 text-xs font-semibold font-sans-clean text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition">
              Voir
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-2xl p-1 mb-8 overflow-x-auto no-scrollbar shadow-sm w-fit">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans-clean text-sm font-semibold transition-all whitespace-nowrap ${
                  active ? "bg-rose-500 text-white shadow-sm" : "text-gray-500 hover:text-rose-500"
                }`}>
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

        {/* === OVERVIEW === */}
        {tab === "overview" && (
          <div className="space-y-8">
            {/* Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={ShoppingBag} label="Commandes" value={orders.length} sub={`${orders.filter(o => o.status === "delivered").length} livrées`} color="rose" />
              <StatCard icon={Euro} label="Total dépensé" value={`${totalSpent.toFixed(0)}€`} sub="toutes commandes" color="indigo" />
              <StatCard icon={Gift} label="Pots commandés" value={totalPots} sub="cadeaux pour vos invités" color="emerald" />
              <StatCard icon={Flower2} label="Sites événementiels" value={activeEvents.length} sub={`${events.filter(e => e.plan === "premium").length} premium`} color="amber" />
            </div>

            {/* Recent orders */}
            {recentOrders.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif-elegant text-xl font-bold text-gray-800">Commandes récentes</h2>
                  <button onClick={() => setTab("orders")} className="font-sans-clean text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1">
                    Voir tout <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-3">
                  {recentOrders.map(o => (
                    <OrderCard key={o.id} order={o} onDownloadInvoice={handleDownloadInvoice} downloading={downloadingId === o.id} />
                  ))}
                </div>
              </div>
            )}

            {/* Events summary */}
            {activeEvents.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif-elegant text-xl font-bold text-gray-800">Mes événements</h2>
                  <button onClick={() => setTab("events")} className="font-sans-clean text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1">
                    Voir tout <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeEvents.slice(0, 2).map(e => <EventCard key={e.id} event={e} />)}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div>
              <h2 className="font-serif-elegant text-xl font-bold text-gray-800 mb-4">Actions rapides</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a href={createPageUrl("Shop")} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl hover:border-rose-200 hover:bg-rose-50 transition shadow-sm">
                  <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-rose-500" />
                  </div>
                  <div>
                    <p className="font-sans-clean text-sm font-semibold text-gray-800">Commander un kit</p>
                    <p className="font-sans-clean text-xs text-gray-400">Découvrir nos pots personnalisés</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                </a>
                <a href={createPageUrl("CreateMyEvent") + "?plan=basic"} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50 transition shadow-sm">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Flower2 className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="font-sans-clean text-sm font-semibold text-gray-800">Créer mon site</p>
                    <p className="font-sans-clean text-xs text-gray-400">Site événement gratuit</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                </a>
                <a href={createPageUrl("Contact")} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl hover:border-emerald-200 hover:bg-emerald-50 transition shadow-sm">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <LifeBuoy className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-sans-clean text-sm font-semibold text-gray-800">Contacter le support</p>
                    <p className="font-sans-clean text-xs text-gray-400">Nous sommes là pour vous aider</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* === ORDERS === */}
        {tab === "orders" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif-elegant text-2xl font-bold text-gray-800">Mes commandes</h2>
              <a href={createPageUrl("Shop")}
                className="flex items-center gap-1.5 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 px-4 py-2 rounded-full transition font-sans-clean">
                <ShoppingBag className="w-3.5 h-3.5" /> Nouvelle commande
              </a>
            </div>
            {orders.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-gray-100">
                <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="font-serif-elegant text-2xl text-gray-400 mb-2">Aucune commande</p>
                <p className="font-sans-clean text-sm text-gray-400 mb-6">Vous n'avez pas encore passé de commande.</p>
                <a href={createPageUrl("Shop")}
                  className="inline-flex items-center gap-2 bg-rose-500 text-white rounded-full px-6 py-3 font-sans-clean text-sm font-semibold hover:bg-rose-600 transition">
                  Découvrir la boutique <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => (
                  <OrderCard key={order.id} order={order} onDownloadInvoice={handleDownloadInvoice} downloading={downloadingId === order.id} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* === EVENTS === */}
        {tab === "events" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif-elegant text-2xl font-bold text-gray-800">Mes événements</h2>
              <a href={createPageUrl("CreateMyEvent") + "?plan=basic"}
                className="flex items-center gap-1.5 text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-full transition font-sans-clean">
                <Sparkles className="w-3.5 h-3.5" /> Créer un site
              </a>
            </div>
            {events.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-gray-100">
                <Flower2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="font-serif-elegant text-2xl text-gray-400 mb-2">Aucun événement</p>
                <p className="font-sans-clean text-sm text-gray-400 mb-6">Créez votre site événementiel gratuit.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href={createPageUrl("CreateMyEvent") + "?plan=basic"}
                    className="inline-flex items-center gap-2 bg-white border-2 border-rose-300 text-rose-600 rounded-full px-6 py-3 font-sans-clean text-sm font-semibold hover:bg-rose-50 transition">
                    Créer mon site gratuit
                  </a>
                  <a href={createPageUrl("CreateMyEvent") + "?plan=premium"}
                    className="inline-flex items-center gap-2 bg-rose-500 text-white rounded-full px-6 py-3 font-sans-clean text-sm font-semibold hover:bg-rose-600 transition">
                    ✨ Version complète — 39,99€ <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {events.map(event => <EventCard key={event.id} event={event} />)}
              </div>
            )}
          </div>
        )}

        {/* === PROFILE === */}
        {tab === "profile" && (
          <div className="max-w-xl space-y-6">
            <h2 className="font-serif-elegant text-2xl font-bold text-gray-800">Mon profil</h2>

            {/* Identity (read-only) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <p className="font-sans-clean text-xs font-semibold uppercase tracking-widest text-rose-400">Identité</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="font-sans-clean text-xs text-gray-400 uppercase tracking-wide mb-1">Nom complet</p>
                  <p className="font-sans-clean font-semibold text-gray-800">{user?.full_name || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="font-sans-clean text-xs text-gray-400 uppercase tracking-wide mb-1">Email</p>
                  <p className="font-sans-clean font-semibold text-gray-800 truncate">{user?.email}</p>
                </div>
              </div>
              <p className="font-sans-clean text-xs text-gray-400">Le nom et l'email sont gérés par votre compte Base44.</p>
            </div>

            {/* Contact & address */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <p className="font-sans-clean text-xs font-semibold uppercase tracking-widest text-rose-400">Contact & livraison</p>
              <div>
                <Label className="font-sans-clean text-sm font-semibold text-gray-700 mb-1.5 block flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-rose-300" /> Téléphone
                </Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="06 12 34 56 78" className="h-11 rounded-xl" />
              </div>
              <div>
                <Label className="font-sans-clean text-sm font-semibold text-gray-700 mb-1.5 block flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-rose-300" /> Adresse
                </Label>
                <Input value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} placeholder="12 rue des Roses" className="h-11 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="font-sans-clean text-sm font-semibold text-gray-700 mb-1.5 block">Code postal</Label>
                  <Input value={form.zip_code} onChange={e => setForm(f => ({ ...f, zip_code: e.target.value }))} placeholder="75001" className="h-11 rounded-xl" />
                </div>
                <div>
                  <Label className="font-sans-clean text-sm font-semibold text-gray-700 mb-1.5 block">Ville</Label>
                  <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Paris" className="h-11 rounded-xl" />
                </div>
              </div>
              <div>
                <Label className="font-sans-clean text-sm font-semibold text-gray-700 mb-1.5 block flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-rose-300" /> Pays
                </Label>
                <Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} placeholder="France" className="h-11 rounded-xl" />
              </div>
              <Button onClick={handleSaveProfile} disabled={saving} className="w-full h-11 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-sans-clean font-semibold gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCheck className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? "Enregistré !" : saving ? "Enregistrement…" : "Sauvegarder"}
              </Button>
            </div>

            {/* Danger zone */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="font-sans-clean text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Compte</p>
              <button onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-red-200 hover:bg-red-50 transition">
                <span className="font-sans-clean text-sm font-semibold text-red-500 flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Se déconnecter
                </span>
                <ChevronRight className="w-4 h-4 text-red-300" />
              </button>
            </div>
          </div>
        )}

        {/* === SUPPORT === */}
        {tab === "support" && (
          <div className="max-w-xl space-y-6">
            <h2 className="font-serif-elegant text-2xl font-bold text-gray-800">Support & aide</h2>

            <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-6 text-center">
              <LifeBuoy className="w-10 h-10 text-rose-400 mx-auto mb-3" />
              <h3 className="font-serif-elegant text-xl font-bold text-gray-800 mb-1">Une question ?</h3>
              <p className="font-sans-clean text-sm text-gray-500 mb-4">Notre équipe répond sous 24h en semaine.</p>
              <a href={createPageUrl("Contact")}
                className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full px-6 py-3 font-sans-clean text-sm font-semibold transition">
                <Mail className="w-4 h-4" /> Nous contacter
              </a>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
              {[
                { q: "Comment suivre ma commande ?", a: "Rendez-vous dans l'onglet Commandes, cliquez sur une commande pour voir le numéro de suivi et le lien de tracking." },
                { q: "Comment créer mon site événementiel ?", a: "Depuis l'onglet Événements, cliquez sur 'Créer un site'. C'est gratuit et prend moins de 5 minutes." },
                { q: "Comment modifier ma commande ?", a: "Les modifications sont possibles sous 24h après la commande. Contactez-nous via le formulaire." },
                { q: "Comment personnaliser mon kit ?", a: "Les personnalisations (nom, date, message) sont définies lors de la commande. Pour tout changement, contactez-nous rapidement." },
                { q: "Quels délais de livraison ?", a: "En moyenne 5-10 jours ouvrés. Pour un événement proche, contactez-nous au préalable." },
              ].map((faq, i) => (
                <FAQItem key={i} question={faq.q} answer={faq.a} />
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
              <p className="font-sans-clean text-xs text-gray-400 mb-3">Retrouvez toutes nos conditions</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <a href={createPageUrl("CGV")} className="font-sans-clean text-xs text-gray-500 hover:text-rose-500 underline">CGV</a>
                <a href={createPageUrl("CGU")} className="font-sans-clean text-xs text-gray-500 hover:text-rose-500 underline">CGU</a>
                <a href={createPageUrl("MentionsLegales")} className="font-sans-clean text-xs text-gray-500 hover:text-rose-500 underline">Mentions légales</a>
                <a href={createPageUrl("FAQ")} className="font-sans-clean text-xs text-gray-500 hover:text-rose-500 underline">FAQ</a>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-16 py-10 px-6 border-t border-gray-100 text-center">
        <p className="font-sans-clean text-xs text-gray-400">
          © 2025 Fleurs en fête · <a href={createPageUrl("Contact")} className="hover:text-rose-400">Contact</a> · <a href={createPageUrl("CGV")} className="hover:text-rose-400">CGV</a>
        </p>
      </footer>
    </div>
  );
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="px-5 py-4">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between gap-3 text-left">
        <span className="font-sans-clean text-sm font-semibold text-gray-800">{question}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>
      {open && <p className="font-sans-clean text-sm text-gray-500 mt-2 leading-relaxed">{answer}</p>}
    </div>
  );
}