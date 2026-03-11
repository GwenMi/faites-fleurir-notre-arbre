import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Save, Loader2, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

export default function MenuEditor({ event }) {
  const [starters, setStarters] = useState(event?.menu_starters || []);
  const [mains, setMains] = useState(event?.menu_mains || []);
  const [desserts, setDesserts] = useState(event?.menu_desserts || []);
  const [menuEnabled, setMenuEnabled] = useState(event?.menu_enabled || false);
  const [saving, setSaving] = useState(false);

  const addItem = (list, setList) => setList([...list, ""]);
  const removeItem = (list, setList, idx) => setList(list.filter((_, i) => i !== idx));
  const updateItem = (list, setList, idx, val) => {
    const updated = [...list];
    updated[idx] = val;
    setList(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Event.update(event.id, {
      menu_starters: starters.filter(s => s.trim()),
      menu_mains: mains.filter(s => s.trim()),
      menu_desserts: desserts.filter(s => s.trim()),
      menu_enabled: menuEnabled,
    });
    toast.success("Menu enregistré ✓");
    setSaving(false);
  };

  const Section = ({ title, items, setItems, color }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
      <h3 className="font-semibold text-gray-700 text-sm">{title}</h3>
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2">
          <Input
            value={item}
            onChange={e => updateItem(items, setItems, idx, e.target.value)}
            placeholder={`Option ${idx + 1}…`}
            className="rounded-xl"
          />
          <button onClick={() => removeItem(items, setItems, idx)} className="text-gray-300 hover:text-red-400 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        onClick={() => addItem(items, setItems)}
        className={`w-full flex items-center justify-center gap-2 text-xs font-semibold py-2 rounded-xl border border-dashed ${color} transition`}
      >
        <Plus className="w-3.5 h-3.5" /> Ajouter une option
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-rose-400" />
          <h2 className="text-xl font-bold text-gray-800">Menu & choix de plats</h2>
        </div>
        <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
          Enregistrer
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={menuEnabled}
            onChange={e => setMenuEnabled(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <div>
            <p className="font-semibold text-gray-700 text-sm">Activer le choix de menu dans le RSVP</p>
            <p className="text-xs text-gray-400 mt-0.5">Les invités pourront choisir leurs plats lors de leur réponse RSVP</p>
          </div>
        </label>
      </div>

      <Section title="🥗 Entrées" items={starters} setItems={setStarters} color="border-green-200 text-green-600 hover:bg-green-50" />
      <Section title="🍽️ Plats principaux" items={mains} setItems={setMains} color="border-rose-200 text-rose-500 hover:bg-rose-50" />
      <Section title="🍰 Desserts" items={desserts} setItems={setDesserts} color="border-amber-200 text-amber-600 hover:bg-amber-50" />
    </div>
  );
}