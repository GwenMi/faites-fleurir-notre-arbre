import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MapPin } from "lucide-react";

export default function DayScheduleSection({ event, primaryColor }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.DaySchedule.filter({ event_id: event.id }).then(data => {
      setItems((data || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.time.localeCompare(b.time)));
      setLoading(false);
    });
  }, [event.id]);

  if (loading || items.length === 0) return null;

  const pc = primaryColor || "#c084fc";

  return (
    <div className="my-10">
      <div className="text-center mb-8">
        <p className="text-xs tracking-[0.3em] uppercase mb-2 font-light" style={{ color: pc }}>Programme</p>
        <h2 className="text-3xl font-bold text-gray-800" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
          Déroulé de la journée
        </h2>
        <div className="w-16 h-px mx-auto mt-3" style={{ background: `linear-gradient(90deg, transparent, ${pc}, transparent)` }} />
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[28px] top-3 bottom-3 w-0.5 rounded-full md:left-1/2 md:-translate-x-1/2"
          style={{ background: `linear-gradient(to bottom, ${pc}44, ${pc}cc, ${pc}44)` }} />

        <div className="space-y-6">
          {items.map((item, i) => (
            <div key={item.id} className={`relative flex items-start gap-4 md:gap-0 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
              {/* Icon bubble — mobile: left fixed; desktop: center */}
              <div className="flex-shrink-0 z-10 md:absolute md:left-1/2 md:-translate-x-1/2 md:top-3">
                <div className="w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center text-2xl border-4 border-white"
                  style={{ background: `linear-gradient(135deg, ${pc}22, ${pc}44)` }}>
                  {item.icon || "🌸"}
                </div>
              </div>

              {/* Content card */}
              <div className={`flex-1 md:w-[44%] md:flex-none ${i % 2 === 0 ? "md:pr-10 md:text-right" : "md:pl-10 md:ml-auto"}`}>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 ml-4 md:ml-0">
                  <div className={`flex items-center gap-2 mb-1 ${i % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                    <span className="text-xs font-bold rounded-full px-2.5 py-0.5 border flex-shrink-0"
                      style={{ color: pc, background: pc + "18", borderColor: pc + "44" }}>
                      {item.time}
                    </span>
                    <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                  </div>
                  {item.location && (
                    <p className={`text-xs text-gray-400 flex items-center gap-1 ${i % 2 === 0 ? "md:justify-end" : ""}`}>
                      <MapPin className="w-3 h-3 flex-shrink-0" /> {item.location}
                    </p>
                  )}
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.description}</p>
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