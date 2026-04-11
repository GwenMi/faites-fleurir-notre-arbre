import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Loader2, ExternalLink, MapPin, Heart, Image, HelpCircle, Gift, BookOpen, Check } from "lucide-react";
import { toast } from "sonner";
import SectionOrderEditor, { DEFAULT_SECTIONS_ORDER } from "./SectionOrderEditor";

const SECTIONS = [
  {
    key: "show_couple_story",
    label: "Notre histoire",
    icon: Heart,
    desc: "Racontez votre histoire aux invités",
    color: "rose",
    hasContent: true,
    contentKey: "couple_story",
    contentLabel: "Votre histoire",
    placeholder: "Nous nous sommes rencontrés en 2019...",
    rows: 6,
  },
  {
    key: "show_photo_gallery",
    label: "Galerie photo collaborative",
    icon: Image,
    desc: "Les invités partagent leurs photos via QR code",
    color: "purple",
  },
  {
    key: "show_map",
    label: "Plan d'accès",
    icon: MapPin,
    desc: "Afficher l'adresse et la carte du lieu",
    color: "blue",
    hasContent: true,
    contentKey: "map_address",
    contentLabel: "Adresse du lieu",
    placeholder: "12 Allée des Roses, 44000 Nantes",
    rows: 1,
    extra: {
      key: "map_embed_url",
      label: "URL Google Maps embed (optionnel)",
      placeholder: "https://www.google.com/maps/embed?pb=...",
      help: "Dans Google Maps → Partager → Intégrer → copier l'URL src",
    },
  },
  {
    key: "show_faq",
    label: "FAQ — Questions fréquentes",
    icon: HelpCircle,
    desc: "Répondez aux questions de vos invités",
    color: "amber",
  },
  {
    key: "show_wishlist",
    label: "Liste de cadeaux",
    icon: Gift,
    desc: "Partagez vos envies avec vos proches",
    color: "green",
  },
  {
    key: "show_guestbook",
    label: "Livre d'or",
    icon: BookOpen,
    desc: "Les invités laissent un message souvenir",
    color: "indigo",
  },
  {
    key: "show_cagnotte",
    label: "Cagnotte",
    icon: Gift,
    desc: "Lien vers votre cagnotte (Leetchi, Lydia, PayPal…)",
    color: "pink",
    hasContent: true,
    contentKey: "cagnotte_message",
    contentLabel: "Message pour les invités (optionnel)",
    placeholder: "Pour nous aider à réaliser notre voyage de noces…",
    rows: 2,
    extra: {
      key: "cagnotte_url",
      label: "Lien de votre cagnotte",
      placeholder: "https://www.leetchi.com/c/votre-cagnotte",
      help: "Copiez le lien de partage de votre cagnotte (Leetchi, Lydia, PayPal.me, Sumeria…)",
    },
  },
];

const COLOR_MAP = {
  rose: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-600", toggle: "bg-rose-400" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-600", toggle: "bg-purple-400" },
  blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600", toggle: "bg-blue-400" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600", toggle: "bg-amber-400" },
  green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-600", toggle: "bg-green-400" },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-600", toggle: "bg-indigo-400" },
  pink:   { bg: "bg-pink-50",   border: "border-pink-200",   text: "text-pink-600",   toggle: "bg-pink-400" },
};

export default function SiteEditorManager({ event }) {
  const [form, setForm] = useState({
    show_couple_story: event.show_couple_story ?? false,
    couple_story: event.couple_story || "",
    show_map: event.show_map ?? false,
    map_address: event.map_address || "",
    map_embed_url: event.map_embed_url || "",
    show_photo_gallery: event.show_photo_gallery ?? true,
    show_faq: event.show_faq ?? true,
    show_wishlist: event.show_wishlist ?? true,
    show_guestbook: event.show_guestbook ?? true,
    show_cagnotte: event.show_cagnotte ?? false,
    cagnotte_url: event.cagnotte_url || "",
    cagnotte_message: event.cagnotte_message || "",
  });
  const [sectionsOrder, setSectionsOrder] = useState(
    event.sections_order?.length ? event.sections_order : DEFAULT_SECTIONS_ORDER
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showOrderEditor, setShowOrderEditor] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setSaved(false); };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Event.update(event.id, { ...form, sections_order: sectionsOrder });
    setSaving(false);
    setSaved(true);
    toast.success("Sections du site enregistrées ✓");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-800">Sections de votre site public</h3>
          <p className="text-xs text-gray-400 mt-0.5">Activez, désactivez et personnalisez chaque section</p>
        </div>
        {event.public_url && (
          <a href={event.public_url} target="_blank" rel="noreferrer"
            className="text-xs text-rose-500 flex items-center gap-1 hover:text-rose-600 transition border border-rose-200 px-3 py-1.5 rounded-full">
            <ExternalLink className="w-3.5 h-3.5" /> Voir mon site
          </a>
        )}
      </div>

      {/* Drag & drop order editor */}
      <div className="border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowOrderEditor(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">⠿</span>
            <p className="text-sm font-semibold text-gray-700">Ordre des sections</p>
          </div>
          <span className="text-xs text-rose-400 font-semibold">{showOrderEditor ? "Fermer ↑" : "Modifier ↓"}</span>
        </button>
        {showOrderEditor && (
          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="mt-3">
              <SectionOrderEditor order={sectionsOrder} onChange={setSectionsOrder} />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {SECTIONS.map(section => {
          const enabled = form[section.key];
          const Icon = section.icon;
          const colors = COLOR_MAP[section.color];
          return (
            <div key={section.key}
              className={`rounded-2xl border-2 transition-all overflow-hidden ${enabled ? `${colors.border} ${colors.bg}` : "border-gray-100 bg-white"}`}>
              {/* Header row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${enabled ? `${colors.toggle} text-white` : "bg-gray-100 text-gray-400"}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${enabled ? colors.text : "text-gray-600"}`}>{section.label}</p>
                  <p className="text-xs text-gray-400 truncate">{section.desc}</p>
                </div>
                <button
                  onClick={() => set(section.key, !enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${enabled ? colors.toggle : "bg-gray-200"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>

              {/* Content editor */}
              {enabled && section.hasContent && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/60">
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-600 mb-1.5">{section.contentLabel}</p>
                    <textarea
                      value={form[section.contentKey] || ""}
                      onChange={e => set(section.contentKey, e.target.value)}
                      rows={section.rows || 4}
                      placeholder={section.placeholder}
                      className="w-full rounded-xl border border-white shadow-sm px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white"
                    />
                  </div>
                  {section.extra && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1.5">{section.extra.label}</p>
                      <Input
                        value={form[section.extra.key] || ""}
                        onChange={e => set(section.extra.key, e.target.value)}
                        placeholder={section.extra.placeholder}
                        className="rounded-xl bg-white border-white shadow-sm text-xs"
                      />
                      {section.extra.help && (
                        <p className="text-xs text-gray-400 mt-1">ℹ️ {section.extra.help}</p>
                      )}
                      {form[section.extra.key] && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-white shadow-sm h-40">
                          <iframe src={form[section.extra.key]} width="100%" height="100%" className="border-0" loading="lazy" title="Carte" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white">
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : saved ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
        {saved ? "Enregistré ✓" : "Enregistrer les sections"}
      </Button>
    </div>
  );
}