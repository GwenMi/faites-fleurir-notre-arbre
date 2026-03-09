import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Eye, Users, Mail, RefreshCw, Star, MessageSquare, Image, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const DEFAULT_SUBJECT = (event) => `Merci d'avoir partagé ce moment avec nous — ${event.couple_names}`;

const DEFAULT_BODY = `Bonjour {prenom},

Nous tenions à vous remercier chaleureusement pour votre présence et les moments inoubliables que vous avez partagés avec nous.

{message_livre_or}
{photo}

Votre présence a rendu cette journée encore plus belle et précieuse à nos yeux.

Avec tout notre amour,
{couple}`;

function buildEmailBody(template, guest, event) {
  let body = template
    .replace(/{prenom}/g, guest.name || "")
    .replace(/{couple}/g, event.couple_names || "");

  // Guestbook message block
  if (guest.guestbookMessage) {
    body = body.replace(
      /{message_livre_or}/g,
      `Votre message dans le livre d'or nous a beaucoup touché :\n« ${guest.guestbookMessage} »\n`
    );
  } else {
    body = body.replace(/{message_livre_or}\n?/g, "");
  }

  // Photo block
  if (guest.photoUrl) {
    body = body.replace(
      /{photo}/g,
      `Nous avons également adoré la photo que vous avez partagée. Elle sera un souvenir précieux pour nous.\n`
    );
  } else {
    body = body.replace(/{photo}\n?/g, "");
  }

  return body.trim();
}

