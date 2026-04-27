import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus, Edit2, Trash2, Package, Loader2, Save, X,
  FlowerIcon, Ribbon, Layers, AlertTriangle, Check
} from "lucide-react";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  active: true,
  pot_type: "",
  pot_quantity: 0,
  pot_stock: 0,
  ribbon_color: "",
  ribbon_quantity: 0,
  ribbon_stock: 0,
  seed_type: "",
  seed_quantity: 0,
  seed_stock: 0,
  custom_text_included: false,
  total_stock: 0,
  notes: "",
};

function calcTotalStock(form) {
  const stocks = [];
  if (form.pot_quantity > 0) stocks.push(Math.floor((form.pot_stock || 0) / form.pot_quantity));
  if (form.ribbon_quantity > 0) stocks.push(Math.floor((form.ribbon_stock || 0) / form.ribbon_quantity));
  if (form.seed_quantity > 0) stocks.push(Math.floor((form.seed_stock || 0) / form.seed_quantity));
  return stocks.length > 0 ? Math.min(...stocks) : 0;
}

function StockBadge({ value }) {
  if (value === 0) return <Badge className="bg-red-100 text-red-600 text-xs">Rupture</Badge>;
  if (value <= 5) return <Badge className="bg-amber-100 text-amber-700 text-xs">Stock faible ({value})</Badge>;
  return <Badge className="bg-green-100 text-green-700 text-xs">{value} kits</Badge>;
}

