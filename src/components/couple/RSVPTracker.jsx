import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, CheckCircle2, XCircle, HelpCircle, Clock } from "lucide-react";

const STATUS = {
  confirmed: { label: "Présent(e)", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 border-green-200" },
  declined:  { label: "Absent(e)",  icon: XCircle,      color: "text-red-500",   bg: "bg-red-50 border-red-200" },
  maybe:     { label: "Peut-être",  icon: HelpCircle,   color: "text-amber-500", bg: "bg-amber-50 border-amber-200" },
  pending:   { label: "En attente", icon: Clock,        color: "text-gray-400",  bg: "bg-gray-50 border-gray-200" },
};

export default function RSVPTracker({ event }) {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuests();
    // Realtime
    const unsub = base44.entities.GuestInvitation.subscribe((ev) => {
      if (ev.type === "create") setGuests(g => [...g, ev.data].filter(x => x.event_id === event.id));
      else if (ev.type === "update") setGuests(g => g.map(x => x.id === ev.id ? ev.data : x));
      else if (ev.type === "delete") setGuests(g => g.filter(x => x.id !== ev.id));
    });
    return unsub;
  }, []);

  const fetchGuests = async () => {
    const result = await base44.entities.GuestInvitation.filter({ event_id: event.id }, "guest_name");
    setGuests(result || []);
    setLoading(false);
  };

  const counts = {
    confirmed: guests.filter(g => g.rsvp_status === "confirmed").length,
    declined:  guests.filter(g => g.rsvp_status === "declined").length,
    maybe:     guests.filter(g => g.rsvp_status === "maybe").length,
    pending:   guests.filter(g => g.rsvp_status === "pending" || !g.rsvp_status).length,
  };
  const totalPeople = guests.filter(g => g.rsvp_status === "confirmed").reduce((s, g) => s + (g.party_size || 1), 0);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-rose-400" /></div>;

  if (guests.length === 0) return (
    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
      <p className="text-gray-500 text-sm">Ajoutez d'abord des invités dans l'onglet "Mes invités".</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Live badge */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-xs text-gray-500 font-sans-clean">Mis à jour en temps réel</span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(STATUS).map(([key, s]) => {
          const Icon = s.icon;
          return (
            <div key={key} className={`rounded-2xl border p-4 text-center ${s.bg}`}>
              <Icon className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
              <p className={`text-3xl font-bold font-serif-elegant ${s.color}`}>{counts[key]}</p>
              <p className="text-xs text-gray-500 font-sans-clean mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {counts.confirmed > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 text-sm text-green-700 font-sans-clean">
          🎉 <strong>{totalPeople} personne{totalPeople > 1 ? "s" : ""}</strong> confirmée{totalPeople > 1 ? "s" : ""} au total (comptant les accompagnants)
        </div>
      )}

      {/* Progress bar */}
      {guests.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex justify-between text-xs text-gray-500 font-sans-clean mb-2">
            <span>Taux de réponse</span>
            <span>{Math.round(((guests.length - counts.pending) / guests.length) * 100)}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-400 rounded-full transition-all duration-500"
              style={{ width: `${((guests.length - counts.pending) / guests.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 font-sans-clean">{guests.length - counts.pending} réponses reçues sur {guests.length} invités</p>
        </div>
      )}

      {/* Detail list */}
      <div className="space-y-3">
        {Object.entries(STATUS).map(([key, s]) => {
          const group = guests.filter(g => (g.rsvp_status || "pending") === key);
          if (group.length === 0) return null;
          const Icon = s.icon;
          return (
            <div key={key} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className={`px-5 py-3 border-b border-gray-100 flex items-center gap-2`}>
                <Icon className={`w-4 h-4 ${s.color}`} />
                <span className={`font-semibold text-sm font-sans-clean ${s.color}`}>{s.label} — {group.length}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {group.map(g => (
                  <div key={g.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 font-sans-clean">{g.guest_name}</p>
                      {g.guest_email && <p className="text-xs text-gray-400">{g.guest_email}</p>}
                      {g.dietary_notes && <p className="text-xs text-amber-600 italic">{g.dietary_notes}</p>}
                    </div>
                    {key === "confirmed" && g.party_size > 1 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-sans-clean">
                        {g.party_size} personnes
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}