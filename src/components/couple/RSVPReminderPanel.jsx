import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, BellRing, CheckCircle2, Clock, Users, AlertCircle, Send, CalendarClock } from "lucide-react";
import { toast } from "sonner";

export default function RSVPReminderPanel({ event }) {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    base44.entities.GuestInvitation.filter({ event_id: event.id }, "guest_name").then(data => {
      setGuests(data || []);
      setLoading(false);
    });
  }, [event.id]);

  // Guests who were invited but haven't responded
  const pendingGuests = guests.filter(g => g.guest_email && g.invitation_sent && g.rsvp_status === "pending");
  // Guests with no email (can't send)
  const noEmailPending = guests.filter(g => !g.guest_email && g.rsvp_status === "pending");
  // Already reminded
  const alreadyReminded = pendingGuests.filter(g => g.reminder_sent_date);
  const neverReminded = pendingGuests.filter(g => !g.reminder_sent_date);

  const sendReminder = async (guest) => {
    const eventDate = event.event_date
      ? new Date(event.event_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : "";
    const rsvpLink = event.public_url || "";
    const lastReminder = guest.reminder_sent_date
      ? new Date(guest.reminder_sent_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
      : null;

    await base44.integrations.Core.SendEmail({
      to: guest.guest_email,
      subject: `⏰ Rappel : confirmez votre présence au mariage de ${event.couple_names}`,
      body: `<div style="font-family:Georgia,serif;max-width:520px;margin:auto;padding:32px;background:#fff9f5;border-radius:16px">
  <div style="text-align:center;margin-bottom:24px">
    <p style="font-size:36px;margin:0">💌</p>
    <h1 style="font-size:24px;color:#1f2937;margin:12px 0 4px">${event.couple_names}</h1>
    <p style="color:#9ca3af;font-size:14px">${eventDate}</p>
  </div>
  <p style="color:#374151;font-size:15px;line-height:1.7">Bonjour ${guest.guest_name},</p>
  <p style="color:#374151;font-size:15px;line-height:1.7">
    Nous avons hâte de célébrer ce grand jour avec vous ! 
    Nous n'avons pas encore reçu votre réponse concernant votre présence à notre mariage.
  </p>
  <p style="color:#374151;font-size:15px;line-height:1.7">
    Pourriez-vous prendre un moment pour confirmer ou décliner votre venue ? Cela nous aiderait beaucoup pour l'organisation. 🙏
  </p>
  <div style="text-align:center;margin:32px 0">
    <a href="${rsvpLink}" style="background:#f43f5e;color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:bold;font-size:15px">
      Je confirme ma présence →
    </a>
  </div>
  ${event.welcome_message ? `<p style="color:#6b7280;font-size:14px;font-style:italic;border-left:3px solid #fda4af;padding-left:12px;margin:20px 0">${event.welcome_message}</p>` : ""}
  <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:24px">
    Ce rappel vous a été envoyé car vous n'avez pas encore répondu à notre invitation. 🌸
  </p>
</div>`,
    });

    await base44.entities.GuestInvitation.update(guest.id, {
      reminder_sent_date: new Date().toISOString(),
    });
  };

  const sendAllReminders = async () => {
    const toSend = pendingGuests;
    if (toSend.length === 0) { toast.info("Aucun invité en attente à relancer."); return; }
    setSending(true);
    setSentCount(0);
    setProgress(0);

    let count = 0;
    for (const guest of toSend) {
      await sendReminder(guest);
      count++;
      setSentCount(count);
      setProgress(Math.round((count / toSend.length) * 100));
    }

    // Refresh list
    const updated = await base44.entities.GuestInvitation.filter({ event_id: event.id }, "guest_name");
    setGuests(updated || []);

    setSending(false);
    toast.success(`✅ ${count} relance(s) envoyée(s) avec succès !`);
  };

  const sendSingleReminder = async (guest) => {
    try {
      await sendReminder(guest);
      const updated = await base44.entities.GuestInvitation.filter({ event_id: event.id }, "guest_name");
      setGuests(updated || []);
      toast.success(`Relance envoyée à ${guest.guest_name}`);
    } catch (e) {
      toast.error("Erreur lors de l'envoi");
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-rose-400" /></div>;

  return (
    <div className="space-y-6">
      {/* Stats banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Invités total", value: guests.length, color: "text-gray-800", bg: "bg-gray-50" },
          { label: "En attente (avec email)", value: pendingGuests.length, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Jamais relancés", value: neverReminded.length, color: "text-rose-600", bg: "bg-rose-50" },
          { label: "Déjà relancés", value: alreadyReminded.length, color: "text-indigo-600", bg: "bg-indigo-50" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl border border-white p-4 text-center`}>
            <p className={`text-3xl font-bold font-serif-elegant ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 font-sans-clean mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main action */}
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
            <BellRing className="w-6 h-6 text-rose-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 font-sans-clean mb-1">Envoyer une relance à tous les invités en attente</h3>
            <p className="text-sm text-gray-500 font-sans-clean mb-4">
              {pendingGuests.length === 0
                ? "Tous vos invités ont répondu ! 🎉"
                : `${pendingGuests.length} invité(s) avec un email n'ont pas encore confirmé leur présence.${neverReminded.length > 0 ? ` Dont ${neverReminded.length} jamais relancé(s).` : ""}`}
            </p>

            {/* Progress bar during send */}
            {sending && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Envoi en cours...</span>
                  <span>{sentCount} / {pendingGuests.length}</span>
                </div>
                <div className="w-full bg-rose-100 rounded-full h-2">
                  <div className="bg-rose-400 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <Button
              onClick={sendAllReminders}
              disabled={sending || pendingGuests.length === 0}
              className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl h-10"
            >
              {sending
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Envoi en cours...</>
                : <><Send className="w-4 h-4 mr-2" /> Relancer {pendingGuests.length} invité(s)</>
              }
            </Button>
          </div>
        </div>
      </div>

      {/* No email warning */}
      {noEmailPending.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 font-sans-clean">
            <strong>{noEmailPending.length} invité(s)</strong> sans adresse email ne peuvent pas recevoir de relance : {noEmailPending.map(g => g.guest_name).join(", ")}
          </p>
        </div>
      )}

      {/* Guest list */}
      {pendingGuests.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <h3 className="font-semibold text-sm text-gray-700 font-sans-clean">
              Invités en attente de réponse ({pendingGuests.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {pendingGuests.map(guest => (
              <div key={guest.id} className="px-5 py-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-sm flex-shrink-0">
                  {guest.guest_name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate font-sans-clean">{guest.guest_name}</p>
                  <p className="text-xs text-gray-400 truncate">{guest.guest_email}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {guest.reminder_sent_date ? (
                    <span className="text-xs flex items-center gap-1 text-indigo-500 font-sans-clean">
                      <CalendarClock className="w-3 h-3" />
                      Relancé le {new Date(guest.reminder_sent_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </span>
                  ) : (
                    <span className="text-xs flex items-center gap-1 text-gray-400 font-sans-clean">
                      <Clock className="w-3 h-3" /> Jamais relancé
                    </span>
                  )}
                  <button
                    onClick={() => sendSingleReminder(guest)}
                    disabled={sending}
                    className="text-xs flex items-center gap-1 text-rose-500 hover:text-rose-700 border border-rose-200 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition font-sans-clean"
                  >
                    <Mail className="w-3 h-3" /> Relancer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingGuests.length === 0 && guests.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto mb-3" />
          <p className="text-gray-600 font-semibold font-sans-clean">Tous vos invités ont répondu ! 🎉</p>
          <p className="text-sm text-gray-400 font-sans-clean mt-1">Aucune relance nécessaire.</p>
        </div>
      )}
    </div>
  );
}