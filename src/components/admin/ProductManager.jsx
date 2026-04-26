import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Plus, Edit2, Trash2, Loader2, Package, Check, X,
  ToggleLeft, ToggleRight, ImagePlus, CalendarClock, Archive
} from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = {
  kit_compose: "Kit à composer",
  kit_pret: "Kit prêt-à-l'emploi",
  pack_invite: "Pack invités",
  option_emballage: "Option emballage",
  autre: "Autre",
};

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "kit_compose",
  image: "",
  quantity: "",
  active: true,
  stock_enabled: false,
  stock_quantity: "",
  stock_end_date: "",
  sort_order: 0,
  notes: "",
};

function ProductForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set("image", file_url);
    setUploadingImg(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) { toast.error("Nom et prix requis"); return; }
    setSaving(true);
    const payload = {
      ...form,
      price: parseFloat(form.price) || 0,
      quantity: form.quantity !== "" ? parseInt(form.quantity) : undefined,
      stock_quantity: form.stock_quantity !== "" ? parseInt(form.stock_quantity) : 0,
      sort_order: parseInt(form.sort_order) || 0,
    };
    await onSave(payload);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-rose-100 p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nom */}
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Nom du produit *</label>
          <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Kit Mariage Tournesol" required className="h-10 rounded-xl" />
        </div>
        {/* Prix */}
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Prix unitaire (€) *</label>
          <Input type="number" step="0.01" min="0" value={form.price} onChange={e => set("price", e.target.value)} placeholder="3.90" required className="h-10 rounded-xl" />
        </div>
        {/* Catégorie */}
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Catégorie</label>
          <select value={form.category} onChange={e => set("category", e.target.value)}
            className="w-full h-10 rounded-xl border border-input px-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-ring">
            {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        {/* Nombre de pots */}
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Nb de pots (packs invités)</label>
          <Input type="number" min="1" value={form.quantity} onChange={e => set("quantity", e.target.value)} placeholder="50" className="h-10 rounded-xl" />
        </div>
        {/* Ordre */}
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Ordre d'affichage</label>
          <Input type="number" value={form.sort_order} onChange={e => set("sort_order", e.target.value)} placeholder="0" className="h-10 rounded-xl" />
        </div>
        {/* Actif */}
        <div className="flex items-center gap-3 mt-5">
          <button type="button" onClick={() => set("active", !form.active)}>
            {form.active
              ? <ToggleRight className="w-8 h-8 text-green-500" />
              : <ToggleLeft className="w-8 h-8 text-gray-300" />}
          </button>
          <span className="text-sm font-semibold text-gray-700">{form.active ? "Produit actif" : "Produit inactif"}</span>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label>
        <textarea value={form.description} onChange={e => set("description", e.target.value)}
          placeholder="Description courte affichée sur la boutique…"
          rows={2} className="w-full rounded-xl border border-input px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
      </div>

      {/* Image */}
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1 block">Image produit</label>
        <div className="flex items-center gap-3">
          {form.image && <img src={form.image} alt="aperçu" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />}
          <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-gray-300 cursor-pointer hover:border-rose-300 hover:bg-rose-50 transition text-sm text-gray-500">
            {uploadingImg ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
            {uploadingImg ? "Chargement…" : "Choisir une image"}
            <input type="file" accept="image/*" className="hidden" onChange={handleImage} disabled={uploadingImg} />
          </label>
          {form.image && (
            <Input value={form.image} onChange={e => set("image", e.target.value)} placeholder="ou URL de l'image" className="h-9 rounded-xl flex-1 text-xs" />
          )}
        </div>
        {!form.image && (
          <Input value={form.image} onChange={e => set("image", e.target.value)} placeholder="ou coller une URL d'image" className="h-9 rounded-xl mt-2 text-xs" />
        )}
      </div>

      {/* Stock */}
      <div className="border border-amber-100 rounded-xl p-4 bg-amber-50 space-y-3">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => set("stock_enabled", !form.stock_enabled)}>
            {form.stock_enabled
              ? <ToggleRight className="w-7 h-7 text-amber-500" />
              : <ToggleLeft className="w-7 h-7 text-gray-300" />}
          </button>
          <div>
            <p className="text-sm font-semibold text-amber-800">Gestion du stock</p>
            <p className="text-xs text-amber-600">Utile pour les éditions limitées ou produits saisonniers</p>
          </div>
        </div>
        {form.stock_enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-amber-700 mb-1 block">Quantité en stock</label>
              <Input type="number" min="0" value={form.stock_quantity} onChange={e => set("stock_quantity", e.target.value)}
                placeholder="100" className="h-9 rounded-xl border-amber-200 bg-white" />
            </div>
            <div>
              <label className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">
                <CalendarClock className="w-3.5 h-3.5" /> Date de fin (édition limitée)
              </label>
              <Input type="date" value={form.stock_end_date} onChange={e => set("stock_end_date", e.target.value)}
                className="h-9 rounded-xl border-amber-200 bg-white" />
            </div>
          </div>
        )}
      </div>

      {/* Notes internes */}
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1 block">Notes internes</label>
        <Input value={form.notes} onChange={e => set("notes", e.target.value)}
          placeholder="Ex : fournisseur X, délai 3 semaines…" className="h-9 rounded-xl" />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving} className="flex-1 bg-rose-500 hover:bg-rose-600 rounded-xl h-10">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {initial?.id ? "Mettre à jour" : "Créer le produit"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-xl h-10">
          <X className="w-4 h-4" /> Annuler
        </Button>
      </div>
    </form>
  );
}

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterActive, setFilterActive] = useState("all");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Product.list("sort_order", 100);
    setProducts(data || []);
    setLoading(false);
  };

  const handleSave = async (data) => {
    if (editing?.id) {
      await base44.entities.Product.update(editing.id, data);
      toast.success("Produit mis à jour ✓");
    } else {
      await base44.entities.Product.create(data);
      toast.success("Produit créé ✓");
    }
    setShowForm(false);
    setEditing(null);
    await load();
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Supprimer "${product.name}" ?`)) return;
    await base44.entities.Product.delete(product.id);
    toast.success("Produit supprimé");
    await load();
  };

  const toggleActive = async (product) => {
    await base44.entities.Product.update(product.id, { active: !product.active });
    setProducts(ps => ps.map(p => p.id === product.id ? { ...p, active: !p.active } : p));
    toast.success(product.active ? "Produit désactivé" : "Produit activé ✓");
  };

  const startEdit = (product) => {
    setEditing(product);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filtered = products.filter(p => {
    if (filterActive === "active") return p.active;
    if (filterActive === "inactive") return !p.active;
    return true;
  });

  const isLimitedExpired = (p) => p.stock_end_date && new Date(p.stock_end_date) < new Date();
  const isLowStock = (p) => p.stock_enabled && p.stock_quantity <= 10;

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-rose-300" /></div>;

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {[
            { key: "all", label: `Tous (${products.length})` },
            { key: "active", label: `Actifs (${products.filter(p => p.active).length})` },
            { key: "inactive", label: `Inactifs (${products.filter(p => !p.active).length})` },
          ].map(f => (
            <button key={f.key} onClick={() => setFilterActive(f.key)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition border ${filterActive === f.key ? "bg-rose-500 text-white border-rose-500" : "bg-white text-gray-500 border-gray-200 hover:border-rose-200"}`}>
              {f.label}
            </button>
          ))}
        </div>
        <Button
          onClick={() => { setEditing(null); setShowForm(s => !s); }}
          className="bg-rose-500 hover:bg-rose-600 rounded-xl text-sm gap-2"
        >
          <Plus className="w-4 h-4" /> Nouveau produit
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <ProductForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Aucun produit</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(product => {
            const expired = isLimitedExpired(product);
            const lowStock = isLowStock(product);
            return (
              <div key={product.id} className={`bg-white rounded-2xl border p-4 flex items-center gap-4 ${!product.active ? "opacity-60 border-gray-100" : expired ? "border-red-200" : lowStock ? "border-amber-200" : "border-gray-100"}`}>
                {/* Image */}
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-100" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-rose-200" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800 text-sm">{product.name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{CATEGORIES[product.category]}</span>
                    {!product.active && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 flex items-center gap-1"><Archive className="w-3 h-3" /> Inactif</span>}
                    {expired && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">Expiré</span>}
                    {lowStock && !expired && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">⚠ Stock bas</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <p className="text-base font-bold text-rose-600">{parseFloat(product.price || 0).toFixed(2)} €</p>
                    {product.quantity && <span className="text-xs text-gray-400">{product.quantity} pots</span>}
                    {product.stock_enabled && (
                      <span className="text-xs text-gray-400">
                        Stock : <strong className={product.stock_quantity <= 10 ? "text-amber-600" : "text-gray-700"}>{product.stock_quantity}</strong>
                        {product.stock_end_date && ` · jusqu'au ${new Date(product.stock_end_date).toLocaleDateString("fr-FR")}`}
                      </span>
                    )}
                  </div>
                  {product.description && <p className="text-xs text-gray-400 mt-1 truncate">{product.description}</p>}
                  {product.notes && <p className="text-xs text-indigo-400 mt-0.5 italic truncate">📝 {product.notes}</p>}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleActive(product)} title={product.active ? "Désactiver" : "Activer"}
                    className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-400">
                    {product.active ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-gray-300" />}
                  </button>
                  <button onClick={() => startEdit(product)} className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-400 hover:text-indigo-500">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(product)} className="p-2 rounded-xl hover:bg-red-50 transition text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}