import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export default function SeatingPlanSection({ event }) {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    loadSeating();
  }, [event?.id]);

  const loadSeating = async () => {
    try {
      const data = await base44.entities.SeatingTable.filter({ event_id: event.id });
      setTables(data || []);
    } catch {}
  };

  if (tables.length === 0) {
    return (
      <section className="py-12">
        <h2 className="font-serif-elegant text-3xl font-bold mb-6 text-gray-900">🪑 Plan de table</h2>
        <p className="text-center text-gray-400 py-8">Plan de table à venir</p>
      </section>
    );
  }

  return (
    <section className="py-12">
      <h2 className="font-serif-elegant text-3xl font-bold mb-8 text-gray-900">🪑 Plan de table</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {tables.map((table) => (
          <div key={table.id} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 text-center">
            <p className="font-bold text-gray-800 text-lg">{table.table_name || `Table ${table.table_number}`}</p>
            <p className="text-sm text-gray-600 mt-2">{table.capacity ? `${table.capacity} places` : ""}</p>
          </div>
        ))}
      </div>
    </section>
  );
}