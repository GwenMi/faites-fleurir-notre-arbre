export default function RusticTemplate({ event, primaryColor, secondaryColor, fontHeading, fontBody, fontImportUrl, children }) {
  return (
    <div style={{ fontFamily: fontBody }}>
      <style>{`
        @import url('${fontImportUrl}');
        .font-heading { font-family: '${fontHeading}', serif; }
        .font-body { font-family: '${fontBody}', sans-serif; }
      `}</style>
      
      <div className="flex min-h-screen bg-amber-50">
        {/* Bande gauche rustique avec motif */}
        <div className="w-2 md:w-4 flex flex-col items-center py-16 gap-4" style={{ background: `linear-gradient(180deg, ${primaryColor}12, ${primaryColor}08)`, borderRight: `2px solid ${primaryColor}25` }}>
          <div className="text-3xl">🌿</div>
          <div className="flex-1 flex flex-col gap-3 py-8 px-1 items-center">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="w-full h-0.5" style={{ backgroundColor: primaryColor, opacity: 0.3 }} />
            ))}
          </div>
          <div className="text-3xl">🌾</div>
        </div>
        
        <div className="flex-1 max-w-5xl mx-auto px-6 md:px-12 py-16">
          {/* Header avec décoration */}
          <header className="text-center mb-16 pb-12 relative">
            <div className="absolute left-0 right-0 -top-8 flex justify-center gap-6 mb-8">
              <span className="text-4xl">🌼</span>
              <span className="text-4xl">🌾</span>
              <span className="text-4xl">🌼</span>
            </div>
            <div className="mt-16 mb-6">
              <div className="text-5xl mb-4">🌿</div>
            </div>
            <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4" style={{ color: primaryColor, fontStyle: 'italic' }}>
              {event?.couple_names || "Votre événement"}
            </h1>
            {event?.event_name && (
              <p className="font-body text-lg text-gray-700 mb-4">{event.event_name}</p>
            )}
            {event?.event_date && (
              <p className="font-body text-sm text-gray-600">{new Date(event.event_date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            )}
          </header>

          {/* Contenu */}
          <main className="space-y-16">
            {children}
          </main>

          {/* Footer */}
          <footer className="mt-20 pt-12 text-center text-gray-700">
            <div className="flex justify-center gap-6 mb-6">
              <span className="text-3xl">🌻</span>
              <span className="text-3xl">🌿</span>
              <span className="text-3xl">🌻</span>
            </div>
            <p className="text-sm italic" style={{ color: primaryColor }}>Avec gratitude et tendresse</p>
            <div className="mt-4 h-px" style={{ background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)` }} />
          </footer>
        </div>

        {/* Bande droite rustique */}
        <div className="w-2 md:w-4 flex flex-col items-center py-16 gap-4" style={{ background: `linear-gradient(180deg, ${primaryColor}12, ${primaryColor}08)`, borderLeft: `2px solid ${primaryColor}25` }}>
          <div className="text-3xl">🌿</div>
          <div className="flex-1 flex flex-col gap-3 py-8 px-1 items-center">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="w-full h-0.5" style={{ backgroundColor: primaryColor, opacity: 0.3 }} />
            ))}
          </div>
          <div className="text-3xl">🌾</div>
        </div>
      </div>
    </div>
  );
}