function GuestRow({ guest, selected, onToggle, expanded, onExpand, template, event }) {
  const preview = buildEmailBody(template, guest, event);
  return (
    <div className={`border-2 rounded-2xl overflow-hidden transition-all ${selected ? "border-rose-300 bg-rose-50/30" : "border-gray-100 bg-white"}`}>
      <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={onToggle}>
        <input type="checkbox" checked={selected} onChange={onToggle} onClick={e => e.stopPropagation()} className="rounded w-4 h-4 accent-rose-400" />
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ background: selected ? "#fb7185" : "#d1d5db" }}>
          {(guest.name || "?")[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate">{guest.name}</p>
          <p className="text-xs text-gray-400 truncate">{guest.email}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {guest.guestbookMessage && (
            <span title="Message livre d'or" className="p-1 bg-purple-100 rounded-full">
              <MessageSquare className="w-3 h-3 text-purple-500" />
            </span>
          )}
          {guest.photoUrl && (
            <span title="Photo partagée" className="p-1 bg-amber-100 rounded-full">
              <Image className="w-3 h-3 text-amber-500" />
            </span>
          )}
          <button onClick={e => { e.stopPropagation(); onExpand(); }}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 bg-gray-50/50">
          <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5"><Eye className="w-3 h-3" /> Aperçu de l'email</p>
          <div className="bg-white rounded-xl border border-gray-100 p-3">
            <p className="text-xs font-semibold text-gray-600 mb-1">Objet :</p>
            <p className="text-xs text-gray-700 mb-3">{DEFAULT_SUBJECT(event)}</p>
            <p className="text-xs font-semibold text-gray-600 mb-1">Message :</p>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">{preview}</pre>
          </div>
          {guest.photoUrl && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-500 mb-1.5">Photo déposée par cet invité :</p>
              <img src={guest.photoUrl} alt="" className="w-24 h-24 object-cover rounded-xl border border-gray-100" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ThankyouEmailManager({ event }) {
  const [guests, setGuests] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [subject, setSubject] = useState(DEFAULT_SUBJECT(event));
  const [template, setTemplate] = useState(DEFAULT_BODY);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [showVars, setShowVars] = useState(false);

  useEffect(() => { loadData(); }, [event?.id]);

  const loadData = async () => {
    setLoading(true);
    const [rsvps, guestbook, photos] = await Promise.all([
      base44.entities.RSVPResponse.filter({ event_id: event.id }),
      base44.entities.GuestbookEntry.filter({ event_id: event.id }),
      base44.entities.Photo.filter({ event_id: event.id, approved: true }),
    ]);

    // Build a merged guest list keyed by lowercased name
    const guestMap = {};

    (rsvps || []).filter(r => r.email).forEach(r => {
      const key = r.guest_name?.toLowerCase();
      if (key) guestMap[key] = { name: r.guest_name, email: r.email, attending: r.attending };
    });

    (guestbook || []).forEach(g => {
      const key = g.pseudo?.toLowerCase();
      if (!key) return;
      if (!guestMap[key]) guestMap[key] = { name: g.pseudo, email: g.email || null };
      guestMap[key].guestbookMessage = g.message;
    });

    (photos || []).forEach(p => {
      const key = p.guest_name?.toLowerCase();
      if (!key) return;
      if (!guestMap[key]) guestMap[key] = { name: p.guest_name, email: null };
      if (!guestMap[key].photoUrl) guestMap[key].photoUrl = p.image;
    });

    const list = Object.values(guestMap);
    setGuests(list);
    // Auto-select guests with email
    setSelected(new Set(list.filter(g => g.email).map(g => g.name)));
    setLoading(false);
  };

  const toggleGuest = (name) => {
    const next = new Set(selected);
    next.has(name) ? next.delete(name) : next.add(name);
    setSelected(next);
  };

  const withEmail = guests.filter(g => g.email);
  const withoutEmail = guests.filter(g => !g.email);

  const handleSend = async () => {
    const targets = withEmail.filter(g => selected.has(g.name));
    if (targets.length === 0) { toast.error("Aucun destinataire sélectionné"); return; }
    if (!subject.trim()) { toast.error("L'objet est requis"); return; }
    setSending(true);
    setSentCount(0);
    let count = 0;
    for (const g of targets) {
      const body = buildEmailBody(template, g, event);
      await base44.integrations.Core.SendEmail({
        to: g.email,
        from_name: event.couple_names,
        subject,
        body,
      }).catch(() => {});
      count++;
      setSentCount(count);
    }
    toast.success(`${count} email${count > 1 ? "s" : ""} de remerciement envoyé${count > 1 ? "s" : ""} !`);
    setSending(false);
  };

  const insertVar = (v) => setTemplate(t => t + v);

  if (loading) return <div className="py-10 text-center text-gray-400 text-sm">Chargement...</div>;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold text-gray-800 mb-0.5">💌 Emails de remerciement</h3>
        <p className="text-xs text-gray-400">
          Envoyez un email personnalisé à chaque invité, avec son message du livre d'or et sa photo.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-rose-50 rounded-2xl p-3 text-center border border-rose-100">
          <p className="text-2xl font-bold text-rose-500">{guests.length}</p>
          <p className="text-xs text-gray-500">invités</p>
        </div>
        <div className="bg-purple-50 rounded-2xl p-3 text-center border border-purple-100">
          <p className="text-2xl font-bold text-purple-500">{withEmail.length}</p>
          <p className="text-xs text-gray-500">avec email</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-3 text-center border border-amber-100">
          <p className="text-2xl font-bold text-amber-500">{guests.filter(g => g.guestbookMessage || g.photoUrl).length}</p>
          <p className="text-xs text-gray-500">avec contenu</p>
        </div>
      </div>

      {/* Subject */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-1">Objet de l'email *</p>
        <Input value={subject} onChange={e => setSubject(e.target.value)} className="rounded-xl" />
      </div>

      {/* Template editor */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold text-gray-500">Corps du message *</p>
          <button onClick={() => setShowVars(v => !v)}
            className="text-xs text-purple-500 hover:underline flex items-center gap-1">
            <Star className="w-3 h-3" /> Variables disponibles
          </button>
        </div>
        {showVars && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {["{prenom}", "{couple}", "{message_livre_or}", "{photo}"].map(v => (
              <button key={v} onClick={() => insertVar(v)}
                className="text-xs bg-purple-50 border border-purple-200 text-purple-600 rounded-full px-2.5 py-1 hover:bg-purple-100 transition font-mono">
                {v}
              </button>
            ))}
          </div>
        )}
        <textarea
          value={template}
          onChange={e => setTemplate(e.target.value)}
          rows={10}
          className="w-full rounded-xl border border-input px-3 py-2 text-sm resize-none font-mono leading-relaxed"
        />
        <p className="text-xs text-gray-400 mt-1">
          Les variables sont remplacées automatiquement par le contenu de chaque invité.
        </p>
      </div>

      {/* Guest list */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Destinataires
            <Badge className="bg-rose-100 text-rose-600 text-xs">{selected.size} sélectionné{selected.size > 1 ? "s" : ""}</Badge>
          </p>
          <div className="flex gap-2">
            <button onClick={() => setSelected(new Set(withEmail.map(g => g.name)))}
              className="text-xs text-purple-500 hover:underline">Tous</button>
            <span className="text-gray-300">|</span>
            <button onClick={() => setSelected(new Set())}
              className="text-xs text-gray-400 hover:underline">Aucun</button>
          </div>
        </div>

        {guests.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">
            <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
            Aucun invité trouvé (RSVP, livre d'or ou photos).
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {withEmail.map(g => (
              <GuestRow
                key={g.name}
                guest={g}
                selected={selected.has(g.name)}
                onToggle={() => toggleGuest(g.name)}
                expanded={expandedId === g.name}
                onExpand={() => setExpandedId(expandedId === g.name ? null : g.name)}
                template={template}
                event={event}
              />
            ))}
            {withoutEmail.length > 0 && (
              <div className="pt-2">
                <p className="text-xs text-gray-400 mb-1.5">Sans email (non envoyable) :</p>
                {withoutEmail.map(g => (
                  <div key={g.name} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 opacity-50 mb-1">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                      {(g.name || "?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-500 truncate">{g.name}</p>
                      <p className="text-xs text-gray-400">Pas d'email renseigné</p>
                    </div>
                    {g.guestbookMessage && <MessageSquare className="w-3 h-3 text-purple-400" />}
                    {g.photoUrl && <Image className="w-3 h-3 text-amber-400" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Send */}
      <Button
        onClick={handleSend}
        disabled={sending || selected.size === 0 || !subject.trim() || !template.trim()}
        className="w-full h-11 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold"
      >
        {sending ? (
          <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Envoi… ({sentCount}/{selected.size})</>
        ) : (
          <><Send className="w-4 h-4 mr-2" /> Envoyer {selected.size} remerciement{selected.size > 1 ? "s" : ""}</>
        )}
      </Button>

      <p className="text-xs text-center text-gray-400">
        Chaque email est personnalisé avec le prénom, le message du livre d'or et la photo de l'invité.
      </p>
    </div>
  );
}