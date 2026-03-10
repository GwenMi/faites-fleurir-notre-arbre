import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Gift, Plus, Send, Check, Trash2, Sparkles, X, Copy } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = {
  cadeau: { label: "Cadeau", emoji: "🎁" },
  cagnotte: { label: "Cagnotte", emoji: "💰" },
  bon_cadeau: { label: "Bon cadeau", emoji: "🎫" },
  fait_main: { label: "Fait main", emoji: "🧶" },
  autre: { label: "Autre", emoji: "✨" },
};

const DEFAULT_TEMPLATE = `Chers {prenom},

Nous tenions à vous remercier chaleureusement pour votre cadeau ({cadeau}). C'est un geste qui nous touche profondément et qui rendra notre vie à deux encore plus belle.

Votre présence à nos côtés lors de cette journée inoubliable restera gravée dans nos mémoires.

Avec tout notre amour,
{mariés}`;

function GenerateModal({ gift, event, onClose }) {
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [generated, setGenerated] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const preview = template
    .replace(/{prenom}/g, gift.guest_name.split(" ")[0])
    .replace(/{cadeau}/g, gift.gift_description)
    .replace(/{mariés}/g, event.couple_names || "Les mariés");

  const generateAI = async () => {
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Tu es un assistant pour rédiger des messages de remerciement de mariage en français.
Rédige un message de remerciement chaleureux et personnalisé de la part de "${event.couple_names || "les mariés"}" pour "${gift.guest_name}" qui leur a offert "${gift.gift_description}".
Le message doit être sincère, poétique et élégant, environ 4-5 phrases. Signe avec le prénom des mariés.`,
    });
    setGenerated(result);
    setLoading(false);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Message copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h3 className="font-semibold text-gray-800">Message de remerciement</h3>
            <p className="text-xs text-gray-400 mt-0.5">Pour {gift.guest_name} — {gift.gift_description}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Template */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">Modèle de message</label>
              <span className="text-xs text-gray-400">Variables : {"{prenom}"} {"{cadeau}"} {"{mariés}"}</span>
            </div>
            <textarea
              value={template}
              onChange={e => setTemplate(e.target.value)}
              rows={8}
              className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-rose-200 font-mono"
            />
          </div>

          {/* Preview */}
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-rose-400 mb-2 uppercase tracking-wide">Aperçu</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{preview}</p>
            <Button size="sm" variant="ghost" className="mt-3 text-rose-500" onClick={() => handleCopy(preview)}>
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              Copier ce message
            </Button>
          </div>

          {/* AI */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-violet-400" />
                Générer avec l'IA
              </p>
              <Button size="sm" onClick={generateAI} disabled={loading}
                className="bg-violet-500 hover:bg-violet-600 text-white text-xs">
                {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                Générer
              </Button>
            </div>
            {generated && (
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{generated}</p>
                <Button size="sm" variant="ghost" className="mt-3 text-violet-500" onClick={() => handleCopy(generated)}>
                  {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  Copier ce message
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThankYouManager({ event }) {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedGift, setSelectedGift] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    guest_name: "", guest_email: "", gift_description: "", category: "cadeau", amount: "", notes: ""
  });

  useEffect(() => { loadGifts(); }, [event?.id]);

  const loadGifts = async () => {
    setLoading(true);
    const data = await base44.entities.ThankYouGift.filter({ event_id: event.id }, "-created_date");
    setGifts(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.entities.ThankYouGift.create({
      ...form,
      amount: form.amount ? parseFloat(form.amount) : undefined,
      event_id: event.id,
    });
    toast.success("Cadeau ajouté !");
    setForm({ guest_name: "", guest_email: "", gift_description: "", category: "cadeau", amount: "", notes: "" });
    setShowForm(false);
    setSaving(false);
    loadGifts();
  };

  const markSent = async (gift) => {
    await base44.entities.ThankYouGift.update(gift.id, {
      thank_you_sent: !gift.thank_you_sent,
      thank_you_sent_date: !gift.thank_you_sent ? new Date().toISOString() : null,
    });
    loadGifts();
    if (!gift.thank_you_sent) toast.success("Remerciement marqué comme envoyé ✓");
  };

  const handleDelete = async (id) => {
    await base44.entities.ThankYouGift.delete(id);
    loadGifts();
    toast.success("Supprimé");
  };

  const sent = gifts.filter(g => g.thank_you_sent).length;
  const pending = gifts.length - sent;

  return (
    <div className="space-y-5">
      {selectedGift && (
        <GenerateModal
          gift={selectedGift}
          event={event}
          onClose={() => setSelectedGift(null)}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Cadeaux reçus", value: gifts.length, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-100" },
          { label: "Remerciements envoyés", value: sent, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
          { label: "En attente", value: pending, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4 text-center`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)} className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl gap-2">
          <Plus className="w-4 h-4" />
          Ajouter un cadeau
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-rose-100 rounded-2xl p-5 space-y-3">
          <h4 className="font-semibold text-gray-700 mb-1">Nouveau cadeau</h4>
          <div className="grid grid-cols-2 gap-3">
            <Input required placeholder="Nom du donateur *" value={form.guest_name}
              onChange={e => setForm({ ...form, guest_name: e.target.value })} className="rounded-xl" />
            <Input placeholder="Email (optionnel)" value={form.guest_email}
              onChange={e => setForm({ ...form, guest_email: e.target.value })} className="rounded-xl" />
          </div>
          <Input required placeholder="Description du cadeau *" value={form.gift_description}
            onChange={e => setForm({ ...form, gift_description: e.target.value })} className="rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="h-9 rounded-xl border border-input px-3 text-sm bg-transparent">
              {Object.entries(CATEGORIES).map(([k, v]) => (
                <option key={k} value={k}>{v.emoji} {v.label}</option>
              ))}
            </select>
            <Input placeholder="Montant (si cagnotte)" type="number" value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })} className="rounded-xl" />
          </div>
          <Input placeholder="Notes internes" value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })} className="rounded-xl" />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button type="submit" disabled={saving} className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ajouter"}
            </Button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-rose-300" /></div>
      ) : gifts.length === 0 ? (
        <div className="text-center py-16">
          <Gift className="w-10 h-10 text-rose-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Aucun cadeau enregistré pour l'instant</p>
        </div>
      ) : (
        <div className="space-y-3">
          {gifts.map(gift => (
            <div key={gift.id}
              className={`bg-white border rounded-2xl p-4 flex items-start gap-4 transition ${gift.thank_you_sent ? "border-emerald-100 opacity-80" : "border-gray-100"}`}>
              <div className="text-2xl mt-0.5">{CATEGORIES[gift.category]?.emoji || "🎁"}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-gray-800">{gift.guest_name}</span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">
                    {CATEGORIES[gift.category]?.label}
                  </span>
                  {gift.thank_you_sent && (
                    <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Remercié
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-0.5">{gift.gift_description}
                  {gift.amount ? <span className="ml-2 text-rose-500 font-semibold">{gift.amount}€</span> : null}
                </p>
                {gift.notes && <p className="text-xs text-gray-400 mt-1 italic">{gift.notes}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button size="sm" variant="ghost" title="Générer un message"
                  onClick={() => setSelectedGift(gift)}
                  className="text-violet-500 hover:text-violet-700 hover:bg-violet-50">
                  <Sparkles className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" title={gift.thank_you_sent ? "Marquer non envoyé" : "Marquer remercié"}
                  onClick={() => markSent(gift)}
                  className={gift.thank_you_sent ? "text-emerald-500" : "text-gray-400 hover:text-emerald-500"}>
                  <Send className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(gift.id)}
                  className="text-gray-300 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}