import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, GripVertical, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

const PRESETS = [
  { icon: "💍", title: "Cérémonie civile", time: "10:00", description: "", location: "Mairie" },
  { icon: "⛪", title: "Cérémonie religieuse", time: "14:30", description: "", location: "Église" },
  { icon: "🥂", title: "Vin d'honneur / Cocktail", time: "16:00", description: "", location: "" },
  { icon: "🍽️", title: "Dîner", time: "19:30", description: "", location: "" },
  { icon: "💃", title: "Soirée & bal", time: "22:00", description: "", location: "" },
  { icon: "🎂", title: "Découpe du gâteau", time: "23:30", description: "", location: "" },
];

const ICONS = ["💍", "⛪", "🥂", "🍽️", "💃", "🎂", "📸", "🌸", "🎵", "🎉", "🚌", "🌅"];

export default function ScheduleManager({ eventId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ time: "", title: "", description: "", location: "", icon: "🌸" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, [eventId]);

  const loadData = async () => {
    setLoading(true);
    const data = await base44.entities.DaySchedule.filter({ event_id: eventId });
    setItems((data || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.time.localeCompare(b.time)));
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.time || !form.title.trim()) return;
    setSaving(true);
    await base44.entities.DaySchedule.create({ event_id: eventId, ...form, order: items.length });
    setForm({ time: "", title: "", description: "", location: "", icon: "🌸" });
    await loadData();
    toast.success("Étape ajoutée !");
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.DaySchedule.delete(id);
    await loadData();
    toast.success("Étape supprimée");
  };

  const applyPreset = (preset) => setForm({ ...form, ...preset });

  if (loading) return <div className="py-8 text-center text-gray-400 text-sm">Chargement...</div>;

  return (
    <div>
      {/* Presets */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 mb-2">Suggestions rapides</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button key={p.title} onClick={() => applyPreset(p)}
              className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-100 rounded-full px-3 py-1 transition">
              {p.icon} {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-5 space-y-3">
        <p className="text-sm font-bold text-gray-700">Nouvelle étape</p>

        {/* Icon picker */}
        <div className="flex flex-wrap gap-1.5">
          {ICONS.map(ic => (
            <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))}
              className={`w-8 h-8 rounded-xl text-lg transition ${form.icon === ic ? "bg-purple-100 ring-2 ring-purple-400 scale-110" : "bg-white border border-gray-100 hover:scale-105"}`}>
              {ic}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-shrink-0">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
            <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              className="pl-9 pr-3 py-2 rounded-xl border border-input bg-white text-sm w-32" />
          </div>
          <Input placeholder="Intitulé *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="rounded-xl flex-1" />
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
          <Input placeholder="Lieu (optionnel)" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="rounded-xl pl-9" />
        </div>

        <textarea placeholder="Description (optionnel)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
          className="w-full rounded-xl border border-input px-3 py-2 text-sm bg-white resize-none" />

        <Button onClick={handleSave} disabled={saving || !form.time || !form.title.trim()} className="w-full rounded-xl bg-purple-500 hover:bg-purple-600 text-white h-9">
          <Plus className="w-4 h-4 mr-1" /> Ajouter l'étape
        </Button>
      </div>

      {/* Timeline list */}
      {items.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-6">Aucune étape pour l'instant.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
              <GripVertical className="w-4 h-4 text-gray-200 flex-shrink-0 mt-1" />
              <div className="text-xl flex-shrink-0">{item.icon || "🌸"}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-purple-500 bg-purple-50 rounded-full px-2 py-0.5">{item.time}</span>
                  <p className="font-semibold text-sm text-gray-800">{item.title}</p>
                </div>
                {item.location && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {item.location}</p>
                )}
                {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
              </div>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-200 hover:text-red-400 rounded-lg hover:bg-red-50 transition flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}