import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, List, Users } from "lucide-react";
import TableManager from "./seating/TableManager";
import SeatingVisual from "./seating/SeatingVisual";

export default function SeatingManager({ event }) {
  const [tables, setTables] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [event?.id]);

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

  const handleUpdatePosition = async (tableId, x, y) => {
    await base44.entities.SeatingTable.update(tableId, { position_x: Math.round(x * 10) / 10, position_y: Math.round(y * 10) / 10 });
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, position_x: x, position_y: y } : t));
  };

  const totalGuests = guests.length;
  const totalCapacity = tables.reduce((s, t) => s + (t.capacity || 0), 0);

  if (loading) return <div className="py-10 text-center text-gray-400 text-sm">Chargement du plan de table...</div>;

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-purple-50 rounded-2xl p-3 text-center border border-purple-100">
          <p className="text-2xl font-bold text-purple-600">{tables.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Tables</p>
        </div>
        <div className="bg-rose-50 rounded-2xl p-3 text-center border border-rose-100">
          <p className="text-2xl font-bold text-rose-500">{totalGuests}</p>
          <p className="text-xs text-gray-500 mt-0.5">Invités placés</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-3 text-center border border-green-100">
          <p className="text-2xl font-bold text-green-600">{totalCapacity - totalGuests}</p>
          <p className="text-xs text-gray-500 mt-0.5">Places libres</p>
        </div>
      </div>

      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="w-full mb-4 rounded-2xl bg-gray-50 border border-gray-100 p-1">
          <TabsTrigger value="visual" className="flex-1 rounded-xl text-xs">
            <LayoutGrid className="w-3 h-3 mr-1" /> Plan visuel
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex-1 rounded-xl text-xs">
            <List className="w-3 h-3 mr-1" /> Gestion
          </TabsTrigger>
        </TabsList>
        <TabsContent value="visual">
          <SeatingVisual tables={tables} guests={guests} onUpdatePosition={handleUpdatePosition} />
        </TabsContent>
        <TabsContent value="manage">
          <TableManager eventId={event.id} tables={tables} guests={guests} onRefresh={loadData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}