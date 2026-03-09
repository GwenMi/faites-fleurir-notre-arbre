import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Save, Mail, CheckCircle2, Info } from "lucide-react";
import { toast } from "sonner";

const TRIGGERS = [
  { key: "on_new_photo", label: "Nouvelle photo déposée", icon: "📸", desc: "Un invité soumet une nouvelle photo" },
  { key: "on_new_rsvp", label: "Nouvelle réponse RSVP", icon: "📋", desc: "Un invité répond à votre invitation" },
  { key: "on_new_guestbook", label: "Nouveau message livre d'or", icon: "💬", desc: "Un invité écrit dans le livre d'or" },
  { key: "on_new_order", label: "Nouvelle commande", icon: "📦", desc: "Un invité passe une commande boutique" },
];

export default function NotificationsManager({ event }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => { loadData(); }, [event?.id]);

  const loadData = async () => {
    setLoading(true);
    const existing = await base44.entities.NotificationSettings.filter({ event_id: event.id });
    if (existing && existing.length > 0) {
      setSettings(existing[0]);
    } else {
      setSettings({
        event_id: event.id,
        notify_email: "",
        on_new_photo: true,
        on_new_rsvp: true,
        on_new_guestbook: true,
        on_new_order: true,
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!settings.notify_email?.trim()) { toast.error("Veuillez saisir une adresse email"); return; }
    setSaving(true);
    if (settings.id) {
      await base44.entities.NotificationSettings.update(settings.id, settings);
    } else {
      const created = await base44.entities.NotificationSettings.create(settings);
      setSettings(created);
    }
    toast.success("Préférences de notifications sauvegardées !");
    setSaving(false);
  };

  const handleTest = async () => {
    if (!settings.notify_email?.trim()) { toast.error("Veuillez d'abord saisir votre email"); return; }
    setTesting(true);
    await base44.integrations.Core.SendEmail({
      to: settings.notify_email,
      from_name: event.couple_names,
      subject: `[Test] Notifications activées — ${event.couple_names}`,
      body: `Bonjour,\n\nVos notifications sont bien configurées pour l'événement "${event.couple_names}".\n\nVous recevrez des emails automatiques selon vos préférences :\n${TRIGGERS.filter(t => settings[t.key]).map(t => `• ${t.label}`).join("\n")}\n\nÀ bientôt,\nFleurs de fête`,
    });
    toast.success("Email de test envoyé !");
    setTesting(false);
  };

  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));

  if (loading || !settings) return <div className="py-10 text-center text-gray-400 text-sm">Chargement...</div>;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold text-gray-800 flex items-center gap-2"><Bell className="w-4 h-4 text-purple-500" /> Notifications par email</h3>
        <p className="text-xs text-gray-400 mt-0.5">Recevez un email automatique lors des activités importantes sur votre événement.</p>
      </div>

      {/* Email */}
      <div className="bg-purple-50 rounded-2xl border border-purple-100 p-4">
        <p className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5" /> Adresse de réception
        </p>
        <div className="flex gap-2">
          <Input
            type="email"
            value={settings.notify_email || ""}
            onChange={e => setSettings(s => ({ ...s, notify_email: e.target.value }))}
            placeholder="votre@email.com"
            className="rounded-xl bg-white flex-1"
          />
          <Button variant="outline" size="sm" onClick={handleTest} disabled={testing} className="rounded-xl flex-shrink-0">
            {testing ? "Envoi…" : "Tester"}
          </Button>
        </div>
      </div>

      {/* Triggers */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-3">Quand souhaitez-vous être notifié ?</p>
        <div className="space-y-2">
          {TRIGGERS.map(trigger => (
            <label key={trigger.key}
              className={`flex items-center gap-4 p-3.5 rounded-2xl border-2 cursor-pointer transition ${settings[trigger.key] ? "border-purple-200 bg-purple-50" : "border-gray-100 bg-white hover:bg-gray-50"}`}>
              <span className="text-xl flex-shrink-0">{trigger.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${settings[trigger.key] ? "text-purple-700" : "text-gray-700"}`}>{trigger.label}</p>
                <p className="text-xs text-gray-400">{trigger.desc}</p>
              </div>
              <div className="flex-shrink-0">
                <div onClick={() => toggle(trigger.key)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${settings[trigger.key] ? "bg-purple-500" : "bg-gray-200"}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${settings[trigger.key] ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-2xl p-3 text-xs text-blue-600">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>Les notifications sont envoyées en temps réel dès qu'une action est effectuée par vos invités. Pensez à vérifier vos spams si vous ne recevez rien.</span>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full h-11 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-semibold">
        {saving ? "Sauvegarde…" : <><Save className="w-4 h-4 mr-2" /> Sauvegarder les préférences</>}
      </Button>
    </div>
  );
}