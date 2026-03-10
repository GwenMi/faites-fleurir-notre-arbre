import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Save, Loader2, Palette, Type, ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";

const PRESET_THEMES = [
  { key: "classique",  label: "Classique",     primary: "#f43f5e", secondary: "#86efac", font_heading: "Cormorant Garamond", font_body: "Lato",       emoji: "💍" },
  { key: "champetre",  label: "Champêtre",      primary: "#65a30d", secondary: "#fbbf24", font_heading: "Playfair Display",   font_body: "Raleway",    emoji: "🌿" },
  { key: "elegant",   label: "Élégant",         primary: "#6366f1", secondary: "#c7d2fe", font_heading: "EB Garamond",        font_body: "Montserrat", emoji: "✨" },
  { key: "boheme",    label: "Bohème",           primary: "#d97706", secondary: "#fde68a", font_heading: "Great Vibes",        font_body: "Lato",       emoji: "🌙" },
  { key: "moderne",   label: "Moderne",          primary: "#0f172a", secondary: "#94a3b8", font_heading: "Josefin Sans",       font_body: "Raleway",    emoji: "◼️" },
  { key: "floral",    label: "Floral",           primary: "#db2777", secondary: "#fbcfe8", font_heading: "Dancing Script",     font_body: "Lato",       emoji: "🌸" },
  { key: "minimal",   label: "Minimaliste",      primary: "#374151", secondary: "#e5e7eb", font_heading: "Montserrat",         font_body: "Montserrat", emoji: "⬜" },
  { key: "douceur",   label: "Douceur",          primary: "#c084fc", secondary: "#fda4af", font_heading: "Cormorant Garamond", font_body: "Raleway",    emoji: "🩷" },
  { key: "nature",    label: "Nature",            primary: "#059669", secondary: "#a7f3d0", font_heading: "Playfair Display",   font_body: "Lato",       emoji: "🍃" },
  { key: "festif",    label: "Festif",            primary: "#f59e0b", secondary: "#fde68a", font_heading: "Dancing Script",     font_body: "Montserrat", emoji: "🎉" },
];

const HEADING_FONTS = [
  "Cormorant Garamond", "Playfair Display", "EB Garamond",
  "Great Vibes", "Dancing Script", "Josefin Sans", "Montserrat", "Raleway",
];

const BODY_FONTS = ["Lato", "Raleway", "Montserrat", "Josefin Sans", "EB Garamond"];

const GOOGLE_FONTS_URL = (fonts) =>
  `https://fonts.googleapis.com/css2?${fonts.map(f => `family=${f.replace(/ /g, "+")}:wght@300;400;600;700`).join("&")}&display=swap`;

