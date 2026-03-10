import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MapPin } from "lucide-react";

export default function DayScheduleSection({ event, primaryColor }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const color = primaryColor || "#f43f5e";

  useEffect(() => {
    base44.entities.DaySchedule.filter({ event_id: event.id }).then(data => {
      setItems((data || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.time.localeCompare(b.time)));
      setLoading(false);
    });
  }, [event.id]);

  if (loading || items.length === 0) return null;

  return (
    <div className="px-4 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-px flex-1 max-w-16" style={{ background: `linear-gradient(to right, transparent, ${color}66)` }} />
          <span className="text-lg">📅</span>
          <div className="h-px flex-1 max-w-16" style={{ background: `linear-gradient(to left, transparent, ${color}66)` }} />
        </div>
        <h2 className="font-serif-elegant text-3xl font-bold text-gray-800 mb-2">Programme du jour</h2>
        <p className="font-sans-clean text-gray-500 text-sm">Les grands moments qui vous attendent.</p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5" style={{ background: `linear-gradient(to bottom, ${color}33, ${color}88, ${color}33)` }} />

        <div className="space-y-6">
          {items.map((item, idx) => (
            <div key={item.id} className="flex gap-5 items-start group">
              {/* Icon node */}
              <div className="flex-shrink-0 w-16 flex flex-col items-center">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-md border-2 border-white relative z-10 transition group-hover:scale-110"
                  style={{ background: `${color}22`, borderColor: `${color}66` }}>
                  {item.icon || "🌸"}
                </div>
              </div>

              {/* Content card */}
              <div className="flex-1 pb-2">
                <div
                  className="bg-white rounded-2xl border shadow-sm p-4 transition group-hover:shadow-md"
                  style={{ borderColor: `${color}22` }}>
                  <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-gray-800 font-sans-clean text-sm leading-snug">{item.title}</p>
                    <span
                      className="text-xs font-bold font-sans-clean px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ background: `${color}15`, color }}>
                      {item.time}
                    </span>
                  </div>
                  {item.location && (
                    <p className="text-xs text-gray-400 font-sans-clean flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {item.location}
                    </p>
                  )}
                  {item.description && (
                    <p className="text-xs text-gray-500 font-sans-clean mt-1.5 leading-relaxed">{item.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}