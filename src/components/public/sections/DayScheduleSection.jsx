import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export default function DayScheduleSection({ event }) {
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    loadSchedule();
  }, [event?.id]);

  const loadSchedule = async () => {
    try {
      const data = await base44.entities.DaySchedule.filter({ event_id: event.id }, "order");
      setSchedule(data || []);
    } catch {}
  };

  if (schedule.length === 0) {
    return (
      <section className="py-12">
        <h2 className="font-serif-elegant text-3xl font-bold mb-6 text-gray-900">📅 Programme de la journée</h2>
        <p className="text-center text-gray-400 py-8">Programme à venir...</p>
      </section>
    );
  }

  return (
    <section className="py-12">
      <h2 className="font-serif-elegant text-3xl font-bold mb-8 text-gray-900">📅 Programme de la journée</h2>
      <div className="space-y-4">
        {schedule.map((item, idx) => (
          <div key={idx} className="flex gap-6 pb-6 border-b border-gray-100 last:border-0">
            <div className="text-4xl flex-shrink-0">{item.icon || "⏰"}</div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{item.time}</p>
              <h3 className="text-lg font-bold text-gray-800 mt-1">{item.title}</h3>
              {item.description && <p className="text-gray-600 text-sm mt-2">{item.description}</p>}
              {item.location && <p className="text-gray-500 text-xs mt-2">📍 {item.location}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}