export default function KitManager() {
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = list, "new" = new form, id = edit
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => { loadKits(); }, []);

  const loadKits = async () => {
    setLoading(true);
    const data = await base44.entities.Kit.list("-created_date");
    setKits(data || []);
    setLoading(false);
  };

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditingId("new");
  };

  const openEdit = (kit) => {
    setForm({ ...kit });
    setEditingId(kit.id);
  };

  const cancel = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleChange = (field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      updated.total_stock = calcTotalStock(updated);
      return updated;
    });
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error("Nom du kit requis"); return; }
    setSaving(true);
    const data = { ...form, price: parseFloat(form.price) || 0 };
    if (editingId === "new") {
      await base44.entities.Kit.create(data);
      toast.success("Kit créé ✓");
    } else {
      await base44.entities.Kit.update(editingId, data);
      toast.success("Kit mis à jour ✓");
    }
    setSaving(false);
    setEditingId(null);
    loadKits();
  };

  const deleteKit = async (id) => {
    if (!window.confirm("Supprimer ce kit ?")) return;
    await base44.entities.Kit.delete(id);
    toast.success("Supprimé ✓");
    loadKits();
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
    </div>
  );

  // ── FORM ──
  if (editingId !== null) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-lg">
            {editingId === "new" ? "Nouveau kit" : "Modifier le kit"}
          </h3>
          <button onClick={cancel} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Infos générales */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Informations générales</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Nom du kit *</label>
              <Input value={form.name} onChange={e => handleChange("name", e.target.value)} placeholder="Ex: Kit Mariage Rose 50 pots" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Prix (€)</label>
              <Input type="number" step="0.01" value={form.price} onChange={e => handleChange("price", e.target.value)} placeholder="0.00" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer mb-1">
                <input type="checkbox" checked={form.active} onChange={e => handleChange("active", e.target.checked)} className="rounded" />
                <span className="text-sm font-semibold text-gray-600">Kit actif</span>
              </label>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label>
              <Input value={form.description} onChange={e => handleChange("description", e.target.value)} placeholder="Description courte du kit" />
            </div>
          </div>
        </div>

        {/* Composants */}
        <div className="space-y-3">
          {/* Pots */}
          <div className="bg-orange-50 rounded-xl border border-orange-100 p-5 space-y-3">
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">🫙 Pots</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-3 sm:col-span-1">
                <label className="text-xs text-gray-500 mb-1 block">Type de pot</label>
                <Input value={form.pot_type} onChange={e => handleChange("pot_type", e.target.value)} placeholder="Ex: Verre 8cm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Qté / kit</label>
                <Input type="number" min="0" value={form.pot_quantity} onChange={e => handleChange("pot_quantity", parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Stock dispo</label>
                <Input type="number" min="0" value={form.pot_stock} onChange={e => handleChange("pot_stock", parseInt(e.target.value) || 0)} />
              </div>
            </div>
          </div>

          {/* Rubans */}
          <div className="bg-pink-50 rounded-xl border border-pink-100 p-5 space-y-3">
            <p className="text-xs font-semibold text-pink-600 uppercase tracking-wider">🎀 Rubans</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-3 sm:col-span-1">
                <label className="text-xs text-gray-500 mb-1 block">Couleur / type</label>
                <Input value={form.ribbon_color} onChange={e => handleChange("ribbon_color", e.target.value)} placeholder="Ex: Rose poudré" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Qté / kit</label>
                <Input type="number" min="0" value={form.ribbon_quantity} onChange={e => handleChange("ribbon_quantity", parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Stock dispo</label>
                <Input type="number" min="0" value={form.ribbon_stock} onChange={e => handleChange("ribbon_stock", parseInt(e.target.value) || 0)} />
              </div>
            </div>
          </div>

          {/* Graines */}
          <div className="bg-green-50 rounded-xl border border-green-100 p-5 space-y-3">
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">🌱 Graines</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-3 sm:col-span-1">
                <label className="text-xs text-gray-500 mb-1 block">Type de graines</label>
                <Input value={form.seed_type} onChange={e => handleChange("seed_type", e.target.value)} placeholder="Ex: Lavande" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Qté / kit</label>
                <Input type="number" min="0" value={form.seed_quantity} onChange={e => handleChange("seed_quantity", parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Stock dispo</label>
                <Input type="number" min="0" value={form.seed_stock} onChange={e => handleChange("seed_stock", parseInt(e.target.value) || 0)} />
              </div>
            </div>
          </div>
        </div>

        {/* Options & stock calculé */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Options & Stock</p>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.custom_text_included} onChange={e => handleChange("custom_text_included", e.target.checked)} className="rounded" id="cti" />
            <label htmlFor="cti" className="text-sm text-gray-600 cursor-pointer">Texte personnalisé inclus</label>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-600 font-medium">Kits complets disponibles :</span>
            <StockBadge value={form.total_stock} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Notes internes</label>
            <Input value={form.notes} onChange={e => handleChange("notes", e.target.value)} placeholder="Notes pour l'équipe" />
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={save} disabled={saving} className="flex-1 bg-rose-500 hover:bg-rose-600">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {editingId === "new" ? "Créer le kit" : "Enregistrer"}
          </Button>
          <Button onClick={cancel} variant="outline" className="flex-1">Annuler</Button>
        </div>
      </div>
    );
  }

  // ── LIST ──
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Kits</h2>
          <p className="text-sm text-gray-500 mt-0.5">{kits.length} kit{kits.length > 1 ? "s" : ""} configuré{kits.length > 1 ? "s" : ""}</p>
        </div>
        <Button onClick={openNew} className="bg-rose-500 hover:bg-rose-600">
          <Plus className="w-4 h-4 mr-1" /> Nouveau kit
        </Button>
      </div>

      {kits.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
          <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Aucun kit créé</p>
          <Button onClick={openNew} variant="outline" className="mt-4 text-sm">
            <Plus className="w-4 h-4 mr-1" /> Créer le premier kit
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {kits.map(kit => (
            <div key={kit.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-rose-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-bold text-gray-800">{kit.name}</span>
                  {!kit.active && <Badge className="bg-gray-100 text-gray-500 text-xs">Inactif</Badge>}
                  <StockBadge value={kit.total_stock || 0} />
                </div>
                {kit.price > 0 && <p className="text-sm text-rose-600 font-semibold mb-2">{kit.price.toFixed(2)} €</p>}
                <div className="flex flex-wrap gap-2">
                  {kit.pot_type && <span className="text-xs bg-orange-50 text-orange-600 rounded-full px-2.5 py-1">🫙 {kit.pot_type} × {kit.pot_quantity}</span>}
                  {kit.ribbon_color && <span className="text-xs bg-pink-50 text-pink-600 rounded-full px-2.5 py-1">🎀 {kit.ribbon_color} × {kit.ribbon_quantity}</span>}
                  {kit.seed_type && <span className="text-xs bg-green-50 text-green-600 rounded-full px-2.5 py-1">🌱 {kit.seed_type} × {kit.seed_quantity}</span>}
                  {kit.custom_text_included && <span className="text-xs bg-purple-50 text-purple-600 rounded-full px-2.5 py-1">✏️ Texte perso</span>}
                </div>
                {kit.notes && <p className="text-xs text-gray-400 mt-2 italic">{kit.notes}</p>}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => openEdit(kit)} className="p-2 hover:bg-gray-50 rounded-lg transition text-gray-400 hover:text-gray-600">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteKit(kit.id)} className="p-2 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}