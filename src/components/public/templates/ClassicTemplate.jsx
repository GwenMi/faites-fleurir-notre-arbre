export default function ClassicTemplate({ event, primaryColor, secondaryColor, fontHeading, fontBody, fontImportUrl, children }) {
  return (
    <div style={{ fontFamily: fontBody }}>
      <style>{`
        @import url('${fontImportUrl}');
        .font-heading { font-family: '${fontHeading}', serif; }
        .font-body { font-family: '${fontBody}', sans-serif; }
      `}</style>
      
      <div className="flex min-h-screen" style={{ backgroundColor: `${primaryColor}02` }}>
        {/* Bande gauche avec ornements */}
        <div className="w-2 md:w-4 flex flex-col items-center py-16 gap-12" style={{ background: `linear-gradient(180deg, ${primaryColor}08, ${primaryColor}04)`, borderRight: `1px solid ${primaryColor}20` }}>
          <div className="text-3xl" style={{ opacity: 0.15 }}>✦</div>
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ opacity: 0.15 }}>
                <div className="text-2xl">❖</div>
              </div>
            ))}
          </div>
          <div className="text-3xl" style={{ opacity: 0.15 }}>✦</div>
        </div>
        
        <div className="flex-1 max-w-5xl mx-auto px-6 md:px-12 py-16">
          {/* Header */}
          <header className="text-center mb-16 pb-12" style={{ borderBottomWidth: '3px', borderBottomStyle: 'solid', borderBottomColor: `${primaryColor}30` }}>
            <div className="mb-3 text-2xl" style={{ opacity: 0.15 }}>✤</div>
            <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4 tracking-wide" style={{ color: primaryColor, letterSpacing: '0.02em' }}>
              {event?.couple_names || "Votre événement"}
            </h1>
            <div className="mb-4 text-2xl" style={{ opacity: 0.15 }}>✤</div>
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

        {/* Bande droite avec ornements */}
        <div className="w-2 md:w-4 flex flex-col items-center py-16 gap-12" style={{ background: `linear-gradient(180deg, ${primaryColor}08, ${primaryColor}04)`, borderLeft: `1px solid ${primaryColor}20` }}>
          <div className="text-3xl" style={{ opacity: 0.15 }}>✦</div>
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ opacity: 0.15 }}>
                <div className="text-2xl">❖</div>
              </div>
            ))}
          </div>
          <div className="text-3xl" style={{ opacity: 0.15 }}>✦</div>
        </div>
      </div>
    </div>
  );
}