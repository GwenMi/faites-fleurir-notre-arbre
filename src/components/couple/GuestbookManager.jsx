import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Check, X, Star, StarOff, BookOpen, Trash2, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function formatDate(d) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function GuestbookManager({ event }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending"); // pending | approved | all

  useEffect(() => { loadEntries(); }, [event?.id]);

  const loadEntries = async () => {
    setLoading(true);
    const data = await base44.entities.GuestbookEntry.filter({ event_id: event.id });
    setEntries((data || []).sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    setLoading(false);
  };

  const approve = async (entry) => {
    await base44.entities.GuestbookEntry.update(entry.id, { approved: true });
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, approved: true } : e));
    toast.success(`Message de ${entry.pseudo} approuvé ✓`);
  };

  const reject = async (entry) => {
    await base44.entities.GuestbookEntry.update(entry.id, { approved: false });
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, approved: false } : e));
    toast.success("Message masqué");
  };

  const toggleFeatured = async (entry) => {
    await base44.entities.GuestbookEntry.update(entry.id, { featured: !entry.featured });
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, featured: !e.featured } : e));
    toast.success(entry.featured ? "Retiré des favoris" : "Mis en avant ⭐");
  };

  const remove = async (entry) => {
    if (!confirm(`Supprimer le message de ${entry.pseudo} ?`)) return;
    await base44.entities.GuestbookEntry.delete(entry.id);
    setEntries(prev => prev.filter(e => e.id !== entry.id));
    toast.success("Message supprimé");
  };

  const pending = entries.filter(e => !e.approved);
  const approved = entries.filter(e => e.approved);

  const displayed = filter === "pending" ? pending : filter === "approved" ? approved : entries;

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "En attente", value: pending.length, color: "amber", icon: Clock },
          { label: "Approuvés", value: approved.length, color: "green", icon: CheckCircle },
          { label: "Total", value: entries.length, color: "purple", icon: BookOpen },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`bg-${s.color}-50 border border-${s.color}-100 rounded-2xl p-3 text-center`}>
              <Icon className={`w-4 h-4 text-${s.color}-400 mx-auto mb-1`} />
              <p className={`text-2xl font-bold text-${s.color}-600`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: "pending", label: `En attente (${pending.length})` },
          { key: "approved", label: `Approuvés (${approved.length})` },
          { key: "all", label: "Tous" },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`text-xs px-4 py-2 rounded-xl border transition font-semibold ${filter === f.key ? "bg-rose-100 border-rose-300 text-rose-700" : "bg-white border-gray-200 text-gray-500 hover:border-rose-200"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Entries */}
      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Chargement...</div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">{filter === "pending" ? "Aucun message en attente de validation 🎉" : "Aucun message ici"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(entry => (
            <div key={entry.id} className={`bg-white border rounded-2xl p-4 shadow-sm transition ${!entry.approved ? "border-amber-200 bg-amber-50/30" : entry.featured ? "border-yellow-300 bg-yellow-50/20" : "border-gray-100"}`}>
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm ${!entry.approved ? "bg-amber-300" : "bg-purple-400"}`}>
                  {entry.pseudo[0]?.toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-sm text-gray-800">{entry.pseudo}</span>
                    {entry.email && <span className="text-xs text-gray-400">{entry.email}</span>}
                    <span className="text-xs text-gray-300">{formatDate(entry.created_date)}</span>
                    {!entry.approved && <span className="text-xs bg-amber-100 text-amber-600 border border-amber-200 rounded-full px-2 py-0.5">En attente</span>}
                    {entry.featured && <span className="text-xs bg-yellow-100 text-yellow-600 border border-yellow-200 rounded-full px-2 py-0.5">⭐ Mis en avant</span>}
                  </div>
                  <p className="text-sm text-gray-700 italic leading-relaxed">"{entry.message}"</p>
                  {entry.photo_url && (
                    <img src={entry.photo_url} alt="Photo jointe" className="mt-2 rounded-xl max-h-40 object-cover border border-gray-100" />
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  {!entry.approved ? (
                    <Button size="sm" onClick={() => approve(entry)}
                      className="rounded-xl bg-green-500 hover:bg-green-600 text-white h-8 px-3 text-xs gap-1">
                      <Check className="w-3.5 h-3.5" /> Approuver
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => reject(entry)}
                      className="rounded-xl h-8 px-3 text-xs text-gray-500 gap-1">
                      <X className="w-3.5 h-3.5" /> Masquer
                    </Button>
                  )}
                  <button onClick={() => toggleFeatured(entry)}
                    className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl border transition ${entry.featured ? "bg-yellow-50 border-yellow-200 text-yellow-600" : "bg-white border-gray-200 text-gray-400 hover:border-yellow-200"}`}>
                    {entry.featured ? <StarOff className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                    {entry.featured ? "Retirer" : "Mettre en avant"}
                  </button>
                  <button onClick={() => remove(entry)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl border border-gray-100 text-gray-300 hover:border-red-200 hover:text-red-400 transition">
                    <Trash2 className="w-3 h-3" /> Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}