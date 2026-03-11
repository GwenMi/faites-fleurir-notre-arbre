import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  ChevronLeft, Loader2, TrendingUp, TrendingDown, Minus,
  Package, AlertTriangle, CheckCircle2, RefreshCw, Info
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";
import AdminGuard from "@/components/admin/AdminGuard";

const MONTHS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
const MONTHS_FULL = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

// Simple weighted moving average forecast
function forecast(historicalValues, monthsAhead = 3) {
  if (historicalValues.length === 0) return Array(monthsAhead).fill(0);
  const weights = historicalValues.map((_, i) => i + 1);
  const totalWeight = weights.reduce((s, w) => s + w, 0);
  const baseValue = historicalValues.reduce((s, v, i) => s + v * weights[i], 0) / totalWeight;
  // Add slight growth trend
  const trend = historicalValues.length >= 2
    ? (historicalValues[historicalValues.length - 1] - historicalValues[0]) / historicalValues.length
    : 0;
  return Array.from({ length: monthsAhead }, (_, i) =>
    Math.max(0, Math.round(baseValue + trend * (i + 1)))
  );
}

export default function Forecast() {
  const [orders, setOrders] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Order.list("-created_date", 500),
      base44.entities.Event.list("-created_date", 200),
    ]).then(([ord, ev]) => {
      setOrders(ord || []);
      setEvents(ev || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <AdminGuard allowedRoles={["admin", "manager"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-rose-300" />
        </div>
      </AdminGuard>
    );
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Build last 6 months of order data
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(currentYear, currentMonth - 5 + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const getMonthKey = (y, m) => `${y}-${String(m + 1).padStart(2, "0")}`;

  // Orders by month
  const ordersByMonth = {};
  const revenueByMonth = {};
  orders.forEach(o => {
    const d = new Date(o.created_date);
    const key = getMonthKey(d.getFullYear(), d.getMonth());
    if (!ordersByMonth[key]) { ordersByMonth[key] = 0; revenueByMonth[key] = 0; }
    ordersByMonth[key]++;
    revenueByMonth[key] += o.total_price || 0;
  });

  const historicalCounts = last6Months.map(({ year, month }) => ordersByMonth[getMonthKey(year, month)] || 0);
  const historicalRevenue = last6Months.map(({ year, month }) => revenueByMonth[getMonthKey(year, month)] || 0);

  // Forecast next 3 months
  const forecastCounts = forecast(historicalCounts, 3);
  const forecastRevenue = forecast(historicalRevenue, 3);

  const next3Months = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(currentYear, currentMonth + 1 + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // Chart data: historical + forecast
  const chartData = [
    ...last6Months.map(({ year, month }, i) => ({
      name: MONTHS_FR[month],
      commandes: historicalCounts[i],
      revenuK: Math.round(historicalRevenue[i]),
      type: "historique",
    })),
    ...next3Months.map(({ month }, i) => ({
      name: MONTHS_FR[month] + " *",
      commandes: forecastCounts[i],
      revenuK: Math.round(forecastRevenue[i]),
      type: "prévision",
    })),
  ];

  // Events by month (to detect peaks)
  const eventsByMonth = {};
  events.forEach(ev => {
    if (!ev.event_date) return;
    const d = new Date(ev.event_date);
    const key = getMonthKey(d.getFullYear(), d.getMonth());
    eventsByMonth[key] = (eventsByMonth[key] || 0) + 1;
  });

  // Upcoming event density for next 3 months
  const upcomingEventDensity = next3Months.map(({ year, month }) => eventsByMonth[getMonthKey(year, month)] || 0);

  // Options aggregation for stock forecast
  const allOpts = orders.map(o => ({ ...(o.options_selected || {}), qty: o.quantity || 1 }));

  const countOpt = (field) => {
    const map = {};
    allOpts.forEach(o => {
      if (o[field]) {
        map[o[field]] = (map[o[field]] || 0) + o.qty;
      }
    });
    return map;
  };

  const seedCounts = countOpt("seed_type");
  const potCounts = countOpt("pot_type");
  const ribbonCounts = countOpt("ribbon_color");

  // Avg monthly usage ratio per variant
  const avgMonthlyOrders = historicalCounts.reduce((s, v) => s + v, 0) / (historicalCounts.filter(v => v > 0).length || 1);

  const projectStock = (countMap, forecastTotal) => {
    const total = Object.values(countMap).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => {
        const ratio = count / total;
        const needed = Math.ceil(ratio * forecastTotal);
        return { name, ratio, needed, historical: count };
      });
  };

  const totalForecast3M = forecastCounts.reduce((s, v) => s + v, 0);
  const avgPotsPerOrder = orders.length > 0
    ? orders.reduce((s, o) => s + (o.quantity || 1), 0) / orders.length
    : 1;
  const totalPotsForecast = Math.ceil(totalForecast3M * avgPotsPerOrder);

  const seedForecast = projectStock(seedCounts, totalPotsForecast);
  const potForecast = projectStock(potCounts, totalPotsForecast);
  const ribbonForecast = projectStock(ribbonCounts, totalPotsForecast);

  // Peak detection
  const maxHistorical = Math.max(...historicalCounts, 1);
  const peakThreshold = maxHistorical * 0.8;

  const getPeakLevel = (count) => {
    const ratio = count / maxHistorical;
    if (ratio >= 0.9) return { label: "Pic fort", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: AlertTriangle };
    if (ratio >= 0.6) return { label: "Activité soutenue", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: TrendingUp };
    if (ratio >= 0.3) return { label: "Activité normale", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: Minus };
    return { label: "Faible activité", color: "text-gray-500", bg: "bg-gray-50 border-gray-200", icon: TrendingDown };
  };

  // Seasonal patterns (same months last year)
  const seasonalData = next3Months.map(({ month }) => {
    const lastYearKey = getMonthKey(currentYear - 1, month);
    return ordersByMonth[lastYearKey] || 0;
  });

  const combinedForecast = next3Months.map((_, i) => {
    const wma = forecastCounts[i];
    const seasonal = seasonalData[i];
    const eventBoost = upcomingEventDensity[i] * 1.5;
    return Math.round((wma * 0.6 + seasonal * 0.3 + eventBoost * 0.1));
  });

  return (
    <AdminGuard allowedRoles={["admin", "manager"]}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <a href={createPageUrl("AdminDashboard")} className="p-2 rounded-lg hover:bg-gray-100">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </a>
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            <div>
              <h1 className="font-bold text-gray-800 text-lg">Prévisions d'activité</h1>
              <p className="text-xs text-gray-500">Basé sur l'historique · Horizon 3 mois</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 space-y-6">

          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {next3Months.map(({ month }, i) => {
              const count = combinedForecast[i];
              const level = getPeakLevel(count);
              const Icon = level.icon;
              return (
                <div key={i} className={`rounded-xl border p-4 ${level.bg}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-500">{MONTHS_FULL[month]}</span>
                    <Icon className={`w-4 h-4 ${level.color}`} />
                  </div>
                  <p className={`text-2xl font-bold ${level.color}`}>{count}</p>
                  <p className="text-xs text-gray-500 mt-0.5">commandes prévues</p>
                  <span className={`text-xs font-medium ${level.color} mt-1 block`}>{level.label}</span>
                </div>
              );
            })}
            <div className="rounded-xl border bg-indigo-50 border-indigo-200 p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-500">3 mois</span>
                <Package className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-indigo-700">{totalPotsForecast}</p>
              <p className="text-xs text-gray-500 mt-0.5">pots à produire</p>
            </div>
          </div>

          {/* Activity chart */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">Historique & Prévisions commandes</h2>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-400 inline-block" /> Historique</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-200 inline-block border border-dashed border-indigo-400" /> Prévision</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "12px" }}
                  formatter={(val, name) => [val, name === "commandes" ? "Commandes" : "Revenu (€)"]}
                />
                <ReferenceLine x={MONTHS_FR[currentMonth]} stroke="#e2e8f0" strokeDasharray="4 4" />
                <Bar dataKey="commandes" fill="#818cf8"
                  radius={[6, 6, 0, 0]}
                  fillOpacity={1}
                  label={false}
                  cell={chartData.map((entry) =>
                    entry.type === "prévision"
                      ? { fill: "#c7d2fe", stroke: "#818cf8", strokeDasharray: "4 4", strokeWidth: 1 }
                      : { fill: "#818cf8" }
                  )}
                />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-400 text-center mt-2">* Mois avec astérisque = prévision · Algorithme : moyenne mobile pondérée + saisonnalité</p>
          </div>

          {/* Monthly forecast detail */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-800 mb-4">Détail des 3 prochains mois</h2>
            <div className="space-y-4">
              {next3Months.map(({ month, year }, i) => {
                const level = getPeakLevel(combinedForecast[i]);
                const Icon = level.icon;
                const pots = Math.ceil(combinedForecast[i] * avgPotsPerOrder);
                const lastYearSame = seasonalData[i];
                const eventsMonth = upcomingEventDensity[i];
                return (
                  <div key={i} className={`rounded-xl border p-4 ${level.bg}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${level.color} bg-white`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{MONTHS_FULL[month]} {year}</h3>
                          <p className={`text-sm font-semibold ${level.color}`}>{level.label}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${level.color}`}>{combinedForecast[i]}</p>
                        <p className="text-xs text-gray-500">commandes</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <div className="bg-white/70 rounded-lg p-2.5 text-center">
                        <p className="text-lg font-bold text-gray-800">{pots}</p>
                        <p className="text-xs text-gray-500">pots</p>
                      </div>
                      <div className="bg-white/70 rounded-lg p-2.5 text-center">
                        <p className="text-lg font-bold text-gray-800">{lastYearSame}</p>
                        <p className="text-xs text-gray-500">N-1</p>
                      </div>
                      <div className="bg-white/70 rounded-lg p-2.5 text-center">
                        <p className="text-lg font-bold text-gray-800">{eventsMonth}</p>
                        <p className="text-xs text-gray-500">événements</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stock needs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StockSection
              title="🌱 Graines"
              items={seedForecast}
              color="green"
              total={totalPotsForecast}
            />
            <StockSection
              title="🫙 Pots"
              items={potForecast}
              color="amber"
              total={totalPotsForecast}
            />
            <StockSection
              title="🎀 Rubans"
              items={ribbonForecast}
              color="rose"
              total={totalPotsForecast}
            />
          </div>

          {/* Methodology note */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 space-y-1">
              <p className="font-semibold">Méthodologie des prévisions</p>
              <p>Les prévisions combinent : <strong>Moyenne mobile pondérée</strong> des 6 derniers mois (60%) + <strong>Saisonnalité N-1</strong> (30%) + <strong>Densité d'événements planifiés</strong> (10%).</p>
              <p>Les besoins en stock sont estimés proportionnellement aux choix des commandes historiques.</p>
            </div>
          </div>

        </div>
      </div>
    </AdminGuard>
  );
}

function StockSection({ title, items, color, total }) {
  const colorMap = {
    green: { bar: "bg-green-400", bg: "bg-green-50 border-green-100", header: "text-green-800", badge: "bg-green-100 text-green-700" },
    amber: { bar: "bg-amber-400", bg: "bg-amber-50 border-amber-100", header: "text-amber-800", badge: "bg-amber-100 text-amber-700" },
    rose:  { bar: "bg-rose-400",  bg: "bg-rose-50 border-rose-100",   header: "text-rose-800",  badge: "bg-rose-100 text-rose-700" },
  };
  const c = colorMap[color];

  if (items.length === 0) {
    return (
      <div className={`rounded-xl border p-4 ${c.bg}`}>
        <h3 className={`font-bold text-sm mb-3 ${c.header}`}>{title}</h3>
        <p className="text-xs text-gray-400 text-center py-4">Aucune donnée historique</p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-4 ${c.bg}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-bold text-sm ${c.header}`}>{title}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c.badge}`}>
          {items.reduce((s, i) => s + i.needed, 0)} total
        </span>
      </div>
      <div className="space-y-3">
        {items.slice(0, 5).map((item) => (
          <div key={item.name}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-700 font-medium truncate flex-1 mr-2">{item.name}</span>
              <span className={`font-bold ${c.header}`}>{item.needed}</span>
            </div>
            <div className="w-full bg-white/60 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full ${c.bar}`} style={{ width: `${Math.min(100, item.ratio * 100)}%` }} />
            </div>
          </div>
        ))}
        {items.length > 5 && (
          <p className="text-xs text-gray-400 text-center">+{items.length - 5} variantes</p>
        )}
      </div>
    </div>
  );
}