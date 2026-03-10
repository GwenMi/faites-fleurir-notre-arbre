import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, MapPin, Clock, Pencil, X, CalendarDays, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, isToday, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

const EMPTY_FORM = { title: "", vendor_id: "", date: "", time: "", duration_min: 60, location: "", notes: "" };

export default function AgendaManager({ event }) {
  const eventId = event.id;
  const [appointments, setAppointments] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, [eventId]);

  const loadData = async () => {
    setLoading(true);
    const [appts, vends] = await Promise.all([
      base44.entities.VendorAppointment.filter({ event_id: eventId }),
      base44.entities.Vendor.filter({ event_id: eventId }),
    ]);
    setAppointments(appts || []);
    setVendors(vends || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.date) return;
    setSaving(true);
    const vendor = vendors.find(v => v.id === form.vendor_id);
    const payload = { ...form, event_id: eventId, vendor_name: vendor?.name || "" };
    if (editId) {
      await base44.entities.VendorAppointment.update(editId, payload);
      toast.success("Rendez-vous mis à jour !");
    } else {
      await base44.entities.VendorAppointment.create(payload);
      toast.success("Rendez-vous ajouté !");
    }
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(false);
    await loadData();
    setSaving(false);
  };

  const handleEdit = (appt) => {
    setForm({ title: appt.title, vendor_id: appt.vendor_id || "", date: appt.date, time: appt.time || "", duration_min: appt.duration_min || 60, location: appt.location || "", notes: appt.notes || "" });
    setEditId(appt.id);
    setSelectedDate(parseISO(appt.date));
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await base44.entities.VendorAppointment.delete(id);
    await loadData();
    toast.success("Rendez-vous supprimé");
  };

  const openNew = (date) => {
    setForm({ ...EMPTY_FORM, date: format(date, "yyyy-MM-dd") });
    setEditId(null);
    setShowForm(true);
  };

  // Calendar helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  // Pad start
  const startPad = (monthStart.getDay() + 6) % 7; // Monday = 0

  const getApptForDay = (day) => appointments.filter(a => a.date && isSameDay(parseISO(a.date), day));
  const selectedAppts = selectedDate ? getApptForDay(selectedDate).sort((a, b) => (a.time || "").localeCompare(b.time || "")) : [];

  const getVendor = (id) => vendors.find(v => v.id === id);

  if (loading) return <div className="py-8 text-center text-gray-400 text-sm">Chargement…</div>;

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
          <h2 className="font-semibold text-gray-800 capitalize">{format(currentMonth, "MMMM yyyy", { locale: fr })}</h2>
          <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 text-center border-b border-gray-50">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(d => (
            <div key={d} className="py-2 text-xs font-semibold text-gray-400">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} className="h-14 border-b border-r border-gray-50" />)}
          {days.map(day => {
            const dayAppts = getApptForDay(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);
            return (
              <div
                key={day.toISOString()}
                onClick={() => setSelectedDate(isSelected ? null : day)}
                className={`h-14 border-b border-r border-gray-50 p-1.5 cursor-pointer transition hover:bg-purple-50 ${isSelected ? "bg-purple-100" : ""}`}
              >
                <div className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${isCurrentDay ? "bg-rose-500 text-white" : isSelected ? "text-purple-700" : "text-gray-700"}`}>
                  {format(day, "d")}
                </div>
                <div className="mt-0.5 space-y-0.5">
                  {dayAppts.slice(0, 2).map(a => (
                    <div key={a.id} className="text-[9px] leading-tight bg-purple-200 text-purple-800 rounded px-1 truncate">
                      {a.time ? `${a.time} ` : ""}{a.title}
                    </div>
                  ))}
                  {dayAppts.length > 2 && <div className="text-[9px] text-purple-400">+{dayAppts.length - 2}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day panel */}
      {selectedDate && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 capitalize flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-purple-400" />
              {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
            </h3>
            <Button size="sm" onClick={() => openNew(selectedDate)} className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl gap-1 h-8">
              <Plus className="w-3.5 h-3.5" /> Ajouter
            </Button>
          </div>

          {selectedAppts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Aucun rendez-vous ce jour. <button onClick={() => openNew(selectedDate)} className="text-purple-400 hover:underline">Ajouter ?</button></p>
          ) : (
            <div className="space-y-3">
              {selectedAppts.map(appt => {
                const vendor = appt.vendor_id ? getVendor(appt.vendor_id) : null;
                return (
                  <div key={appt.id} className="flex gap-3 items-start border border-gray-100 rounded-xl p-3">
                    <div className="flex-shrink-0 text-center min-w-[48px]">
                      {appt.time ? (
                        <>
                          <p className="text-sm font-bold text-purple-500">{appt.time}</p>
                          {appt.duration_min && <p className="text-[10px] text-gray-400">{appt.duration_min} min</p>}
                        </>
                      ) : (
                        <p className="text-xs text-gray-300">—</p>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800">{appt.title}</p>
                      {vendor && (
                        <p className="text-xs text-rose-500 flex items-center gap-1 mt-0.5"><Users className="w-3 h-3" /> {vendor.name}</p>
                      )}
                      {appt.location && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {appt.location}</p>
                      )}
                      {appt.notes && <p className="text-xs text-gray-500 mt-1 italic">{appt.notes}</p>}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => handleEdit(appt)} className="p-1.5 text-gray-300 hover:text-purple-400 rounded-lg hover:bg-purple-50 transition">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(appt.id)} className="p-1.5 text-gray-300 hover:text-red-400 rounded-lg hover:bg-red-50 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-700">{editId ? "Modifier le rendez-vous" : "Nouveau rendez-vous"}</p>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); }}>
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          </div>

          <Input placeholder="Objet *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="rounded-xl" />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Date *</label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Heure</label>
              <Input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className="rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Durée (min)</label>
              <Input type="number" min="15" step="15" value={form.duration_min} onChange={e => setForm(f => ({ ...f, duration_min: e.target.value }))} className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Prestataire</label>
              <select value={form.vendor_id} onChange={e => setForm(f => ({ ...f, vendor_id: e.target.value }))} className="w-full border border-input rounded-xl px-3 py-2 text-sm bg-white">
                <option value="">— Aucun —</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
            <Input placeholder="Lieu (optionnel)" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="rounded-xl pl-9" />
          </div>

          <textarea placeholder="Notes (optionnel)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
            className="w-full rounded-xl border border-input px-3 py-2 text-sm bg-white resize-none" />

          <Button onClick={handleSave} disabled={saving || !form.title.trim() || !form.date} className="w-full rounded-xl bg-purple-500 hover:bg-purple-600 text-white h-9">
            {saving ? "Enregistrement…" : editId ? "Mettre à jour" : "Ajouter"}
          </Button>
        </div>
      )}

      {/* Upcoming appointments list */}
      {!selectedDate && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-600">Tous les rendez-vous</h3>
          {appointments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Aucun rendez-vous. Cliquez sur un jour du calendrier pour commencer.</p>
          ) : (
            appointments
              .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
              .map(appt => {
                const vendor = appt.vendor_id ? getVendor(appt.vendor_id) : null;
                return (
                  <div key={appt.id} className="flex gap-3 items-center bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
                    <div className="flex-shrink-0 text-center min-w-[60px]">
                      <p className="text-xs font-bold text-purple-500">{format(parseISO(appt.date), "d MMM", { locale: fr })}</p>
                      {appt.time && <p className="text-xs text-gray-400">{appt.time}</p>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">{appt.title}</p>
                      {vendor && <p className="text-xs text-rose-400 flex items-center gap-1"><Users className="w-3 h-3" />{vendor.name}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(appt)} className="p-1.5 text-gray-200 hover:text-purple-400 rounded-lg hover:bg-purple-50 transition">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(appt.id)} className="p-1.5 text-gray-200 hover:text-red-400 rounded-lg hover:bg-red-50 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}
    </div>
  );
}