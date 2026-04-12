export default function MinimalTemplate({ event, primaryColor, secondaryColor, fontHeading, fontBody, fontImportUrl, children }) {
  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('${fontImportUrl}');
        .font-serif-elegant { font-family: '${fontHeading}', Georgia, serif; }
        .font-sans-clean { font-family: '${fontBody}', system-ui, sans-serif; }
      `}</style>

      {/* Header minimaliste */}
      <div className="text-center py-32 px-6 bg-white border-b border-gray-200">
        <h1 className="font-serif-elegant text-7xl md:text-8xl font-light text-gray-900 mb-2 tracking-tight">
          {event.couple_names}
        </h1>
        <div className="w-16 h-px bg-gray-400 mx-auto mb-6"></div>
        {event.welcome_message && (
          <p className="font-sans-clean text-gray-600 max-w-md mx-auto mb-4">
            {event.welcome_message}
          </p>
        )}
        {event.event_date && (
          <p className="font-sans-clean text-sm text-gray-400 font-light">
            {new Date(event.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}
      </div>

      {/* Contenu avec maxwidth strict */}
      <div className="max-w-2xl mx-auto px-6 py-20 space-y-20">
        {children}
      </div>

      {/* Footer minimal */}
      <footer className="py-12 px-6 border-t border-gray-200 text-center">
        <p className="font-sans-clean text-xs text-gray-400">Fleurs en fête</p>
      </footer>
    </div>
  );
}