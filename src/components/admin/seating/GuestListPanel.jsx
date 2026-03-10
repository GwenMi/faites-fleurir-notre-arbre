import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, X, Search, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function GuestListPanel({ eventId, guests, tables, selectedGuest, onSelectGuest, onRefresh }) {
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const unassigned = guests.filter(g => !g.table_id || g.table_id === "");
  const assigned = guests.filter(g => g.table_id && g.table_id !== "");

  const filtered = (list) => list.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    // Duplicate check (case-insensitive)
    const duplicate = guests.some(g => g.name.toLowerCase() === name.toLowerCase());
    if (duplicate) { toast.error(`"${name}" est déjà dans la liste !`); return; }
    setAdding(true);
    await base44.entities.SeatingGuest.create({ event_id: eventId, name, table_id: "" });
    setNewName("");
    onRefresh();
    setAdding(false);
    toast.success("Invité ajouté !");
  };

  const handleRemove = async (guest) => {
    await base44.entities.SeatingGuest.delete(guest.id);
    if (selectedGuest?.id === guest.id) onSelectGuest(null);
    onRefresh();
  };

  const getTableName = (tableId) => tables.find(t => t.id === tableId)?.name || "?";

  return (
    <div className="flex flex-col h-full">
      {/* Add guest */}
      <div className="flex gap-2 mb-3">
        <Input placeholder="Prénom Nom…" value={newName} onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()} className="rounded-xl text-sm flex-1" />
        <Button size="sm" onClick={handleAdd} disabled={adding || !newName.trim()} className="rounded-xl bg-purple-500 hover:bg-purple-600 text-white flex-shrink-0">
          <UserPlus className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
          className="w-full pl-8 pr-3 py-2 text-xs border border-input rounded-xl bg-white" />
      </div>

      {selectedGuest && (
        <div className="mb-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-700 flex-1">Cliquez sur une table pour placer <strong>{selectedGuest.name}</strong></p>
          <button onClick={() => onSelectGuest(null)} className="text-amber-400 hover:text-amber-600"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {/* Unassigned */}
        {filtered(unassigned).length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 mt-1">Non placés ({filtered(unassigned).length})</p>
            {filtered(unassigned).map(g => (
              <div key={g.id}
                draggable
                onDragStart={e => { e.dataTransfer.setData("guestId", g.id); e.dataTransfer.effectAllowed = "move"; }}
                onClick={() => onSelectGuest(selectedGuest?.id === g.id ? null : g)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 cursor-grab active:cursor-grabbing transition mb-1 ${selectedGuest?.id === g.id ? "bg-amber-50 border border-amber-200" : "bg-gray-50 hover:bg-purple-50 border border-transparent hover:border-purple-100"}`}>
                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                  {g.name[0].toUpperCase()}
                </div>
                <span className="text-sm text-gray-700 flex-1 truncate">{g.name}</span>
                {g.source === "rsvp" && <span className="text-xs text-purple-400 flex-shrink-0">RSVP</span>}
                <span className="text-gray-300 text-xs flex-shrink-0" title="Glisser vers une table">⠿</span>
                <button onClick={e => { e.stopPropagation(); handleRemove(g); }} className="text-gray-200 hover:text-red-400 transition flex-shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Assigned */}
        {filtered(assigned).length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 mt-3">Placés ({filtered(assigned).length})</p>
            {filtered(assigned).map(g => (
              <div key={g.id} className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-green-200 flex items-center justify-center text-xs font-bold text-green-700 flex-shrink-0">
                  {g.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{g.name}</p>
                  <p className="text-xs text-gray-400 truncate">{getTableName(g.table_id)}</p>
                </div>
                <button onClick={() => handleRemove(g)} className="text-gray-200 hover:text-red-400 transition flex-shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {guests.length === 0 && <p className="text-center text-gray-400 text-xs py-4">Aucun invité pour l'instant.</p>}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 text-center">
        {guests.length} invités · {assigned.length} placés · {unassigned.length} non placés
      </div>
    </div>
  );
}