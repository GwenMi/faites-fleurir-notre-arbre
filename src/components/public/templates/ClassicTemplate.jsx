export default function ClassicTemplate({ event, primaryColor, secondaryColor, fontHeading, fontBody, fontImportUrl, children }) {
  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('${fontImportUrl}');
        .font-serif-elegant { font-family: '${fontHeading}', Georgia, serif; }
        .font-sans-clean { font-family: '${fontBody}', system-ui, sans-serif; }
        .gold-line { background: linear-gradient(90deg, transparent, ${primaryColor}88, transparent); height: 1px; }
      `}</style>

      {/* Hero classique */}
      <div className="relative text-center py-20 px-6 overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${primaryColor}15 0%, #fff 60%, ${secondaryColor}15 100%)` }}>
        {event.cover_image && (
          <div className="absolute inset-0 z-0">
            <img src={event.cover_image} className="w-full h-full object-cover opacity-20" alt="" />
            <div className="absolute inset-0 bg-white/60" />
          </div>
        )}
        <div className="relative z-10">
          <p className="font-sans-clean text-xs tracking-[0.3em] uppercase mb-4" style={{ color: primaryColor }}>
            {event.event_type === "mariage" ? "Mariage" :
             event.event_type === "anniversaire" ? "Anniversaire" :
             event.event_type === "bapteme" ? "Baptême" :
             event.event_type === "communion" ? "Communion" :
             event.event_type === "fete_entreprise" ? "Fête d'entreprise" :
             event.event_type === "maison_hote" ? "Maison d'hôte" :
             "Événement"}
          </p>
          <h1 className="font-serif-elegant text-5xl md:text-7xl font-bold text-gray-800 mb-4">
            {event.couple_names}
          </h1>
          <div className="gold-line max-w-xs mx-auto mb-5" />
          {event.welcome_message && (
            <p className="font-sans-clean text-gray-600 text-base max-w-lg mx-auto leading-relaxed font-light mb-4">
              {event.welcome_message}
            </p>
          )}
          {event.event_date && (
            <p className="font-sans-clean text-sm text-gray-400">
              {new Date(event.event_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div className="space-y-12 py-12">
        {children}
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-100 text-center">
        <p className="font-sans-clean text-xs text-gray-300 mb-3">Créé avec Fleurs en fête 🌸</p>
      </footer>
    </div>
  );
}