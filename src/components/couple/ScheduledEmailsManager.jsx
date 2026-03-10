import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Plus, Loader2, Send, Clock, CheckCircle2, Trash2, Edit2, Calendar, Users } from "lucide-react";
import { toast } from "sonner";

const TEMPLATES = {
  rsvp_reminder: {
    name: "Relance RSVP",
    subject: "⏰ Rappel : confirmez votre présence au mariage de {{couple_names}}",
    body: `<div style="font-family:Georgia,serif;max-width:520px;margin:auto;padding:32px;background:#fff9f5;border-radius:16px">
  <div style="text-align:center;margin-bottom:24px">
    <p style="font-size:36px;margin:0">💌</p>
    <h1 style="font-size:24px;color:#1f2937;margin:12px 0 4px">{{couple_names}}</h1>
    <p style="color:#9ca3af;font-size:14px">{{event_date}}</p>
  </div>
  <p style="color:#374151;font-size:15px;line-height:1.7">Bonjour {{guest_name}},</p>
  <p style="color:#374151;font-size:15px;line-height:1.7">Nous avons hâte de célébrer ce grand jour avec vous ! Nous n'avons pas encore reçu votre réponse concernant votre présence.</p>
  <div style="text-align:center;margin:32px 0">
    <a href="{{rsvp_link}}" style="background:#f43f5e;color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:bold;font-size:15px">Je confirme ma présence →</a>
  </div>
  <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:24px">Ce message vous a été envoyé car vous n'avez pas encore répondu à notre invitation. 🌸</p>
</div>`,
    target_audience: "pending_rsvp",
  },
  event_reminder: {
    name: "Rappel avant l'événement",
    subject: "🌸 Le grand jour approche ! {{couple_names}} vous attendent",
    body: `<div style="font-family:Georgia,serif;max-width:520px;margin:auto;padding:32px;background:#f0fdf4;border-radius:16px">
  <div style="text-align:center;margin-bottom:24px">
    <p style="font-size:36px;margin:0">🌿</p>
    <h1 style="font-size:24px;color:#1f2937;margin:12px 0 4px">{{couple_names}}</h1>
    <p style="color:#6b7280;font-size:14px">{{event_date}}</p>
  </div>
  <p style="color:#374151;font-size:15px;line-height:1.7">Bonjour {{guest_name}},</p>
  <p style="color:#374151;font-size:15px;line-height:1.7">Le grand jour approche à grands pas ! Nous sommes si heureux de partager ce moment avec vous.</p>
  <p style="color:#374151;font-size:15px;line-height:1.7">Retrouvez toutes les informations pratiques sur notre site :</p>
  <div style="text-align:center;margin:32px 0">
    <a href="{{rsvp_link}}" style="background:#10b981;color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:bold;font-size:15px">Voir le programme →</a>
  </div>
  <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:24px">Avec tout notre amour 💚</p>
</div>`,
    target_audience: "confirmed",
  },
  custom: {
    name: "Message personnalisé",
    subject: "Un message de {{couple_names}}",
    body: `<div style="font-family:Georgia,serif;max-width:520px;margin:auto;padding:32px;background:#faf5ff;border-radius:16px">
  <div style="text-align:center;margin-bottom:24px">
    <p style="font-size:36px;margin:0">✨</p>
    <h1 style="font-size:24px;color:#1f2937;margin:12px 0 4px">{{couple_names}}</h1>
  </div>
  <p style="color:#374151;font-size:15px;line-height:1.7">Bonjour {{guest_name}},</p>
  <p style="color:#374151;font-size:15px;line-height:1.7">[Votre message personnalisé ici...]</p>
  <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:24px">Avec tout notre amour 💜</p>
</div>`,
    target_audience: "all",
  },
};

const STATUS_CONFIG = {
  draft: { label: "Brouillon", color: "bg-gray-100 text-gray-600" },
  scheduled: { label: "Programmé", color: "bg-blue-100 text-blue-600" },
  sent: { label: "Envoyé", color: "bg-green-100 text-green-600" },
  cancelled: { label: "Annulé", color: "bg-red-100 text-red-600" },
};

const AUDIENCE_LABELS = {
  pending_rsvp: "Invités en attente",
  confirmed: "Invités confirmés",
  all: "Tous les invités",
};

const DEFAULT_FORM = {
  name: "Relance RSVP",
  type: "rsvp_reminder",
  subject: TEMPLATES.rsvp_reminder.subject,
  body_template: TEMPLATES.rsvp_reminder.body,
  schedule_type: "specific_date",
  days_before_event: 7,
  scheduled_date: "",
  target_audience: "pending_rsvp",
  status: "scheduled",
};

