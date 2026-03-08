import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, BarChart2, X } from "lucide-react";
import { toast } from "sonner";

export default function PollManager({ eventId, polls, responses, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", question: "", type: "single_choice", options: ["", ""], deadline: "", is_active: true });
  const [saving, setSaving] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addOption = () => setForm(f => ({ ...f, options: [...f.options, ""] }));
  const removeOption = (i) => setForm(f => ({ ...f, options: f.options.filter((_, idx) => idx !== i) }));
  const setOption = (i, v) => setForm(f => { const o = [...f.options]; o[i] = v; return { ...f, options: o }; });

  const handleCreate = async () => {
    if (!form.title || !form.question) { toast.error("Merci de renseigner le titre et la question"); return; }
    setSaving(true);
    await base44.entities.Poll.create({ ...form, event_id: eventId, options: form.options.filter(o => o.trim()) });
    setShowForm(false);
    setForm({ title: "", question: "", type: "single_choice", options: ["", ""], deadline: "", is_active: true });
    toast.success("Sondage créé !");
    onRefresh();
    setSaving(false);
  };

  const toggleActive = async (poll) => {
    await base44.entities.Poll.update(poll.id, { is_active: !poll.is_active });
    onRefresh();
  };

  const deletePoll = async (poll) => {
    await base44.entities.Poll.delete(poll.id);
    toast.success("Sondage supprimé");
    onRefresh();
  };

  const getPollResponses = (pollId) => responses.filter(r => r.poll_id === pollId);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-gray-700">Sondages ({polls.length})</h3>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="rounded-xl bg-purple-500 hover:bg-purple-600 text-white">
          <Plus className="w-4 h-4 mr-1" /> Nouveau
        </Button>
      </div>

      {showForm && (
        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 space-y-3">
          <Input placeholder="Titre (ex: RSVP)" value={form.title} onChange={e => set("title", e.target.value)} className="rounded-xl h-11" />
          <Input placeholder="Question" value={form.question} onChange={e => set("question", e.target.value)} className="rounded-xl h-11" />
          <Select value={form.type} onValueChange={v => set("type", v)}>
            <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="single_choice">Choix unique</SelectItem>
              <SelectItem value="multiple_choice">Choix multiple</SelectItem>
              <SelectItem value="yes_no">Oui / Non</SelectItem>
              <SelectItem value="text">Réponse libre</SelectItem>
            </SelectContent>
          </Select>

          {(form.type === "single_choice" || form.type === "multiple_choice") && (
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Options</Label>
              {form.options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={opt} onChange={e => setOption(i, e.target.value)} placeholder={`Option ${i + 1}`} className="rounded-xl h-9" />
                  {form.options.length > 2 && (
                    <button onClick={() => removeOption(i)} className="text-red-400 hover:text-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addOption} className="text-sm text-purple-500 hover:text-purple-700 font-medium">
                + Ajouter une option
              </button>
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-sm text-gray-600">Date limite (optionnel)</Label>
            <Input type="date" value={form.deadline} onChange={e => set("deadline", e.target.value)} className="rounded-xl h-11" />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button onClick={handleCreate} disabled={saving} className="flex-1 rounded-xl bg-purple-500 hover:bg-purple-600 text-white">
              {saving ? "Création..." : "Créer"}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {polls.map(poll => {
          const pollResps = getPollResponses(poll.id);
          return (
            <div key={poll.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-800">{poll.title}</p>
                  <p className="text-sm text-gray-500">{poll.question}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={poll.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
                    {poll.is_active ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-3">{pollResps.length} réponse{pollResps.length !== 1 ? "s" : ""}</p>

              {pollResps.length > 0 && selectedPoll === poll.id && (
                <div className="mb-3 space-y-1">
                  {poll.type === "text" ? (
                    pollResps.map(r => (
                      <div key={r.id} className="bg-gray-50 rounded-lg px-3 py-2 text-sm">
                        <span className="font-medium text-gray-600">{r.guest_name}:</span>
                        <span className="text-gray-500 ml-2">{r.response}</span>
                      </div>
                    ))
                  ) : (
                    (poll.type === "yes_no" ? ["Oui", "Non"] : poll.options || []).map(opt => {
                      const count = pollResps.filter(r => r.response === opt || r.response.includes(opt)).length;
                      const pct = pollResps.length > 0 ? Math.round((count / pollResps.length) * 100) : 0;
                      return (
                        <div key={opt}>
                          <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                            <span>{opt}</span><span>{count} ({pct}%)</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full bg-purple-400" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setSelectedPoll(selectedPoll === poll.id ? null : poll.id)}
                  className="flex-1 rounded-xl text-xs h-8">
                  <BarChart2 className="w-3 h-3 mr-1" /> {selectedPoll === poll.id ? "Masquer" : "Résultats"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => toggleActive(poll)} className="flex-1 rounded-xl text-xs h-8">
                  {poll.is_active ? "Désactiver" : "Activer"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => deletePoll(poll)}
                  className="rounded-xl text-xs h-8 border-red-200 text-red-500 hover:bg-red-50">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        })}
        {polls.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <BarChart2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucun sondage pour l'instant</p>
          </div>
        )}
      </div>
    </div>
  );
}