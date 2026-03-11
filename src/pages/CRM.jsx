import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import AdminGuard from "@/components/admin/AdminGuard";
import { ChevronLeft, Loader2, Users, Plus, X, Phone, Mail, MessageSquare, Calendar, CheckCircle2, Clock, Search, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const TYPE_CONFIG = {
  note:      { label: "Note", icon: MessageSquare, color: "bg-gray-100 text-gray-600" },
  call:      { label: "Appel", icon: Phone, color: "bg-blue-100 text-blue-600" },
  email:     { label: "Email", icon: Mail, color: "bg-purple-100 text-purple-600" },
  meeting:   { label: "RDV", icon: Users, color: "bg-amber-100 text-amber-700" },
  follow_up: { label: "Relance", icon: Clock, color: "bg-rose-100 text-rose-600" },
};

function NoteForm({ customer, onSave, onCancel }) {
  const [form, setForm] = useState({ type: "note", content: "", follow_up_date: "" });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.content.trim()) { toast.error("Le contenu est requis"); return; }
    setSaving(true);
    await base44.entities.CustomerNote.create({
      customer_email: customer.email,
      customer_name: customer.name,
      order_id: customer.order_id || "",
      type: form.type,
      content: form.content,
      follow_up_date: form.follow_up_date || null,
      done: false,
    });
    toast.success("Note enregistrée ✓");
    setSaving(false);
    onSave();
  };

  return (
    <div className="bg-indigo-50 rounded-xl p-4 space-y-3 mt-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-indigo-700">Nouvelle interaction</p>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {Object.entries(TYPE_CONFIG).map(([k, cfg]) => {
          const Icon = cfg.icon;
          return (
            <button
              key={k}
              onClick={() => setForm(f => ({ ...f, type: k }))}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs font-medium transition
                ${form.type === k ? "border-indigo-400 bg-indigo-100 text-indigo-700" : "border-gray-200 text-gray-500 bg-white hover:border-gray-300"}`}
            >
              <Icon className="w-3 h-3" /> {cfg.label}
            </button>
          );
        })}
      </div>
      <textarea
        rows={3}
        value={form.content}
        onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
        placeholder="Détails de l'interaction…"
        className="w-full text-sm border border-indigo-200 rounded-xl px-3 py-2 resize-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
      <div>
        <label className="text-xs text-indigo-600 mb-1 block">Date de relance (optionnel)</label>
        <input
          type="date"
          value={form.follow_up_date}
          onChange={e => setForm(f => ({ ...f, follow_up_date: e.target.value }))}
          className="text-sm border border-indigo-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>
      <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white h-9 text-sm">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer"}
      </Button>
    </div>
  );
}

function CustomerCard({ customer, notes, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const pendingFollowUps = notes.filter(n => n.follow_up_date && !n.done && new Date(n.follow_up_date) >= new Date(new Date().toDateString()));
  const overdueFollowUps = notes.filter(n => n.follow_up_date && !n.done && new Date(n.follow_up_date) < new Date(new Date().toDateString()));

  const toggleDone = async (note) => {
    await base44.entities.CustomerNote.update(note.id, { done: !note.done });
    onRefresh();
  };

  const deleteNote = async (note) => {
    await base44.entities.CustomerNote.delete(note.id);
    toast.success("Note supprimée");
    onRefresh();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div
        className="flex items-start justify-between gap-3 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-gray-800">{customer.name}</p>
            {overdueFollowUps.length > 0 && (
              <Badge className="bg-red-100 text-red-600 text-xs">⚠ {overdueFollowUps.length} en retard</Badge>
            )}
            {pendingFollowUps.length > 0 && (
              <Badge className="bg-amber-100 text-amber-700 text-xs">🕐 {pendingFollowUps.length} relance{pendingFollowUps.length > 1 ? "s" : ""}</Badge>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{customer.email}</p>
          <p className="text-xs text-gray-400">{notes.length} interaction{notes.length > 1 ? "s" : ""}</p>
        </div>
        <Button size="sm" variant="ghost" className="text-xs text-indigo-500 hover:bg-indigo-50 flex-shrink-0">
          {expanded ? "Réduire" : "Voir"}
        </Button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-2">
          {/* Follow-up alerts */}
          {overdueFollowUps.map(n => (
            <div key={n.id} className="flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-200">
              <Clock className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <span className="text-xs text-red-700 flex-1 truncate">Relance en retard : {n.content.slice(0, 50)}</span>
              <button onClick={() => toggleDone(n)} className="text-xs text-green-600 font-semibold hover:underline flex-shrink-0">✓ Fait</button>
            </div>
          ))}

          {/* Notes history */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notes.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).map(note => {
              const cfg = TYPE_CONFIG[note.type] || TYPE_CONFIG.note;
              const Icon = cfg.icon;
              return (
                <div key={note.id} className={`flex items-start gap-2.5 p-3 rounded-xl ${note.done ? "opacity-50" : "bg-gray-50"}`}>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-gray-600">{cfg.label}</span>
                      {note.follow_up_date && !note.done && (
                        <span className="text-xs text-amber-600">📅 Relance {new Date(note.follow_up_date).toLocaleDateString("fr-FR")}</span>
                      )}
                      {note.done && <span className="text-xs text-green-500">✓ Fait</span>}
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 whitespace-pre-wrap">{note.content}</p>
                    <p className="text-xs text-gray-300 mt-1">{new Date(note.created_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {!note.done && <button onClick={() => toggleDone(note)} className="text-green-400 hover:text-green-600 p-1"><CheckCircle2 className="w-3.5 h-3.5" /></button>}
                    <button onClick={() => deleteNote(note)} className="text-gray-300 hover:text-red-400 p-1"><X className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              );
            })}
          </div>

          {showForm ? (
            <NoteForm customer={customer} onSave={() => { setShowForm(false); onRefresh(); }} onCancel={() => setShowForm(false)} />
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 text-xs text-indigo-600 font-semibold py-2 rounded-xl border border-dashed border-indigo-200 hover:bg-indigo-50 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Ajouter une interaction
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function CRM() {
  const [orders, setOrders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    const [ord, nt] = await Promise.all([
      base44.entities.Order.list("-created_date"),
      base44.entities.CustomerNote.list("-created_date"),
    ]);
    setOrders(ord || []);
    setNotes(nt || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // Group orders by customer email
  const customerMap = {};
  orders.forEach(o => {
    if (!customerMap[o.customer_email]) {
      customerMap[o.customer_email] = { email: o.customer_email, name: o.customer_name, orders: [], order_id: o.id };
    }
    customerMap[o.customer_email].orders.push(o);
  });

  // Also include customers who only have notes
  notes.forEach(n => {
    if (!customerMap[n.customer_email]) {
      customerMap[n.customer_email] = { email: n.customer_email, name: n.customer_name, orders: [], order_id: "" };
    }
  });

  const customers = Object.values(customerMap).filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  // Pending follow-ups count
  const totalOverdue = notes.filter(n => n.follow_up_date && !n.done && new Date(n.follow_up_date) < new Date(new Date().toDateString())).length;
  const totalPending = notes.filter(n => n.follow_up_date && !n.done && new Date(n.follow_up_date) >= new Date(new Date().toDateString())).length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
      <Loader2 className="w-8 h-8 animate-spin text-rose-300" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <a href={createPageUrl("AdminDashboard")} className="p-2 rounded-xl hover:bg-gray-50 transition">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </a>
          <Users className="w-5 h-5 text-indigo-400" />
          <h1 className="font-bold text-gray-800">Relation client (CRM)</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {/* KPI pills */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700">
            👥 {customers.length} client{customers.length > 1 ? "s" : ""}
          </span>
          {totalOverdue > 0 && (
            <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-red-50 text-red-600">
              ⚠ {totalOverdue} relance{totalOverdue > 1 ? "s" : ""} en retard
            </span>
          )}
          {totalPending > 0 && (
            <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-amber-50 text-amber-700">
              🕐 {totalPending} relance{totalPending > 1 ? "s" : ""} à venir
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Rechercher un client…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-gray-200"
          />
        </div>

        {/* Customer list */}
        {customers.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="text-sm">Aucun client trouvé.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {customers.map(customer => (
              <CustomerCard
                key={customer.email}
                customer={customer}
                notes={notes.filter(n => n.customer_email === customer.email)}
                onRefresh={loadData}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}