import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight, CalendarDays, Download, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

const TYPES = {
  wedding:     { dot: "bg-rose-400",   label: "Mariage", emoji: "💍" },
  appointment: { dot: "bg-indigo-400", label: "RDV prestataire", emoji: "📅" },
  payment:     { dot: "bg-amber-400",  label: "Échéance paiement", emoji: "💶" },
  task:        { dot: "bg-blue-400",   label: "Date limite tâche", emoji: "✅" },
};

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const days = [];
  for (let i = 0; i < offset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function toGoogleCalendarDate(dateStr) {
  return dateStr?.replace(/-/g, "") || "";
}

function generateGoogleCalLink(title, date, description = "") {
  const d = toGoogleCalendarDate(date);
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  const endD = nextDay.toISOString().split("T")[0].replace(/-/g, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${d}/${endD}`,
    details: description,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function generateICS(entries) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fleurs en fête//FR",
    "CALSCALE:GREGORIAN",
  ];
  entries.forEach(e => {
    if (!e.date) return;
    const d = e.date.replace(/-/g, "");
    lines.push(
      "BEGIN:VEVENT",
      `DTSTART;VALUE=DATE:${d}`,
      `SUMMARY:${e.title}`,
      `DESCRIPTION:${e.description || ""}`,
      `UID:fleurs-fete-${e.id || Math.random()}`,
      "END:VEVENT"
    );
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export default function CoupleCalendar({ event }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [appointments, setAppointments] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadData(); }, [event?.id]);

  const loadData = async () => {
    setLoading(true);
    const [appts, vends, tks] = await Promise.all([
      base44.entities.VendorAppointment.filter({ event_id: event.id }, "date", 200),
      base44.entities.Vendor.filter({ event_id: event.id }, "name", 100),
      base44.entities.WeddingTask.filter({ event_id: event.id, status: ["a_faire", "en_cours"] }, "due_date", 200),
    ]);
    setAppointments(appts || []);
    setVendors(vends || []);
    setTasks(tks || []);
    setLoading(false);
  };

  // Build calendar map
  const calMap = {};
  const addEntry = (dateStr, entry) => {
    if (!dateStr) return;
    if (!calMap[dateStr]) calMap[dateStr] = [];
    calMap[dateStr].push(entry);
  };

  // Wedding day
  if (event.event_date) addEntry(event.event_date, { type: "wedding", id: "wedding", title: `💍 ${event.couple_names}`, date: event.event_date });

  // Appointments
  appointments.forEach(a => {
    addEntry(a.date, { type: "appointment", id: a.id, title: a.title, description: a.vendor_name ? `Prestataire : ${a.vendor_name}` : "", date: a.date, time: a.time, location: a.location });
  });

  // Vendor payment deadlines
  vendors.forEach(v => {
    if (v.next_payment_date && v.next_payment_amount > 0) {
      addEntry(v.next_payment_date, { type: "payment", id: `pay-${v.id}`, title: `💶 ${v.name}`, description: `${v.next_payment_amount}€ à régler`, date: v.next_payment_date, amount: v.next_payment_amount });
    }
  });

  // Tasks with due date
  tasks.forEach(t => {
    if (t.due_date) addEntry(t.due_date, { type: "task", id: t.id, title: t.title, description: t.description || "", date: t.due_date, priority: t.priority });
  });

  // All entries as flat array for export
  const allEntries = Object.values(calMap).flat();

  const calDays = getCalendarDays(year, month);

  const formatDay = (d) => {
    if (!d) return null;
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  };

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  // Upcoming in next 60 days
  const upcoming = Object.entries(calMap)
    .filter(([k]) => { const d = new Date(k); const now = new Date(); const limit = new Date(); limit.setDate(limit.getDate() + 60); return d >= now && d <= limit; })
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([, items]) => items);

  const handleExportICS = () => {
    const ics = generateICS(allEntries);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "mariage-fleurs-fete.ics"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Calendrier exporté ✓ Importez le fichier .ics dans Google Calendar, Apple Calendar...");
  };

  if (loading) return <div className="py-10 text-center text-gray-400 text-sm">Chargement...</div>;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><CalendarDays className="w-4 h-4 text-rose-400" /> Calendrier du mariage</h3>
          <p className="text-xs text-gray-400 mt-0.5">RDV prestataires · Échéances · Tâches</p>
        </div>
        <Button size="sm" variant="outline" onClick={handleExportICS} className="rounded-xl gap-2 text-xs">
          <Download className="w-3.5 h-3.5" /> Exporter (.ics)
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(TYPES).map(([k, v]) => (
          <span key={k} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`w-2.5 h-2.5 rounded-full ${v.dot}`} /> {v.label}
          </span>
        ))}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-50 transition"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
          <h2 className="font-bold text-gray-800 text-sm">{MONTHS_FR[month]} {year}</h2>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-gray-50 transition"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calDays.map((d, i) => {
            const key = formatDay(d);
            const items = d ? (calMap[key] || []) : [];
            const isToday = d && today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
            const isSelected = selected?.key === key;
            const types = [...new Set(items.map(it => it.type))];
            const isWedding = types.includes("wedding");
            return (
              <div key={i} onClick={() => d && setSelected({ day: d, key, items })}
                className={`min-h-[48px] rounded-xl p-1 flex flex-col items-center gap-0.5 transition cursor-pointer
                  ${d ? "hover:bg-rose-50" : ""}
                  ${isWedding ? "ring-2 ring-rose-400 bg-rose-50" : ""}
                  ${isToday && !isWedding ? "bg-indigo-50 ring-2 ring-indigo-200" : ""}
                  ${isSelected && !isToday && !isWedding ? "bg-gray-50 ring-2 ring-gray-200" : ""}
                `}>
                {d && (
                  <>
                    <span className={`text-xs font-semibold ${isWedding ? "text-rose-600" : isToday ? "text-indigo-700" : "text-gray-700"}`}>{d}</span>
                    <div className="flex flex-wrap gap-0.5 justify-center">
                      {types.map(t => <span key={t} className={`w-1.5 h-1.5 rounded-full ${TYPES[t]?.dot || "bg-gray-300"}`} />)}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Day detail */}
      {selected && selected.items.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h4 className="font-bold text-gray-700 text-sm mb-3">
            {selected.day} {MONTHS_FR[month]} {year}
          </h4>
          <div className="space-y-2">
            {selected.items.map((item, idx) => {
              const cfg = TYPES[item.type];
              const gcLink = generateGoogleCalLink(item.title, item.date, item.description);
              return (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
                  <span className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-400">{cfg.label}</p>
                    {item.time && <p className="text-xs text-gray-500 mt-0.5">🕐 {item.time}{item.location ? ` · 📍 ${item.location}` : ""}</p>}
                    {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                    {item.amount && <p className="text-xs font-bold text-amber-600 mt-0.5">💶 {item.amount}€ à régler</p>}
                  </div>
                  <a href={gcLink} target="_blank" rel="noreferrer" title="Ajouter à Google Calendar"
                    className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-300 hover:text-indigo-500 transition flex-shrink-0">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming 60 days */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h4 className="font-bold text-gray-700 text-sm mb-3">Prochaines échéances (60 jours)</h4>
        {upcoming.length === 0 ? (
          <p className="text-xs text-gray-400 py-2">Aucune échéance dans les 60 prochains jours.</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((item, idx) => {
              const cfg = TYPES[item.type];
              const diff = Math.round((new Date(item.date) - new Date(today.toDateString())) / 86400000);
              const isUrgent = diff <= 7;
              return (
                <div key={idx} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-base">{cfg.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{item.title}</p>
                    <p className="text-xs text-gray-400">{formatDate(item.date)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isUrgent && <AlertCircle className="w-3.5 h-3.5 text-amber-400" />}
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${diff === 0 ? "bg-rose-100 text-rose-600" : isUrgent ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-500"}`}>
                      {diff === 0 ? "Aujourd'hui" : `J-${diff}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}