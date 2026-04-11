import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, TrendingUp, ShoppingBag, Star, Package } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { format, parseISO, startOfMonth, subMonths } from "date-fns";
import { fr } from "date-fns/locale";

const COLORS = ["#f43f5e", "#fb923c", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa"];

const CATEGORY_LABELS = {
  kit_compose: "Kit à composer",
  kit_pret: "Kit prêt à offrir",
  kit_entreprise_standard: 'Pack Standard "Bureau"',
  kit_entreprise_premium: 'Pack Premium "Moniteur"',
  kit_naturel_essentiel: "Kit Naturel Essentiel",
  kit_naturel_douceur: "Kit Naturel Douceur",
};

export default function ActivityDashboard({ userEmail }) {
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [o, r] = await Promise.all([
        base44.entities.Order.filter({ customer_email: userEmail }),
        base44.entities.Review.filter({ email: userEmail }),
      ]);
      setOrders(o || []);
      setReviews(r || []);
      setLoading(false);
    };
    load();
  }, [userEmail]);

  // Orders over the last 6 months
  const ordersOverTime = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(), 5 - i);
      return { key: format(d, "yyyy-MM"), label: format(d, "MMM yy", { locale: fr }), total: 0, amount: 0 };
    });
    orders.forEach(o => {
      if (!o.created_date) return;
      const key = format(parseISO(o.created_date), "yyyy-MM");
      const bucket = months.find(m => m.key === key);
      if (bucket) { bucket.total += 1; bucket.amount += o.total_price || 0; }
    });
    return months;
  }, [orders]);

  // Top product categories
  const categoryData = useMemo(() => {
    const counts = {};
    orders.forEach(o => {
      const id = o.product_id || "autre";
      counts[id] = (counts[id] || 0) + (o.quantity || 1);
    });
    return Object.entries(counts)
      .map(([id, qty]) => ({ name: CATEGORY_LABELS[id] || id, value: qty }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [orders]);

  // Status breakdown
  const statusData = useMemo(() => {
    const map = { pending: "En attente", confirmed: "Confirmée", shipped: "Expédiée", delivered: "Livrée", cancelled: "Annulée" };
    const counts = {};
    orders.forEach(o => { const s = map[o.status] || o.status; counts[s] = (counts[s] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const totalSpent = orders.reduce((s, o) => s + (o.total_price || 0), 0);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : null;

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-rose-300" />
    </div>
  );

  if (orders.length === 0) return (
    <div className="text-center py-16 text-gray-400">
      <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-200" />
      <p className="font-sans-shop text-sm">Aucune activité à afficher pour le moment.</p>
      <p className="text-xs mt-1">Vos statistiques apparaîtront après votre première commande.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: ShoppingBag, label: "Commandes", value: orders.length, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-100" },
          { icon: Package, label: "Dépenses totales", value: `${totalSpent.toFixed(0)} €`, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
          { icon: TrendingUp, label: "Ce mois-ci", value: ordersOverTime[5]?.total || 0, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
          { icon: Star, label: "Note moyenne", value: avgRating ? `${avgRating} ★` : "—", color: "text-violet-500", bg: "bg-violet-50", border: "border-violet-100" },
        ].map(({ icon: Icon, label, value, color, bg, border }) => (
          <div key={label} className={`${bg} border ${border} rounded-2xl p-4 text-center`}>
            <Icon className={`w-5 h-5 mx-auto mb-1.5 ${color}`} />
            <p className={`text-xl font-bold font-sans-shop ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Commandes dans le temps */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-sans-shop font-semibold text-gray-700 text-sm mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-rose-400" /> Commandes sur 6 mois
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={ordersOverTime} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #f3f4f6", fontSize: 12 }}
              formatter={(v) => [v, "Commandes"]} labelStyle={{ fontWeight: 600 }} />
            <Area type="monotone" dataKey="total" stroke="#f43f5e" strokeWidth={2.5} fill="url(#colorOrders)" dot={{ r: 4, fill: "#f43f5e" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Montant dépensé */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-sans-shop font-semibold text-gray-700 text-sm mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-amber-400" /> Dépenses par mois (€)
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={ordersOverTime} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #f3f4f6", fontSize: 12 }}
              formatter={(v) => [`${v.toFixed(2)} €`, "Total"]} />
            <Bar dataKey="amount" fill="#fbbf24" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Top produits */}
        {categoryData.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-sans-shop font-semibold text-gray-700 text-sm mb-4">🏆 Produits commandés</h3>
            <div className="space-y-3">
              {categoryData.map((cat, i) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 truncate max-w-[140px]">{cat.name}</span>
                    <span className="text-xs font-bold text-gray-700">{cat.value}×</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${(cat.value / categoryData[0].value) * 100}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statuts */}
        {statusData.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-sans-shop font-semibold text-gray-700 text-sm mb-4">📦 Statuts des commandes</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "12px", fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}