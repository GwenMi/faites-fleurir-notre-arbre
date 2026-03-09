import { useState, useRef } from "react";

export default function SeatingVisual({ tables, guests, onUpdatePosition }) {
  const [selectedTable, setSelectedTable] = useState(null);
  const [dragging, setDragging] = useState(null);
  const canvasRef = useRef(null);

  const getClientPos = (e) => {
    if (e.touches) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  };

  const handleDragStart = (e, table) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const { x, y } = getClientPos(e);
    setDragging({
      tableId: table.id,
      startX: x, startY: y,
      origX: table.position_x ?? 50,
      origY: table.position_y ?? 50,
      canvasW: rect.width,
      canvasH: rect.height,
      currentX: null, currentY: null,
    });
    setSelectedTable(table.id);
  };

  const handleDragMove = (e) => {
    if (!dragging) return;
    const { x, y } = getClientPos(e);
    const dx = x - dragging.startX;
    const dy = y - dragging.startY;
    const newX = Math.min(92, Math.max(8, dragging.origX + (dx / dragging.canvasW) * 100));
    const newY = Math.min(92, Math.max(8, dragging.origY + (dy / dragging.canvasH) * 100));
    setDragging(prev => ({ ...prev, currentX: newX, currentY: newY }));
  };

  const handleDragEnd = () => {
    if (dragging?.currentX != null) {
      onUpdatePosition(dragging.tableId, dragging.currentX, dragging.currentY);
    }
    setDragging(null);
  };

  const getPos = (table) => {
    if (dragging?.tableId === table.id && dragging.currentX != null) {
      return { x: dragging.currentX, y: dragging.currentY };
    }
    return { x: table.position_x ?? 50, y: table.position_y ?? 50 };
  };

  if (tables.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <span className="text-4xl block mb-3">🗺️</span>
        <p className="text-sm">Créez des tables dans l'onglet "Gestion" pour les voir ici.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-gray-400 mb-3 text-center">✋ Faites glisser les tables pour les repositionner · Cliquez pour voir les invités</p>
      <div
        ref={canvasRef}
        className="relative rounded-2xl border-2 border-dashed border-rose-200 overflow-hidden select-none"
        style={{ height: 500, background: "linear-gradient(135deg, #fdf4ff 0%, #fff1f2 50%, #f0fdf4 100%)" }}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {/* Subtle grid */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="seating-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#9333ea" strokeWidth="0.8"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#seating-grid)" />
        </svg>

        {tables.map(table => {
          const { x, y } = getPos(table);
          const tableGuests = guests.filter(g => g.table_id === table.id);
          const isSelected = selectedTable === table.id;
          const w = table.shape === "round" ? 80 : 96;
          const h = table.shape === "round" ? 80 : 60;

          return (
            <div
              key={table.id}
              className="absolute"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)", zIndex: isSelected ? 20 : 5, cursor: "grab" }}
              onMouseDown={e => handleDragStart(e, table)}
              onTouchStart={e => handleDragStart(e, table)}
              onClick={() => setSelectedTable(isSelected ? null : table.id)}
            >
              <div
                className={`flex flex-col items-center justify-center shadow-lg transition-transform ${isSelected ? "scale-110" : "hover:scale-105"}`}
                style={{
                  width: w, height: h,
                  borderRadius: table.shape === "round" ? "50%" : 14,
                  background: table.color + "cc",
                  border: `3px solid ${isSelected ? "#1e1b4b" : table.color}`,
                }}
              >
                <span className="text-white font-bold text-xs text-center px-1 leading-tight drop-shadow">
                  {table.name.length > 10 ? table.name.slice(0, 9) + "…" : table.name}
                </span>
                <span className="text-white/80 text-xs">
                  {tableGuests.length}/{table.capacity}
                </span>
              </div>

              {isSelected && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-2.5 min-w-[140px] z-30">
                  <p className="text-xs font-bold text-gray-700 mb-1.5 border-b border-gray-100 pb-1">{table.name}</p>
                  {tableGuests.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Aucun invité</p>
                  ) : (
                    tableGuests.slice(0, 8).map(g => (
                      <p key={g.id} className="text-xs text-gray-600 py-0.5">· {g.name}</p>
                    ))
                  )}
                  {tableGuests.length > 8 && (
                    <p className="text-xs text-gray-400 mt-1">+{tableGuests.length - 8} autres…</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {tables.map(table => {
          const count = guests.filter(g => g.table_id === table.id).length;
          const full = count >= table.capacity;
          return (
            <div key={table.id} className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-full px-3 py-1 shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: table.color }} />
              <span className="text-xs text-gray-700 font-medium">{table.name}</span>
              <span className={`text-xs ${full ? "text-red-400" : "text-gray-400"}`}>{count}/{table.capacity}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}