import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, TrendingUp, Package, Zap, Tag, Plus, Edit2, Trash2,
  Copy, Check, AlertCircle, Shield, Users, ShoppingBag, BarChart2,
  Truck, ClipboardList, MessageSquare, FileText, Calendar, LogOut,
  ChevronRight, Home, Menu, X
} from "lucide-react";
import { toast } from "sonner";
import AdminGuard from "@/components/admin/AdminGuard";
import UserManagementPanel from "@/components/admin/UserManagementPanel";
import ProductManager from "@/components/admin/ProductManager";
import TeamManager from "@/components/admin/TeamManager";
import SupplierTab from "@/components/admin/SupplierTab";

// Sections internes au dashboard
const INTERNAL_SECTIONS = [
  { key: "stats", label: "Tableau de bord", icon: BarChart2, color: "text-rose-500" },
  { key: "products", label: "Produits", icon: ShoppingBag, color: "text-pink-500" },
  { key: "suppliers", label: "Fournisseurs", icon: Truck, color: "text-orange-500" },
  { key: "team", label: "Équipe", icon: Users, color: "text-violet-500" },
];

// Liens vers d'autres pages
const EXTERNAL_LINKS = [
  { label: "Commandes", icon: Package, color: "text-blue-500", href: createPageUrl("AdminOrders") },
  { label: "Expédition", icon: Truck, color: "text-cyan-500", href: "/AdminShipping" },
  { label: "Picking", icon: ClipboardList, color: "text-amber-500", href: createPageUrl("Picking") },
  { label: "CRM", icon: MessageSquare, color: "text-teal-500", href: createPageUrl("CRM") },
  { label: "Devis", icon: FileText, color: "text-purple-500", href: createPageUrl("Quotes") },
  { label: "Calendrier", icon: Calendar, color: "text-green-500", href: createPageUrl("CalendarView") },
  { label: "Super Panel", icon: Shield, color: "text-indigo-500", href: createPageUrl("AdminSuperPanel") },
  { label: "Prévisions", icon: TrendingUp, color: "text-gray-500", href: createPageUrl("Forecast") },
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("stats");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, monthlyData: [], conversionRate: 0 });
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoForm, setPromoForm] = useState({ code: "", discount_percent: 0, discount_amount: 0, active: true, valid_from: "", valid_until: "", max_uses: null, min_order_amount: null, applies_to: "all", description: "" });
  const [copiedCode, setCopiedCode] = useState(null);
  const [savingPromo, setSavingPromo] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const allOrders = await base44.entities.Order.list("-created_date", 1000);
      setOrders(allOrders);
      const allPromos = await base44.entities.Promo.list("-created_date", 100);
      setPromos(allPromos);
      calculateStats(allOrders);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const calculateStats = (ordersList) => {
    const paidOrders = ordersList.filter(o => o.payment_status === "paid");
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
    const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
    const monthlyMap = {};
    ordersList.forEach(order => {
      const date = new Date(order.created_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyMap[key]) monthlyMap[key] = { month: key, orders: 0, revenue: 0 };
      monthlyMap[key].orders += 1;
      if (order.payment_status === "paid") monthlyMap[key].revenue += order.total_price || 0;
    });
    setStats({
      totalRevenue: totalRevenue.toFixed(2),
      totalOrders: ordersList.length,
      avgOrderValue: avgOrderValue.toFixed(2),
      monthlyData: Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month)).slice(-12),
      conversionRate: ordersList.length > 0 ? (paidOrders.length / ordersList.length * 100).toFixed(1) : 0,
    });
  };

  const savePromo = async () => {
    if (!promoForm.code.trim()) { toast.error("Code requis"); return; }
    setSavingPromo(true);
    try {
      if (editingPromo) { await base44.entities.Promo.update(editingPromo.id, promoForm); toast.success("Code promo mis à jour ✓"); }
      else { await base44.entities.Promo.create(promoForm); toast.success("Code promo créé ✓"); }
      setShowPromoForm(false); setEditingPromo(null);
      setPromoForm({ code: "", discount_percent: 0, discount_amount: 0, active: true, valid_from: "", valid_until: "", max_uses: null, min_order_amount: null, applies_to: "all", description: "" });
      await loadData();
    } catch (e) { toast.error("Erreur sauvegarde"); }
    setSavingPromo(false);
  };

  const deletePromo = async (id) => {
    if (!window.confirm("Supprimer ce code ?")) return;
    await base44.entities.Promo.delete(id);
    toast.success("Supprimé ✓"); loadData();
  };

  const editPromo = (promo) => { setEditingPromo(promo); setPromoForm(promo); setShowPromoForm(true); };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code); setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000); toast.success("Copié ✓");
  };

  const currentSection = INTERNAL_SECTIONS.find(s => s.key === activeSection);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  );

  return (
    <AdminGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50 flex">

        {/* Overlay mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-200 z-30 flex flex-col
          transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}>
          {/* Logo */}
          <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800 text-sm">🌸 Fleurs de Fête</p>
              <p className="text-xs text-gray-400">Administration</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-gray-50">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Nav interne */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Dashboard</p>
            {INTERNAL_SECTIONS.map(section => {
              const Icon = section.icon;
              const active = activeSection === section.key;
              return (
                <button
                  key={section.key}
                  onClick={() => { setActiveSection(section.key); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-rose-50 text-rose-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-rose-500" : section.color}`} />
                  <span className="flex-1 text-left">{section.label}</span>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-rose-400" />}
                </button>
              );
            })}

            {/* Séparateur */}
            <div className="pt-3 pb-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Outils</p>
            </div>

            {EXTERNAL_LINKS.map(link => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-all"
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${link.color}`} />
                  <span>{link.label}</span>
                </a>
              );
            })}
          </div>

          {/* Déconnexion */}
          <div className="px-3 py-4 border-t border-gray-100">
            <button
              onClick={() => base44.auth.logout("/")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Topbar mobile */}
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-gray-50">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              {currentSection && (() => { const Icon = currentSection.icon; return <Icon className="w-4 h-4 text-rose-500" />; })()}
              <span className="font-semibold text-gray-800 text-sm">{currentSection?.label}</span>
            </div>
          </div>

          {/* Page header desktop */}
          <div className="hidden lg:block bg-white border-b border-gray-100 px-8 py-5">
            <div className="flex items-center gap-3">
              {currentSection && (() => { const Icon = currentSection.icon; return <Icon className="w-5 h-5 text-rose-500" />; })()}
              <h1 className="text-xl font-bold text-gray-800">{currentSection?.label}</h1>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 lg:p-8 overflow-auto">

            {/* Produits */}
            {activeSection === "products" && <ProductManager />}

            {/* Fournisseurs */}
            {activeSection === "suppliers" && <SupplierTab />}

            {/* Équipe */}
            {activeSection === "team" && <TeamManager />}

            {/* Stats */}
            {activeSection === "stats" && (
              <div className="space-y-8">
                {/* KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Revenu total", value: `${stats.totalRevenue}€`, sub: "Paiements confirmés", icon: TrendingUp, color: "text-rose-500" },
                    { label: "Commandes", value: stats.totalOrders, sub: "Tous statuts", icon: Package, color: "text-blue-500" },
                    { label: "Panier moyen", value: `${stats.avgOrderValue}€`, sub: "Commandes payées", icon: Zap, color: "text-amber-500" },
                    { label: "Taux conv.", value: `${stats.conversionRate}%`, sub: "Payées / total", icon: TrendingUp, color: "text-green-500" },
                  ].map(kpi => {
                    const Icon = kpi.icon;
                    return (
                      <div key={kpi.label} className="bg-white rounded-xl p-5 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{kpi.label}</p>
                          <Icon className={`w-4 h-4 ${kpi.color}`} />
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{kpi.value}</p>
                        <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h2 className="font-bold text-gray-800 mb-4 text-sm">Commandes par mois</h2>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={stats.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="orders" fill="#f472b6" name="Commandes" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h2 className="font-bold text-gray-800 mb-4 text-sm">Revenus par mois</h2>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={stats.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={v => `${v}€`} />
                        <Line type="monotone" dataKey="revenue" stroke="#ec4899" strokeWidth={2} dot={false} name="Revenu" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Users */}
                <UserManagementPanel />

                {/* Promos */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="w-5 h-5 text-purple-600" />
                      <h2 className="text-lg font-bold text-gray-800">Codes Promos</h2>
                      <Badge className="bg-purple-100 text-purple-700">{promos.length}</Badge>
                    </div>
                    <Button onClick={() => { setEditingPromo(null); setPromoForm({ code: "", discount_percent: 0, discount_amount: 0, active: true, valid_from: "", valid_until: "", max_uses: null, min_order_amount: null, applies_to: "all", description: "" }); setShowPromoForm(true); }} className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="w-4 h-4 mr-1" /> Nouveau code
                    </Button>
                  </div>

                  {showPromoForm && (
                    <div className="bg-purple-50 rounded-xl p-5 border border-purple-200 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Code *</label>
                          <Input value={promoForm.code} onChange={e => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })} placeholder="NOEL2024" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Réduction</label>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label className="text-xs text-gray-500 mb-1 block">%</label>
                              <Input type="number" min="0" max="100" value={promoForm.discount_percent} onChange={e => setPromoForm({ ...promoForm, discount_percent: parseFloat(e.target.value) })} placeholder="10" />
                            </div>
                            <div className="flex-1">
                              <label className="text-xs text-gray-500 mb-1 block">€</label>
                              <Input type="number" min="0" step="0.01" value={promoForm.discount_amount} onChange={e => setPromoForm({ ...promoForm, discount_amount: parseFloat(e.target.value) })} placeholder="5.00" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Valide du</label>
                          <Input type="date" value={promoForm.valid_from} onChange={e => setPromoForm({ ...promoForm, valid_from: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Valide jusqu'au</label>
                          <Input type="date" value={promoForm.valid_until} onChange={e => setPromoForm({ ...promoForm, valid_until: e.target.value })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Max utilisations</label>
                          <Input type="number" min="1" value={promoForm.max_uses || ""} onChange={e => setPromoForm({ ...promoForm, max_uses: e.target.value ? parseInt(e.target.value) : null })} placeholder="illimité" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Montant min (€)</label>
                          <Input type="number" min="0" step="0.01" value={promoForm.min_order_amount || ""} onChange={e => setPromoForm({ ...promoForm, min_order_amount: e.target.value ? parseFloat(e.target.value) : null })} placeholder="50.00" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">S'applique à</label>
                          <select value={promoForm.applies_to} onChange={e => setPromoForm({ ...promoForm, applies_to: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                            <option value="all">Tous les produits</option>
                            <option value="products">Produits seuls</option>
                            <option value="guest_packs">Packs invités seuls</option>
                          </select>
                        </div>
                        <div className="flex items-center mt-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={promoForm.active} onChange={e => setPromoForm({ ...promoForm, active: e.target.checked })} className="rounded border-gray-300" />
                            <span className="text-sm font-semibold text-gray-700">Actif</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Description interne</label>
                        <Input value={promoForm.description} onChange={e => setPromoForm({ ...promoForm, description: e.target.value })} placeholder="Ex: Promo Noël 2024" />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={savePromo} disabled={savingPromo} className="flex-1 bg-purple-600 hover:bg-purple-700">
                          {savingPromo && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                          {editingPromo ? "Mettre à jour" : "Créer"}
                        </Button>
                        <Button onClick={() => setShowPromoForm(false)} variant="outline" className="flex-1">Annuler</Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {promos.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-6">Aucun code promo</p>
                    ) : promos.map(promo => {
                      const isExpired = promo.valid_until && new Date(promo.valid_until) < new Date();
                      const isFull = promo.max_uses && promo.uses_count >= promo.max_uses;
                      return (
                        <div key={promo.id} className={`flex items-center justify-between p-4 rounded-xl border ${!promo.active ? "bg-gray-50 border-gray-200" : isExpired ? "bg-amber-50 border-amber-200" : isFull ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <code className="font-bold text-gray-800">{promo.code}</code>
                              {!promo.active && <Badge className="bg-gray-200 text-gray-600 text-xs">Inactif</Badge>}
                              {isExpired && <Badge className="bg-amber-200 text-amber-700 text-xs">Expiré</Badge>}
                              {isFull && <Badge className="bg-red-200 text-red-700 text-xs">Limite atteinte</Badge>}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                              {promo.discount_percent > 0 && <span>-{promo.discount_percent}%</span>}
                              {promo.discount_amount > 0 && <span>-{promo.discount_amount}€</span>}
                              {promo.max_uses && <span>• {promo.uses_count}/{promo.max_uses} utilisations</span>}
                              {promo.description && <span>• {promo.description}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-3">
                            <button onClick={() => copyCode(promo.code)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                              {copiedCode === promo.code ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
                            </button>
                            <button onClick={() => editPromo(promo)} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-600">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => deletePromo(promo.id)} className="p-2 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}