export default function ScheduledEmailsManager({ event }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(null);
  const [guests, setGuests] = useState([]);
  const [form, setForm] = useState({ ...DEFAULT_FORM, scheduled_date: new Date(Date.now() + 86400000).toISOString().slice(0, 16) });

  useEffect(() => { loadData(); }, [event.id]);

  const loadData = async () => {
    const [camps, guestList] = await Promise.all([
      base44.entities.EmailCampaign.filter({ event_id: event.id }, "-created_date"),
      base44.entities.GuestInvitation.filter({ event_id: event.id }),
    ]);
    setCampaigns(camps || []);
    setGuests(guestList || []);
    setLoading(false);
  };

  const applyTemplate = (type) => {
    const tpl = TEMPLATES[type];
    if (tpl) setForm(f => ({ ...f, type, name: tpl.name, subject: tpl.subject, body_template: tpl.body, target_audience: tpl.target_audience }));
  };

  const openNewForm = () => {
    setEditingCampaign(null);
    setForm({ ...DEFAULT_FORM, scheduled_date: new Date(Date.now() + 86400000).toISOString().slice(0, 16) });
    setShowForm(true);
  };

  const openEdit = (campaign) => {
    setEditingCampaign(campaign);
    setForm({ ...campaign, scheduled_date: campaign.scheduled_date ? campaign.scheduled_date.slice(0, 16) : "" });
    setShowForm(true);
  };

  const saveCampaign = async () => {
    if (!form.name || !form.subject || !form.body_template) { toast.error("Remplissez tous les champs obligatoires."); return; }
    setSaving(true);
    const payload = { ...form, event_id: event.id };
    if (editingCampaign) {
      await base44.entities.EmailCampaign.update(editingCampaign.id, payload);
      toast.success("Campagne mise à jour !");
    } else {
      await base44.entities.EmailCampaign.create(payload);
      toast.success("Campagne programmée !");
    }
    await loadData();
    setShowForm(false);
    setSaving(false);
  };

  const deleteCampaign = async (id) => {
    if (!confirm("Supprimer cette campagne ?")) return;
    await base44.entities.EmailCampaign.delete(id);
    setCampaigns(c => c.filter(x => x.id !== id));
    toast.success("Campagne supprimée.");
  };

  const sendNow = async (campaign) => {
    setSending(campaign.id);
    const eventDateStr = event.event_date
      ? new Date(event.event_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : "";

    let targetGuests = guests.filter(g => g.guest_email);
    if (campaign.target_audience === "pending_rsvp") targetGuests = targetGuests.filter(g => g.rsvp_status === "pending");
    else if (campaign.target_audience === "confirmed") targetGuests = targetGuests.filter(g => g.rsvp_status === "confirmed");

    let count = 0;
    for (const guest of targetGuests) {
      const body = campaign.body_template
        .replace(/\{\{guest_name\}\}/g, guest.guest_name || "")
        .replace(/\{\{couple_names\}\}/g, event.couple_names || "")
        .replace(/\{\{event_date\}\}/g, eventDateStr)
        .replace(/\{\{rsvp_link\}\}/g, event.public_url || "")
        .replace(/\{\{welcome_message\}\}/g, event.welcome_message || "");
      const subject = campaign.subject
        .replace(/\{\{guest_name\}\}/g, guest.guest_name || "")
        .replace(/\{\{couple_names\}\}/g, event.couple_names || "")
        .replace(/\{\{event_date\}\}/g, eventDateStr);
      await base44.integrations.Core.SendEmail({ to: guest.guest_email, subject, body });
      count++;
    }

    await base44.entities.EmailCampaign.update(campaign.id, { status: "sent", sent_count: count, sent_date: new Date().toISOString() });
    await loadData();
    toast.success(`✅ ${count} email(s) envoyé(s) !`);
    setSending(null);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-rose-400" /></div>;

  if (showForm) {
    return (
      <div className="space-y-5 max-w-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 font-sans-clean text-lg">
            {editingCampaign ? "Modifier la campagne" : "Nouvelle campagne email"}
          </h2>
          <button onClick={() => setShowForm(false)} className="text-xs text-gray-400 hover:text-gray-600">✕ Annuler</button>
        </div>

        {!editingCampaign && (
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Choisir un modèle</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(TEMPLATES).map(([key, tpl]) => (
                <button key={key} onClick={() => applyTemplate(key)}
                  className={`text-left p-3 rounded-xl border text-xs transition ${form.type === key ? "border-rose-300 bg-rose-50 text-rose-700" : "border-gray-200 bg-white text-gray-600 hover:border-rose-200"}`}>
                  <p className="font-semibold">{tpl.name}</p>
                  <p className="text-gray-400 mt-0.5 leading-tight">{AUDIENCE_LABELS[tpl.target_audience]}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Nom de la campagne *</label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Relance J-30" className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Objet de l'email *</label>
            <Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Objet..." className="rounded-xl" />
            <p className="text-xs text-gray-400 mt-1">Variables : {`{{guest_name}}`}, {`{{couple_names}}`}, {`{{event_date}}`}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Corps de l'email (HTML) *</label>
            <textarea
              value={form.body_template}
              onChange={e => setForm(f => ({ ...f, body_template: e.target.value }))}
              rows={8}
              className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs font-mono shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
              placeholder="HTML du template..."
            />
            <p className="text-xs text-gray-400 mt-1">Variables : {`{{guest_name}}`}, {`{{couple_names}}`}, {`{{event_date}}`}, {`{{rsvp_link}}`}, {`{{welcome_message}}`}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Destinataires</label>
            <Select value={form.target_audience} onValueChange={v => setForm(f => ({ ...f, target_audience: v }))}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending_rsvp">Invités en attente de réponse</SelectItem>
                <SelectItem value="confirmed">Invités confirmés</SelectItem>
                <SelectItem value="all">Tous les invités (avec email)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Programmation</label>
            <Select value={form.schedule_type} onValueChange={v => setForm(f => ({ ...f, schedule_type: v }))}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Envoyer immédiatement (manuellement)</SelectItem>
                <SelectItem value="specific_date">À une date et heure précise</SelectItem>
                <SelectItem value="days_before_event">X jours avant l'événement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.schedule_type === "specific_date" && (
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Date et heure d'envoi</label>
              <Input type="datetime-local" value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} className="rounded-xl" />
            </div>
          )}
          {form.schedule_type === "days_before_event" && (
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Nombre de jours avant l'événement</label>
              <Input type="number" min={1} value={form.days_before_event} onChange={e => setForm(f => ({ ...f, days_before_event: parseInt(e.target.value) }))} className="rounded-xl w-32" />
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button onClick={saveCampaign} disabled={saving} className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {editingCampaign ? "Mettre à jour" : "Programmer la campagne"}
          </Button>
          <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Annuler</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-800 font-sans-clean">Campagnes email programmées</h2>
          <p className="text-sm text-gray-400 font-sans-clean mt-0.5">Relances RSVP et rappels automatisés avec templates personnalisables</p>
        </div>
        <Button onClick={openNewForm} className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl gap-2">
          <Plus className="w-4 h-4" /> Nouvelle campagne
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Programmées", value: campaigns.filter(c => c.status === "scheduled").length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Envoyées", value: campaigns.filter(c => c.status === "sent").length, color: "text-green-600", bg: "bg-green-50" },
          { label: "Brouillons", value: campaigns.filter(c => c.status === "draft").length, color: "text-gray-600", bg: "bg-gray-50" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Mail className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-600 font-semibold font-sans-clean">Aucune campagne créée</p>
          <p className="text-sm text-gray-400 mt-1 font-sans-clean">Créez une campagne pour relancer automatiquement vos invités.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map(campaign => {
            const status = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.draft;
            const isSending = sending === campaign.id;
            const targetCount = guests.filter(g => {
              if (!g.guest_email) return false;
              if (campaign.target_audience === "pending_rsvp") return g.rsvp_status === "pending";
              if (campaign.target_audience === "confirmed") return g.rsvp_status === "confirmed";
              return true;
            }).length;

            return (
              <div key={campaign.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-rose-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-gray-800 font-sans-clean text-sm">{campaign.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>{status.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mb-2">{campaign.subject}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{AUDIENCE_LABELS[campaign.target_audience]} ({targetCount})</span>
                      {campaign.schedule_type === "specific_date" && campaign.scheduled_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(campaign.scheduled_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })} à {new Date(campaign.scheduled_date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                      {campaign.schedule_type === "days_before_event" && (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />J-{campaign.days_before_event} avant l'événement</span>
                      )}
                      {campaign.status === "sent" && campaign.sent_count !== undefined && (
                        <span className="flex items-center gap-1 text-green-500"><CheckCircle2 className="w-3 h-3" />{campaign.sent_count} envoi(s) le {campaign.sent_date ? new Date(campaign.sent_date).toLocaleDateString("fr-FR") : ""}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {campaign.status !== "sent" && (
                      <>
                        <button onClick={() => openEdit(campaign)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => sendNow(campaign)}
                          disabled={!!sending}
                          className="flex items-center gap-1 text-xs text-white bg-rose-500 hover:bg-rose-600 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                        >
                          {isSending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                          {isSending ? "Envoi..." : "Envoyer"}
                        </button>
                      </>
                    )}
                    <button onClick={() => deleteCampaign(campaign.id)} className="p-1.5 text-gray-300 hover:text-red-400 rounded-lg hover:bg-red-50 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}