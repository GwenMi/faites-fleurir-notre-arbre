import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import AdminGuard from "@/components/admin/AdminGuard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sparkles, Package, Calendar, Users, Search, RefreshCw,
  Loader2, Check, X, ExternalLink, ShieldCheck, CreditCard,
  Eye, ChevronRight, ArrowLeft
} from "lucide-react";
import { toast } from "sonner";

// ─── Onglet Événements ───────────────────────────────────────────────────────

function EventsTab() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Event.list("-created_date", 200);
    setEvents(data || []);
    setLoading(false);
  };

  const setPlan = async (event, plan) => {
    await base44.entities.Event.update(event.id, { plan });
    setEvents(ev => ev.map(e => e.id === event.id ? { ...e, plan } : e));
    toast.success(plan === "premium" ? `✅ Premium activé pour ${event.couple_names}` : `Plan basic restauré`);
  };

  const filtered = events.filter(e => {
    const q = query.toLowerCase();
    return !q || (e.couple_names || "").toLowerCase().includes(q)
      || (e.slug || "").toLowerCase().includes(q)
      || (e.created_by || "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-300" />
          <Input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher par nom, slug ou email…"
            className="pl-9 rounded-xl h-10" />
        </div>
        <button onClick={load} className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-400">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-rose-300" /></div> : (
        <div className="space-y-2">
          {filtered.length === 0 && <p className="text-center text-sm text-gray-400 py-8">Aucun événement trouvé</p>}
          {filtered.map(event => (
            <div key={event.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-800 text-sm">{event.couple_names || "Sans nom"}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${event.plan === "premium" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                    {event.plan === "premium" ? "⭐ Premium" : "Gratuit"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {event.slug && <span className="mr-3">/{event.slug}</span>}
                  {event.created_by && <span>{event.created_by}</span>}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {event.public_url && (
                  <a href={event.public_url} target="_blank" rel="noreferrer"
                    className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-indigo-500 transition" title="Voir le site">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {event.plan !== "premium" ? (
                  <button onClick={() => setPlan(event, "premium")}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition">
                    <Sparkles className="w-3.5 h-3.5" /> Octroyer Premium
                  </button>
                ) : (
                  <button onClick={() => setPlan(event, "basic")}
                    className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-xl hover:bg-gray-50 border border-gray-200 transition">
                    Rétrograder Basic
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Onglet Commandes ────────────────────────────────────────────────────────

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const PAYMENT_OPTIONS = ["unpaid", "partial", "paid"];
const STATUS_LABELS = { pending: "En attente", confirmed: "Confirmée", shipped: "Expédiée", delivered: "Livrée", cancelled: "Annulée" };
const PAYMENT_LABELS = { unpaid: "Non payée", partial: "Acompte", paid: "Payée" };
const PAYMENT_COLORS = { unpaid: "text-red-600 bg-red-50", partial: "text-amber-600 bg-amber-50", paid: "text-green-600 bg-green-50" };

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null); // { id, field, value }

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Order.list("-created_date", 300);
    setOrders(data || []);
    setLoading(false);
  };

  const saveField = async (order, field, value) => {
    await base44.entities.Order.update(order.id, { [field]: value });
    setOrders(os => os.map(o => o.id === order.id ? { ...o, [field]: value } : o));
    setEditing(null);
    toast.success("Commande mise à jour");
  };

  const filtered = orders.filter(o => {
    const q = query.toLowerCase();
    return !q || (o.customer_name || "").toLowerCase().includes(q)
      || (o.customer_email || "").toLowerCase().includes(q)
      || (o.id || "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-300" />
          <Input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher par nom, email ou ID…"
            className="pl-9 rounded-xl h-10" />
        </div>
        <button onClick={load} className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-400">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-rose-300" /></div> : (
        <div className="space-y-2">
          {filtered.length === 0 && <p className="text-center text-sm text-gray-400 py-8">Aucune commande trouvée</p>}
          {filtered.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{order.customer_name || "—"}</p>
                  <p className="text-xs text-gray-400">{order.customer_email}</p>
                  <p className="text-xs text-gray-300 mt-0.5">#{(order.id || "").slice(-8).toUpperCase()}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-bold text-rose-600 text-sm">{order.total_price?.toFixed(2)}€</span>
                  <a href={createPageUrl("AdminOrdersDetail") + `?id=${order.id}`} target="_blank" rel="noreferrer"
                    className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-indigo-500 transition" title="Détail">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Statut + Paiement */}
              <div className="flex flex-wrap gap-3">
                {/* Statut commande */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Statut :</span>
                  {editing?.id === order.id && editing?.field === "status" ? (
                    <div className="flex gap-1">
                      <select defaultValue={order.status} onChange={e => saveField(order, "status", e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white">
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                      <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <button onClick={() => setEditing({ id: order.id, field: "status" })}
                      className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                      {STATUS_LABELS[order.status] || order.status}
                    </button>
                  )}
                </div>

                {/* Statut paiement */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Paiement :</span>
                  {editing?.id === order.id && editing?.field === "payment_status" ? (
                    <div className="flex gap-1">
                      <select defaultValue={order.payment_status} onChange={e => saveField(order, "payment_status", e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white">
                        {PAYMENT_OPTIONS.map(s => <option key={s} value={s}>{PAYMENT_LABELS[s]}</option>)}
                      </select>
                      <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <button onClick={() => setEditing({ id: order.id, field: "payment_status" })}
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold transition hover:opacity-80 ${PAYMENT_COLORS[order.payment_status] || "bg-gray-100 text-gray-600"}`}>
                      {PAYMENT_LABELS[order.payment_status] || order.payment_status}
                    </button>
                  )}
                </div>

                {/* Raccourci : marquer payée */}
                {order.payment_status !== "paid" && (
                  <button onClick={() => saveField(order, "payment_status", "paid")}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition">
                    <CreditCard className="w-3 h-3" /> Marquer payée
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Onglet Accès invités ────────────────────────────────────────────────────

function GuestSessionsTab() {
  const [sessions, setSessions] = useState([]);
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [allSessions, allEvents] = await Promise.all([
      base44.entities.GuestSession.list("-created_date", 500),
      base44.entities.Event.list("-created_date", 200),
    ]);
    const evMap = {};
    (allEvents || []).forEach(e => { evMap[e.id] = e; });
    setSessions(allSessions || []);
    setEvents(evMap);
    setLoading(false);
  };

  const update = async (id, status) => {
    await base44.entities.GuestSession.update(id, { status });
    setSessions(s => s.map(g => g.id === id ? { ...g, status } : g));
    toast.success(status === "approved" ? "Accès accordé ✅" : "Accès refusé");
  };

  const filtered = sessions.filter(g => {
    const s = g.status || "approved";
    return filter === "all" ? true : s === filter;
  });

  const counts = {
    pending: sessions.filter(g => (g.status || "approved") === "pending").length,
    all: sessions.length,
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "pending", label: `En attente (${counts.pending})` },
          { key: "approved", label: "Approuvés" },
          { key: "rejected", label: "Refusés" },
          { key: "all", label: `Tous (${counts.all})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold transition border ${filter === f.key ? "bg-rose-500 text-white border-rose-500" : "bg-white text-gray-500 border-gray-200 hover:border-rose-200"}`}>
            {f.label}
          </button>
        ))}
        <button onClick={load} className="p-1.5 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-400 ml-auto">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-rose-300" /></div> : (
        <div className="space-y-2">
          {filtered.length === 0 && <p className="text-center text-sm text-gray-400 py-8">Aucune demande dans cette catégorie</p>}
          {filtered.map(g => {
            const status = g.status || "approved";
            const ev = events[g.event_id];
            return (
              <div key={g.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 font-bold text-sm flex-shrink-0">
                  {(g.pseudo || g.email || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800">{g.pseudo || "—"}</p>
                  <p className="text-xs text-gray-400 truncate">{g.email}</p>
                  {ev && <p className="text-xs text-indigo-400 mt-0.5 truncate">↳ {ev.couple_names}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    status === "pending" ? "bg-amber-100 text-amber-700" :
                    status === "approved" ? "bg-green-100 text-green-700" :
                    "bg-red-100 text-red-600"}`}>
                    {status === "pending" ? "En attente" : status === "approved" ? "Approuvé" : "Refusé"}
                  </span>
                  {status !== "approved" && (
                    <button onClick={() => update(g.id, "approved")}
                      className="w-7 h-7 rounded-full bg-green-100 hover:bg-green-200 text-green-600 flex items-center justify-center transition">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {status !== "rejected" && (
                    <button onClick={() => update(g.id, "rejected")}
                      className="w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 text-red-500 flex items-center justify-center transition">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Page principale ─────────────────────────────────────────────────────────

const TABS = [
  { key: "events",   label: "Sites événements", icon: Calendar,    desc: "Plan, slug, accès" },
  { key: "orders",   label: "Commandes",         icon: Package,     desc: "Statut, paiement" },
  { key: "guests",   label: "Accès invités",      icon: Users,       desc: "Toutes demandes" },
];

export default function AdminSuperPanel() {
  const [activeTab, setActiveTab] = useState("events");

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
          .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
          .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
        `}</style>

        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h1 className="font-serif-elegant text-xl font-bold text-gray-800">Super Panel Admin</h1>
                <p className="font-sans-clean text-xs text-gray-400">Intervention directe sur tous les éléments</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href={createPageUrl("AdminDashboard")}
                className="font-sans-clean text-xs text-gray-500 hover:text-rose-500 border border-gray-200 px-3 py-1.5 rounded-full transition">
                Dashboard →
              </a>
              <a href={createPageUrl("AdminOrders")}
                className="font-sans-clean text-xs text-gray-500 hover:text-rose-500 border border-gray-200 px-3 py-1.5 rounded-full transition">
                Commandes →
              </a>
            </div>
          </div>

          {/* Tabs */}
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex gap-1 border-t border-gray-100">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.key;
                return (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`flex-shrink-0 flex items-center gap-2 px-5 py-3.5 text-sm font-sans-clean font-semibold border-b-2 transition ${
                      active ? "border-rose-400 text-rose-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          {activeTab === "events" && <EventsTab />}
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "guests" && <GuestSessionsTab />}
        </div>
      </div>
    </AdminGuard>
  );
}
