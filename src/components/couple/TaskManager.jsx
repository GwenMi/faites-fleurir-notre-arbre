import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, CheckCircle2, Circle, Clock, Trash2, Edit2, ClipboardList, Flag } from "lucide-react";
import { toast } from "sonner";

const TASK_CATEGORIES = [
  { value: "ceremonie", label: "💒 Cérémonie" },
  { value: "reception", label: "🎉 Réception" },
  { value: "traiteur", label: "🍽️ Traiteur" },
  { value: "decoration", label: "✨ Décoration" },
  { value: "administratif", label: "📋 Administratif" },
  { value: "logistique", label: "🚗 Logistique" },
  { value: "tenues", label: "👗 Tenues" },
  { value: "beaute", label: "💄 Beauté" },
  { value: "voyage", label: "✈️ Voyage de noces" },
  { value: "communication", label: "📨 Communication" },
  { value: "autre", label: "📦 Autre" },
];

const ROLES = [
  { value: "marie_e", label: "💍 Marié(e)", color: "bg-rose-100 text-rose-700 border-rose-200" },
  { value: "temoin", label: "👑 Témoin", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "famille", label: "👨‍👩‍👧 Famille", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "prestataire", label: "🤝 Prestataire", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "ami", label: "🌟 Ami(e)", color: "bg-green-100 text-green-700 border-green-200" },
];

const getRoleConfig = (v) => ROLES.find(r => r.value === v) || ROLES[0];
const getCatLabel = (v) => TASK_CATEGORIES.find(c => c.value === v)?.label || v;

function getDueDateStatus(due_date) {
  if (!due_date) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(due_date); due.setHours(0, 0, 0, 0);
  const diff = Math.round((due - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: `${Math.abs(diff)}j de retard`, color: "text-red-500 bg-red-50 border-red-100", urgent: true };
  if (diff === 0) return { label: "Aujourd'hui !", color: "text-orange-500 bg-orange-50 border-orange-100", urgent: true };
  if (diff <= 3) return { label: `Dans ${diff}j`, color: "text-amber-500 bg-amber-50 border-amber-100", urgent: false };
  return { label: due.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }), color: "text-gray-400 bg-gray-50 border-gray-100", urgent: false };
}

