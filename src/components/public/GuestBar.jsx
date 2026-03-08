import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function GuestBar({ guest, onUpdate, tpl }) {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(guest.name);

  const save = () => {
    if (!newName.trim()) return;
    onUpdate({ ...guest, name: newName.trim() });
    setEditing(false);
  };

  const primary = tpl?.primary || "#f43f5e";

  return (
    <div
      className="px-4 py-2 flex items-center justify-between text-sm border-b"
      style={{ background: primary + "12", borderColor: primary + "30" }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ background: primary }}
        >
          {guest.name.charAt(0).toUpperCase()}
        </div>
        {editing ? (
          <div className="flex items-center gap-1.5">
            <Input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="h-7 text-sm rounded-lg w-32 py-0"
              onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
              autoFocus
            />
            <button onClick={save} className="p-1 rounded-lg text-green-500 hover:bg-green-50 transition">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => setEditing(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span className="font-medium text-gray-700">{guest.name}</span>
        )}
      </div>
      {!editing && (
        <button
          onClick={() => { setNewName(guest.name); setEditing(true); }}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition"
        >
          <Pencil className="w-3 h-3" /> Modifier mon prénom
        </button>
      )}
    </div>
  );
}