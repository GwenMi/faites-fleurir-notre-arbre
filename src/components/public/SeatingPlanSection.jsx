import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SeatingPlanSection({ event, primaryColor }) {
  const [tables, setTables] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [highlight, setHighlight] = useState(null); // table_id

  const color = primaryColor || "#f43f5e";

  useEffect(() => {
    Promise.all([
      base44.entities.SeatingTable.filter({ event_id: event.id }),
      base44.entities.SeatingGuest.filter({ event_id: event.id }),
    ]).then(([t, g]) => {
      setTables((t || []).sort((a, b) => a.name.localeCompare(b.name)));
      setGuests(g || []);
      setLoading(false);
    });
  }, [event.id]);

  const assigned = guests.filter(g => g.table_id);
  if (loading || assigned.length === 0) return null;

  const filtered = search.trim()
    ? guests.filter(g => g.name.toLowerCase().includes(search.toLowerCase().trim()))
    : [];

  const matchTable = filtered.length > 0 ? filtered[0]?.table_id : null;

  const handleSearch = (val) => {
    setSearch(val);
    const match = guests.find(g => g.name.toLowerCase().includes(val.toLowerCase().trim()));
    setHighlight(match?.table_id || null);
  };

  return (
    <div className="px-4 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-px flex-1 max-w-16" style={{ background: `linear-gradient(to right, transparent, ${color}66)` }} />
          <span className="text-lg">🗺️</span>
          <div className="h-px flex-1 max-w-16" style={{ background: `linear-gradient(to left, transparent, ${color}66)` }} />
        </div>
        <h2 className="font-serif-elegant text-3xl font-bold text-gray-800 mb-2">Plan de table</h2>
        <p className="font-sans-clean text-gray-500 text-sm mb-5">Retrouvez votre place pour le grand jour.</p>

        {/* Search */}
        <div className="relative max-w-xs mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Chercher votre nom…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="pl-9 h-11 rounded-full border-gray-200 shadow-sm font-sans-clean text-sm"
          />
        </div>

        {/* Search result */}
        {search.trim() && (
          <div className="mt-3">
            {filtered.length > 0 ? (
              filtered.map(g => {
                const table = tables.find(t => t.id === g.table_id);
                return table ? (
                  <div key={g.id} className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2 text-sm font-sans-clean text-green-700 font-semibold">
                    ✓ {g.name} → <span style={{ color: table.color || color }}>{table.name}</span>
                  </div>
                ) : null;
              })
            ) : (
              <p className="text-sm text-gray-400 font-sans-clean">Aucun résultat pour « {search} »</p>
            )}
          </div>
        )}
      </div>

      {/* Tables grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tables.map(table => {
          const tableGuests = guests.filter(g => g.table_id === table.id);
          if (tableGuests.length === 0) return null;
          const isHighlighted = highlight === table.id;

          return (
            <div key={table.id}
              className={`bg-white rounded-2xl border-2 p-4 shadow-sm transition-all duration-300 ${isHighlighted ? "scale-105 shadow-lg" : "border-gray-100"}`}
              style={{ borderColor: isHighlighted ? table.color || color : undefined }}>
              {/* Table header */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 flex items-center justify-center text-white font-bold font-serif-elegant text-sm shadow flex-shrink-0"
                  style={{
                    background: table.color || color,
                    borderRadius: table.shape === "round" ? "50%" : "10px",
                  }}>
                  {table.name.slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 font-sans-clean text-sm">{table.name}</p>
                  <p className="text-xs text-gray-400 font-sans-clean">{tableGuests.length} personne{tableGuests.length > 1 ? "s" : ""}</p>
                </div>
              </div>

              {/* Guest chips */}
              <div className="flex flex-wrap gap-1.5">
                {tableGuests.map(g => {
                  const isMatch = search.trim() && g.name.toLowerCase().includes(search.toLowerCase().trim());
                  return (
                    <span key={g.id}
                      className="text-xs font-sans-clean px-2.5 py-1 rounded-full border transition"
                      style={isMatch
                        ? { background: (table.color || color) + "22", borderColor: table.color || color, color: table.color || color, fontWeight: 700 }
                        : { background: "#f9fafb", borderColor: "#e5e7eb", color: "#374151" }}>
                      {g.name}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}