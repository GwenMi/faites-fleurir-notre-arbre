import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Clock } from "lucide-react";

export default function DayScheduleSection({ event, primaryColor }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!event?.id) return;
    base44.entities.DaySchedule.filter({ event_id: event.id })
      .then(res => setItems((res || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))));
  }, [event?.id]);

  if (items.length === 0) return null;

  return (
    <div className="px-4 py-12">
      <style>{`
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
      `}</style>

      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-px flex-1 max-w-16" style={{ background: `linear-gradient(to right, transparent, ${primaryColor}66)` }} />
          <Clock className="w-5 h-5" style={{ color: primaryColor }} />
          <div className="h-px flex-1 max-w-16" style={{ background: `linear-gradient(to left, transparent, ${primaryColor}66)` }} />
        </div>
        <h2 className="font-serif-elegant text-3xl md:text-4xl font-bold text-gray-800">
          Programme du jour
        </h2>
      </div>

      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-px" style={{ background: `${primaryColor}33` }} />
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={item.id} className="flex gap-4 items-start pl-0">
              <div className="flex-shrink-0 flex flex-col items-center" style={{ width: "4rem" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-base z-10 bg-white border-2"
                  style={{ borderColor: primaryColor + "55" }}>
                  {item.icon || "🌸"}
                </div>
              </div>
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-sans-clean font-bold text-gray-800 text-sm">{item.title}</h3>
                  <span className="font-sans-clean text-xs text-gray-400 flex-shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" />{item.time}
                  </span>
                </div>
                {item.description && <p className="font-sans-clean text-xs text-gray-500 mt-1 leading-relaxed">{item.description}</p>}
                {item.location && <p className="font-sans-clean text-xs mt-1" style={{ color: primaryColor }}>📍 {item.location}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}