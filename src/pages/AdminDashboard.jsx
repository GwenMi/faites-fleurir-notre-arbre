import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Package, Zap, Tag, Plus, Edit2, Trash2, Copy, Check, AlertCircle, Shield, Users, ShoppingBag, BarChart2 } from "lucide-react";
import { toast } from "sonner";
import AdminGuard from "@/components/admin/AdminGuard";
import UserManagementPanel from "@/components/admin/UserManagementPanel";
import ProductManager from "@/components/admin/ProductManager";
import TeamManager from "@/components/admin/TeamManager";

const COLORS = ["#f472b6", "#ec4899", "#db2777", "#be185d"];

const TABS = [
  { key: "stats", label: "Stats & Promos", icon: BarChart2 },
  { key: "products", label: "Produits", icon: ShoppingBag },
  { key: "team", label: "Équipe", icon: Users },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("stats");
  const [orders, setOrders] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    monthlyData: [],
    conversionRate: 0
  });
  
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoForm, setPromoForm] = useState({
    code: "",
    discount_percent: 0,
    discount_amount: 0,
    active: true,
    valid_from: "",
    valid_until: "",
    max_uses: null,
    min_order_amount: null,
    applies_to: "all",
    description: ""
  });
  const [copiedCode, setCopiedCode] = useState(null);
  const [savingPromo, setSavingPromo] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allOrders = await base44.entities.Order.list("-created_date", 1000);
      setOrders(allOrders);
      
      const allPromos = await base44.entities.Promo.list("-created_date", 100);
      setPromos(allPromos);
      
      calculateStats(allOrders);
    } catch (e) {
      console.error("Erreur chargement:", e);
    }
    setLoading(false);
  };

  const calculateStats = (ordersList) => {
    const totalRevenue = ordersList
      .filter(o => o.payment_status === "paid")
      .reduce((sum, o) => sum + (o.total_price || 0), 0);

    const totalOrders = ordersList.length;
    const paidOrders = ordersList.filter(o => o.payment_status === "paid");
    const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

    // Monthly breakdown
    const monthlyMap = {};
    ordersList.forEach(order => {
      const date = new Date(order.created_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, orders: 0, revenue: 0 };
      }
      monthlyMap[monthKey].orders += 1;
      if (order.payment_status === "paid") {
        monthlyMap[monthKey].revenue += order.total_price || 0;
      }
    });

    const monthlyData = Object.values(monthlyMap)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months

    // Conversion rate (commandes payées / commandes totales)
    const conversionRate = totalOrders > 0 ? (paidOrders.length / totalOrders * 100).toFixed(1) : 0;

    setStats({
      totalRevenue: totalRevenue.toFixed(2),
      totalOrders,
      avgOrderValue: avgOrderValue.toFixed(2),
      monthlyData,
      conversionRate
    });
  };

  const savePromo = async () => {
    if (!promoForm.code.trim()) {
      toast.error("Code requis");
      return;
    }

    setSavingPromo(true);
    try {
      if (editingPromo) {
        await base44.entities.Promo.update(editingPromo.id, promoForm);
        toast.success("Code promo mis à jour ✓");
      } else {
        await base44.entities.Promo.create(promoForm);
        toast.success("Code promo créé ✓");
      }
      
      setShowPromoForm(false);
      setEditingPromo(null);
      setPromoForm({
        code: "",
        discount_percent: 0,
        discount_amount: 0,
        active: true,
        valid_from: "",
        valid_until: "",
        max_uses: null,
        min_order_amount: null,
        applies_to: "all",
        description: ""
      });
      
      await loadData();
    } catch (e) {
      toast.error("Erreur sauvegarde");
    }
    setSavingPromo(false);
  };

  const deletePromo = async (id) => {
    if (!window.confirm("Supprimer ce code ?")) return;
    try {
      await base44.entities.Promo.delete(id);
      toast.success("Code promo supprimé ✓");
      loadData();
    } catch (e) {
      toast.error("Erreur suppression");
    }
  };

  const editPromo = (promo) => {
    setEditingPromo(promo);
    setPromoForm(promo);
    setShowPromoForm(true);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success("Code copié ✓");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <AdminGuard allowedRoles={["admin"]}>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🌸 Admin Fleurs de Fête</h1>
              <p className="text-gray-500 mt-0.5 text-sm">Tableau de bord de gestion</p>
            </div>
            <div className="flex items-center gap-2">
              <a href={createPageUrl("AdminOrders")} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold transition">
                <Package className="w-4 h-4" /> Commandes
              </a>
              <a href={createPageUrl("AdminSuperPanel")} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition">
                <Shield className="w-4 h-4" /> Super Panel
              </a>
              <a href={createPageUrl("Forecast")} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold transition">
                <TrendingUp className="w-4 h-4" /> Prévisions
              </a>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition ${active ? "border-rose-400 text-rose-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                  <Icon className="w-4 h-4" /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Onglet Produits */}
        {activeTab === "products" && <ProductManager />}

        {/* Onglet Équipe */}
        {activeTab === "team" && <TeamManager />}

        {activeTab !== "products" && activeTab !== "team" && <>
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500 font-semibold">REVENU TOTAL</p>
              <TrendingUp className="w-5 h-5 text-rose-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.totalRevenue}€</p>
            <p className="text-xs text-gray-400 mt-2">Paiements confirmés</p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500 font-semibold">COMMANDES</p>
              <Package className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.totalOrders}</p>
            <p className="text-xs text-gray-400 mt-2">Total tous statuts</p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500 font-semibold">PANIER MOYEN</p>
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.avgOrderValue}€</p>
            <p className="text-xs text-gray-400 mt-2">Commandes payées</p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500 font-semibold">TAUX CONV.</p>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.conversionRate}%</p>
            <p className="text-xs text-gray-400 mt-2">Commandes payées / total</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Commandes par mois */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="font-bold text-gray-800 mb-4">Commandes par mois</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#f472b6" name="Commandes" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenus par mois */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="font-bold text-gray-800 mb-4">Revenus par mois</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={value => `${value}€`} />
                <Line type="monotone" dataKey="revenue" stroke="#ec4899" strokeWidth={2} name="Revenu" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Management */}
        <UserManagementPanel />

        {/* Gestion Promos */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-800">Codes Promos</h2>
              <Badge className="bg-purple-100 text-purple-700">{promos.length}</Badge>
            </div>
            <Button onClick={() => { setEditingPromo(null); setPromoForm({
              code: "",
              discount_percent: 0,
              discount_amount: 0,
              active: true,
              valid_from: "",
              valid_until: "",
              max_uses: null,
              min_order_amount: null,
              applies_to: "all",
              description: ""
            }); setShowPromoForm(true); }} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" /> Nouveau code
            </Button>
          </div>

          {/* Promo Form */}
          {showPromoForm && (
            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Code *</label>
                  <Input
                    value={promoForm.code}
                    onChange={e => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                    placeholder="NOEL2024"
                    className="uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Type réduction</label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-gray-600 mb-1 block">% discount</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={promoForm.discount_percent}
                        onChange={e => setPromoForm({ ...promoForm, discount_percent: parseFloat(e.target.value) })}
                        placeholder="10"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-600 mb-1 block">ou montant (€)</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={promoForm.discount_amount}
                        onChange={e => setPromoForm({ ...promoForm, discount_amount: parseFloat(e.target.value) })}
                        placeholder="5.00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Valide du</label>
                  <Input
                    type="date"
                    value={promoForm.valid_from}
                    onChange={e => setPromoForm({ ...promoForm, valid_from: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Valide jusqu'au</label>
                  <Input
                    type="date"
                    value={promoForm.valid_until}
                    onChange={e => setPromoForm({ ...promoForm, valid_until: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Max utilisations (vide = illimité)</label>
                  <Input
                    type="number"
                    min="1"
                    value={promoForm.max_uses || ""}
                    onChange={e => setPromoForm({ ...promoForm, max_uses: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Montant min commande (€)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={promoForm.min_order_amount || ""}
                    onChange={e => setPromoForm({ ...promoForm, min_order_amount: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="50.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">S'applique à</label>
                  <select
                    value={promoForm.applies_to}
                    onChange={e => setPromoForm({ ...promoForm, applies_to: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">Tous les produits</option>
                    <option value="products">Produits seuls</option>
                    <option value="guest_packs">Packs invités seuls</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      checked={promoForm.active}
                      onChange={e => setPromoForm({ ...promoForm, active: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-semibold text-gray-700">Actif</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description interne</label>
                <Input
                  value={promoForm.description}
                  onChange={e => setPromoForm({ ...promoForm, description: e.target.value })}
                  placeholder="Ex: Promo Noël 2024"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={savePromo} disabled={savingPromo} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  {savingPromo ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingPromo ? "Mettre à jour" : "Créer"}
                </Button>
                <Button onClick={() => setShowPromoForm(false)} variant="outline" className="flex-1">
                  Annuler
                </Button>
              </div>
            </div>
          )}

          {/* Promos List */}
          <div className="space-y-2">
            {promos.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">Aucun code promo créé</p>
            ) : (
              promos.map(promo => {
                const isExpired = promo.valid_until && new Date(promo.valid_until) < new Date();
                const isFull = promo.max_uses && promo.uses_count >= promo.max_uses;
                
                return (
                  <div key={promo.id} className={`flex items-center justify-between p-4 rounded-lg border ${
                    !promo.active ? "bg-gray-50 border-gray-200" : isExpired ? "bg-amber-50 border-amber-200" : isFull ? "bg-red-50 border-red-200" : "bg-white border-gray-200"
                  }`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <code className="font-bold text-lg text-gray-800">{promo.code}</code>
                        {!promo.active && <Badge className="bg-gray-200 text-gray-700">Inactif</Badge>}
                        {isExpired && <Badge className="bg-amber-200 text-amber-700">Expiré</Badge>}
                        {isFull && <Badge className="bg-red-200 text-red-700">Limité atteint</Badge>}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                        {promo.discount_percent > 0 && <span>-{promo.discount_percent}%</span>}
                        {promo.discount_amount > 0 && <span>-{promo.discount_amount}€</span>}
                        {promo.max_uses && <span>•  {promo.uses_count}/{promo.max_uses} utilisations</span>}
                        {promo.min_order_amount && <span>• Minimum {promo.min_order_amount}€</span>}
                        {promo.description && <span className="text-gray-500">• {promo.description}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyCode(promo.code)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                      >
                        {copiedCode === promo.code ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => editPromo(promo)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deletePromo(promo.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        </>}
      </div>
    </div>
    </AdminGuard>
  );
}