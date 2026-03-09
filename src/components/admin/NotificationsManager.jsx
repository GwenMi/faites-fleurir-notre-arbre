import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Users, Mail, CheckCircle2, Bell, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function NotificationsManager({ event }) {
  const [responses, setResponses] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [event?.id]);

  const loadData = async () => {
    setLoading(true);
    const r = await base44.entities.RSVPResponse.filter({ event_id: event.id });
    const withEmail = (r || []).filter(x => x.email);
    setResponses(withEmail);
    setSelected(new Set(withEmail.filter(x => x.attending).map(x => x.id)));
    setLoading(false);
  };

  const toggleAll = (attending) => {
    const filtered = responses.filter(r => r.attending === attending);
    const allSelected = filtered.every(r => selected.has(r.id));
    const next = new Set(selected);
    filtered.forEach(r => allSelected ? next.delete(r.id) : next.add(r.id));
    setSelected(next);
  };

  const toggleOne = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) { toast.error("Objet et message requis"); return; }
    if (selected.size === 0) { toast.error("Aucun destinataire sélectionné"); return; }
    setSending(true);
    setSentCount(0);
    const targets = responses.filter(r => selected.has(r.id));
    let count = 0;
    for (const r of targets) {
      await base44.integrations.Core.SendEmail({
        to: r.email,
        from_name: event.couple_names,
        subject,
        body: body.replace("{prenom}", r.guest_name),
      }).catch(() => {});
      count++;
      setSentCount(count);
    }
    toast.success(`${count} email${count > 1 ? "s" : ""} envoyé${count > 1 ? "s" : ""} avec succès !`);
    setSending(false);
  };

  const attending = responses.filter(r => r.attending);
  const absent = responses.filter(r => !r.attending);

  const TEMPLATES = [
    {
      label: "Rappel de l'événement",
      subject: `Rappel — ${event.couple_names}`,
      body: `Bonjour {prenom},\n\nNous vous rappelons que notre événement "${event.couple_names}" aura lieu le ${event.event_date}.\n\nNous avons hâte de vous accueillir !\n\nÀ très bientôt,\n${event.couple_names}`,
    },
    {
      label: "Info pratique",
      subject: `Informations pratiques — ${event.couple_names}`,
      body: `Bonjour {prenom},\n\nNous souhaitons vous partager quelques informations importantes pour la journée du ${event.event_date}.\n\n[Ajoutez vos informations ici]\n\nÀ bientôt,\n${event.couple_names}`,
    },
    {
      label: "Remerciements",
      subject: `Merci d'être venus — ${event.couple_names}`,
      body: `Bonjour {prenom},\n\nNous tenions à vous remercier chaleureusement pour votre présence et les moments partagés lors de notre événement.\n\nVotre présence a rendu cette journée encore plus belle.\n\nAvec toute notre affection,\n${event.couple_names}`,
    },
  ];

  if (loading) return <div className="py-10 text-center text-gray-400 text-sm">Chargement...</div>;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-purple-50 rounded-2xl p-3 text-center border border-purple-100">
          <p className="text-2xl font-bold text-purple-600">{responses.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">avec email</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-3 text-center border border-green-100">
          <p className="text-2xl font-bold text-green-600">{attending.filter(r => r.email).length}</p>
          <p className="text-xs text-gray-500 mt-0.5">présents</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-3 text-center border border-red-100">
          <p className="text-2xl font-bold text-red-500">{absent.filter(r => r.email).length}</p>
          <p className="text-xs text-gray-500 mt-0.5">absents</p>
        </div>
      </div>

      {responses.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Mail className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Aucun invité avec email pour l'instant.</p>
          <p className="text-xs mt-1">Les invités qui renseignent leur email lors du RSVP apparaîtront ici.</p>
        </div>
      ) : (
        <>
          {/* Recipient selector */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4" /> Destinataires
                <Badge className="bg-purple-100 text-purple-600 text-xs">{selected.size} sélectionné{selected.size > 1 ? "s" : ""}</Badge>
              </p>
              <div className="flex gap-2">
                <button onClick={() => toggleAll(true)} className="text-xs text-green-600 hover:underline">Présents</button>
                <span className="text-gray-300">|</span>
                <button onClick={() => toggleAll(false)} className="text-xs text-red-500 hover:underline">Absents</button>
                <span className="text-gray-300">|</span>
                <button onClick={() => setSelected(new Set(responses.map(r => r.id)))} className="text-xs text-purple-500 hover:underline">Tous</button>
                <span className="text-gray-300">|</span>
                <button onClick={() => setSelected(new Set())} className="text-xs text-gray-400 hover:underline">Aucun</button>
              </div>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {responses.map(r => (
                <label key={r.id} className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition border ${selected.has(r.id) ? "bg-white border-purple-200 shadow-sm" : "border-transparent hover:bg-white/60"}`}>
                  <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleOne(r.id)} className="rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-700 truncate">{r.guest_name}</p>
                    <p className="text-xs text-gray-400 truncate">{r.email}</p>
                  </div>
                  <Badge className={r.attending ? "bg-green-100 text-green-600 text-xs" : "bg-red-50 text-red-400 text-xs"}>
                    {r.attending ? "Présent" : "Absent"}
                  </Badge>
                </label>
              ))}
            </div>
          </div>

          {/* Templates */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Modèles rapides</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map(t => (
                <button key={t.label} onClick={() => { setSubject(t.subject); setBody(t.body); }}
                  className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-500 border border-purple-100 rounded-full px-3 py-1.5 transition">
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Compose */}
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Objet de l'email *</p>
              <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Ex: Informations importantes pour votre venue" className="rounded-xl" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Message * <span className="text-purple-400">(utilisez {"{prenom}"} pour personnaliser)</span></p>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={7} placeholder="Bonjour {prenom},&#10;&#10;Votre message ici..."
                className="w-full rounded-xl border border-input px-3 py-2 text-sm resize-none" />
            </div>
          </div>

          {/* Send button */}
          <Button onClick={handleSend} disabled={sending || selected.size === 0 || !subject.trim() || !body.trim()}
            className="w-full h-11 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-semibold">
            {sending ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Envoi en cours... ({sent}/{selected.size})</>
            ) : (
              <><Send className="w-4 h-4 mr-2" /> Envoyer à {selected.size} destinataire{selected.size > 1 ? "s" : ""}</>
            )}
          </Button>
          <p className="text-xs text-center text-gray-400">Les emails sont envoyés un par un depuis notre service d'envoi.</p>
        </>
      )}
    </div>
  );
}