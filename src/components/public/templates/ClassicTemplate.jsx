export default function ClassicTemplate({ event, primaryColor, secondaryColor, fontHeading, fontBody, fontImportUrl, children }) {
  return (
    <div style={{ fontFamily: fontBody }}>
      <style>{`
        @import url('${fontImportUrl}');
        .font-heading { font-family: '${fontHeading}', serif; }
        .font-body { font-family: '${fontBody}', sans-serif; }
      `}</style>
      
      {/* Layout avec bandes latérales */}
      <div className="flex min-h-screen bg-white">
        {/* Bande gauche dorée/classique */}
        <div style={{ backgroundColor: primaryColor, opacity: 0.08 }} className="w-1 md:w-2" />
        
        <div className="flex-1 max-w-5xl mx-auto px-6 md:px-12 py-16">
          {/* Header */}
          <header className="text-center mb-16 pb-12 border-b border-gray-100">
            <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4" style={{ color: primaryColor }}>
              {event?.couple_names || "Votre événement"}
            </h1>
            {event?.event_name && (
              <p className="font-body text-lg text-gray-600 mb-4">{event.event_name}</p>
            )}
            {event?.event_date && (
              <p className="font-body text-sm text-gray-500">{new Date(event.event_date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            )}
          </header>

          {/* Contenu */}
          <main className="space-y-16">
            {children}
          </main>

          {/* Footer */}
          <footer className="mt-20 pt-12 border-t border-gray-100 text-center text-gray-500 text-sm">
            <p>Merci de votre présence à cet événement</p>
          </footer>
        </div>

        {/* Bande droite dorée/classique */}
        <div style={{ backgroundColor: primaryColor, opacity: 0.08 }} className="w-1 md:w-2" />
      </div>
    </div>
  );
}