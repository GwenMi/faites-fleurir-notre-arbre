import { TEMPLATES } from "@/components/public/TemplateConfig";

export default function TemplatePreview({ templateKey, coupleName, eventType }) {
  const tpl = TEMPLATES[templateKey];
  if (!tpl) return null;

  const isDark = /^(0[0-2]|[1-5][0-9]|6[0-3])$/.test(
    Math.round((parseInt(tpl.primaryColor.slice(1), 16) * 299 + parseInt(tpl.primaryColor.slice(3, 5), 16) * 587 + parseInt(tpl.primaryColor.slice(5), 16) * 114) / 1000).toString()
  );

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-white">
      {/* Header avec couleur primaire */}
      <div style={{ backgroundColor: tpl.primaryColor }} className="p-8 text-center text-white">
        <p className="text-sm tracking-widest uppercase opacity-80 mb-3">Aperçu du thème</p>
        <div className="text-5xl mb-4">{tpl.emoji}</div>
        <h1 className="font-serif-elegant text-4xl font-bold mb-2">{coupleName || "Votre événement"}</h1>
        <p className="text-sm opacity-90">Créé avec le thème <strong>{tpl.name}</strong></p>
      </div>

      {/* Contenu principal */}
      <div className="p-8 space-y-6">
        {/* Section titre */}
        <div className="text-center space-y-3">
          <h2 className="font-serif-elegant text-3xl font-bold" style={{ color: tpl.primaryColor }}>
            Bienvenue
          </h2>
          <div className="w-16 h-1 mx-auto" style={{ backgroundColor: tpl.secondaryColor }}></div>
          <p className="text-gray-600 text-sm leading-relaxed max-w-md mx-auto">
            Un message de bienvenue pour vos invités, avec toute l'émotion du moment.
          </p>
        </div>

        {/* Boutons exemple */}
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            style={{ backgroundColor: tpl.primaryColor }}
            className="px-6 py-3 text-white rounded-full text-sm font-semibold transition-transform hover:scale-105"
          >
            RSVP
          </button>
          <button
            style={{ backgroundColor: tpl.secondaryColor, color: isDark ? "#fff" : "#000" }}
            className="px-6 py-3 rounded-full text-sm font-semibold transition-transform hover:scale-105"
          >
            Galerie Photos
          </button>
        </div>

        {/* Sections exemple */}
        <div className="space-y-4 mt-8 pt-8 border-t border-gray-100">
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <span className="text-xl">📅</span> Programme de la journée
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm text-gray-600">
              <div>10:00 - Cérémonie</div>
              <div>12:30 - Apéritif</div>
              <div>14:00 - Repas</div>
              <div>20:00 - Première danse</div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <span className="text-xl">📸</span> Album photos
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="aspect-square rounded-lg"
                  style={{ backgroundColor: tpl.secondaryColor, opacity: 0.3 }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <span className="text-xl">💝</span> Liste de cadeaux
            </h3>
            <p className="text-sm text-gray-600">Partagez vos envies avec vos proches</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="p-4 text-center text-white text-xs opacity-90"
        style={{ backgroundColor: tpl.primaryColor }}
      >
        Merci de nous avoir accompagnés dans ce beau moment
      </div>
    </div>
  );
}