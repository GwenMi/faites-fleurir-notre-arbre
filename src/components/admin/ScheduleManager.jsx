import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Save, Loader2, CalendarDays } from "lucide-react";
import { toast } from "sonner";

const ICONS = ["🌸", "💒", "🎶", "🍽️", "🥂", "💃", "🎂", "📸", "🚗", "🎁", "✨", "💍"];

export default function ScheduleManager({ eventId, event }) {
  const id = eventId || event?.id;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ time: "", title: "", description: "", location: "", icon: "🌸" });
  const [showForm, setShowForm] = useState(false);

  const loadItems = async () => {
    if (!id) return;
    const data = await base44.entities.DaySchedule.filter({ event_id: id }, "order");
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { loadItems(); }, [id]);

  const handleAdd = async () => {
    if (!form.time || !form.title) { toast.error("Heure et titre requis"); return; }
    setSaving(true);
    await base44.entities.DaySchedule.create({ ...form, event_id: id, order: items.length });
    toast.success("Étape ajoutée ✓");
    setForm({ time: "", title: "", description: "", location: "", icon: "🌸" });
    setShowForm(false);
    setSaving(false);
    loadItems();
  };

  const handleDelete = async (item) => {
    await base44.entities.DaySchedule.delete(item.id);
    toast.success("Supprimé");
    loadItems();
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-6 h-6 animate-spin text-rose-300" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-rose-400" />
          <h2 className="text-xl font-bold text-gray-800">Programme du jour J</h2>
        </div>
        <Button onClick={() => setShowForm(s => !s)} className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white">
          <Plus className="w-4 h-4 mr-1" /> Ajouter une étape
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Heure *</label>
              <Input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Icône</label>
              <select value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                className="w-full border border-input rounded-xl px-3 py-2 text-sm bg-white">
                {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Titre *</label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Cérémonie civile…" className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Description</label>
            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Détails…" className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Lieu</label>
            <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Nom du lieu…" className="rounded-xl" />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={saving} className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white flex-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
              Enregistrer
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Annuler</Button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="text-sm">Aucune étape dans le programme. Ajoutez-en une !</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.sort((a, b) => (a.time || "").localeCompare(b.time || "")).map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-4">
              <div className="text-2xl flex-shrink-0">{item.icon || "🌸"}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-rose-500">{item.time}</span>
                  <span className="font-semibold text-gray-800 text-sm">{item.title}</span>
                </div>
                {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                {item.location && <p className="text-xs text-gray-400 mt-0.5">📍 {item.location}</p>}
              </div>
              <button onClick={() => handleDelete(item)} className="text-gray-300 hover:text-red-400 p-1 flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}