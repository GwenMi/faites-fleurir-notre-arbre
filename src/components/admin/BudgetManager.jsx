import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, CheckCircle2, Circle, TrendingUp, PiggyBank, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const CATEGORIES = [
  { value: "traiteur", label: "🍽️ Traiteur", color: "#f97316" },
  { value: "fleurs", label: "🌸 Fleurs", color: "#ec4899" },
  { value: "salle", label: "🏛️ Salle", color: "#8b5cf6" },
  { value: "musique", label: "🎵 Musique", color: "#06b6d4" },
  { value: "photo_video", label: "📸 Photo/Vidéo", color: "#3b82f6" },
  { value: "tenue", label: "👗 Tenue", color: "#d946ef" },
  { value: "decoration", label: "✨ Décoration", color: "#f59e0b" },
  { value: "faire_part", label: "💌 Faire-part", color: "#10b981" },
  { value: "transport", label: "🚗 Transport", color: "#64748b" },
  { value: "voyage_noces", label: "✈️ Voyage de noces", color: "#0ea5e9" },
  { value: "autre", label: "📦 Autre", color: "#a1a1aa" },
];

const getCat = (value) => CATEGORIES.find(c => c.value === value) || CATEGORIES[CATEGORIES.length - 1];
const fmt = (n) => `${(n || 0).toLocaleString("fr-FR")} €`;

function AddItemForm({ eventId, onAdded }) {
  const [form, setForm] = useState({ label: "", category: "traiteur", budget_amount: "", actual_amount: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.label || !form.budget_amount) { toast.error("Intitulé et budget requis"); return; }
    setSaving(true);
    await base44.entities.BudgetItem.create({
      event_id: eventId,
      label: form.label,
      category: form.category,
      budget_amount: parseFloat(form.budget_amount) || 0,
      actual_amount: parseFloat(form.actual_amount) || 0,
      notes: form.notes,
    });
    toast.success("Poste ajouté !");
    setForm({ label: "", category: "traiteur", budget_amount: "", actual_amount: "", notes: "" });
    setSaving(false);
    onAdded();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-purple-50 rounded-2xl border border-purple-100 p-4 space-y-3">
      <p className="text-sm font-bold text-purple-700">+ Nouveau poste</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Intitulé *</p>
          <Input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
            placeholder="Ex: Fleuriste Dupont" className="rounded-xl bg-white" />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Catégorie</p>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full rounded-xl border border-input px-3 py-2 text-sm bg-white">
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Budget prévu (€) *</p>
          <Input type="number" min="0" value={form.budget_amount} onChange={e => setForm(f => ({ ...f, budget_amount: e.target.value }))}
            placeholder="0" className="rounded-xl bg-white" />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Dépense réelle (€)</p>
          <Input type="number" min="0" value={form.actual_amount} onChange={e => setForm(f => ({ ...f, actual_amount: e.target.value }))}
            placeholder="0" className="rounded-xl bg-white" />
        </div>
      </div>
      <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
        placeholder="Notes (optionnel)" className="rounded-xl bg-white" />
      <Button type="submit" disabled={saving} className="rounded-xl bg-purple-500 hover:bg-purple-600 text-white">
        <Plus className="w-4 h-4 mr-1" /> Ajouter ce poste
      </Button>
    </form>
  );
}

