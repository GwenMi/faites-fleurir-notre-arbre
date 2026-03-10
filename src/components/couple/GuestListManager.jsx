import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Mail, CheckCircle2, Clock, X, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

const RSVP_BADGE = {
  pending:   { label: "En attente", cls: "bg-gray-100 text-gray-600" },
  confirmed: { label: "Confirmé ✓", cls: "bg-green-100 text-green-700" },
  declined:  { label: "Décliné",    cls: "bg-red-100 text-red-600" },
  maybe:     { label: "Peut-être",  cls: "bg-amber-100 text-amber-700" },
};

export default function GuestListManager({ event }) {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ guest_name: "", guest_email: "", phone: "", table_note: "" });
  const [saving, setSaving] = useState(false);
  const [sendingAll, setSendingAll] = useState(false);
  const [sendingId, setSendingId] = useState(null);

  useEffect(() => {
    fetchGuests();
    const unsub = base44.entities.GuestInvitation.subscribe((ev) => {
      if (ev.type === "create") setGuests(g => [...g, ev.data]);
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

  const addGuest = async (e) => {
    e.preventDefault();
    if (!form.guest_name.trim()) return;
    setSaving(true);
    await base44.entities.GuestInvitation.create({ ...form, event_id: event.id });
    setForm({ guest_name: "", guest_email: "", phone: "", table_note: "" });
    setShowForm(false);
    setSaving(false);
    toast.success("Invité ajouté");
  };

  const deleteGuest = async (id) => {
    await base44.entities.GuestInvitation.delete(id);
    toast.success("Invité supprimé");
  };

  const sendInvitation = async (guest) => {
    if (!guest.guest_email) { toast.error("Cet invité n'a pas d'email"); return; }
    setSendingId(guest.id);
    try {
      const eventDate = event.event_date
        ? new Date(event.event_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
        : "";
      const rsvpLink = event.public_url || "";
      await base44.integrations.Core.SendEmail({
        to: guest.guest_email,
        subject: `🌸 Invitation au mariage de ${event.couple_names}`,
        body: `<div style="font-family:Georgia,serif;max-width:520px;margin:auto;padding:32px;background:#fff9f5;border-radius:16px">
  <div style="text-align:center;margin-bottom:24px">
    <p style="font-size:36px;margin:0">🌸</p>
    <h1 style="font-size:28px;color:#1f2937;margin:12px 0 4px">${event.couple_names}</h1>
    <p style="color:#9ca3af;font-size:14px">${eventDate}</p>
  </div>
  <p style="color:#374151;font-size:15px;line-height:1.7">Bonjour ${guest.guest_name},</p>
  <p style="color:#374151;font-size:15px;line-height:1.7">Nous avons le bonheur de vous inviter à célébrer notre mariage. Votre présence nous ferait vraiment plaisir !</p>
  ${event.welcome_message ? `<p style="color:#6b7280;font-size:14px;font-style:italic;border-left:3px solid #fda4af;padding-left:12px;margin:20px 0">${event.welcome_message}</p>` : ""}
  <div style="text-align:center;margin:32px 0">
    <a href="${rsvpLink}" style="background:#f43f5e;color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:bold;font-size:15px">Confirmer ma présence →</a>
  </div>
  <p style="color:#9ca3af;font-size:12px;text-align:center">Votre pot de graines vous sera remis lors de la cérémonie 🌱</p>
</div>`,
      });
      await base44.entities.GuestInvitation.update(guest.id, {
        invitation_sent: true,
        invitation_sent_date: new Date().toISOString(),
      });
      toast.success(`Invitation envoyée à ${guest.guest_name}`);
    } catch (e) {
      toast.error("Erreur lors de l'envoi");
    }
    setSendingId(null);
  };

  const sendAllPending = async () => {
    const toSend = guests.filter(g => g.guest_email && !g.invitation_sent);
    if (toSend.length === 0) { toast.info("Toutes les invitations ont déjà été envoyées"); return; }
    setSendingAll(true);
    for (const g of toSend) await sendInvitation(g);
    setSendingAll(false);
    toast.success(`${toSend.length} invitation(s) envoyée(s)`);
  };

  const stats = {
    total: guests.length,
    sent: guests.filter(g => g.invitation_sent).length,
    confirmed: guests.filter(g => g.rsvp_status === "confirmed").length,
    pending: guests.filter(g => g.rsvp_status === "pending").length,
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-rose-400" /></div>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Invités total", value: stats.total, color: "text-gray-800" },
          { label: "Invitations envoyées", value: stats.sent, color: "text-indigo-600" },
          { label: "Confirmés", value: stats.confirmed, color: "text-green-600" },
          { label: "En attente", value: stats.pending, color: "text-amber-600" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
            <p className={`text-3xl font-bold font-serif-elegant ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 font-sans-clean mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setShowForm(v => !v)} className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl h-10">
          <Plus className="w-4 h-4 mr-2" /> Ajouter un invité
        </Button>
        {stats.total > 0 && (
          <Button onClick={sendAllPending} disabled={sendingAll} variant="outline" className="rounded-xl h-10">
            {sendingAll ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
            Envoyer les invitations non envoyées
          </Button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={addGuest} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">Nouvel invité</h3>
            <button type="button" onClick={() => setShowForm(false)}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input placeholder="Prénom Nom *" value={form.guest_name} onChange={e => setForm(f => ({ ...f, guest_name: e.target.value }))} className="h-10 rounded-xl" required />
            <Input type="email" placeholder="Email" value={form.guest_email} onChange={e => setForm(f => ({ ...f, guest_email: e.target.value }))} className="h-10 rounded-xl" />
            <Input placeholder="Téléphone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="h-10 rounded-xl" />
            <Input placeholder="Note (table, régime...)" value={form.table_note} onChange={e => setForm(f => ({ ...f, table_note: e.target.value }))} className="h-10 rounded-xl" />
          </div>
          <Button type="submit" disabled={saving} className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-xl h-10">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Ajouter
          </Button>
        </form>
      )}

      {/* Guest list */}
      {guests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Aucun invité ajouté. Commencez par ajouter vos invités !</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {guests.map(guest => {
              const badge = RSVP_BADGE[guest.rsvp_status || "pending"];
              return (
                <div key={guest.id} className="px-5 py-4 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-sm flex-shrink-0">
                    {guest.guest_name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{guest.guest_name}</p>
                    {guest.guest_email && <p className="text-xs text-gray-400 truncate">{guest.guest_email}</p>}
                    {guest.table_note && <p className="text-xs text-gray-400 italic">{guest.table_note}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge.cls}`}>{badge.label}</span>
                    {guest.invitation_sent ? (
                      <span className="text-xs flex items-center gap-1 text-green-600"><CheckCircle2 className="w-3 h-3" /> Envoyée</span>
                    ) : guest.guest_email ? (
                      <button
                        onClick={() => sendInvitation(guest)}
                        disabled={sendingId === guest.id}
                        className="text-xs flex items-center gap-1 text-indigo-500 hover:text-indigo-700 border border-indigo-200 px-2 py-1 rounded-lg"
                      >
                        {sendingId === guest.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                        Inviter
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300 flex items-center gap-1"><Clock className="w-3 h-3" /> Pas d'email</span>
                    )}
                    <button onClick={() => deleteGuest(guest.id)} className="text-gray-300 hover:text-red-400 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}