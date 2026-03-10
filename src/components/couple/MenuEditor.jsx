import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, UtensilsCrossed, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

const COURSE_CONFIG = [
  { key: "menu_starters", label: "Entrées", emoji: "🥗" },
  { key: "menu_mains", label: "Plats principaux", emoji: "🍽️" },
  { key: "menu_desserts", label: "Desserts", emoji: "🍰" },
];

export default function MenuEditor({ event }) {
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(event.menu_enabled || false);
  const [starters, setStarters] = useState(event.menu_starters || []);
  const [mains, setMains] = useState(event.menu_mains || []);
  const [desserts, setDesserts] = useState(event.menu_desserts || []);
  const [inputs, setInputs] = useState({ starters: "", mains: "", desserts: "" });

  const stateByCourse = {
    menu_starters: { items: starters, setter: setStarters, inputKey: "starters" },
    menu_mains: { items: mains, setter: setMains, inputKey: "mains" },
    menu_desserts: { items: desserts, setter: setDesserts, inputKey: "desserts" },
  };

  const addItem = (courseKey) => {
    const { items, setter, inputKey } = stateByCourse[courseKey];
    const val = inputs[inputKey].trim();
    if (!val) return;
    setter([...items, val]);
    setInputs(i => ({ ...i, [inputKey]: "" }));
  };

  const removeItem = (courseKey, idx) => {
    const { items, setter } = stateByCourse[courseKey];
    setter(items.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Event.update(event.id, {
      menu_enabled: enabled,
      menu_starters: starters,
      menu_mains: mains,
      menu_desserts: desserts,
    });
    toast.success("Menu enregistré ✓");
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Enable toggle */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-rose-400" />
            Choix du menu dans le RSVP
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Vos invités pourront sélectionner leurs plats lors de leur réponse.
          </p>
        </div>
        <button onClick={() => setEnabled(!enabled)} className="transition">
          {enabled
            ? <ToggleRight className="w-10 h-10 text-rose-500" />
            : <ToggleLeft className="w-10 h-10 text-gray-300" />}
        </button>
      </div>

      {enabled && (
        <>
          {COURSE_CONFIG.map(({ key, label, emoji }) => {
            const { items, inputKey } = stateByCourse[key];
            return (
              <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                <h3 className="font-semibold text-gray-700 text-sm">{emoji} {label}</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder={`Ajouter une option ${label.toLowerCase()}…`}
                    value={inputs[inputKey]}
                    onChange={e => setInputs(i => ({ ...i, [inputKey]: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && addItem(key)}
                    className="rounded-xl flex-1 text-sm"
                  />
                  <Button size="sm" variant="outline" onClick={() => addItem(key)} className="rounded-xl">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {items.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-2">Aucune option ajoutée</p>
                ) : (
                  <ul className="space-y-1.5">
                    {items.map((item, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                        <span className="text-sm text-gray-700">{item}</span>
                        <button onClick={() => removeItem(key, idx)} className="text-gray-300 hover:text-red-400 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </>
      )}

      <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl bg-rose-500 hover:bg-rose-600 text-white h-10">
        {saving ? "Enregistrement…" : "Enregistrer le menu"}
      </Button>
    </div>
  );
}