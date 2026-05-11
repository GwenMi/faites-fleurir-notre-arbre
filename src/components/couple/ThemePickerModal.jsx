import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Loader2, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import ClassicTemplate from "@/components/public/templates/ClassicTemplate";
import RusticTemplate from "@/components/public/templates/RusticTemplate";
import MinimalTemplate from "@/components/public/templates/MinimalTemplate";
import ElegantTemplate from "@/components/public/templates/ElegantTemplate";
import FestiveTemplate from "@/components/public/templates/FestiveTemplate";

const TEMPLATES = [
  { key: "classique",  label: "Classique",    emoji: "💍", Component: ClassicTemplate,  thumbnail: ({ primary, secondary }) => (
    <div className="w-full h-full relative overflow-hidden rounded-lg" style={{ background: "#FEFCF5" }}>
      <div className="absolute inset-x-0 top-0 h-2/3 flex flex-col items-center justify-center px-2">
        <div className="w-8 h-px mb-1" style={{ background: primary + "66" }} />
        <div className="text-[9px] font-bold text-center" style={{ color: "#2c2c2c", fontFamily: "Georgia" }}>Sophie & Thomas</div>
        <div className="w-full h-px mb-1 mt-1" style={{ background: `linear-gradient(90deg, transparent, ${primary}88, transparent)` }} />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1/3 flex items-center justify-center gap-1 px-2">
        <div className="h-4 flex-1 rounded" style={{ background: primary }} />
        <div className="h-4 flex-1 rounded" style={{ background: secondary + "66" }} />
      </div>
    </div>
  )},
  { key: "champetre",  label: "Champêtre",   emoji: "🌿", Component: RusticTemplate,   thumbnail: ({ primary }) => (
    <div className="w-full h-full relative overflow-hidden rounded-lg" style={{ background: "#F5F0E8" }}>
      <div className="absolute top-1 left-1 text-[12px]">🌿</div>
      <div className="absolute top-1 right-1 text-[12px]">🌿</div>
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center px-2">
        <div className="w-10 h-px mb-1" style={{ background: primary }} />
        <div className="text-[8px] font-bold text-center" style={{ color: primary }}>Sophie & Thomas</div>
        <div className="text-[6px] mt-0.5" style={{ color: "#8B7355" }}>24 juin 2025</div>
        <div className="w-10 h-px mt-1" style={{ background: primary }} />
      </div>
      <div className="absolute bottom-2 left-0 right-0 text-center text-[10px]">🌿</div>
    </div>
  )},
  { key: "minimal",    label: "Minimaliste", emoji: "⬜", Component: MinimalTemplate,  thumbnail: () => (
    <div className="w-full h-full relative overflow-hidden rounded-lg" style={{ background: "#fff" }}>
      <div className="absolute inset-0 flex flex-col">
        <div className="flex-1 relative" style={{ background: "#1a1a1a" }}>
          <div className="absolute inset-0 flex flex-col justify-end p-2">
            <div className="text-[9px] font-light text-white">Sophie & Thomas</div>
            <div className="text-[6px] text-white/50 uppercase tracking-widest">24 JUIN 2025</div>
          </div>
        </div>
        <div className="flex-none px-2 py-1 flex gap-1">
          <div className="text-[5px] text-gray-300 uppercase tracking-widest">Défiler ↓</div>
        </div>
      </div>
    </div>
  )},
  { key: "elegant",    label: "Élégant",     emoji: "✨", Component: ElegantTemplate,  thumbnail: () => (
    <div className="w-full h-full relative overflow-hidden rounded-lg" style={{ background: "#1A1A2E" }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-2">
        <div className="w-8 h-px mb-1.5" style={{ background: "#C9A96E66" }} />
        <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: "#C9A96E", opacity: 0.7 }}>Mariage</div>
        <div className="text-[9px] italic font-bold text-center" style={{ color: "#C9A96E", fontFamily: "Georgia" }}>Sophie & Thomas</div>
        <div className="text-[5px] mt-1 uppercase tracking-widest" style={{ color: "rgba(255,255,255,.3)" }}>24 JUIN 2025</div>
        <div className="w-8 h-px mt-1.5" style={{ background: "#C9A96E66" }} />
      </div>
    </div>
  )},
  { key: "festif",     label: "Festif",      emoji: "🎉", Component: FestiveTemplate,  thumbnail: ({ primary, secondary }) => (
    <div className="w-full h-full relative overflow-hidden rounded-lg" style={{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)` }}>
      <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle, rgba(255,255,255,.25) 1px, transparent 1px)`, backgroundSize: "10px 10px" }} />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-2">
        <div className="text-[8px] font-bold text-white text-center mb-0.5">Sophie & Thomas</div>
        <div className="text-[10px] mt-1">🎉✨</div>
      </div>
    </div>
  )},
];

