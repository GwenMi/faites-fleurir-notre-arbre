export default function RusticTemplate({ event, primaryColor, secondaryColor, fontHeading, fontBody, fontImportUrl, children }) {
  return (
    <div className="min-h-screen bg-amber-50">
      <style>{`
        @import url('${fontImportUrl}');
        .font-serif-elegant { font-family: '${fontHeading}', Georgia, serif; }
        .font-sans-clean { font-family: '${fontBody}', system-ui, sans-serif; }
        .floral-divider { 
          background: radial-gradient(circle, ${primaryColor}30 20%, transparent 20%);
          background-size: 20px 20px;
          height: 40px;
        }
      `}</style>

      {/* Hero champêtre */}
      <div className="relative text-center py-24 px-6 overflow-hidden border-b-8" style={{ borderColor: primaryColor }}>
        {event.cover_image && (
          <div className="absolute inset-0 z-0">
            <img src={event.cover_image} className="w-full h-full object-cover opacity-30 grayscale" alt="" />
            <div className="absolute inset-0 bg-amber-50/80" />
          </div>
        )}
        <div className="relative z-10">
          <div className="mb-6">
            <span className="text-6xl">🌾</span>
          </div>
          <h1 className="font-serif-elegant text-6xl md:text-8xl font-bold mb-2" style={{ color: primaryColor }}>
            {event.couple_names}
          </h1>
          <div className="w-24 h-1 mx-auto mb-6" style={{ background: primaryColor }}></div>
          {event.welcome_message && (
            <p className="font-sans-clean text-gray-700 text-lg max-w-lg mx-auto leading-relaxed mb-4">
              {event.welcome_message}
            </p>
          )}
          {event.event_date && (
            <p className="font-sans-clean text-sm text-gray-500 italic">
              {new Date(event.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
        </div>
      </div>

      <div className="floral-divider"></div>

      {/* Contenu */}
      <div className="space-y-16 py-16">
        {children}
      </div>

      <div className="floral-divider"></div>

      {/* Footer */}
      <footer className="py-12 px-4 text-center" style={{ background: primaryColor + "15" }}>
        <p className="font-sans-clean text-xs text-gray-600 mb-2">Merci de votre présence</p>
        <p className="font-sans-clean text-xs text-gray-400">Créé avec Fleurs en fête 🌸</p>
      </footer>
    </div>
  );
}