export default function ThemeEditor({ event }) {
  const [theme, setTheme] = useState({
    primary_color: event.primary_color || "#f43f5e",
    secondary_color: event.secondary_color || "#86efac",
    font_heading: event.font_heading || "Cormorant Garamond",
    font_body: event.font_body || "Lato",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const allFonts = [...new Set([...HEADING_FONTS, ...BODY_FONTS])];
  const fontsUrl = GOOGLE_FONTS_URL(allFonts);

  const applyPreset = (preset) => {
    setTheme({
      primary_color: preset.primary,
      secondary_color: preset.secondary,
      font_heading: preset.font_heading,
      font_body: preset.font_body,
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Event.update(event.id, theme);
    setSaving(false);
    setSaved(true);
    toast.success("Thème enregistré ! Votre site public est mis à jour. 🎨");
  };

  const isCurrentPreset = (preset) =>
    theme.primary_color === preset.primary &&
    theme.secondary_color === preset.secondary &&
    theme.font_heading === preset.font_heading &&
    theme.font_body === preset.font_body;

  return (
    <div className="space-y-6">
      <style>{`@import url('${fontsUrl}');`}</style>

      {/* Preset grid */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Palette className="w-4 h-4 text-rose-400" /> Thèmes prédéfinis
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {PRESET_THEMES.map(preset => (
            <button
              key={preset.key}
              onClick={() => applyPreset(preset)}
              className={`relative rounded-2xl border-2 p-3 text-left transition hover:scale-105 ${
                isCurrentPreset(preset) ? "border-rose-400 shadow-md" : "border-transparent hover:border-gray-200"
              }`}
              style={{ background: `linear-gradient(135deg, ${preset.primary}22, ${preset.secondary}33)` }}
            >
              {isCurrentPreset(preset) && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-400 rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </span>
              )}
              {/* Color swatches */}
              <div className="flex gap-1 mb-2">
                <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ background: preset.primary }} />
                <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ background: preset.secondary }} />
              </div>
              <p className="text-xs font-semibold text-gray-700">{preset.emoji} {preset.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 truncate" style={{ fontFamily: preset.font_heading }}>
                {preset.font_heading.split(" ")[0]}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Fine-tune */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Colors */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-4">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Palette className="w-4 h-4" /> Couleurs personnalisées
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme.primary_color}
                onChange={e => { setTheme(t => ({ ...t, primary_color: e.target.value })); setSaved(false); }}
                className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5 bg-white"
              />
              <div>
                <p className="text-xs font-semibold text-gray-600">Couleur principale</p>
                <p className="text-xs text-gray-400">{theme.primary_color}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme.secondary_color}
                onChange={e => { setTheme(t => ({ ...t, secondary_color: e.target.value })); setSaved(false); }}
                className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5 bg-white"
              />
              <div>
                <p className="text-xs font-semibold text-gray-600">Couleur secondaire</p>
                <p className="text-xs text-gray-400">{theme.secondary_color}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fonts */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-4">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Type className="w-4 h-4" /> Polices
          </h4>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Police des titres</p>
              <select
                value={theme.font_heading}
                onChange={e => { setTheme(t => ({ ...t, font_heading: e.target.value })); setSaved(false); }}
                className="w-full rounded-xl border border-input px-3 py-2 text-sm bg-white"
              >
                {HEADING_FONTS.map(f => (
                  <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                ))}
              </select>
              <p className="mt-1.5 text-base text-gray-700 truncate" style={{ fontFamily: theme.font_heading }}>
                Sophie & Thomas
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Police du texte</p>
              <select
                value={theme.font_body}
                onChange={e => { setTheme(t => ({ ...t, font_body: e.target.value })); setSaved(false); }}
                className="w-full rounded-xl border border-input px-3 py-2 text-sm bg-white"
              >
                {BODY_FONTS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-gray-500 truncate" style={{ fontFamily: theme.font_body }}>
                Nous serions heureux de vous accueillir
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="rounded-2xl overflow-hidden border-2 border-dashed border-gray-200">
        <div className="bg-gray-100 px-4 py-2 flex items-center gap-2 text-xs text-gray-400">
          <ExternalLink className="w-3 h-3" /> Aperçu de votre site public
        </div>
        <div
          className="relative py-10 px-6 text-center"
          style={{ background: `linear-gradient(160deg, ${theme.primary_color}15 0%, #fff 60%, ${theme.secondary_color}15 100%)` }}
        >
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: theme.primary_color, fontFamily: theme.font_body }}>
            Mariage
          </p>
          <h1 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: theme.font_heading }}>
            {event.couple_names}
          </h1>
          <div className="h-px max-w-xs mx-auto mb-4" style={{ background: `linear-gradient(90deg, transparent, ${theme.primary_color}88, transparent)` }} />
          <p className="text-sm text-gray-500" style={{ fontFamily: theme.font_body }}>
            {event.welcome_message || "Bienvenue sur notre page de mariage ✨"}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <div className="px-5 py-2 rounded-full text-white text-sm font-semibold" style={{ background: theme.primary_color, fontFamily: theme.font_body }}>
              Confirmer ma présence
            </div>
            <div className="px-5 py-2 rounded-full text-sm border" style={{ borderColor: theme.secondary_color, color: theme.primary_color, background: theme.secondary_color + "33", fontFamily: theme.font_body }}>
              Programme
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl h-10 text-white"
          style={{ background: theme.primary_color }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {saved ? "Enregistré ✓" : "Sauvegarder le thème"}
        </Button>
        {event.public_url && (
          <a href={event.public_url} target="_blank" rel="noreferrer"
            className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition">
            <ExternalLink className="w-3.5 h-3.5" /> Voir mon site
          </a>
        )}
      </div>
    </div>
  );
}