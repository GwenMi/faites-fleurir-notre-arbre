import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";

const PRESETS = [
  { question: "Régime alimentaire", type: "choice", options: ["Standard", "Végétarien", "Vegan", "Sans gluten", "Halal", "Casher"] },
  { question: "Chanson préférée pour la piste de danse", type: "text", options: [] },
  { question: "Allergie alimentaire ?", type: "yes_no", options: [] },
  { question: "Avez-vous besoin d'un hébergement ?", type: "yes_no", options: [] },
  { question: "Message pour les mariés", type: "text", options: [] },
];

export default function RSVPQuestions({ eventId, questions, onRefresh }) {
  const [form, setForm] = useState({ question: "", type: "text", options: [], required: false });
  const [optionInput, setOptionInput] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAddOption = () => {
    if (!optionInput.trim()) return;
    setForm(f => ({ ...f, options: [...f.options, optionInput.trim()] }));
    setOptionInput("");
  };

  const handleSave = async () => {
    if (!form.question.trim()) return;
    setSaving(true);
    await base44.entities.RSVPQuestion.create({ event_id: eventId, ...form, order: questions.length });
    setForm({ question: "", type: "text", options: [], required: false });
    onRefresh();
    toast.success("Question ajoutée !");
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.RSVPQuestion.delete(id);
    onRefresh();
    toast.success("Question supprimée");
  };

  const applyPreset = (preset) => {
    setForm({ question: preset.question, type: preset.type, options: [...preset.options], required: false });
  };

  return (
    <div>
      {/* Presets */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 mb-2">Suggestions rapides</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button key={p.question} onClick={() => applyPreset(p)}
              className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-100 rounded-full px-3 py-1 transition">
              + {p.question}
            </button>
          ))}
        </div>
      </div>

      {/* Add question form */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-5">
        <p className="text-sm font-bold text-gray-700 mb-3">Nouvelle question</p>
        <div className="space-y-2">
          <Input placeholder="Question…" value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} className="rounded-xl" />
          <div className="flex gap-2">
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value, options: [] }))}
              className="flex-1 rounded-xl border border-input bg-white px-3 py-2 text-sm">
              <option value="text">Texte libre</option>
              <option value="choice">Choix multiple</option>
              <option value="yes_no">Oui / Non</option>
            </select>
            <label className="flex items-center gap-1.5 bg-white border border-input rounded-xl px-3 py-2 cursor-pointer text-sm">
              <input type="checkbox" checked={form.required} onChange={e => setForm(f => ({ ...f, required: e.target.checked }))} />
              Obligatoire
            </label>
          </div>
          {form.type === "choice" && (
            <div className="space-y-1">
              <div className="flex gap-2">
                <Input placeholder="Ajouter une option…" value={optionInput} onChange={e => setOptionInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAddOption()} className="rounded-xl text-sm flex-1" />
                <Button size="sm" variant="outline" onClick={handleAddOption} className="rounded-xl"><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {form.options.map((opt, i) => (
                  <span key={i} className="flex items-center gap-1 bg-purple-50 text-purple-600 text-xs rounded-full px-2.5 py-1 border border-purple-100">
                    {opt}
                    <button onClick={() => setForm(f => ({ ...f, options: f.options.filter((_, j) => j !== i) }))} className="hover:text-red-400 ml-0.5">×</button>
                  </span>
                ))}
              </div>
            </div>
          )}
          <Button onClick={handleSave} disabled={saving || !form.question.trim()} className="w-full rounded-xl bg-purple-500 hover:bg-purple-600 text-white h-9">
            <Plus className="w-4 h-4 mr-1" /> Ajouter la question
          </Button>
        </div>
      </div>

      {/* Questions list */}
      {questions.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-4">Aucune question personnalisée pour l'instant.</p>
      ) : (
        <div className="space-y-2">
          {questions.sort((a, b) => (a.order || 0) - (b.order || 0)).map((q, i) => (
            <div key={q.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
              <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{q.question}</p>
                <p className="text-xs text-gray-400">{q.type === "text" ? "Texte libre" : q.type === "choice" ? `Choix: ${(q.options || []).join(", ")}` : "Oui / Non"}{q.required ? " · Obligatoire" : ""}</p>
              </div>
              <button onClick={() => handleDelete(q.id)} className="p-1.5 text-gray-300 hover:text-red-400 rounded-lg hover:bg-red-50 transition">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}