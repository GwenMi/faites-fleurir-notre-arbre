import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ChevronLeft, Loader2, Package, CheckCircle2, Circle, RefreshCw, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminGuard from "@/components/admin/AdminGuard";

const STATUS_PICKING = ["pending", "confirmed"];

const SECTION_CONFIG = {
  seeds: {
    label: "🌱 Graines",
    color: "bg-green-50 border-green-200",
    headerColor: "bg-green-100 text-green-800",
    badgeColor: "bg-green-200 text-green-800",
    dotColor: "bg-green-400",
  },
  pots: {
    label: "🫙 Pots",
    color: "bg-amber-50 border-amber-200",
    headerColor: "bg-amber-100 text-amber-800",
    badgeColor: "bg-amber-200 text-amber-800",
    dotColor: "bg-amber-400",
  },
  ribbons: {
    label: "🎀 Rubans",
    color: "bg-rose-50 border-rose-200",
    headerColor: "bg-rose-100 text-rose-800",
    badgeColor: "bg-rose-200 text-rose-800",
    dotColor: "bg-rose-400",
  },
};

export default function Picking() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [checked, setChecked] = useState({});
  const [expanded, setExpanded] = useState({ seeds: true, pots: true, ribbons: true });

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const all = await base44.entities.Order.list("-created_date", 200);
    setOrders(all || []);
    setLoading(false);
  };

  const filteredOrders = orders.filter(o => {
    if (statusFilter === "all") return STATUS_PICKING.includes(o.status);
    return o.status === statusFilter;
  });

  // Group by type
  const groups = { seeds: {}, pots: {}, ribbons: {} };

  filteredOrders.forEach(order => {
    const opts = order.options_selected || {};
    const qty = order.quantity || 1;

    if (opts.seed_type) {
      if (!groups.seeds[opts.seed_type]) groups.seeds[opts.seed_type] = { total: 0, orders: [] };
      groups.seeds[opts.seed_type].total += qty;
      groups.seeds[opts.seed_type].orders.push(order);
    }
    if (opts.pot_type) {
      if (!groups.pots[opts.pot_type]) groups.pots[opts.pot_type] = { total: 0, orders: [] };
      groups.pots[opts.pot_type].total += qty;
      groups.pots[opts.pot_type].orders.push(order);
    }
    if (opts.ribbon_color) {
      if (!groups.ribbons[opts.ribbon_color]) groups.ribbons[opts.ribbon_color] = { total: 0, orders: [] };
      groups.ribbons[opts.ribbon_color].total += qty;
      groups.ribbons[opts.ribbon_color].orders.push(order);
    }
  });

  const toggleCheck = (key) => {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSection = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const totalPots = filteredOrders.reduce((s, o) => s + (o.quantity || 1), 0);
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const totalItems = Object.values(groups).flatMap(g => Object.keys(g)).length;

  return (
    <AdminGuard allowedRoles={["admin", "manager"]}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href={createPageUrl("AdminOrders")} className="p-2 rounded-lg hover:bg-gray-100">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </a>
              <div>
                <h1 className="font-bold text-gray-800 text-lg">Préparation des commandes</h1>
                <p className="text-xs text-gray-500">Picking par type d'article</p>
              </div>
            </div>
            <button onClick={fetchOrders} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700" title="Actualiser">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-rose-300" />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto p-4 space-y-4">

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                <p className="text-2xl font-bold text-gray-800">{filteredOrders.length}</p>
                <p className="text-xs text-gray-500 mt-0.5">commandes</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                <p className="text-2xl font-bold text-rose-600">{totalPots}</p>
                <p className="text-xs text-gray-500 mt-0.5">pots à préparer</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                <p className="text-2xl font-bold text-green-600">{checkedCount}/{totalItems}</p>
                <p className="text-xs text-gray-500 mt-0.5">références pickées</p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-500 font-medium">Statut :</span>
              {[
                { value: "all", label: "En cours (à préparer)" },
                { value: "pending", label: "En attente" },
                { value: "confirmed", label: "Confirmées" },
              ].map(f => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    statusFilter === f.value
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">Aucune commande à préparer</p>
              </div>
            ) : (
              <>
                {/* Progress */}
                {totalItems > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-600">Progression du picking</span>
                      <span className="text-xs text-gray-500">{checkedCount} / {totalItems} références</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className="bg-green-400 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${totalItems > 0 ? (checkedCount / totalItems) * 100 : 0}%` }}
                      />
                    </div>
                    {checkedCount === totalItems && totalItems > 0 && (
                      <p className="text-xs text-green-600 font-semibold mt-2 text-center">✅ Picking terminé !</p>
                    )}
                  </div>
                )}

                {/* Sections by type */}
                {Object.entries(SECTION_CONFIG).map(([sectionKey, cfg]) => {
                  const sectionData = groups[sectionKey];
                  const entries = Object.entries(sectionData);
                  if (entries.length === 0) return null;

                  const sectionTotal = entries.reduce((s, [, v]) => s + v.total, 0);
                  const sectionChecked = entries.filter(([k]) => checked[`${sectionKey}__${k}`]).length;
                  const isExpanded = expanded[sectionKey];

                  return (
                    <div key={sectionKey} className={`rounded-xl border ${cfg.color} overflow-hidden`}>
                      {/* Section header */}
                      <button
                        onClick={() => toggleSection(sectionKey)}
                        className={`w-full flex items-center justify-between px-4 py-3 ${cfg.headerColor} font-semibold text-sm`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{cfg.label}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${cfg.badgeColor}`}>
                            {sectionTotal} unités
                          </span>
                          <span className="text-xs opacity-70">
                            {sectionChecked}/{entries.length} pickées
                          </span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 opacity-60" /> : <ChevronDown className="w-4 h-4 opacity-60" />}
                      </button>

                      {/* Items */}
                      {isExpanded && (
                        <div className="divide-y divide-white/60">
                          {entries.map(([variantName, data]) => {
                            const checkKey = `${sectionKey}__${variantName}`;
                            const isDone = !!checked[checkKey];

                            return (
                              <div key={variantName} className={`p-4 transition ${isDone ? "opacity-50" : ""}`}>
                                <div className="flex items-start gap-3">
                                  <button onClick={() => toggleCheck(checkKey)} className="mt-0.5 flex-shrink-0">
                                    {isDone
                                      ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                                      : <Circle className="w-5 h-5 text-gray-300 hover:text-gray-400" />
                                    }
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`font-semibold text-sm ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}>
                                        {variantName}
                                      </span>
                                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badgeColor}`}>
                                        × {data.total}
                                      </span>
                                    </div>
                                    {/* Orders list */}
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                      {data.orders.map((order, idx) => (
                                        <a
                                          key={idx}
                                          href={createPageUrl(`AdminOrdersDetail?id=${order.id}`)}
                                          className="inline-flex items-center gap-1 text-xs bg-white/80 border border-gray-200 rounded-lg px-2 py-1 hover:bg-white transition text-gray-600"
                                        >
                                          <span className="font-medium">{order.customer_name}</span>
                                          <span className="text-gray-400">×{order.quantity || 1}</span>
                                          <StatusDot status={order.status} />
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Orders without options */}
                {(() => {
                  const noOpts = filteredOrders.filter(o => {
                    const opts = o.options_selected || {};
                    return !opts.seed_type && !opts.pot_type && !opts.ribbon_color;
                  });
                  if (noOpts.length === 0) return null;
                  return (
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                      <h3 className="text-sm font-semibold text-gray-600 mb-3">📋 Commandes sans options détaillées ({noOpts.length})</h3>
                      <div className="space-y-2">
                        {noOpts.map((o, idx) => (
                          <a
                            key={idx}
                            href={createPageUrl(`AdminOrdersDetail?id=${o.id}`)}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-800">{o.customer_name}</p>
                              <p className="text-xs text-gray-500">{o.product_name} × {o.quantity || 1}</p>
                            </div>
                            <StatusBadge status={o.status} />
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}

function StatusDot({ status }) {
  const colors = {
    pending: "bg-amber-400",
    confirmed: "bg-blue-400",
    shipped: "bg-purple-400",
    delivered: "bg-green-400",
    cancelled: "bg-red-400",
  };
  return <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors[status] || "bg-gray-300"}`} />;
}

function StatusBadge({ status }) {
  const cfg = {
    pending:   { label: "En attente",  cls: "bg-amber-100 text-amber-700" },
    confirmed: { label: "Confirmée",   cls: "bg-blue-100 text-blue-700" },
    shipped:   { label: "Expédiée",    cls: "bg-purple-100 text-purple-700" },
    delivered: { label: "Livrée",      cls: "bg-green-100 text-green-700" },
    cancelled: { label: "Annulée",     cls: "bg-red-100 text-red-700" },
  }[status] || { label: status, cls: "bg-gray-100 text-gray-600" };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}>{cfg.label}</span>;
}