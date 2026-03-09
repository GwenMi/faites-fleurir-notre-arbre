import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Users, ChevronDown, ChevronUp, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

const COLORS = ["#a78bfa", "#f472b6", "#fb923c", "#34d399", "#60a5fa", "#f59e0b", "#ec4899", "#6ee7b7"];

const SHAPES = [
  { value: "round", label: "🔵 Ronde" },
  { value: "rectangle", label: "🔲 Rectangle" },
];

export default function TableManager({ eventId, tables, guests, onRefresh }) {
  const [expanded, setExpanded] = useState(null);
  const [newTableName, setNewTableName] = useState("");
  const [newTableShape, setNewTableShape] = useState("round");
  const [newTableCap, setNewTableCap] = useState(8);
  const [newTableColor, setNewTableColor] = useState(COLORS[0]);
  const [creating, setCreating] = useState(false);
  const [newGuest, setNewGuest] = useState({});
  const [addingGuest, setAddingGuest] = useState({});

  const handleCreateTable = async () => {
    if (!newTableName.trim()) return;
    setCreating(true);
    await base44.entities.SeatingTable.create({
      event_id: eventId,
      name: newTableName.trim(),
      shape: newTableShape,
      capacity: Number(newTableCap),
      color: newTableColor,
      position_x: 20 + Math.random() * 60,
      position_y: 20 + Math.random() * 60,
    });
    setNewTableName("");
    setNewTableCap(8);
    toast.success("Table créée !");
    onRefresh();
    setCreating(false);
  };

  const handleDeleteTable = async (tableId) => {
    await base44.entities.SeatingTable.delete(tableId);
    // also delete guests of this table
    const tableGuests = guests.filter(g => g.table_id === tableId);
    await Promise.all(tableGuests.map(g => base44.entities.SeatingGuest.delete(g.id)));
    onRefresh();
    toast.success("Table supprimée");
  };

  const handleAddGuest = async (tableId) => {
    const name = (newGuest[tableId] || "").trim();
    if (!name) return;
    setAddingGuest(prev => ({ ...prev, [tableId]: true }));
    await base44.entities.SeatingGuest.create({ event_id: eventId, table_id: tableId, name });
    setNewGuest(prev => ({ ...prev, [tableId]: "" }));
    onRefresh();
    setAddingGuest(prev => ({ ...prev, [tableId]: false }));
  };

  const handleRemoveGuest = async (guestId) => {
    await base44.entities.SeatingGuest.delete(guestId);
    onRefresh();
  };

  return (
    <div>
      {/* Add table form */}
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 mb-5">
        <p className="text-sm font-bold text-gray-700 mb-3">➕ Nouvelle table</p>
        <div className="flex flex-col gap-2">
          <Input
            placeholder="Nom (ex: Table des mariés, Table 1…)"
            value={newTableName}
            onChange={e => setNewTableName(e.target.value)}
            className="rounded-xl"
          />
          <div className="flex gap-2 flex-wrap">
            <select
              value={newTableShape}
              onChange={e => setNewTableShape(e.target.value)}
              className="flex-1 min-w-[120px] rounded-xl border border-input bg-white px-3 py-2 text-sm"
            >
              {SHAPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <div className="flex items-center gap-2 bg-white border border-input rounded-xl px-3 py-2">
              <Users className="w-4 h-4 text-gray-400" />
              <input
                type="number" min="1" max="30"
                value={newTableCap}
                onChange={e => setNewTableCap(e.target.value)}
                className="w-10 text-sm text-center border-none outline-none bg-transparent"
              />
              <span className="text-xs text-gray-400">places</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {COLORS.map(c => (
              <button key={c} onClick={() => setNewTableColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${newTableColor === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-110"}`}
                style={{ background: c }} />
            ))}
          </div>
          <Button
            onClick={handleCreateTable}
            disabled={creating || !newTableName.trim()}
            className="w-full rounded-xl bg-purple-500 hover:bg-purple-600 text-white h-10"
          >
            <Plus className="w-4 h-4 mr-1" /> Créer la table
          </Button>
        </div>
      </div>

      {/* Tables list */}
      {tables.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-6">Aucune table pour l'instant.</p>
      ) : (
        <div className="space-y-3">
          {tables.map(table => {
            const tableGuests = guests.filter(g => g.table_id === table.id);
            const isExpanded = expanded === table.id;
            const full = tableGuests.length >= table.capacity;
            return (
              <div key={table.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : table.id)}>
                  <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow"
                    style={{ background: table.color }}>
                    {table.shape === "round" ? "⬤" : "▬"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-800">{table.name}</p>
                    <p className="text-xs text-gray-400">{tableGuests.length} / {table.capacity} invités · {table.shape === "round" ? "Ronde" : "Rectangle"}</p>
                  </div>
                  {full && <span className="text-xs bg-red-50 text-red-400 rounded-full px-2 py-0.5 border border-red-100">Complète</span>}
                  <button onClick={e => { e.stopPropagation(); handleDeleteTable(table.id); }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                    {/* Guest list */}
                    <div className="space-y-1.5 mb-3">
                      {tableGuests.length === 0 && (
                        <p className="text-xs text-gray-400 italic">Aucun invité assigné</p>
                      )}
                      {tableGuests.map(g => (
                        <div key={g.id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: table.color }}>
                            {g.name[0].toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-700 flex-1">{g.name}</span>
                          <button onClick={() => handleRemoveGuest(g.id)} className="text-gray-300 hover:text-red-400 transition">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add guest */}
                    {!full && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Prénom & Nom"
                          value={newGuest[table.id] || ""}
                          onChange={e => setNewGuest(prev => ({ ...prev, [table.id]: e.target.value }))}
                          onKeyDown={e => e.key === "Enter" && handleAddGuest(table.id)}
                          className="rounded-xl text-sm flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddGuest(table.id)}
                          disabled={addingGuest[table.id] || !newGuest[table.id]?.trim()}
                          className="rounded-xl bg-purple-500 hover:bg-purple-600 text-white flex-shrink-0"
                        >
                          <UserPlus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    {full && (
                      <p className="text-xs text-center text-red-400 mt-1">Table complète — augmentez la capacité pour ajouter des invités.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}