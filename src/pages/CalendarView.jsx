import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ChevronLeft, ChevronRight, Calendar, Loader2, Package, Heart, Truck } from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1; // Monday-first
  const days = [];
  for (let i = 0; i < offset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

const TYPE_CONFIG = {
  event:    { color: "bg-purple-400", label: "Événement client", dot: "🌸" },
  delivery: { color: "bg-amber-400",  label: "Livraison fournisseur", dot: "📦" },
  order:    { color: "bg-rose-400",   label: "Date événement commande", dot: "🎉" },
};

export default function CalendarView() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState([]);
  const [orders, setOrders] = useState([]);
  const [supplierOrders, setSupplierOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // {day, items[]}

  useEffect(() => {
    Promise.all([
      base44.entities.Event.list(),
      base44.entities.Order.list(),
      base44.entities.SupplierOrder.list(),
    ]).then(([ev, ord, sup]) => {
      setEvents(ev || []);
      setOrders(ord || []);
      setSupplierOrders(sup || []);
      setLoading(false);
    });
  }, []);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  // Build a map: "YYYY-MM-DD" -> [{type, label, color}]
  const calMap = {};
  const addEntry = (dateStr, entry) => {
    if (!dateStr) return;
    if (!calMap[dateStr]) calMap[dateStr] = [];
    calMap[dateStr].push(entry);
  };

  events.forEach(ev => {
    if (ev.event_date) addEntry(ev.event_date, { type: "event", label: ev.couple_names || ev.event_name });
  });

  orders.forEach(ord => {
    const opts = ord.options_selected || {};
    if (opts.event_date) addEntry(opts.event_date, { type: "order", label: `${ord.customer_name} — ${ord.product_name}` });
  });

  supplierOrders.forEach(so => {
    if (so.expected_delivery_date) addEntry(so.expected_delivery_date, { type: "delivery", label: `${so.supplier_name} — ${so.product_description}` });
  });

  const calDays = getCalendarDays(year, month);

  const formatDay = (d) => {
    if (!d) return null;
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  };

  const handleDayClick = (d) => {
    if (!d) return;
    const key = formatDay(d);
    const items = calMap[key] || [];
    setSelected({ day: d, key, items });
  };

  // Summary for the visible month
  const monthEntries = Object.entries(calMap).filter(([k]) => k.startsWith(`${year}-${String(month+1).padStart(2,"0")}`));
  const monthEvents = monthEntries.flatMap(([, v]) => v);
  const countEvents   = monthEvents.filter(e => e.type === "event").length;
  const countDeliveries = monthEvents.filter(e => e.type === "delivery").length;
  const countOrders   = monthEvents.filter(e => e.type === "order").length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
      <Loader2 className="w-8 h-8 animate-spin text-rose-300" />
    </div>
  );

  return (
    <AdminGuard allowedRoles={["admin", "manager"]}>
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <a href={createPageUrl("AdminDashboard")} className="p-2 rounded-xl hover:bg-gray-50 transition">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </a>
          <Calendar className="w-5 h-5 text-purple-400" />
          <h1 className="font-bold text-gray-800">Calendrier opérationnel</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {/* Summary pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { icon: "🌸", label: `${countEvents} événement${countEvents > 1 ? "s" : ""} client`, color: "bg-purple-50 text-purple-700" },
            { icon: "🎉", label: `${countOrders} date${countOrders > 1 ? "s" : ""} de commande`, color: "bg-rose-50 text-rose-700" },
            { icon: "📦", label: `${countDeliveries} livraison${countDeliveries > 1 ? "s" : ""} fournisseur`, color: "bg-amber-50 text-amber-700" },
          ].map(({ icon, label, color }) => (
            <span key={label} className={`text-xs font-medium px-3 py-1.5 rounded-full ${color}`}>{icon} {label}</span>
          ))}
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          {/* Nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-50 transition">
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="font-bold text-gray-800">{MONTHS_FR[month]} {year}</h2>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-gray-50 transition">
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {calDays.map((d, i) => {
              const key = formatDay(d);
              const items = d ? (calMap[key] || []) : [];
              const isToday = d && today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
              const isSelected = selected?.key === key;
              const types = [...new Set(items.map(it => it.type))];
              return (
                <div
                  key={i}
                  onClick={() => handleDayClick(d)}
                  className={`min-h-[52px] rounded-xl p-1.5 flex flex-col items-center gap-1 transition cursor-pointer
                    ${d ? "hover:bg-purple-50" : ""}
                    ${isToday ? "bg-purple-100 ring-2 ring-purple-300" : ""}
                    ${isSelected && !isToday ? "bg-indigo-50 ring-2 ring-indigo-200" : ""}
                  `}
                >
                  {d && (
                    <>
                      <span className={`text-xs font-semibold ${isToday ? "text-purple-700" : "text-gray-700"}`}>{d}</span>
                      <div className="flex flex-wrap gap-0.5 justify-center">
                        {types.map(t => (
                          <span key={t} className={`w-2 h-2 rounded-full ${TYPE_CONFIG[t].color}`} title={TYPE_CONFIG[t].label} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-gray-50">
            {Object.entries(TYPE_CONFIG).map(([, cfg]) => (
              <div key={cfg.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className={`w-2.5 h-2.5 rounded-full ${cfg.color}`} />
                {cfg.label}
              </div>
            ))}
          </div>
        </div>

        {/* Day detail panel */}
        {selected && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-bold text-gray-700 mb-3 text-sm">
              {selected.day} {MONTHS_FR[month]} {year}
            </h3>
            {selected.items.length === 0 ? (
              <p className="text-xs text-gray-400">Aucun événement ce jour.</p>
            ) : (
              <div className="space-y-2">
                {selected.items.map((item, idx) => {
                  const cfg = TYPE_CONFIG[item.type];
                  return (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50">
                      <span className="text-base">{cfg.dot}</span>
                      <div>
                        <p className="text-xs font-semibold text-gray-700">{item.label}</p>
                        <p className="text-xs text-gray-400">{cfg.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Upcoming events list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-700 mb-3 text-sm flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-400" /> Prochaines échéances (30 jours)
          </h3>
          {(() => {
            const now = new Date();
            const limit = new Date(now); limit.setDate(limit.getDate() + 30);
            const upcoming = Object.entries(calMap)
              .filter(([k]) => { const d = new Date(k); return d >= now && d <= limit; })
              .sort(([a], [b]) => a.localeCompare(b))
              .flatMap(([k, items]) => items.map(it => ({ ...it, date: k })));

            if (upcoming.length === 0) return <p className="text-xs text-gray-400">Aucune échéance dans les 30 prochains jours.</p>;
            return (
              <div className="space-y-2">
                {upcoming.map((item, idx) => {
                  const cfg = TYPE_CONFIG[item.type];
                  const d = new Date(item.date);
                  const diff = Math.round((d - new Date(today.toDateString())) / 86400000);
                  return (
                    <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition">
                      <span className="text-base">{cfg.dot}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-700 truncate">{item.label}</p>
                        <p className="text-xs text-gray-400">{d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} · {cfg.label}</p>
                      </div>
                      <span className={`text-xs font-bold rounded-full px-2 py-0.5 flex-shrink-0 ${diff === 0 ? "bg-rose-100 text-rose-600" : diff <= 7 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                        {diff === 0 ? "Aujourd'hui" : `J-${diff}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

      </div>
    </div>
    </AdminGuard>
  );
}