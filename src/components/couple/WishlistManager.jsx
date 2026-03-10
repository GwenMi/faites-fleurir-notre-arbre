import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ExternalLink, Gift, Loader2, X, Edit2, Check } from "lucide-react";
import { toast } from "sonner";

const EMPTY_FORM = { title: "", description: "", price: "", link: "", image_url: "", category: "gift", target_amount: "" };

export default function WishlistManager({ event }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchItems();
    const unsub = base44.entities.WishlistItem.subscribe((ev) => {
      if (ev.type === "create") setItems(i => [...i, ev.data]);
      else if (ev.type === "update") setItems(i => i.map(x => x.id === ev.id ? ev.data : x));
      else if (ev.type === "delete") setItems(i => i.filter(x => x.id !== ev.id));
    });
    return unsub;
  }, []);

  const fetchItems = async () => {
    const result = await base44.entities.WishlistItem.filter({ event_id: event.id }, "order");
    setItems(result || []);
    setLoading(false);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const startEdit = (item) => {
    setForm({
      title: item.title || "",
      description: item.description || "",
      price: item.price != null ? String(item.price) : "",
      link: item.link || "",
      image_url: item.image_url || "",
      category: item.category || "gift",
      target_amount: item.target_amount != null ? String(item.target_amount) : "",
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const cancel = () => { setShowForm(false); setForm(EMPTY_FORM); setEditingId(null); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    const data = {
      event_id: event.id,
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      price: form.price ? parseFloat(form.price) : undefined,
      link: form.link.trim() || undefined,
      image_url: form.image_url.trim() || undefined,
      category: form.category,
      target_amount: form.target_amount ? parseFloat(form.target_amount) : undefined,
    };
    if (editingId) {
      await base44.entities.WishlistItem.update(editingId, data);
      toast.success("Cadeau mis à jour");
    } else {
      await base44.entities.WishlistItem.create({ ...data, order: items.length });
      toast.success("Cadeau ajouté ✓");
    }
    cancel();
    setSaving(false);
  };

  const deleteItem = async (id) => {
    await base44.entities.WishlistItem.delete(id);
    toast.success("Supprimé");
  };

  const resetOffered = async (item) => {
    await base44.entities.WishlistItem.update(item.id, { offered: false, offered_by: "" });
    toast.success("Marqué comme disponible");
  };

  const offered = items.filter(i => i.offered).length;
  const total = items.length;

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-rose-400" /></div>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      {total > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
            <p className="text-3xl font-bold font-serif-elegant text-gray-800">{total}</p>
            <p className="text-xs text-gray-500 font-sans-clean mt-1">Cadeaux</p>
          </div>
          <div className="bg-white rounded-2xl border border-green-200 p-4 text-center">
            <p className="text-3xl font-bold font-serif-elegant text-green-600">{offered}</p>
            <p className="text-xs text-gray-500 font-sans-clean mt-1">Offerts</p>
          </div>
          <div className="bg-white rounded-2xl border border-rose-200 p-4 text-center">
            <p className="text-3xl font-bold font-serif-elegant text-rose-600">{total - offered}</p>
            <p className="text-xs text-gray-500 font-sans-clean mt-1">Disponibles</p>
          </div>
        </div>
      )}

      {/* Add button */}
      <Button onClick={() => { setShowForm(v => !v); setEditingId(null); setForm(EMPTY_FORM); }}
        className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl h-10">
        <Plus className="w-4 h-4 mr-2" /> Ajouter un cadeau / une cagnotte
      </Button>

      {/* Form */}
      {showForm && (
        <form onSubmit={save} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-800 font-sans-clean text-sm">{editingId ? "Modifier" : "Nouveau cadeau"}</h3>
            <button type="button" onClick={cancel}><X className="w-4 h-4 text-gray-400" /></button>
          </div>

          {/* Type */}
          <div className="flex gap-2">
            {[{ v: "gift", label: "🎁 Cadeau" }, { v: "cagnotte", label: "💝 Cagnotte" }].map(opt => (
              <button type="button" key={opt.v} onClick={() => set("category", opt.v)}
                className={`flex-1 py-2 rounded-xl text-sm font-sans-clean font-semibold border transition ${form.category === opt.v ? "bg-rose-50 border-rose-300 text-rose-600" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                {opt.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Titre *" value={form.title} onChange={e => set("title", e.target.value)} className="h-10 rounded-xl" required />
            <Input type="number" placeholder={form.category === "cagnotte" ? "Objectif (€)" : "Prix (€)"} value={form.category === "cagnotte" ? form.target_amount : form.price}
              onChange={e => set(form.category === "cagnotte" ? "target_amount" : "price", e.target.value)} className="h-10 rounded-xl" />
            <Input placeholder="Description" value={form.description} onChange={e => set("description", e.target.value)} className="h-10 rounded-xl sm:col-span-2" />
            <Input placeholder="Lien (boutique...)" value={form.link} onChange={e => set("link", e.target.value)} className="h-10 rounded-xl" />
            <Input placeholder="URL image" value={form.image_url} onChange={e => set("image_url", e.target.value)} className="h-10 rounded-xl" />
          </div>

          <Button type="submit" disabled={saving || !form.title.trim()} className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-xl h-10">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
            {editingId ? "Enregistrer" : "Ajouter"}
          </Button>
        </form>
      )}

      {/* List */}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Gift className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-sans-clean">Aucun cadeau pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className={`bg-white rounded-2xl border p-4 flex gap-4 items-start transition ${item.offered ? "border-green-200 bg-green-50/30" : "border-gray-200"}`}>
              {item.image_url && (
                <img src={item.image_url} alt={item.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-gray-100" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-sans-clean text-gray-400 mr-2">{item.category === "cagnotte" ? "💝 Cagnotte" : "🎁 Cadeau"}</span>
                    <p className="font-semibold text-gray-800 font-sans-clean text-sm">{item.title}</p>
                    {item.description && <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>}
                  </div>
                  {item.category === "gift" && item.price != null && (
                    <span className="text-rose-600 font-bold font-serif-elegant text-lg flex-shrink-0">{item.price}€</span>
                  )}
                  {item.category === "cagnotte" && item.target_amount != null && (
                    <span className="text-rose-600 font-bold font-serif-elegant text-lg flex-shrink-0">/{item.target_amount}€</span>
                  )}
                </div>
                {item.offered && (
                  <p className="text-xs text-green-600 font-sans-clean mt-1">✓ Offert par {item.offered_by || "un invité"}</p>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 flex items-center gap-1 hover:underline">
                      <ExternalLink className="w-3 h-3" /> Voir le produit
                    </a>
                  )}
                  {item.offered && (
                    <button onClick={() => resetOffered(item)} className="text-xs text-gray-400 hover:text-amber-500 underline">
                      Rendre disponible
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button onClick={() => startEdit(item)} className="text-gray-300 hover:text-indigo-400 transition p-1"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => deleteItem(item.id)} className="text-gray-300 hover:text-red-400 transition p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}