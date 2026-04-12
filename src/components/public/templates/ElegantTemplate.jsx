export default function ElegantTemplate({ event, primaryColor, secondaryColor, fontHeading, fontBody, fontImportUrl, children }) {
  return (
    <div style={{ fontFamily: fontBody }}>
      <style>{`
        @import url('${fontImportUrl}');
        .font-heading { font-family: '${fontHeading}', serif; }
        .font-body { font-family: '${fontBody}', sans-serif; }
      `}</style>
      
      <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${primaryColor}06 0%, white 40%, ${secondaryColor}06 100%)` }}>
        <div className="max-w-5xl mx-auto px-8 md:px-16 py-24">
          {/* Header élégant avec ornements */}
          <header className="text-center mb-24 pb-12" style={{ borderBottom: `1px solid ${primaryColor}30` }}>
            <div className="mb-8 text-2xl" style={{ color: primaryColor, opacity: 0.25 }}>◆ ✦ ◆</div>
            <h1 className="font-heading text-6xl md:text-7xl font-bold mb-6" style={{ color: primaryColor, fontStyle: 'italic' }}>
              {event?.couple_names || "Votre événement"}
            </h1>
            {event?.event_name && (
              <p className="font-body text-lg text-gray-700 mb-8">{event.event_name}</p>
            )}
            {event?.event_date && (
              <p className="font-body text-sm text-gray-600 font-light">{new Date(event.event_date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            )}
          </header>

          {/* Contenu */}
          <main className="space-y-20">
            {children}
          </main>

          {/* Footer élégant */}
          <footer className="mt-28 pt-12" style={{ borderTop: `1px solid ${primaryColor}30` }}>
            <div className="text-center">
              <div className="mb-6 text-2xl" style={{ color: secondaryColor, opacity: 0.25 }}>◆ ✦ ◆</div>
              <p className="font-body text-gray-700 text-sm font-light">Merci de votre présence</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}