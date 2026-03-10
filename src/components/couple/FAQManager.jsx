import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit2, Check, X, Loader2, HelpCircle, GripVertical } from "lucide-react";
import { toast } from "sonner";

const SUGGESTIONS = [
  { question: "Où se garer ?", answer: "" },
  { question: "Quel est le code vestimentaire ?", answer: "" },
  { question: "Quels sont les hôtels à proximité ?", answer: "" },
  { question: "Y a-t-il un espace enfants ?", answer: "" },
  { question: "La cérémonie est-elle en intérieur ou extérieur ?", answer: "" },
];

const EMPTY = { question: "", answer: "" };

export default function FAQManager({ event }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const res = await base44.entities.FAQItem.filter({ event_id: event.id }, "order");
    setItems(res || []);
    setLoading(false);
  };

  const openNew = (prefill = EMPTY) => {
    setForm({ question: prefill.question, answer: prefill.answer });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({ question: item.question, answer: item.answer });
    setEditingId(item.id);
    setShowForm(true);
  };

  const cancel = () => { setShowForm(false); setForm(EMPTY); setEditingId(null); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) { toast.error("Question et réponse requises"); return; }
    setSaving(true);
    const data = { event_id: event.id, question: form.question.trim(), answer: form.answer.trim() };
    if (editingId) {
      await base44.entities.FAQItem.update(editingId, data);
      setItems(items.map(i => i.id === editingId ? { ...i, ...data } : i));
      toast.success("Question mise à jour ✓");
    } else {
      const created = await base44.entities.FAQItem.create({ ...data, order: items.length });
      setItems([...items, created]);
      toast.success("Question ajoutée ✓");
    }
    cancel();
    setSaving(false);
  };

  const deleteItem = async (id) => {
    await base44.entities.FAQItem.delete(id);
    setItems(items.filter(i => i.id !== id));
    toast.success("Supprimée");
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-rose-400" /></div>;

  return (
    <div className="space-y-6">
      {/* Add button */}
      <Button onClick={() => openNew()} className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl h-10">
        <Plus className="w-4 h-4 mr-2" /> Ajouter une question
      </Button>

      {/* Form */}
      {showForm && (
        <form onSubmit={save} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-800 font-sans-clean text-sm">{editingId ? "Modifier" : "Nouvelle question"}</h3>
            <button type="button" onClick={cancel}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <Input
            placeholder="Question (ex: Où se garer ?)"
            value={form.question}
            onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
            className="h-10 rounded-xl"
            required
          />
          <textarea
            placeholder="Réponse détaillée…"
            value={form.answer}
            onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
            rows={4}
            className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            required
          />
          <Button type="submit" disabled={saving || !form.question.trim() || !form.answer.trim()}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-xl h-10">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
            {editingId ? "Enregistrer" : "Ajouter"}
          </Button>
        </form>
      )}

      {/* Suggestions */}
      {items.length === 0 && !showForm && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-5">
          <p className="text-xs text-gray-400 font-sans-clean font-semibold uppercase tracking-wide mb-3">Suggestions rapides</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => openNew(s)}
                className="text-xs bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-full hover:bg-rose-100 transition font-sans-clean">
                + {s.question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      {items.length === 0 && showForm === false ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <HelpCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-sans-clean">Aucune question pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex gap-3 group">
              <span className="text-gray-300 mt-0.5 flex-shrink-0 font-serif-elegant font-bold text-lg w-6 text-center">{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 font-sans-clean text-sm">{item.question}</p>
                <p className="text-xs text-gray-400 mt-1 whitespace-pre-line leading-relaxed">{item.answer}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => openEdit(item)} className="p-1.5 text-gray-300 hover:text-indigo-400 rounded-lg hover:bg-indigo-50 transition">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deleteItem(item.id)} className="p-1.5 text-gray-300 hover:text-red-400 rounded-lg hover:bg-red-50 transition">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick add suggestions when list not empty */}
      {items.length > 0 && !showForm && (
        <div>
          <p className="text-xs text-gray-400 font-sans-clean font-semibold uppercase tracking-wide mb-2">Ajouter rapidement</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.filter(s => !items.some(i => i.question === s.question)).map((s, i) => (
              <button key={i} onClick={() => openNew(s)}
                className="text-xs bg-gray-50 text-gray-500 border border-gray-200 px-3 py-1.5 rounded-full hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition font-sans-clean">
                + {s.question}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}