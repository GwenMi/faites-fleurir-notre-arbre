import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Check, X, Clock, Users, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const STATUS_LABELS = {
  pending:  { label: "En attente", color: "bg-amber-100 text-amber-700" },
  approved: { label: "Approuvé",   color: "bg-green-100 text-green-700" },
  rejected: { label: "Refusé",     color: "bg-red-100 text-red-600"    },
};

export default function GuestAccessManager({ event }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending"); // pending | approved | rejected | all

  useEffect(() => { load(); }, [event.id]);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.GuestSession.filter({ event_id: event.id });
    setSessions(data || []);
    setLoading(false);
  };

  const update = async (id, status) => {
    await base44.entities.GuestSession.update(id, { status });
    setSessions(s => s.map(g => g.id === id ? { ...g, status } : g));
    toast.success(status === "approved" ? "Accès accordé ✅" : "Accès refusé");
  };

  const filtered = sessions.filter(g => {
    const s = g.status || "approved"; // rétrocompat anciens comptes sans status
    return filter === "all" ? true : s === filter;
  });

  const counts = {
    pending:  sessions.filter(g => (g.status || "approved") === "pending").length,
    approved: sessions.filter(g => (g.status || "approved") === "approved").length,
    rejected: sessions.filter(g => (g.status || "approved") === "rejected").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-2xl font-bold text-gray-800">
            Demandes d'accès invités
          </h2>
          <p style={{ fontFamily: "'Lato', sans-serif" }} className="text-sm text-gray-500 mt-1">
            Approuvez ou refusez les personnes souhaitant accéder au défi des fleurs
          </p>
        </div>
        <button onClick={load} className="p-2 rounded-full hover:bg-gray-100 transition text-gray-400">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: "pending",  label: "En attente", icon: Clock,  color: "text-amber-600 bg-amber-50 border-amber-200" },
          { key: "approved", label: "Approuvés",  icon: Check,  color: "text-green-600 bg-green-50 border-green-200" },
          { key: "rejected", label: "Refusés",    icon: X,      color: "text-red-500 bg-red-50 border-red-200"       },
        ].map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-2xl border p-4 text-left transition ${color} ${filter === key ? "ring-2 ring-offset-1 ring-current" : "opacity-70 hover:opacity-100"}`}
          >
            <Icon className="w-5 h-5 mb-1" />
            <p style={{ fontFamily: "'Lato', sans-serif" }} className="text-2xl font-bold">{counts[key]}</p>
            <p style={{ fontFamily: "'Lato', sans-serif" }} className="text-xs font-medium">{label}</p>
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p style={{ fontFamily: "'Lato', sans-serif" }} className="text-sm text-gray-400">
            {filter === "pending" ? "Aucune demande en attente" : "Aucun invité dans cette catégorie"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(g => {
            const status = g.status || "approved";
            const badge = STATUS_LABELS[status];
            return (
              <div key={g.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0 text-rose-400 font-bold text-sm">
                    {(g.pseudo || g.email || "?")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p style={{ fontFamily: "'Lato', sans-serif" }} className="font-semibold text-gray-800 text-sm truncate">{g.pseudo || "—"}</p>
                    <p style={{ fontFamily: "'Lato', sans-serif" }} className="text-xs text-gray-400 truncate">{g.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.color}`}>{badge.label}</span>
                  {status !== "approved" && (
                    <button
                      onClick={() => update(g.id, "approved")}
                      className="w-8 h-8 rounded-full bg-green-100 hover:bg-green-200 text-green-600 flex items-center justify-center transition"
                      title="Approuver"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {status !== "rejected" && (
                    <button
                      onClick={() => update(g.id, "rejected")}
                      className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-500 flex items-center justify-center transition"
                      title="Refuser"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