function BudgetItemRow({ item, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [actual, setActual] = useState(String(item.actual_amount || 0));
  const cat = getCat(item.category);
  const over = (item.actual_amount || 0) > (item.budget_amount || 0);

  const saveActual = async () => {
    await base44.entities.BudgetItem.update(item.id, { actual_amount: parseFloat(actual) || 0 });
    setEditing(false);
    onUpdate();
  };

  const togglePaid = async () => {
    await base44.entities.BudgetItem.update(item.id, { paid: !item.paid });
    onUpdate();
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl border transition ${item.paid ? "bg-green-50/50 border-green-100" : over ? "bg-red-50/50 border-red-100" : "bg-white border-gray-100"}`}>
      <button onClick={togglePaid} className="flex-shrink-0 text-gray-300 hover:text-green-500 transition">
        {item.paid ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5" />}
      </button>
      <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ background: cat.color }} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${item.paid ? "line-through text-gray-400" : "text-gray-800"}`}>{item.label}</p>
        <p className="text-xs text-gray-400">{cat.label}</p>
        {item.notes && <p className="text-xs text-gray-400 italic truncate">{item.notes}</p>}
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs text-gray-400">Prévu : <span className="font-semibold text-gray-600">{fmt(item.budget_amount)}</span></p>
        {editing ? (
          <div className="flex items-center gap-1 mt-0.5">
            <Input type="number" value={actual} onChange={e => setActual(e.target.value)}
              className="h-6 w-20 text-xs rounded-lg px-1.5 py-0" onKeyDown={e => e.key === "Enter" && saveActual()} />
            <button onClick={saveActual} className="text-xs text-green-600 hover:underline">OK</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)}
            className={`text-xs font-bold mt-0.5 hover:underline ${over ? "text-red-500" : "text-gray-700"}`}>
            {over && <AlertTriangle className="w-3 h-3 inline mr-0.5 text-red-400" />}
            Réel : {fmt(item.actual_amount)}
          </button>
        )}
      </div>
      <button onClick={onDelete} className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function BudgetManager({ event }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showChart, setShowChart] = useState(true);

  useEffect(() => { loadData(); }, [event?.id]);

  const loadData = async () => {
    setLoading(true);
    const data = await base44.entities.BudgetItem.filter({ event_id: event.id });
    setItems(data || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.BudgetItem.delete(id);
    toast.success("Poste supprimé");
    loadData();
  };

  const totalBudget = items.reduce((s, i) => s + (i.budget_amount || 0), 0);
  const totalActual = items.reduce((s, i) => s + (i.actual_amount || 0), 0);
  const remaining = totalBudget - totalActual;
  const paidCount = items.filter(i => i.paid).length;

  // Chart data
  const barData = items.map(i => ({
    name: i.label.length > 12 ? i.label.slice(0, 12) + "…" : i.label,
    Prévu: i.budget_amount || 0,
    Réel: i.actual_amount || 0,
    fill: getCat(i.category).color,
  }));

  const pieData = CATEGORIES
    .map(cat => ({
      name: cat.label,
      value: items.filter(i => i.category === cat.value).reduce((s, i) => s + (i.budget_amount || 0), 0),
      color: cat.color,
    }))
    .filter(d => d.value > 0);

  const pieDataActual = CATEGORIES
    .map(cat => ({
      name: cat.label,
      value: items.filter(i => i.category === cat.value).reduce((s, i) => s + (i.actual_amount || 0), 0),
      color: cat.color,
    }))
    .filter(d => d.value > 0);

  if (loading) return <div className="py-10 text-center text-gray-400 text-sm">Chargement...</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-800">💰 Gestion du budget</h3>
          <p className="text-xs text-gray-400">{items.length} poste{items.length !== 1 ? "s" : ""} · {paidCount} réglé{paidCount !== 1 ? "s" : ""}</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(v => !v)} className="rounded-xl bg-purple-500 hover:bg-purple-600 text-white">
          <Plus className="w-4 h-4 mr-1" /> Ajouter
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-purple-50 rounded-2xl p-3 text-center border border-purple-100">
          <p className="text-lg font-bold text-purple-600">{fmt(totalBudget)}</p>
          <p className="text-xs text-gray-500">Budget total</p>
        </div>
        <div className={`rounded-2xl p-3 text-center border ${totalActual > totalBudget ? "bg-red-50 border-red-100" : "bg-amber-50 border-amber-100"}`}>
          <p className={`text-lg font-bold ${totalActual > totalBudget ? "text-red-500" : "text-amber-600"}`}>{fmt(totalActual)}</p>
          <p className="text-xs text-gray-500">Dépensé</p>
        </div>
        <div className={`rounded-2xl p-3 text-center border ${remaining < 0 ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"}`}>
          <p className={`text-lg font-bold ${remaining < 0 ? "text-red-500" : "text-green-600"}`}>{fmt(remaining)}</p>
          <p className="text-xs text-gray-500">{remaining < 0 ? "Dépassement" : "Restant"}</p>
        </div>
      </div>

      {/* Progress bar */}
      {totalBudget > 0 && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progression</span>
            <span>{Math.round((totalActual / totalBudget) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div className={`h-3 rounded-full transition-all ${totalActual > totalBudget ? "bg-red-400" : "bg-purple-400"}`}
              style={{ width: `${Math.min((totalActual / totalBudget) * 100, 100)}%` }} />
          </div>
        </div>
      )}

      {showAdd && (
        <AddItemForm eventId={event.id} onAdded={() => { loadData(); setShowAdd(false); }} />
      )}

      {/* Charts */}
      {items.length > 0 && (
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
          <button onClick={() => setShowChart(v => !v)} className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 hover:text-purple-600 transition">
            <TrendingUp className="w-4 h-4" /> Graphiques
            {showChart ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showChart && (
            <div className="space-y-6">
              {/* Bar chart : budget vs réel */}
              <div>
                <p className="text-xs text-gray-400 mb-2">Prévu vs Réel par poste</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={v => `${v.toLocaleString("fr-FR")} €`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Prévu" fill="#c084fc" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Réel" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Pie charts : répartition par catégorie */}
              {pieData.length > 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-400 mb-2 text-center">Budget prévu par catégorie</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75}
                          label={({ name, percent }) => percent > 0.04 ? `${name.split(" ")[0]} ${Math.round(percent * 100)}%` : null}
                          labelLine={false}>
                          {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip formatter={v => `${v.toLocaleString("fr-FR")} €`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {pieDataActual.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2 text-center">Dépenses réelles par catégorie</p>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={pieDataActual} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75}
                            label={({ name, percent }) => percent > 0.04 ? `${name.split(" ")[0]} ${Math.round(percent * 100)}%` : null}
                            labelLine={false}>
                            {pieDataActual.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                          <Tooltip formatter={v => `${v.toLocaleString("fr-FR")} €`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Items list */}
      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <PiggyBank className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Aucun poste de budget pour l'instant.</p>
          <button onClick={() => setShowAdd(true)} className="text-xs text-purple-500 hover:underline mt-1">Ajouter le premier poste</button>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <BudgetItemRow key={item.id} item={item} onUpdate={loadData} onDelete={() => handleDelete(item.id)} />
          ))}
        </div>
      )}

      {items.length > 0 && remaining < 0 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl p-3 text-sm text-red-600">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          Attention : le budget est dépassé de {fmt(Math.abs(remaining))}.
        </div>
      )}
    </div>
  );
}