export default function ThemePickerModal({ isOpen, event, onClose, onSaved }) {
  const [selectedKey, setSelectedKey] = useState(event?.template || "classique");
  const [saving, setSaving] = useState(false);

  const selectedTemplate = TEMPLATES.find(t => t.key === selectedKey) || TEMPLATES[0];
  const PreviewComponent = selectedTemplate.Component;

  const primaryColor = event?.primary_color || "#f43f5e";
  const secondaryColor = event?.secondary_color || "#86efac";
  const fontHeading = event?.font_heading || "Cormorant Garamond";
  const fontBody = event?.font_body || "Lato";
  const fontImportUrl = `https://fonts.googleapis.com/css2?family=${fontHeading.replace(/ /g, "+")}:wght@400;600;700&family=${fontBody.replace(/ /g, "+")}:wght@300;400;700&display=swap`;

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Event.update(event.id, { template: selectedKey });
    setSaving(false);
    toast.success(`Template "${selectedTemplate.label}" appliqué ! 🎨`);
    onSaved(selectedKey);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="p-0 max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Choisir un template</h2>
            <p className="text-xs text-gray-400 mt-0.5">Cliquez sur un template pour prévisualiser, puis validez votre choix</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left: template thumbnails */}
          <div className="w-48 flex-shrink-0 border-r bg-gray-50 overflow-y-auto p-3 space-y-2">
            {TEMPLATES.map(tpl => {
              const isActive = selectedKey === tpl.key;
              const Thumb = tpl.thumbnail;
              return (
                <button
                  key={tpl.key}
                  onClick={() => setSelectedKey(tpl.key)}
                  className={`w-full text-left rounded-xl border-2 overflow-hidden transition-all ${
                    isActive ? "border-rose-400 shadow-md ring-2 ring-rose-100" : "border-gray-200 hover:border-rose-300"
                  }`}
                >
                  <div className="relative" style={{ aspectRatio: "3/4" }}>
                    <Thumb primary={primaryColor} secondary={secondaryColor} />
                    {isActive && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-rose-400 rounded-full flex items-center justify-center shadow">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="px-2 py-1.5 bg-white">
                    <p className="text-[11px] font-semibold text-gray-700">{tpl.emoji} {tpl.label}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: live preview */}
          <div className="flex-1 overflow-y-auto bg-gray-100">
            <style>{`@import url('${fontImportUrl}');`}</style>
            <PreviewComponent
              event={event}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              fontHeading={fontHeading}
              fontBody={fontBody}
              fontImportUrl={fontImportUrl}
            >
              <div className="w-full space-y-16">
                <section className="max-w-2xl mx-auto px-4">
                  <h2 className="text-3xl font-bold mb-4" style={{ color: primaryColor }}>Bienvenue</h2>
                  <p className="text-gray-600 leading-relaxed">{event?.welcome_message || "Soyez les bienvenus à notre célébration. Un moment de joie et de partage à vos côtés."}</p>
                </section>
                <section className="max-w-2xl mx-auto px-4">
                  <h2 className="text-3xl font-bold mb-6" style={{ color: primaryColor }}>📅 Programme</h2>
                  <div className="space-y-4">
                    {[{ time: "11:30", title: "Cérémonie", desc: "Le moment tant attendu" }, { time: "12:30", title: "Apéritif", desc: "Champagne et amuse-bouches" }, { time: "14:00", title: "Repas", desc: "Dégustation 3 plats" }, { time: "20:00", title: "Danse", desc: "Musique et célébration" }].map((item, i) => (
                      <div key={i} className="flex gap-4 pb-4 border-b border-gray-100">
                        <div className="font-bold min-w-14" style={{ color: primaryColor }}>{item.time}</div>
                        <div><h3 className="font-semibold text-gray-800">{item.title}</h3><p className="text-sm text-gray-600">{item.desc}</p></div>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="max-w-2xl mx-auto px-4">
                  <h2 className="text-3xl font-bold mb-6" style={{ color: primaryColor }}>📸 Galerie</h2>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-gray-200 to-gray-300" />)}
                  </div>
                </section>
                <section className="max-w-2xl mx-auto px-4">
                  <h2 className="text-3xl font-bold mb-6" style={{ color: primaryColor }}>✉️ RSVP</h2>
                  <button style={{ backgroundColor: primaryColor }} className="w-full py-4 text-white font-semibold rounded-lg hover:opacity-90">
                    Je confirme ma présence
                  </button>
                </section>
                <section className="max-w-2xl mx-auto px-4">
                  <h2 className="text-3xl font-bold mb-6" style={{ color: primaryColor }}>📝 Livre d'or</h2>
                  <div className="space-y-4">
                    {[{ name: "Marie", msg: "Un magnifique jour, merci !" }, { name: "Jean", msg: "Bravo à vous deux !" }].map((item, i) => (
                      <div key={i} className="p-4 rounded-lg" style={{ backgroundColor: `${primaryColor}08`, borderLeft: `3px solid ${primaryColor}` }}>
                        <p className="font-semibold text-gray-800 mb-1">{item.name}</p>
                        <p className="text-sm text-gray-600 italic">"{item.msg}"</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </PreviewComponent>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-white flex-shrink-0">
          <p className="text-sm text-gray-500">
            Template sélectionné : <span className="font-semibold text-gray-800">{selectedTemplate.emoji} {selectedTemplate.label}</span>
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="rounded-xl">
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white px-6"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              Appliquer ce template
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}