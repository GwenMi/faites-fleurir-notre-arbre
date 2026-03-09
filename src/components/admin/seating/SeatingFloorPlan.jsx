import { useState, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const ROOM_SHAPES = [
  { id: "rect", label: "Rectangle", icon: "▬" },
  { id: "square", label: "Carré", icon: "■" },
  { id: "L", label: "Forme en L", icon: "⌐" },
  { id: "U", label: "Forme en U", icon: "⊔" },
];

function RoomBackground({ shape }) {
  const base = "absolute border-4 border-gray-200 bg-white/60";
  if (shape === "rect") return <div className={`${base} inset-4 rounded-2xl`} />;
  if (shape === "square") return <div className={`${base} rounded-2xl`} style={{ top: 40, left: "15%", right: "15%", bottom: 40 }} />;
  if (shape === "L") return (
    <>
      <div className={`${base} rounded-tl-2xl rounded-bl-2xl`} style={{ top: 24, left: 16, right: "45%", bottom: 24 }} />
      <div className={`${base} rounded-tr-2xl rounded-br-2xl`} style={{ top: 24, left: "55%", right: 16, bottom: "45%" }} />
    </>
  );
  if (shape === "U") return (
    <>
      <div className={`${base} rounded-tl-2xl rounded-bl-2xl`} style={{ top: 24, left: 16, right: "70%", bottom: 24 }} />
      <div className={`${base} rounded-tr-2xl rounded-br-2xl`} style={{ top: 24, left: "70%", right: 16, bottom: 24 }} />
      <div className={`${base} rounded-b-2xl`} style={{ top: "60%", left: 16, right: 16, bottom: 24 }} />
    </>
  );
  return null;
}

export default function SeatingFloorPlan({ tables, guests, selectedGuest, onSelectGuest, onUpdatePosition, onAssignGuest, onUnassignGuest }) {
  const [roomShape, setRoomShape] = useState("rect");
  const [dragging, setDragging] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const canvasRef = useRef(null);

  const getClientPos = (e) => e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };

  const handleDragStart = useCallback((e, table) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedGuest) return; // in assign mode, don't drag
    const rect = canvasRef.current.getBoundingClientRect();
    const { x, y } = getClientPos(e);
    setDragging({ tableId: table.id, startX: x, startY: y, origX: table.position_x ?? 50, origY: table.position_y ?? 50, canvasW: rect.width, canvasH: rect.height, currentX: null, currentY: null });
  }, [selectedGuest]);

  const handleDragMove = useCallback((e) => {
    if (!dragging) return;
    const { x, y } = getClientPos(e);
    const dx = x - dragging.startX, dy = y - dragging.startY;
    const newX = Math.min(93, Math.max(7, dragging.origX + (dx / dragging.canvasW) * 100));
    const newY = Math.min(93, Math.max(7, dragging.origY + (dy / dragging.canvasH) * 100));
    setDragging(prev => ({ ...prev, currentX: newX, currentY: newY }));
  }, [dragging]);

  const handleDragEnd = useCallback(() => {
    if (dragging?.currentX != null) onUpdatePosition(dragging.tableId, dragging.currentX, dragging.currentY);
    setDragging(null);
  }, [dragging, onUpdatePosition]);

  const handleTableClick = (e, table) => {
    e.stopPropagation();
    if (selectedGuest) {
      // Assign guest to this table
      onAssignGuest(selectedGuest, table);
      onSelectGuest(null);
      return;
    }
    setSelectedTable(selectedTable?.id === table.id ? null : table);
  };

  const getPos = (table) => {
    if (dragging?.tableId === table.id && dragging.currentX != null) return { x: dragging.currentX, y: dragging.currentY };
    return { x: table.position_x ?? 50, y: table.position_y ?? 50 };
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Room shape selector */}
      <div className="flex gap-2 mb-3 flex-wrap items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          <span className="text-xs text-gray-400 self-center mr-1">Salle :</span>
          {ROOM_SHAPES.map(s => (
            <button key={s.id} onClick={() => setRoomShape(s.id)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition ${roomShape === s.id ? "bg-purple-100 border-purple-300 text-purple-700 font-semibold" : "bg-white border-gray-100 text-gray-500 hover:border-purple-200"}`}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>
        <button onClick={handlePrint} className="text-xs flex items-center gap-1 bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-xl px-3 py-1.5 transition print:hidden">
          🖨️ Imprimer
        </button>
      </div>

      {selectedGuest && (
        <div className="mb-2 text-center">
          <span className="text-sm bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-2 inline-block">
            ✋ Cliquez sur une table pour placer <strong>{selectedGuest.name}</strong>
          </span>
        </div>
      )}

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative rounded-2xl overflow-hidden select-none"
        style={{ height: 480, background: "linear-gradient(135deg, #fdf4ff 0%, #fff1f2 50%, #f0fdf4 100%)", cursor: selectedGuest ? "crosshair" : "default" }}
        onMouseMove={handleDragMove} onMouseUp={handleDragEnd} onMouseLeave={handleDragEnd}
        onTouchMove={handleDragMove} onTouchEnd={handleDragEnd}
        onClick={() => setSelectedTable(null)}
      >
        <RoomBackground shape={roomShape} />

        {/* Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
          <defs><pattern id="fp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#9333ea" strokeWidth="0.5" />
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#fp-grid)" />
        </svg>

        {tables.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <p className="text-3xl mb-2">🗺️</p>
              <p className="text-sm">Créez des tables dans l'onglet "Tables"</p>
            </div>
          </div>
        )}

        {tables.map(table => {
          const { x, y } = getPos(table);
          const tableGuests = guests.filter(g => g.table_id === table.id);
          const isSelected = selectedTable?.id === table.id;
          const isActive = selectedGuest && true; // show assign hint
          const w = table.shape === "round" ? 80 : 100;
          const h = table.shape === "round" ? 80 : 56;

          return (
            <div key={table.id} className="absolute"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)", zIndex: isSelected ? 30 : 10 }}>
              <div
                onMouseDown={e => handleDragStart(e, table)}
                onTouchStart={e => handleDragStart(e, table)}
                onClick={e => handleTableClick(e, table)}
                className={`flex flex-col items-center justify-center shadow-lg transition-all ${isSelected ? "scale-110 ring-4 ring-indigo-400 ring-offset-2" : isActive ? "hover:scale-105 hover:ring-2 hover:ring-amber-400 hover:ring-offset-1" : "hover:scale-105"}`}
                style={{ width: w, height: h, borderRadius: table.shape === "round" ? "50%" : 14, background: table.color + "dd", border: `3px solid ${table.color}`, cursor: selectedGuest ? "pointer" : "grab" }}>
                <span className="text-white font-bold text-xs text-center px-1 leading-tight drop-shadow">{table.name.length > 10 ? table.name.slice(0, 9) + "…" : table.name}</span>
                <span className="text-white/80 text-xs">{tableGuests.length}/{table.capacity}</span>
              </div>

              {/* Seats around table */}
              {tableGuests.slice(0, 8).map((g, i) => {
                const total = Math.min(tableGuests.length, 8);
                const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
                const r = (table.shape === "round" ? 52 : 46);
                const sx = Math.cos(angle) * r;
                const sy = Math.sin(angle) * r;
                return (
                  <div key={g.id}
                    onClick={e => { e.stopPropagation(); onUnassignGuest(g); }}
                    className="absolute w-6 h-6 rounded-full border-2 border-white shadow flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-red-300 transition"
                    style={{ left: "50%", top: "50%", transform: `translate(calc(-50% + ${sx}px), calc(-50% + ${sy}px))`, background: table.color, zIndex: 5 }}
                    title={`${g.name} (cliquer pour désassigner)`}>
                    <span className="text-white text-xs font-bold">{g.name[0]}</span>
                  </div>
                );
              })}

              {/* Popup */}
              {isSelected && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 min-w-[160px] z-40"
                  onClick={e => e.stopPropagation()}>
                  <p className="text-xs font-bold text-gray-700 mb-2 border-b border-gray-100 pb-1.5">{table.name} · {tableGuests.length}/{table.capacity}</p>
                  {tableGuests.length === 0
                    ? <p className="text-xs text-gray-400 italic">Aucun invité</p>
                    : tableGuests.map(g => (
                      <div key={g.id} className="flex items-center gap-1.5 py-0.5">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: table.color }}>{g.name[0]}</div>
                        <span className="text-xs text-gray-600 flex-1 truncate">{g.name}</span>
                        <button onClick={() => onUnassignGuest(g)} className="text-gray-200 hover:text-red-400 text-xs">×</button>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .seating-print-area, .seating-print-area * { visibility: visible; }
          .seating-print-area { position: fixed; top: 0; left: 0; width: 100vw; }
        }
      `}</style>
    </div>
  );
}