import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Users, CheckCircle, Clock, XCircle, HelpCircle, TrendingUp, Eye, Baby, UserCheck } from "lucide-react";

export default function StatsPanel({ event }) {
  const [guests, setGuests] = useState([]);
  const [guestbook, setGuestbook] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const unsub = base44.entities.GuestInvitation.subscribe(() => loadData());
    return unsub;
  }, [event?.id]);

  const loadData = async () => {
    setLoading(true);
    const [g, gb, p, w] = await Promise.all([
      base44.entities.GuestInvitation.filter({ event_id: event.id }),
      base44.entities.GuestbookEntry.filter({ event_id: event.id }),
      base44.entities.Photo.filter({ event_id: event.id }),
      base44.entities.WishlistItem.filter({ event_id: event.id }),
    ]);
    setGuests(g || []);
    setGuestbook(gb || []);
    setPhotos(p || []);
    setWishlist(w || []);
    setLoading(false);
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-rose-300" />
    </div>
  );

  // RSVP stats
  const total = guests.length;
  const confirmed = guests.filter(g => g.rsvp_status === "confirmed");
  const declined = guests.filter(g => g.rsvp_status === "declined");
  const pending = guests.filter(g => g.rsvp_status === "pending");
  const maybe = guests.filter(g => g.rsvp_status === "maybe");
  const responded = confirmed.length + declined.length + maybe.length;
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

  // Attendees count (party_size)
  const totalAdults = confirmed.reduce((s, g) => s + (g.party_size || 1), 0);
  const invitationsSent = guests.filter(g => g.invitation_sent).length;

  // Wishlist
  const wishOffered = wishlist.filter(w => w.offered).length;
  const wishTotal = wishlist.filter(w => w.category === "gift").length;

  const rsvpBreakdown = [
    { label: "Confirmés", value: confirmed.length, color: "#10b981", bg: "bg-emerald-50", border: "border-emerald-100", icon: CheckCircle, iconColor: "text-emerald-500" },
    { label: "En attente", value: pending.length, color: "#f59e0b", bg: "bg-amber-50", border: "border-amber-100", icon: Clock, iconColor: "text-amber-500" },
    { label: "Peut-être", value: maybe.length, color: "#8b5cf6", bg: "bg-violet-50", border: "border-violet-100", icon: HelpCircle, iconColor: "text-violet-500" },
    { label: "Déclinés", value: declined.length, color: "#ef4444", bg: "bg-red-50", border: "border-red-100", icon: XCircle, iconColor: "text-red-400" },
  ];

  return (
    <div className="space-y-6">

      {/* Taux de réponse */}
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-rose-400" />
            <h3 className="font-semibold text-gray-800 text-sm">Taux de réponse aux invitations</h3>
          </div>
          <span className="text-3xl font-bold text-rose-500">{responseRate}%</span>
        </div>
        {/* Progress bar segmentée */}
        {total > 0 && (
          <div className="w-full h-4 rounded-full overflow-hidden flex bg-gray-100">
            {confirmed.length > 0 && (
              <div className="h-full bg-emerald-400 transition-all duration-700"
                style={{ width: `${(confirmed.length / total) * 100}%` }} title="Confirmés" />
            )}
            {maybe.length > 0 && (
              <div className="h-full bg-violet-400 transition-all duration-700"
                style={{ width: `${(maybe.length / total) * 100}%` }} title="Peut-être" />
            )}
            {declined.length > 0 && (
              <div className="h-full bg-red-300 transition-all duration-700"
                style={{ width: `${(declined.length / total) * 100}%` }} title="Déclinés" />
            )}
          </div>
        )}
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-400">{responded} sur {total} invités ont répondu</p>
          <p className="text-xs text-gray-400">{invitationsSent} invitation{invitationsSent !== 1 ? "s" : ""} envoyée{invitationsSent !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* RSVP breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {rsvpBreakdown.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4 text-center`}>
              <Icon className={`w-5 h-5 mx-auto mb-1.5 ${s.iconColor}`} />
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Présences confirmées */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <UserCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-gray-800 text-sm">Présences confirmées</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-500">{totalAdults}</div>
            <div className="text-xs text-gray-400 mt-1">Personnes au total</div>
          </div>
          <div className="text-center border-x border-gray-100">
            <div className="text-3xl font-bold text-blue-400">{confirmed.length}</div>
            <div className="text-xs text-gray-400 mt-1">Tables / groupes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-300">
              {totalAdults > 0 ? (totalAdults / confirmed.length || 0).toFixed(1) : "—"}
            </div>
            <div className="text-xs text-gray-400 mt-1">Moy. par groupe</div>
          </div>
        </div>

        {/* Répartition par taille de groupe */}
        {confirmed.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-50">
            <p className="text-xs text-gray-400 mb-2">Répartition des groupes</p>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4].map(size => {
                const count = confirmed.filter(g => (g.party_size || 1) === size).length;
                if (count === 0) return null;
                return (
                  <span key={size} className="text-xs bg-emerald-50 border border-emerald-100 text-emerald-600 px-3 py-1 rounded-full">
                    {count}× {size === 1 ? "1 pers." : `${size} pers.`}
                  </span>
                );
              })}
              {confirmed.filter(g => (g.party_size || 1) > 4).length > 0 && (
                <span className="text-xs bg-emerald-50 border border-emerald-100 text-emerald-600 px-3 py-1 rounded-full">
                  {confirmed.filter(g => (g.party_size || 1) > 4).length}× 5+ pers.
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Activité & contenu */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5 text-violet-400" />
          <h3 className="font-semibold text-gray-800 text-sm">Activité sur le site public</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-violet-500">{guestbook.length}</div>
            <div className="text-xs text-gray-400 mt-1">Messages livre d'or</div>
          </div>
          <div className="border-x border-gray-100">
            <div className="text-2xl font-bold text-pink-400">{photos.length}</div>
            <div className="text-xs text-gray-400 mt-1">Photos partagées</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-400">
              {wishTotal > 0 ? `${wishOffered}/${wishTotal}` : "—"}
            </div>
            <div className="text-xs text-gray-400 mt-1">Cadeaux offerts</div>
          </div>
        </div>
      </div>

      {/* Régimes alimentaires */}
      {confirmed.some(g => g.dietary_notes) && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🍽️</span>
            <h3 className="font-semibold text-gray-800 text-sm">Régimes alimentaires signalés</h3>
          </div>
          <div className="space-y-1.5">
            {confirmed.filter(g => g.dietary_notes).map(g => (
              <div key={g.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{g.guest_name}</span>
                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">{g.dietary_notes}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}