import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, MapPin, Clock, Pencil, X, Users, Send, CheckCircle, Wand2, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

const PRESETS = [
  { icon: "💍", title: "Cérémonie civile",       time: "10:00", description: "", location: "Mairie" },
  { icon: "⛪", title: "Cérémonie religieuse",   time: "14:30", description: "", location: "Église" },
  { icon: "🥂", title: "Vin d'honneur / Cocktail", time: "16:00", description: "", location: "" },
  { icon: "🍽️", title: "Dîner",                 time: "19:30", description: "", location: "" },
  { icon: "💃", title: "Soirée & bal",           time: "22:00", description: "", location: "" },
  { icon: "🎂", title: "Découpe du gâteau",      time: "23:30", description: "", location: "" },
];

const ICONS = ["💍", "⛪", "🥂", "🍽️", "💃", "🎂", "📸", "🌸", "🎵", "🎉", "🚌", "🌅"];

const CAT_ICON = {
  salle: "🏛️", traiteur: "🍽️", photographe: "📸", videaste: "🎬",
  musique: "🎵", fleuriste: "💐", transport: "🚗", gateau: "🎂",
  coiffure_maquillage: "💄", faire_part: "💌", decoration: "✨", autre: "🌸",
};

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
  const [generating, setGenerating] = useState(false);

  useEffect(() => { loadData(); }, [eventId]);

  const loadData = async () => {
    setLoading(true);
    const [data, vendorData, events] = await Promise.all([
      base44.entities.DaySchedule.filter({ event_id: eventId }),
      base44.entities.Vendor.filter({ event_id: eventId }),
      base44.entities.Event.filter({ id: eventId }),
    ]);
    setItems((data || []).sort((a, b) => (a.time || "").localeCompare(b.time || "")));
    setVendors(vendorData || []);
    setEvent((events || [])[0] || null);
    setLoading(false);
  };

  // ── Auto-generate algorithm ──
  const autoGenerate = async () => {
    if (!event?.event_date) {
      toast.error("La date du mariage n'est pas définie");
      return;
    }
    if (items.length > 0 && !confirm("Des étapes existent déjà. Ajouter les étapes auto-générées ?")) return;

    setGenerating(true);
    const existingTitles = items.map(i => i.title.toLowerCase());

    // Load vendor appointments for wedding day
    const weddingAppts = await base44.entities.VendorAppointment.filter({ event_id: eventId, date: event.event_date });

    const newItems = [];

    // Add standard ceremony steps if missing
    if (!existingTitles.some(t => t.includes("civil") || t.includes("mairie"))) {
      newItems.push({ icon: "💍", title: "Cérémonie civile", time: "10:00", description: "Signature des registres", location: "Mairie", vendor_id: "" });
    }

    // Add steps from vendor appointments on wedding day
    weddingAppts.forEach(appt => {
      if (!existingTitles.includes((appt.title || "").toLowerCase())) {
        const vendor = vendors.find(v => v.id === appt.vendor_id);
        newItems.push({
          icon: CAT_ICON[vendor?.category] || "🌸",
          title: appt.title,
          time: appt.time || "12:00",
          description: appt.notes || "",
          location: appt.location || "",
          vendor_id: appt.vendor_id || "",
        });
      }
    });

    // Add default steps for vendors without wedding-day appointments
    const appointedVendorIds = weddingAppts.map(a => a.vendor_id);
    const defaultsByCategory = [
      { category: "salle",      icon: "🥂",  title: "Cocktail & vin d'honneur",  time: "16:00" },
      { category: "traiteur",   icon: "🍽️", title: "Dîner",                      time: "19:30" },
      { category: "photographe",icon: "📸",  title: "Séance photo couple",        time: "16:30" },
      { category: "videaste",   icon: "🎬",  title: "Film de la soirée",          time: "20:00" },
      { category: "musique",    icon: "🎵",  title: "Ouverture du bal",           time: "22:00" },
      { category: "gateau",     icon: "🎂",  title: "Découpe du gâteau",          time: "23:30" },
      { category: "coiffure_maquillage", icon: "💄", title: "Coiffure & maquillage", time: "09:00" },
    ];

    defaultsByCategory.forEach(def => {
      const vendor = vendors.find(v => v.category === def.category && !appointedVendorIds.includes(v.id));
      if (vendor && !existingTitles.some(t => t.includes(def.title.split(" ")[0].toLowerCase()))) {
        newItems.push({ ...def, description: `— ${vendor.name}`, location: "", vendor_id: vendor.id });
      }
    });

    // Sort by time and save
    const sorted = newItems.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    for (const item of sorted) {
      await base44.entities.DaySchedule.create({ event_id: eventId, ...item, order: 0 });
    }

    await loadData();
    toast.success(`${sorted.length} étape${sorted.length > 1 ? "s" : ""} générée${sorted.length > 1 ? "s" : ""} ✓`);
    setGenerating(false);
  };

  // ── PDF export ──
  const exportPDF = () => {
    if (items.length === 0) { toast.error("Aucune étape à exporter"); return; }

    const doc = new jsPDF();
    const couple = event?.couple_names || "Mariage";
    const dateStr = event?.event_date
      ? new Date(event.event_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : "";

    // Header
    doc.setFillColor(254, 242, 242);
    doc.rect(0, 0, 210, 55, "F");
    doc.setFontSize(24); doc.setFont(undefined, "bold"); doc.setTextColor(220, 50, 80);
    doc.text("Programme de la journée", 105, 22, { align: "center" });
    doc.setFontSize(14); doc.setFont(undefined, "normal"); doc.setTextColor(60, 60, 60);
    doc.text(couple, 105, 33, { align: "center" });
    if (dateStr) {
      doc.setFontSize(11); doc.setTextColor(130, 130, 130);
      doc.text(dateStr, 105, 43, { align: "center" });
    }
    doc.setTextColor(0, 0, 0);

    let y = 65;

    items.forEach((item, idx) => {
      if (y > 265) { doc.addPage(); y = 20; }

      // Time badge
      doc.setFillColor(255, 228, 230);
      doc.roundedRect(20, y - 5, 28, 12, 3, 3, "F");
      doc.setFontSize(10); doc.setFont(undefined, "bold"); doc.setTextColor(220, 50, 80);
      doc.text(item.time || "—", 34, y + 3, { align: "center" });

      // Icon + title
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(12); doc.setFont(undefined, "bold");
      doc.text(`${item.icon || "🌸"}  ${item.title}`, 56, y + 3);
      y += 9;

      // Location
      if (item.location) {
        doc.setFont(undefined, "normal"); doc.setFontSize(9); doc.setTextColor(100, 100, 100);
        doc.text(`📍 ${item.location}`, 56, y + 2);
        y += 7;
      }

      // Vendor
      if (item.vendor_id) {
        const v = vendors.find(vv => vv.id === item.vendor_id);
        if (v) {
          doc.setFontSize(9); doc.setFont(undefined, "normal"); doc.setTextColor(180, 80, 120);
          doc.text(`👥 ${v.name}`, 56, y + 2);
          y += 7;
        }
      }

      // Description
      if (item.description) {
        doc.setFont(undefined, "italic"); doc.setFontSize(9); doc.setTextColor(120, 120, 120);
        const lines = doc.splitTextToSize(item.description, 130);
        doc.text(lines, 56, y + 2);
        y += lines.length * 5 + 2;
      }

      // Separator
      if (idx < items.length - 1) {
        doc.setDrawColor(240, 240, 240); doc.setLineWidth(0.4);
        doc.line(56, y + 3, 185, y + 3);
        y += 8;
      }

      doc.setTextColor(0, 0, 0);
    });

    // Footer
    doc.setFontSize(8); doc.setFont(undefined, "normal"); doc.setTextColor(180, 180, 180);
    doc.text("Fleurs de fête — fleursenfete.com", 105, 290, { align: "center" });

    doc.save(`Planning-${couple.replace(/\s/g, "-")}.pdf`);
    toast.success("Planning PDF exporté ✓");
  };

  const handleSendReminder = async (item, vendor) => {
    if (!vendor.email) { toast.error(`Aucun email pour ${vendor.name}`); return; }
    setSendingId(item.id);
    const eventDate = event?.event_date
      ? new Date(event.event_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : "le jour de l'événement";
    await base44.integrations.Core.SendEmail({
      to: vendor.email,
      subject: `Rappel de mission — ${item.title} à ${item.time}`,
      body: `Bonjour ${vendor.contact_name || vendor.name},\n\nVous intervenez pour le mariage de ${event?.couple_names || "nos mariés"} le ${eventDate}.\n\n📌 Étape : ${item.title}\n🕐 Heure : ${item.time}${item.location ? `\n📍 Lieu : ${item.location}` : ""}${item.description ? `\n📝 Détails : ${item.description}` : ""}\n\nCordialement,\n${event?.couple_names || "Les mariés"}`,
    });
    setSentIds(prev => [...prev, item.id]);
    setSendingId(null);
    toast.success(`Rappel envoyé à ${vendor.name}`);
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
    setForm(EMPTY_FORM); setEditId(null); setShowForm(false);
    await loadData(); setSaving(false);
  };

  const handleEdit = (item) => {
    setForm({ time: item.time, title: item.title, description: item.description || "", location: item.location || "", icon: item.icon || "🌸", vendor_id: item.vendor_id || "" });
    setEditId(item.id); setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    await base44.entities.DaySchedule.delete(id);
    await loadData(); toast.success("Étape supprimée");
  };

  const getVendor = (vendorId) => vendors.find(v => v.id === vendorId);

  if (loading) return <div className="py-8 text-center text-gray-400 text-sm">Chargement...</div>;

  return (
    <div>
      {/* Action bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          onClick={autoGenerate}
          disabled={generating}
          className="bg-violet-500 hover:bg-violet-600 text-white rounded-xl gap-2"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {generating ? "Génération…" : "Auto-générer le planning"}
        </Button>
        {items.length > 0 && (
          <Button onClick={exportPDF} variant="outline" className="rounded-xl gap-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50">
            <Download className="w-4 h-4" /> Exporter PDF
          </Button>
        )}
      </div>

      {/* Presets */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 mb-2">Suggestions rapides</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button key={p.title} onClick={() => { setForm(f => ({ ...f, ...p })); setShowForm(true); }}
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
          <div>
            <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1"><Users className="w-3 h-3" /> Prestataire associé</label>
            <select value={form.vendor_id} onChange={e => setForm(f => ({ ...f, vendor_id: e.target.value }))}
              className="w-full border border-input rounded-xl px-3 py-2 text-sm bg-white">
              <option value="">— Aucun prestataire —</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <Button onClick={handleSave} disabled={saving || !form.time || !form.title.trim()} className="w-full rounded-xl bg-purple-500 hover:bg-purple-600 text-white h-9">
            <Plus className="w-4 h-4 mr-1" /> {editId ? "Mettre à jour" : "Ajouter l'étape"}
          </Button>
        </div>
      )}

      {/* Timeline */}
      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Wand2 className="w-8 h-8 mx-auto mb-3 text-gray-200" />
          <p className="text-sm">Aucune étape. Utilisez "Auto-générer" ou ajoutez une étape manuellement.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-purple-100 z-0" />
          <div className="space-y-0">
            {items.map((item, idx) => {
              const vendor = item.vendor_id ? getVendor(item.vendor_id) : null;
              const isLast = idx === items.length - 1;
              return (
                <div key={item.id} className={`relative flex gap-4 ${isLast ? "" : "pb-4"}`}>
                  <div className="relative z-10 flex-shrink-0 w-14 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-purple-100 border-2 border-purple-300 flex items-center justify-center text-lg shadow-sm">
                      {item.icon || "🌸"}
                    </div>
                    <span className="text-xs font-bold text-purple-500 mt-1 whitespace-nowrap">{item.time}</span>
                  </div>
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
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-xs bg-rose-50 text-rose-500 border border-rose-100 rounded-full px-2 py-0.5">
                          <Users className="w-3 h-3" /> {vendor.name}
                        </span>
                        {vendor.email && (
                          sentIds.includes(item.id) ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-500 bg-green-50 border border-green-100 rounded-full px-2 py-0.5">
                              <CheckCircle className="w-3 h-3" /> Rappel envoyé
                            </span>
                          ) : (
                            <button onClick={() => handleSendReminder(item, vendor)} disabled={sendingId === item.id}
                              className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-500 border border-purple-100 rounded-full px-2 py-0.5 hover:bg-purple-100 transition disabled:opacity-50">
                              <Send className="w-3 h-3" /> {sendingId === item.id ? "Envoi…" : "Envoyer rappel"}
                            </button>
                          )
                        )}
                      </div>
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