import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TemplatePreviewModal from "@/components/admin/TemplatePreviewModal";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TEMPLATES, getTemplatesForEventType, getDefaultTemplateForEventType, EVENT_TYPE_LABELS } from "@/components/public/TemplateConfig";
import TemplatePreview from "@/components/admin/TemplatePreview";
import { toast } from "sonner";
import { Camera, X } from "lucide-react";
import SectionOrderEditor from "@/components/public/SectionOrderEditor";

function generateSlug(coupleNames) {
  return coupleNames
    .toLowerCase()
    .replace(/[&+]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[éèê]/g, "e").replace(/[àâ]/g, "a").replace(/[îï]/g, "i")
    .replace(/[ôö]/g, "o").replace(/[ùûü]/g, "u").replace(/ç/g, "c")
    .replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

const NO_DATE_TYPES = ["fete_entreprise", "maison_hote"];
const BIRTH_DATE_TYPES = ["anniversaire", "bapteme", "communion"];

export default function EventForm({ event, onSave, onCancel }) {
  const isEdit = !!event;
  const [form, setForm] = useState(event || {
    couple_names: "", event_name: "", event_type: "mariage", event_date: "",
    birth_date: "",
    welcome_message: "", seed_type: "", template: "classique",
    primary_color: "#c084fc", secondary_color: "#86efac", plan: "basic",
    cover_image: "", status: "active",
    sections_order: [
      "couple_story", "day_schedule", "rsvp", "best_of", "photo_gallery",
      "wishlist", "seating_plan", "faq", "map", "guest_photos", "guestbook", "cagnotte"
    ],
  });

  const isNoDate = NO_DATE_TYPES.includes(form.event_type);

  // Calculate age for anniversaire/bapteme/communion
  const ageAtEvent = BIRTH_DATE_TYPES.includes(form.event_type) && form.birth_date && form.event_date
    ? new Date(form.event_date).getFullYear() - new Date(form.birth_date).getFullYear()
    : null;

  const availableTemplates = getTemplatesForEventType(form.event_type);
  const freeTemplates = availableTemplates.filter(([, v]) => v.plan === "basic");
  const premiumTemplates = availableTemplates.filter(([, v]) => v.plan === "premium");

  const handleEventTypeChange = (v) => {
    const defaultTpl = getDefaultTemplateForEventType(v);
    const tplData = TEMPLATES[defaultTpl];
    setForm(f => ({
      ...f,
      event_type: v,
      template: defaultTpl,
      primary_color: tplData?.primaryColor || f.primary_color,
      secondary_color: tplData?.secondaryColor || f.secondary_color,
    }));
  };
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(event?.cover_image || null);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const handleSetPlan = (newPlan) => {
    set("plan", newPlan);
    // Si passage à premium, initialiser sections_order par défaut
    if (newPlan === "premium" && !form.sections_order) {
      set("sections_order", [
        "couple_story", "day_schedule", "rsvp", "best_of", "photo_gallery",
        "wishlist", "seating_plan", "faq", "map", "guest_photos", "guestbook", "cagnotte"
      ]);
    }
  };

  const handleCover = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.couple_names) {
      toast.error("Merci de renseigner le nom/prénom");
      return;
    }
    if (!isNoDate && !form.event_date) {
      toast.error("Merci de renseigner la date de l'événement");
      return;
    }
    setSaving(true);
    let coverUrl = form.cover_image;
    if (coverFile) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: coverFile });
      coverUrl = file_url;
    }
    const slug = isEdit ? form.slug : generateSlug(form.couple_names);
    const origin = window.location.origin;
    const publicUrl = `${origin}/EventPublic?slug=${slug}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}&margin=10`;
    const data = { ...form, cover_image: coverUrl, slug, public_url: publicUrl, qr_code_url: qrCodeUrl };
    if (isEdit) {
      await base44.entities.Event.update(event.id, data);
      toast.success("Événement mis à jour !");
    } else {
      await base44.entities.Event.create(data);
      toast.success("Événement créé avec succès !");
    }
    setSaving(false);
    onSave && onSave();
  };

  return (
    <div className="space-y-5 p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>{
            form.event_type === "mariage" || form.event_type === "fiançailles" ? "Prénoms des mariés *" :
            form.event_type === "anniversaire" ? "Prénom du/de la fêté(e) *" :
            form.event_type === "bapteme" ? "Prénom de l'enfant *" :
            form.event_type === "communion" ? "Prénom du communiant(e) *" :
            form.event_type === "fete_entreprise" ? "Nom de l'entreprise *" :
            form.event_type === "maison_hote" ? "Nom de la maison d'hôte *" :
            "Nom de l'événement *"
          }</Label>
          <Input
            placeholder={
              form.event_type === "mariage" || form.event_type === "fiançailles" ? "Emma & Lucas" :
              form.event_type === "anniversaire" ? "Sophie" :
              form.event_type === "bapteme" ? "Chloé" :
              form.event_type === "communion" ? "Léa" :
              form.event_type === "fete_entreprise" ? "Acme & Co." :
              form.event_type === "maison_hote" ? "Le Mas des Roses" :
              "Mon événement"
            }
            value={form.couple_names} onChange={(e) => set("couple_names", e.target.value)} className="rounded-xl h-11" />
        </div>
        <div className="space-y-1">
          <Label>Nom de l'événement</Label>
          <Input placeholder="Notre Mariage" value={form.event_name} onChange={(e) => set("event_name", e.target.value)} className="rounded-xl h-11" />
        </div>
        <div className="space-y-1">
          <Label>Type d'événement</Label>
          <Select value={form.event_type} onValueChange={handleEventTypeChange}>
            <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(EVENT_TYPE_LABELS).map(([key, { label, emoji }]) => (
                <SelectItem key={key} value={key}>{emoji} {label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Anniversaire / Baptême / Communion: date de naissance */}
        {BIRTH_DATE_TYPES.includes(form.event_type) && (
          <div className="space-y-1">
            <Label>Date de naissance *</Label>
            <Input type="date" value={form.birth_date} onChange={(e) => set("birth_date", e.target.value)} className="rounded-xl h-11" />
          </div>
        )}

        {/* Date de l'événement (masquée pour entreprises/maisons d'hôtes) */}
        {!isNoDate && (
          <div className="space-y-1">
            <Label>Date de l'événement *</Label>
            <Input type="date" value={form.event_date} onChange={(e) => set("event_date", e.target.value)} className="rounded-xl h-11" />
          </div>
        )}

        {/* Affichage de l'âge calculé */}
        {ageAtEvent !== null && (
          <div className="col-span-2 bg-rose-50 border border-rose-100 rounded-xl p-3 text-sm text-rose-700 font-medium">
            {form.event_type === "anniversaire" ? "🎂" : form.event_type === "communion" ? "✝️" : "🕊️"} {form.couple_names} aura <strong>{ageAtEvent} an{ageAtEvent > 1 ? "s" : ""}</strong> lors de cet événement
          </div>
        )}
      </div>

      <div className="space-y-1">
        <Label>Message de bienvenue</Label>
        <Textarea placeholder="Un message chaleureux pour vos invités..." value={form.welcome_message}
          onChange={(e) => set("welcome_message", e.target.value)} className="rounded-xl" rows={3} />
      </div>

      {/* Cover image */}
      <div className="space-y-1">
        <Label>Photo de couverture</Label>
        <label className="block cursor-pointer">
          {coverPreview ? (
            <div className="relative rounded-xl overflow-hidden">
              <img src={coverPreview} className="w-full h-40 object-cover" alt="couverture" />
              <button type="button" onClick={(e) => { e.preventDefault(); setCoverPreview(null); setCoverFile(null); set("cover_image", ""); }}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          ) : (
            <div className="w-full h-32 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:bg-gray-50 transition">
              <Camera className="w-6 h-6" />
              <span className="text-sm">Ajouter une photo</span>
            </div>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleCover} />
        </label>
      </div>

      {/* Template avec aperçu visuel */}
      <div className="space-y-4">
        <Label>Template <span className="text-gray-400 font-normal text-xs">— adaptés à votre type d'événement</span></Label>
        {availableTemplates.length === 0 ? (
          <p className="text-sm text-gray-400">Aucun template disponible pour ce type d'événement.</p>
        ) : (
          <div className="space-y-4">
            {/* Bouton de prévisualisation interactive */}
            {TEMPLATES[form.template] && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg transition"
                >
                  🎨 Voir l'aperçu complet du template
                </button>
              </div>
            )}

            {/* Grid de sélection */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
              {freeTemplates.map(([key, tpl]) => (
                <button key={key} type="button"
                  onClick={() => { set("template", key); set("primary_color", tpl.primaryColor); set("secondary_color", tpl.secondaryColor); }}
                  className={`p-4 rounded-xl border-2 text-center transition ${form.template === key ? "border-purple-400 bg-purple-50 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                  <div className="text-2xl mb-2">{tpl.emoji}</div>
                  <p className="text-xs font-semibold text-gray-800 mb-1">{tpl.name}</p>
                  <div className="flex gap-1 justify-center mb-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: tpl.primaryColor }}></div>
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: tpl.secondaryColor }}></div>
                  </div>
                  <span className="text-xs text-green-500 font-semibold">Gratuit</span>
                </button>
              ))}
              {premiumTemplates.map(([key, tpl]) => (
                <button key={key} type="button"
                  onClick={() => { set("template", key); set("plan", "premium"); set("primary_color", tpl.primaryColor); set("secondary_color", tpl.secondaryColor); }}
                  className={`p-4 rounded-xl border-2 text-center transition ${form.template === key ? "border-amber-400 bg-amber-50 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                  <div className="text-2xl mb-2">{tpl.emoji}</div>
                  <p className="text-xs font-semibold text-gray-800 mb-1">{tpl.name}</p>
                  <div className="flex gap-1 justify-center mb-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: tpl.primaryColor }}></div>
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: tpl.secondaryColor }}></div>
                  </div>
                  <span className="text-xs text-amber-500 font-semibold">⭐ Premium</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Couleur principale</Label>
          <div className="flex items-center gap-2">
            <input type="color" value={form.primary_color} onChange={(e) => set("primary_color", e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
            <Input value={form.primary_color} onChange={(e) => set("primary_color", e.target.value)} className="rounded-xl h-10 font-mono text-sm" />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Couleur secondaire</Label>
          <div className="flex items-center gap-2">
            <input type="color" value={form.secondary_color} onChange={(e) => set("secondary_color", e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
            <Input value={form.secondary_color} onChange={(e) => set("secondary_color", e.target.value)} className="rounded-xl h-10 font-mono text-sm" />
          </div>
        </div>
      </div>

      {/* Sections (Premium seulement) */}
      {form.plan === "premium" && (
        <div className="space-y-2 border-t pt-4">
          <Label>Ordre des sections</Label>
          <p className="text-xs text-gray-500 mb-3">Glissez pour réorganiser, cliquez sur l'œil pour masquer</p>
          <SectionOrderEditor
            order={form.sections_order || []}
            onChange={(newOrder) => set("sections_order", newOrder)}
          />
        </div>
      )}

      {/* Plan */}
      <div className="space-y-2">
        <Label>Plan</Label>
        <div className="grid grid-cols-2 gap-3">
          {[{ key: "basic", label: "Basic", desc: "Gratuit", color: "green" }, { key: "premium", label: "Premium", desc: "19 €", color: "amber" }].map(p => (
            <button key={p.key} type="button" onClick={() => handleSetPlan(p.key)}
              className={`p-4 rounded-xl border-2 text-left transition ${form.plan === p.key ? `border-${p.color}-400 bg-${p.color}-50` : "border-gray-200 bg-white"}`}>
              <p className="font-bold text-gray-800">{p.label}</p>
              <p className={`text-sm font-semibold text-${p.color}-600`}>{p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && <Button type="button" variant="outline" className="flex-1 rounded-xl h-12" onClick={onCancel}>Annuler</Button>}
        <Button onClick={handleSave} disabled={saving} className="flex-1 rounded-xl h-12 font-semibold bg-purple-500 hover:bg-purple-600 text-white">
          {saving ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer l'événement"}
        </Button>
      </div>

      <TemplatePreviewModal
        isOpen={previewOpen}
        templateKey={form.template}
        event={form}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
}