import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, MapPin, Clock, Pencil, X, Users, Send, CheckCircle } from "lucide-react";
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

const EMPTY_FORM = { time: "", title: "", description: "", location: "", icon: "🌸", vendor_id: "" };

export default function ScheduleManager({ eventId }) {
  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [sentIds, setSentIds] = useState([]);

  useEffect(() => { loadData(); }, [eventId]);

  const loadData = async () => {
    setLoading(true);
    const [data, vendorData, events] = await Promise.all([
      base44.entities.DaySchedule.filter({ event_id: eventId }),
      base44.entities.Vendor.filter({ event_id: eventId }),
      base44.entities.Event.filter({ id: eventId }),
    ]);
    setItems((data || []).sort((a, b) => a.time.localeCompare(b.time)));
    setVendors(vendorData || []);
    setEvent((events || [])[0] || null);
    setLoading(false);
  };

  const handleSendReminder = async (item, vendor) => {
    if (!vendor.email) {
      toast.error(`Aucun email renseigné pour ${vendor.name}`);
      return;
    }
    setSendingId(item.id);
    const eventDate = event?.event_date
      ? new Date(event.event_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : "le jour de l'événement";
    const coupleNames = event?.couple_names || "les mariés";

    const subject = `Rappel de mission — ${item.title} à ${item.time}`;
    const body = `Bonjour ${vendor.contact_name || vendor.name},

Vous intervenez pour le mariage de ${coupleNames} le ${eventDate}.

Voici le rappel de votre mission :

📌 Étape : ${item.title}
🕐 Heure prévue : ${item.time}${item.location ? `\n📍 Lieu : ${item.location}` : ""}${item.description ? `\n📝 Détails : ${item.description}` : ""}

Merci de bien noter cette information et de confirmer votre disponibilité si nécessaire.

Cordialement,
${coupleNames}`;

    await base44.integrations.Core.SendEmail({
      to: vendor.email,
      subject,
      body,
    });
    setSentIds(prev => [...prev, item.id]);
    setSendingId(null);
    toast.success(`Rappel envoyé à ${vendor.name} (${vendor.email})`);
  };

  const handleSave = async () => {
    if (!form.time || !form.title.trim()) return;
    setSaving(true);
    if (editId) {
      await base44.entities.DaySchedule.update(editId, form);
      toast.success("Étape mise à jour !");
    } else {
      await base44.entities.DaySchedule.create({ event_id: eventId, ...form, order: items.length });
      toast.success("Étape ajoutée !");
    }
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(false);
    await loadData();
    setSaving(false);
  };

  const handleEdit = (item) => {
    setForm({ time: item.time, title: item.title, description: item.description || "", location: item.location || "", icon: item.icon || "🌸", vendor_id: item.vendor_id || "" });
    setEditId(item.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    await base44.entities.DaySchedule.delete(id);
    await loadData();
    toast.success("Étape supprimée");
  };

  const applyPreset = (preset) => {
    setForm(f => ({ ...f, ...preset }));
    setShowForm(true);
  };

  const getVendor = (vendorId) => vendors.find(v => v.id === vendorId);

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

      {/* Add button */}
      {!showForm && (
        <Button onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); }}
          className="w-full rounded-xl bg-purple-500 hover:bg-purple-600 text-white h-9 mb-5">
          <Plus className="w-4 h-4 mr-1" /> Nouvelle étape
        </Button>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-700">{editId ? "Modifier l'étape" : "Nouvelle étape"}</p>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); }}>
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          </div>

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

          {/* Vendor selector */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1"><Users className="w-3 h-3" /> Prestataire associé (optionnel)</label>
            <select
              value={form.vendor_id}
              onChange={e => setForm(f => ({ ...f, vendor_id: e.target.value }))}
              className="w-full border border-input rounded-xl px-3 py-2 text-sm bg-white"
            >
              <option value="">— Aucun prestataire —</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          <Button onClick={handleSave} disabled={saving || !form.time || !form.title.trim()} className="w-full rounded-xl bg-purple-500 hover:bg-purple-600 text-white h-9">
            <Plus className="w-4 h-4 mr-1" /> {editId ? "Mettre à jour" : "Ajouter l'étape"}
          </Button>
        </div>
      )}

      {/* Timeline list */}
      {items.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-6">Aucune étape pour l'instant.</p>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-purple-100 z-0" />

          <div className="space-y-0">
            {items.map((item, idx) => {
              const vendor = item.vendor_id ? getVendor(item.vendor_id) : null;
              const isLast = idx === items.length - 1;
              return (
                <div key={item.id} className={`relative flex gap-4 ${isLast ? "" : "pb-4"}`}>
                  {/* Dot */}
                  <div className="relative z-10 flex-shrink-0 w-14 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-purple-100 border-2 border-purple-300 flex items-center justify-center text-lg shadow-sm">
                      {item.icon || "🌸"}
                    </div>
                    <span className="text-xs font-bold text-purple-500 mt-1 whitespace-nowrap">{item.time}</span>
                  </div>

                  {/* Card */}
                  <div className="flex-1 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm text-gray-800">{item.title}</p>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => handleEdit(item)} className="p-1.5 text-gray-300 hover:text-purple-400 rounded-lg hover:bg-purple-50 transition">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-300 hover:text-red-400 rounded-lg hover:bg-red-50 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {item.location && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {item.location}</p>
                    )}
                    {item.description && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.description}</p>}
                    {vendor && (
                      <span className="inline-flex items-center gap-1 mt-2 text-xs bg-rose-50 text-rose-500 border border-rose-100 rounded-full px-2 py-0.5">
                        <Users className="w-3 h-3" /> {vendor.name}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}