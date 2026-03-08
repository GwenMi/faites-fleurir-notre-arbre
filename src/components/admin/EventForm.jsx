import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TEMPLATES, getTemplatesForEventType, EVENT_TYPE_LABELS } from "@/components/public/TemplateConfig";
import { toast } from "sonner";
import { Camera, X } from "lucide-react";

function generateSlug(coupleNames) {
  return coupleNames
    .toLowerCase()
    .replace(/[&+]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[éèê]/g, "e").replace(/[àâ]/g, "a").replace(/[îï]/g, "i")
    .replace(/[ôö]/g, "o").replace(/[ùûü]/g, "u").replace(/ç/g, "c")
    .replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export default function EventForm({ event, onSave, onCancel }) {
  const isEdit = !!event;
  const [form, setForm] = useState(event || {
    couple_names: "", event_name: "", event_type: "mariage", event_date: "",
    welcome_message: "", seed_type: "", template: "classique",
    primary_color: "#c084fc", secondary_color: "#86efac", plan: "basic",
    cover_image: "", status: "active",
  });

  const availableTemplates = getTemplatesForEventType(form.event_type);
  const freeTemplates = availableTemplates.filter(([, v]) => v.plan === "basic");
  const premiumTemplates = availableTemplates.filter(([, v]) => v.plan === "premium");

  const handleEventTypeChange = (v) => {
    const newTemplates = getTemplatesForEventType(v);
    const firstFree = newTemplates.find(([, t]) => t.plan === "basic");
    const defaultTpl = firstFree ? firstFree[0] : newTemplates[0]?.[0] || "classique";
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

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCover = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.couple_names || !form.event_date) {
      toast.error("Merci de renseigner les prénoms et la date");
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
          <Label>Prénoms des mariés *</Label>
          <Input placeholder="Emma & Lucas" value={form.couple_names} onChange={(e) => set("couple_names", e.target.value)} className="rounded-xl h-11" />
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
        <div className="space-y-1">
          <Label>Date *</Label>
          <Input type="date" value={form.event_date} onChange={(e) => set("event_date", e.target.value)} className="rounded-xl h-11" />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Message de bienvenue</Label>
        <Textarea placeholder="Un message chaleureux pour vos invités..." value={form.welcome_message}
          onChange={(e) => set("welcome_message", e.target.value)} className="rounded-xl" rows={3} />
      </div>

      <div className="space-y-1">
        <Label>Type de graine offerte</Label>
        <Input placeholder="Ex: Tournesol, Lavande, Marguerite..." value={form.seed_type}
          onChange={(e) => set("seed_type", e.target.value)} className="rounded-xl h-11" />
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

      {/* Template */}
      <div className="space-y-2">
        <Label>Template</Label>
        <div className="grid grid-cols-3 gap-2">
          {FREE_TEMPLATES.map(([key, tpl]) => (
            <button key={key} type="button" onClick={() => set("template", key)}
              className={`p-3 rounded-xl border-2 text-center text-sm font-medium transition ${form.template === key ? "border-purple-400 bg-purple-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
              {tpl.name}
              <span className="block text-xs text-green-500 mt-0.5">Gratuit</span>
            </button>
          ))}
          {PREMIUM_TEMPLATES.map(([key, tpl]) => (
            <button key={key} type="button" onClick={() => { set("template", key); set("plan", "premium"); }}
              className={`p-3 rounded-xl border-2 text-center text-sm font-medium transition ${form.template === key ? "border-amber-400 bg-amber-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
              {tpl.name}
              <span className="block text-xs text-amber-500 mt-0.5">⭐ Premium</span>
            </button>
          ))}
        </div>
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

      {/* Plan */}
      <div className="space-y-2">
        <Label>Plan</Label>
        <div className="grid grid-cols-2 gap-3">
          {[{ key: "basic", label: "Basic", desc: "Gratuit", color: "green" }, { key: "premium", label: "Premium", desc: "19 €", color: "amber" }].map(p => (
            <button key={p.key} type="button" onClick={() => set("plan", p.key)}
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
    </div>
  );
}