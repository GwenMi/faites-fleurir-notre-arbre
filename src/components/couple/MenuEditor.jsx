import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Save, Loader2, UtensilsCrossed, Baby, Leaf } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_DIETARY = ["Végétarien", "Vegan", "Sans gluten", "Halal", "Casher", "Sans lactose"];

export default function MenuEditor({ event }) {
  const [starters, setStarters] = useState(event?.menu_starters || []);
  const [mains, setMains] = useState(event?.menu_mains || []);
  const [desserts, setDesserts] = useState(event?.menu_desserts || []);
  const [menuEnabled, setMenuEnabled] = useState(event?.menu_enabled || false);
  const [dietaryEnabled, setDietaryEnabled] = useState(event?.menu_dietary_enabled || false);
  const [dietaryOptions, setDietaryOptions] = useState(event?.menu_dietary_options || []);
  const [childrenEnabled, setChildrenEnabled] = useState(event?.menu_children_enabled || false);
  const [childrenOptions, setChildrenOptions] = useState(event?.menu_children_options || []);
  const [saving, setSaving] = useState(false);
  const [newDietary, setNewDietary] = useState("");
  const [newChildren, setNewChildren] = useState("");

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
      menu_dietary_enabled: dietaryEnabled,
      menu_dietary_options: dietaryOptions.filter(s => s.trim()),
      menu_children_enabled: childrenEnabled,
      menu_children_options: childrenOptions.filter(s => s.trim()),
    });
    toast.success("Menu enregistré ✓");
    setSaving(false);
  };

  const CourseSection = ({ title, items, setItems, color }) => (
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

      {/* Toggle menu principal */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={menuEnabled} onChange={e => setMenuEnabled(e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
          <div>
            <p className="font-semibold text-gray-700 text-sm">Activer le choix de menu (entrée / plat / dessert)</p>
            <p className="text-xs text-gray-400 mt-0.5">Les invités pourront choisir leurs plats lors de leur réponse RSVP, pour chaque personne du groupe.</p>
          </div>
        </label>
      </div>

      {menuEnabled && (
        <>
          <CourseSection title="🥗 Entrées" items={starters} setItems={setStarters} color="border-green-200 text-green-600 hover:bg-green-50" />
          <CourseSection title="🍽️ Plats principaux" items={mains} setItems={setMains} color="border-rose-200 text-rose-500 hover:bg-rose-50" />
          <CourseSection title="🍰 Desserts" items={desserts} setItems={setDesserts} color="border-amber-200 text-amber-600 hover:bg-amber-50" />
        </>
      )}

      {/* Régimes alimentaires */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={dietaryEnabled} onChange={e => setDietaryEnabled(e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-green-500" />
            <div>
              <p className="font-semibold text-gray-700 text-sm">Proposer un choix de régime alimentaire</p>
              <p className="text-xs text-gray-400 mt-0.5">Végétarien, vegan, sans gluten… chaque invité choisit son régime.</p>
            </div>
          </div>
        </label>

        {dietaryEnabled && (
          <div className="space-y-3 pt-2 border-t border-gray-50">
            <p className="text-xs font-semibold text-gray-500">Suggestions rapides</p>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_DIETARY.filter(d => !dietaryOptions.includes(d)).map(d => (
                <button key={d} onClick={() => setDietaryOptions(prev => [...prev, d])}
                  className="text-xs bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-full px-3 py-1 transition">
                  + {d}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {dietaryOptions.map((opt, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input value={opt} onChange={e => updateItem(dietaryOptions, setDietaryOptions, idx, e.target.value)} className="rounded-xl" />
                  <button onClick={() => removeItem(dietaryOptions, setDietaryOptions, idx)} className="text-gray-300 hover:text-red-400 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Ajouter un régime personnalisé…"
                value={newDietary}
                onChange={e => setNewDietary(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && newDietary.trim()) { setDietaryOptions(prev => [...prev, newDietary.trim()]); setNewDietary(""); }}}
                className="rounded-xl flex-1"
              />
              <Button size="sm" variant="outline" onClick={() => { if (newDietary.trim()) { setDietaryOptions(prev => [...prev, newDietary.trim()]); setNewDietary(""); }}} className="rounded-xl">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Menu enfant */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={childrenEnabled} onChange={e => setChildrenEnabled(e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
          <div className="flex items-center gap-2">
            <Baby className="w-4 h-4 text-blue-400" />
            <div>
              <p className="font-semibold text-gray-700 text-sm">Proposer un menu enfant</p>
              <p className="text-xs text-gray-400 mt-0.5">Les invités pourront indiquer combien d'enfants les accompagnent et choisir leur menu.</p>
            </div>
          </div>
        </label>

        {childrenEnabled && (
          <div className="space-y-3 pt-2 border-t border-gray-50">
            <p className="text-xs font-semibold text-gray-500">Options du menu enfant</p>
            <div className="space-y-2">
              {childrenOptions.map((opt, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input value={opt} onChange={e => updateItem(childrenOptions, setChildrenOptions, idx, e.target.value)}
                    placeholder={`Menu enfant ${idx + 1}…`} className="rounded-xl" />
                  <button onClick={() => removeItem(childrenOptions, setChildrenOptions, idx)} className="text-gray-300 hover:text-red-400 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Ex : Menu poulet frites, Menu poisson…"
                value={newChildren}
                onChange={e => setNewChildren(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && newChildren.trim()) { setChildrenOptions(prev => [...prev, newChildren.trim()]); setNewChildren(""); }}}
                className="rounded-xl flex-1"
              />
              <Button size="sm" variant="outline" onClick={() => { if (newChildren.trim()) { setChildrenOptions(prev => [...prev, newChildren.trim()]); setNewChildren(""); }}} className="rounded-xl">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}