function TaskForm({ eventId, task, onSave, onCancel }) {
  const [form, setForm] = useState(task || {
    title: "", category: "autre",
    assigned_to_name: "", assigned_to_email: "", assigned_to_role: "marie_e",
    due_date: "", priority: "moyenne", reminder_days_before: 3, notes: ""
  });
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Le titre est requis"); return; }
    setSaving(true);
    if (task?.id) {
      await base44.entities.WeddingTask.update(task.id, form);
      toast.success("Tâche mise à jour ✓");
    } else {
      await base44.entities.WeddingTask.create({ ...form, event_id: eventId, status: "a_faire", reminder_sent: false });
      toast.success("Tâche ajoutée ✓");
    }
    setSaving(false);
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-indigo-50 rounded-2xl border border-indigo-100 p-4 space-y-3">
      <p className="text-sm font-bold text-indigo-700">{task?.id ? "✏️ Modifier la tâche" : "✅ Nouvelle tâche"}</p>
      <Input value={form.title} onChange={e => set("title", e.target.value)}
        placeholder="Titre de la tâche *" className="rounded-xl bg-white font-medium" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Catégorie</p>
          <select value={form.category} onChange={e => set("category", e.target.value)}
            className="w-full rounded-xl border border-input px-3 py-2 text-sm bg-white">
            {TASK_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Priorité</p>
          <select value={form.priority} onChange={e => set("priority", e.target.value)}
            className="w-full rounded-xl border border-input px-3 py-2 text-sm bg-white">
            <option value="haute">🔴 Haute</option>
            <option value="moyenne">🟡 Moyenne</option>
            <option value="basse">🟢 Basse</option>
          </select>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Date limite</p>
          <Input type="date" value={form.due_date || ""} onChange={e => set("due_date", e.target.value)} className="rounded-xl bg-white" />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Rappel email (jours avant)</p>
          <Input type="number" min="1" max="30" value={form.reminder_days_before || 3}
            onChange={e => set("reminder_days_before", parseInt(e.target.value) || 3)} className="rounded-xl bg-white" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Délégué à</p>
          <Input value={form.assigned_to_name} onChange={e => set("assigned_to_name", e.target.value)}
            placeholder="Prénom / nom" className="rounded-xl bg-white" />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Email (rappel auto)</p>
          <Input type="email" value={form.assigned_to_email || ""} onChange={e => set("assigned_to_email", e.target.value)}
            placeholder="email@..." className="rounded-xl bg-white" />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Rôle</p>
          <select value={form.assigned_to_role} onChange={e => set("assigned_to_role", e.target.value)}
            className="w-full rounded-xl border border-input px-3 py-2 text-sm bg-white">
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
      </div>
      <Input value={form.notes || ""} onChange={e => set("notes", e.target.value)}
        placeholder="Notes (optionnel)" className="rounded-xl bg-white" />
      <div className="flex gap-2">
        <Button type="submit" disabled={saving} className="rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white">
          <Plus className="w-4 h-4 mr-1" />{task?.id ? "Mettre à jour" : "Ajouter"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl">Annuler</Button>
      </div>
    </form>
  );
}

function TaskCard({ task, onUpdate, onDelete }) {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const roleConfig = getRoleConfig(task.assigned_to_role);
  const dueDateStatus = getDueDateStatus(task.due_date);
  const isDone = task.status === "termine";

  const cycleStatus = async () => {
    if (loading) return;
    setLoading(true);
    const next = task.status === "a_faire" ? "en_cours" : task.status === "en_cours" ? "termine" : "a_faire";
    await base44.entities.WeddingTask.update(task.id, { status: next });
    setLoading(false);
    onUpdate();
    if (next === "termine") toast.success("Tâche terminée ! 🎉");
  };

  if (editing) {
    return (
      <div className="rounded-2xl border border-indigo-100">
        <TaskForm eventId={task.event_id} task={task}
          onSave={() => { setEditing(false); onUpdate(); }}
          onCancel={() => setEditing(false)} />
      </div>
    );
  }

  const statusIcon = isDone
    ? <CheckCircle2 className="w-5 h-5 text-green-500" />
    : task.status === "en_cours"
      ? <Clock className="w-5 h-5 text-blue-400" />
      : <Circle className="w-5 h-5 text-gray-300" />;

  return (
    <div className={`flex items-start gap-3 p-3 rounded-2xl border transition ${
      isDone ? "bg-green-50/40 border-green-100"
      : dueDateStatus?.urgent ? "bg-red-50/30 border-red-100"
      : "bg-white border-gray-100 hover:border-gray-200"
    }`}>
      <button onClick={cycleStatus} disabled={loading} className="flex-shrink-0 mt-0.5 hover:opacity-70 transition">
        {loading
          ? <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
          : statusIcon}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-sm font-semibold ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}>{task.title}</p>
          {task.priority === "haute" && !isDone && <Flag className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {task.category && <span className="text-xs text-gray-400">{getCatLabel(task.category)}</span>}
          {task.assigned_to_name && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${roleConfig.color}`}>
              {task.assigned_to_name}
            </span>
          )}
          {dueDateStatus && !isDone && (
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${dueDateStatus.color}`}>
              📅 {dueDateStatus.label}
            </span>
          )}
          {task.assigned_to_email && !isDone && (
            <span className="text-xs text-gray-300">· rappel {task.reminder_days_before || 3}j avant</span>
          )}
        </div>
        {task.notes && <p className="text-xs text-gray-400 mt-1 italic truncate">{task.notes}</p>}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
        <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-300 hover:text-gray-500 transition">
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function TaskManager({ event }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    loadTasks();
    const unsub = base44.entities.WeddingTask.subscribe(() => loadTasks());
    return unsub;
  }, [event?.id]);

  const loadTasks = async () => {
    const data = await base44.entities.WeddingTask.filter({ event_id: event.id }, "due_date", 200);
    setTasks(data || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.WeddingTask.delete(id);
    toast.success("Tâche supprimée");
    loadTasks();
  };

  const total = tasks.length;
  const done = tasks.filter(t => t.status === "termine").length;
  const inProgress = tasks.filter(t => t.status === "en_cours").length;
  const toDoCount = tasks.filter(t => t.status === "a_faire").length;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const overdue = tasks.filter(t => t.due_date && t.status !== "termine" && new Date(t.due_date) < today).length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  const filtered = tasks.filter(t =>
    (filterStatus === "all" || t.status === filterStatus) &&
    (filterRole === "all" || t.assigned_to_role === filterRole)
  );

  const byStatus = {
    en_cours: filtered.filter(t => t.status === "en_cours"),
    a_faire: filtered.filter(t => t.status === "a_faire"),
    termine: filtered.filter(t => t.status === "termine"),
  };

  const statusGroups = [
    { key: "en_cours", label: "🔄 En cours", color: "text-blue-600" },
    { key: "a_faire", label: "⏳ À faire", color: "text-gray-600" },
    { key: "termine", label: "✅ Terminées", color: "text-green-600" },
  ];

  if (loading) return <div className="py-10 text-center text-gray-400 text-sm">Chargement...</div>;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-800">✅ Tâches & délégations</h3>
          <p className="text-xs text-gray-400">
            {total} tâche{total !== 1 ? "s" : ""} · {done} terminée{done !== 1 ? "s" : ""}
            {overdue > 0 ? ` · ⚠️ ${overdue} en retard` : ""}
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(v => !v)} className="rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white">
          <Plus className="w-4 h-4 mr-1" /> Ajouter
        </Button>
      </div>

      {/* Global progress bar */}
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-gray-700">Avancement global</span>
          </div>
          <span className="text-2xl font-bold text-indigo-600">{percent}%</span>
        </div>
        <div className="w-full bg-indigo-100 rounded-full h-3 overflow-hidden mb-2">
          <div className="h-3 rounded-full transition-all duration-500"
            style={{ width: `${percent}%`, background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }} />
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-gray-400">
          <span>✅ {done} terminée{done !== 1 ? "s" : ""}</span>
          <span>🔄 {inProgress} en cours</span>
          <span>⏳ {toDoCount} à faire</span>
          {overdue > 0 && <span className="text-red-500 font-semibold">⚠️ {overdue} en retard</span>}
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <TaskForm eventId={event.id}
          onSave={() => { loadTasks(); setShowForm(false); }}
          onCancel={() => setShowForm(false)} />
      )}

      {/* Filters */}
      {total > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-gray-400 mr-1">Statut :</span>
            {[{ v: "all", l: "Tous" }, { v: "a_faire", l: "À faire" }, { v: "en_cours", l: "En cours" }, { v: "termine", l: "Terminé" }].map(s => (
              <button key={s.v} onClick={() => setFilterStatus(s.v)}
                className={`px-2.5 py-1 rounded-full transition ${filterStatus === s.v ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                {s.l}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-gray-400 mr-1">Rôle :</span>
            <button onClick={() => setFilterRole("all")}
              className={`px-2.5 py-1 rounded-full transition ${filterRole === "all" ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              Tous
            </button>
            {ROLES.map(r => (
              <button key={r.value} onClick={() => setFilterRole(r.value)}
                className={`px-2.5 py-1 rounded-full transition ${filterRole === r.value ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {total === 0 && !showForm && (
        <div className="text-center py-12 text-gray-400">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">Aucune tâche pour l'instant</p>
          <p className="text-xs mt-1 text-gray-300">Ajoutez des tâches et déléguez-les à vos témoins et prestataires</p>
          <button onClick={() => setShowForm(true)} className="text-xs text-indigo-500 hover:underline mt-2">
            Créer la première tâche →
          </button>
        </div>
      )}

      {/* Task groups */}
      {statusGroups.map(({ key, label, color }) => {
        const group = byStatus[key];
        if (!group.length) return null;
        return (
          <div key={key}>
            <p className={`text-xs font-bold mb-2 ${color}`}>{label} ({group.length})</p>
            <div className="space-y-2">
              {group.map(task => (
                <TaskCard key={task.id} task={task} onUpdate={loadTasks} onDelete={() => handleDelete(task.id)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}