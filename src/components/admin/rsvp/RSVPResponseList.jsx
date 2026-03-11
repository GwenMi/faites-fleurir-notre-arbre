import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Search, Check, X, UserPlus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function RSVPResponseList({ responses, questions, guests, eventId, onRefresh }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = responses.filter(r => {
    const matchSearch = r.guest_name.toLowerCase().includes(search.toLowerCase()) || (r.email || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "attending" && r.attending) || (filter === "declining" && !r.attending);
    return matchSearch && matchFilter;
  });

  const exportCSV = () => {
    const headers = [
      "Nom", "Email", "Présent", "Nb personnes", "Allergies / intolérances", "Notes",
      "Entrée", "Plat", "Dessert",
      ...questions.map(q => q.question)
    ];
    const rows = responses.map(r => {
      const firstMeal = (r.meal_choices || [])[0] || {};
      return [
        r.guest_name,
        r.email || "",
        r.attending ? "Oui" : "Non",
        r.party_size || 1,
        r.allergies || "",
        r.notes || "",
        firstMeal.starter || "",
        firstMeal.main || "",
        firstMeal.dessert || "",
        ...questions.map(q => (r.answers || {})[q.id] || "")
      ];
    });
    const csv = [headers, ...rows].map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `rsvp-${new Date().toLocaleDateString("fr-FR").replace(/\//g, "-")}.csv`; a.click();
  };

  const addToGuestList = async (response) => {
    const exists = guests.some(g => g.name.toLowerCase() === response.guest_name.toLowerCase() || (g.email && g.email.toLowerCase() === (response.email || "").toLowerCase() && response.email));
    if (exists) { toast.error("Cet invité est déjà dans la liste !"); return; }
    await base44.entities.SeatingGuest.create({
      event_id: eventId, name: response.guest_name, email: response.email || "",
      attending: response.attending, rsvp_response_id: response.id, source: "rsvp"
    });
    onRefresh();
    toast.success("Invité ajouté à la liste !");
  };

  return (
    <div>
      {/* Badge temps réel */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-xs text-gray-400">Mis à jour en temps réel</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex-1 min-w-[160px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-xl bg-white" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="rounded-xl border border-input bg-white px-3 py-2 text-sm">
          <option value="all">Tous</option>
          <option value="attending">Présents</option>
          <option value="declining">Absents</option>
        </select>
        <Button size="sm" variant="outline" onClick={exportCSV} className="rounded-xl gap-1.5">
          <Download className="w-4 h-4" /> Exporter CSV
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-8">Aucune réponse reçue pour l'instant.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => {
            const alreadyInList = guests.some(g => g.name.toLowerCase() === r.guest_name.toLowerCase() || (g.rsvp_response_id === r.id));
            return (
              <div key={r.id} className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${r.attending ? "bg-green-100" : "bg-red-50"}`}>
                    {r.attending ? <Check className="w-3.5 h-3.5 text-green-600" /> : <X className="w-3.5 h-3.5 text-red-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-gray-800">{r.guest_name}</p>
                      {r.party_size > 1 && <span className="text-xs bg-blue-50 text-blue-500 border border-blue-100 rounded-full px-2 py-0.5">+{r.party_size - 1} pers.</span>}
                      {r.email && <span className="text-xs text-gray-400">{r.email}</span>}
                    </div>
                    {questions.length > 0 && (r.answers && Object.keys(r.answers).length > 0) && (
                      <div className="mt-1.5 space-y-0.5">
                        {questions.map(q => (r.answers || {})[q.id] ? (
                          <p key={q.id} className="text-xs text-gray-500"><span className="font-medium">{q.question} :</span> {(r.answers || {})[q.id]}</p>
                        ) : null)}
                      </div>
                    )}
                    {r.notes && <p className="text-xs text-gray-400 mt-1 italic">"{r.notes}"</p>}
                  </div>
                  {!alreadyInList && r.attending && (
                    <button onClick={() => addToGuestList(r)} className="flex-shrink-0 flex items-center gap-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-100 rounded-xl px-2.5 py-1.5 transition">
                      <UserPlus className="w-3.5 h-3.5" /> Ajouter
                    </button>
                  )}
                  {alreadyInList && <span className="text-xs text-green-500 flex-shrink-0">✓ Dans la liste</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}