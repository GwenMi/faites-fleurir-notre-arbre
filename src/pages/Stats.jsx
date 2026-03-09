import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ChevronLeft, Loader2, TrendingUp, ShoppingBag, Euro, Package } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from "recharts";

const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
const COLORS = ["#f43f5e", "#a78bfa", "#34d399", "#fb923c", "#60a5fa", "#f472b6", "#fbbf24", "#4ade80"];

export default function Stats() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Order.list("-created_date").then(data => {
      setOrders(data || []);
      setLoading(false);
    });
  }, []);

  const currentYear = new Date().getFullYear();

  // Monthly revenue & order count for current year
  const monthlyData = MONTHS.map((month, idx) => {
    const monthOrders = orders.filter(o => {
      const d = new Date(o.created_date);
      return d.getFullYear() === currentYear && d.getMonth() === idx && o.status !== "cancelled";
    });
    return {
      month,
      ca: parseFloat(monthOrders.reduce((sum, o) => sum + (o.total_price || 0), 0).toFixed(2)),
      commandes: monthOrders.length,
    };
  });

  // Orders per product (current year, non-cancelled)
  const productMap = {};
  orders
    .filter(o => new Date(o.created_date).getFullYear() === currentYear && o.status !== "cancelled")
    .forEach(o => {
      const name = o.product_name || "Inconnu";
      if (!productMap[name]) productMap[name] = { commandes: 0, ca: 0 };
      productMap[name].commandes += o.quantity || 1;
      productMap[name].ca += o.total_price || 0;
    });
  const productData = Object.entries(productMap)
    .map(([name, v]) => ({ name, commandes: v.commandes, ca: parseFloat(v.ca.toFixed(2)) }))
    .sort((a, b) => b.ca - a.ca);

  // KPIs
  const totalCA = monthlyData.reduce((s, m) => s + m.ca, 0);
  const totalOrders = monthlyData.reduce((s, m) => s + m.commandes, 0);
  const bestMonth = [...monthlyData].sort((a, b) => b.ca - a.ca)[0];
  const avgBasket = totalOrders > 0 ? (totalCA / totalOrders).toFixed(2) : "0.00";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
      <Loader2 className="w-8 h-8 animate-spin text-rose-300" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <a href={createPageUrl("AdminDashboard")} className="p-2 rounded-xl hover:bg-gray-50 transition">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </a>
          <TrendingUp className="w-5 h-5 text-rose-400" />
          <h1 className="font-bold text-gray-800">Statistiques {currentYear}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "CA annuel", value: `${totalCA.toFixed(2)} €`, icon: Euro, color: "text-rose-500", bg: "bg-rose-50" },
            { label: "Commandes", value: totalOrders, icon: ShoppingBag, color: "text-purple-500", bg: "bg-purple-50" },
            { label: "Panier moyen", value: `${avgBasket} €`, icon: Package, color: "text-amber-500", bg: "bg-amber-50" },
            { label: "Meilleur mois", value: bestMonth?.ca > 0 ? `${bestMonth.month} (${bestMonth.ca} €)` : "—", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2">
              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <p className="text-sm font-bold text-gray-800 leading-tight">{value}</p>
            </div>
          ))}
        </div>

        {/* Monthly revenue chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Euro className="w-4 h-4 text-rose-400" /> Chiffre d'affaires mensuel (€)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <Tooltip
                formatter={(v) => [`${v} €`, "CA"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #f3f4f6", fontSize: 12 }}
              />
              <Bar dataKey="ca" radius={[6, 6, 0, 0]} fill="#f43f5e" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly orders count chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-purple-400" /> Nombre de commandes par mois
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <Tooltip
                formatter={(v) => [v, "Commandes"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #f3f4f6", fontSize: 12 }}
              />
              <Line type="monotone" dataKey="commandes" stroke="#a78bfa" strokeWidth={2.5} dot={{ r: 4, fill: "#a78bfa" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders per product */}
        {productData.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" /> Ventes par produit
            </h2>
            <ResponsiveContainer width="100%" height={Math.max(200, productData.length * 48)}>
              <BarChart data={productData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: "#6b7280" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #f3f4f6", fontSize: 12 }}
                  formatter={(v, name) => [name === "ca" ? `${v} €` : `${v} unités`, name === "ca" ? "CA" : "Quantité"]}
                />
                <Legend formatter={v => v === "ca" ? "CA (€)" : "Qté vendue"} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="commandes" name="commandes" radius={[0, 4, 4, 0]} fill="#a78bfa" />
                <Bar dataKey="ca" name="ca" radius={[0, 4, 4, 0]} fill="#f43f5e" />
              </BarChart>
            </ResponsiveContainer>

            {/* Summary table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100">
                    <th className="pb-2 font-medium">Produit</th>
                    <th className="pb-2 font-medium text-right">Qté</th>
                    <th className="pb-2 font-medium text-right">CA</th>
                  </tr>
                </thead>
                <tbody>
                  {productData.map((p, i) => (
                    <tr key={p.name} className="border-b border-gray-50">
                      <td className="py-2 font-medium text-gray-700 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        {p.name}
                      </td>
                      <td className="py-2 text-right text-gray-600">{p.commandes}</td>
                      <td className="py-2 text-right font-semibold text-rose-500">{p.ca.toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {totalOrders === 0 && (
          <div className="text-center py-12 text-gray-400">
            <TrendingUp className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="text-sm">Aucune commande enregistrée pour {currentYear}.</p>
          </div>
        )}
      </div>
    </div>
  );
}