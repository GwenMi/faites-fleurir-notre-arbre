import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  X, Save, Loader2, Package, User, Mail, Phone, MapPin,
  Calendar, Hash, FileText, CheckCircle2, ExternalLink, AlertCircle
} from "lucide-react";

const SOURCES = [
  { value: "manual", label: "💻 Saisie manuelle" },
  { value: "etsy", label: "🛒 Commande Etsy" },
  { value: "salon", label: "🎪 Salon / Marché" },
  { value: "phone", label: "📞 Téléphone" },
];

const EMPTY = {
  customer_name: "",
  customer_email: "",
  customer_phone: "",
  kit_id: "",
  quantity: 1,
  total_price: "",
  event_date: "",
  event_type: "mariage",
  couple_names: "",
  delivery_address: "",
  custom_text: "",
  payment_status: "unpaid",
  source: "manual",
  external_ref: "",
  notes: "",
  send_email: true,
  create_event_site: false,
};

export default function ManualOrderForm({ onClose, onSuccess }) {
  const [kits, setKits] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null); // { order_id, event_slug }
  const [loadingKits, setLoadingKits] = useState(true);

  useEffect(() => {
    base44.entities.Kit.filter({ active: true }).then(data => {
      setKits(data || []);
      setLoadingKits(false);
    });
  }, []);

  const set = (field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-calculer le prix si un kit est sélectionné
      if (field === "kit_id" || field === "quantity") {
        const kit = kits.find(k => k.id === (field === "kit_id" ? value : prev.kit_id));
        if (kit && kit.price) {
          const qty = field === "quantity" ? Number(value) : Number(prev.quantity);
          updated.total_price = (kit.price * qty).toFixed(2);
        }
      }
      return updated;
    });
  };

  const selectedKit = kits.find(k => k.id === form.kit_id);

  const submit = async () => {
    if (!form.customer_name.trim()) { toast.error("Nom client requis"); return; }
    if (!form.customer_email.trim()) { toast.error("Email client requis"); return; }
    if (!form.kit_id) { toast.error("Veuillez sélectionner un kit"); return; }

    setSaving(true);
    const res = await base44.functions.invoke("createManualOrder", {
      ...form,
      kit_name: selectedKit?.name || "",
      quantity: Number(form.quantity),
      total_price: parseFloat(form.total_price) || 0,
    });

    setSaving(false);
    if (res.data?.success) {
      setResult(res.data);
      toast.success("Commande créée ✓");
      onSuccess?.();
    } else {
      toast.error(res.data?.error || "Erreur lors de la création");
    }
  };

  // ── Écran de succès ──
  if (result) {
    return (
      <div className="max-w-lg mx-auto text-center py-10 space-y-5">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Commande créée !</h3>
        <p className="text-sm text-gray-500">
          La commande a bien été enregistrée{form.send_email ? " et l'email de confirmation a été envoyé au client." : "."}
        </p>
        {result.event_slug && (
          <a
            href={`/event/${result.event_slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-rose-600 font-semibold hover:underline"
          >
            <ExternalLink className="w-4 h-4" /> Voir le site événement
          </a>
        )}
        <div className="flex gap-3 justify-center pt-2">
          <Button onClick={() => { setForm(EMPTY); setResult(null); }} variant="outline">
            Nouvelle commande
          </Button>
          <Button onClick={onClose} className="bg-rose-500 hover:bg-rose-600">Fermer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-800 text-lg">Nouvelle commande manuelle</h3>
          <p className="text-xs text-gray-400 mt-0.5">Commande externe, salon, Etsy, téléphone…</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Source */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Source de la commande</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SOURCES.map(s => (
            <button
              key={s.value}
              onClick={() => set("source", s.value)}
              className={`text-xs px-3 py-2.5 rounded-xl border font-medium transition text-center ${
                form.source === s.value
                  ? "border-rose-400 bg-rose-50 text-rose-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Référence externe (n° commande Etsy, bon…)</label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <Input value={form.external_ref} onChange={e => set("external_ref", e.target.value)} placeholder="Ex: 123456789" className="pl-9" />
          </div>
        </div>
      </div>

      {/* Client */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Informations client</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nom complet *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <Input value={form.customer_name} onChange={e => set("customer_name", e.target.value)} placeholder="Prénom Nom" className="pl-9" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <Input type="email" value={form.customer_email} onChange={e => set("customer_email", e.target.value)} placeholder="client@email.com" className="pl-9" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <Input value={form.customer_phone} onChange={e => set("customer_phone", e.target.value)} placeholder="06 00 00 00 00" className="pl-9" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Date de l'événement</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <Input type="date" value={form.event_date} onChange={e => set("event_date", e.target.value)} className="pl-9" />
            </div>
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Adresse de livraison</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-300" />
            <textarea
              value={form.delivery_address}
              onChange={e => set("delivery_address", e.target.value)}
              placeholder={"Prénom Nom\n1 rue de la Paix\n75001 Paris\nFrance"}
              rows={4}
              className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-md bg-transparent placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>
        </div>
      </div>

      {/* Kit & commande */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kit & commande</p>

        {loadingKits ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Chargement des kits…
          </div>
        ) : kits.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
            <AlertCircle className="w-4 h-4" /> Aucun kit actif — créez-en un dans la section Kits
          </div>
        ) : (
          <div className="grid gap-2">
            {kits.map(kit => (
              <button
                key={kit.id}
                onClick={() => set("kit_id", kit.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition ${
                  form.kit_id === kit.id
                    ? "border-rose-400 bg-rose-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Package className={`w-5 h-5 flex-shrink-0 ${form.kit_id === kit.id ? "text-rose-400" : "text-gray-300"}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800">{kit.name}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {kit.pot_type && <span className="text-xs text-gray-400">🫙 {kit.pot_type}</span>}
                    {kit.ribbon_color && <span className="text-xs text-gray-400">🎀 {kit.ribbon_color}</span>}
                    {kit.seed_type && <span className="text-xs text-gray-400">🌱 {kit.seed_type}</span>}
                  </div>
                </div>
                {kit.price > 0 && (
                  <span className="text-sm font-bold text-rose-600 flex-shrink-0">{kit.price.toFixed(2)} €</span>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Quantité *</label>
            <Input type="number" min="1" value={form.quantity} onChange={e => set("quantity", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Prix total (€)</label>
            <Input type="number" step="0.01" value={form.total_price} onChange={e => set("total_price", e.target.value)} placeholder="Auto-calculé" />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Statut paiement</label>
          <select
            value={form.payment_status}
            onChange={e => set("payment_status", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-300"
          >
            <option value="unpaid">Non réglée</option>
            <option value="partial">Acompte reçu</option>
            <option value="paid">Réglée intégralement</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Texte personnalisé du kit</label>
          <Input value={form.custom_text} onChange={e => set("custom_text", e.target.value)} placeholder="Ex: Emma & Thomas — 12 juin 2025" />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Notes internes</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-300" />
            <Input value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Notes pour l'équipe" className="pl-9" />
          </div>
        </div>
      </div>

      {/* Site événement */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="create_event"
            checked={form.create_event_site}
            onChange={e => set("create_event_site", e.target.checked)}
            className="rounded"
          />
          <label htmlFor="create_event" className="text-sm font-semibold text-gray-700 cursor-pointer">
            🎉 Créer automatiquement un espace événement
          </label>
        </div>
        {form.create_event_site && (
          <div className="space-y-3 pl-6">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Noms du/des mariés</label>
              <Input value={form.couple_names} onChange={e => set("couple_names", e.target.value)} placeholder="Ex: Emma & Thomas" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Type d'événement</label>
              <select
                value={form.event_type}
                onChange={e => set("event_type", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-300"
              >
                <option value="mariage">Mariage</option>
                <option value="fiançailles">Fiançailles</option>
                <option value="anniversaire">Anniversaire</option>
                <option value="bapteme">Baptême</option>
                <option value="communion">Communion</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Email */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="send_email"
            checked={form.send_email}
            onChange={e => set("send_email", e.target.checked)}
            className="rounded"
          />
          <label htmlFor="send_email" className="text-sm font-semibold text-blue-700 cursor-pointer">
            📧 Envoyer un email de confirmation au client
          </label>
        </div>
        {form.send_email && (
          <p className="text-xs text-blue-500 mt-2 pl-7">
            Un email récapitulatif sera envoyé à <strong>{form.customer_email || "l'adresse du client"}</strong>
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pb-4">
        <Button onClick={submit} disabled={saving} className="flex-1 bg-rose-500 hover:bg-rose-600 h-11">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Créer la commande
        </Button>
        <Button onClick={onClose} variant="outline" className="h-11 px-6">Annuler</Button>
      </div>
    </div>
  );
}