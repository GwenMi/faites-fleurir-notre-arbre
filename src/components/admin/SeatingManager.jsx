import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, List, Users, Download } from "lucide-react";
import TableManager from "./seating/TableManager";
import SeatingFloorPlan from "./seating/SeatingFloorPlan";
import GuestListPanel from "./seating/GuestListPanel";
import { toast } from "sonner";

export default function SeatingManager({ event }) {
  const [tables, setTables] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [activeTab, setActiveTab] = useState("plan");

  useEffect(() => { loadData(); }, [event?.id]);

  const loadData = async () => {
    setLoading(true);
    const [t, g] = await Promise.all([
      base44.entities.SeatingTable.filter({ event_id: event.id }),
      base44.entities.SeatingGuest.filter({ event_id: event.id }),
    ]);
    setTables((t || []).sort((a, b) => a.name.localeCompare(b.name)));
    setGuests(g || []);
    setLoading(false);
  };

  const handleUpdatePosition = useCallback(async (tableId, x, y) => {
    await base44.entities.SeatingTable.update(tableId, { position_x: Math.round(x * 10) / 10, position_y: Math.round(y * 10) / 10 });
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, position_x: x, position_y: y } : t));
  }, []);

  const handleAssignGuest = useCallback(async (guest, table) => {
    const tableGuests = guests.filter(g => g.table_id === table.id);
    if (tableGuests.length >= (table.capacity || 8)) { toast.error("Table complète !"); return; }
    await base44.entities.SeatingGuest.update(guest.id, { table_id: table.id });
    setGuests(prev => prev.map(g => g.id === guest.id ? { ...g, table_id: table.id } : g));
    toast.success(`${guest.name} → ${table.name}`);
  }, [guests]);

  const handleUnassignGuest = useCallback(async (guest) => {
    await base44.entities.SeatingGuest.update(guest.id, { table_id: "" });
    setGuests(prev => prev.map(g => g.id === guest.id ? { ...g, table_id: "" } : g));
    toast.success(`${guest.name} retiré de la table`);
  }, []);

  const exportCSV = () => {
    const rows = [["Invité", "Table", "Source"]];
    guests.forEach(g => {
      const table = tables.find(t => t.id === g.table_id);
      rows.push([g.name, table?.name || "Non placé", g.source || "manuel"]);
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "plan-de-table.csv"; a.click();
  };

  const totalGuests = guests.length;
  const totalCapacity = tables.reduce((s, t) => s + (t.capacity || 0), 0);
  const assigned = guests.filter(g => g.table_id && g.table_id !== "").length;

  if (loading) return <div className="py-10 text-center text-gray-400 text-sm">Chargement du plan de table...</div>;

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: "Tables", value: tables.length, color: "purple" },
          { label: "Invités", value: totalGuests, color: "blue" },
          { label: "Placés", value: assigned, color: "green" },
          { label: "Libres", value: totalCapacity - assigned, color: "rose" },
        ].map(s => (
          <div key={s.label} className={`bg-${s.color}-50 border border-${s.color}-100 rounded-2xl p-2.5 text-center`}>
            <p className={`text-xl font-bold text-${s.color}-600`}>{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center gap-2 mb-4">
          <TabsList className="flex-1 rounded-2xl bg-gray-50 border border-gray-100 p-1">
            <TabsTrigger value="plan" className="flex-1 rounded-xl text-xs"><LayoutGrid className="w-3 h-3 mr-1" /> Plan visuel</TabsTrigger>
            <TabsTrigger value="tables" className="flex-1 rounded-xl text-xs"><List className="w-3 h-3 mr-1" /> Tables</TabsTrigger>
            <TabsTrigger value="guests" className="flex-1 rounded-xl text-xs"><Users className="w-3 h-3 mr-1" /> Invités</TabsTrigger>
          </TabsList>
          <button onClick={exportCSV} className="flex items-center gap-1 text-xs bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-xl px-3 py-2 transition flex-shrink-0">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>

        <TabsContent value="plan">
          <div className="flex gap-4 flex-col xl:flex-row">
            {/* Guest list sidebar */}
            <div className="xl:w-64 bg-gray-50 border border-gray-100 rounded-2xl p-3 xl:max-h-[560px]">
              <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Liste d'invités
              </p>
              <GuestListPanel
                eventId={event.id} guests={guests} tables={tables}
                selectedGuest={selectedGuest} onSelectGuest={setSelectedGuest} onRefresh={loadData}
              />
            </div>
            {/* Floor plan */}
            <div className="flex-1">
              <SeatingFloorPlan
                tables={tables} guests={guests}
                selectedGuest={selectedGuest} onSelectGuest={setSelectedGuest}
                onUpdatePosition={handleUpdatePosition}
                onAssignGuest={handleAssignGuest}
                onUnassignGuest={handleUnassignGuest}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tables">
          <TableManager eventId={event.id} tables={tables} guests={guests} onRefresh={loadData} />
        </TabsContent>

        <TabsContent value="guests">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <GuestListPanel
              eventId={event.id} guests={guests} tables={tables}
              selectedGuest={selectedGuest} onSelectGuest={setSelectedGuest} onRefresh={loadData}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}