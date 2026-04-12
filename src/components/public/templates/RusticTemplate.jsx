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
        <div className="w-1 md:w-3 flex flex-col" style={{ backgroundColor: primaryColor, opacity: 0.12 }}>
          <div className="flex-1 flex flex-col gap-3 py-8 px-0.5">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-full h-1" style={{ backgroundColor: primaryColor, opacity: 0.3 }} />
            ))}
          </div>
        </div>
        
        <div className="flex-1 max-w-5xl mx-auto px-6 md:px-12 py-16">
          {/* Header avec décoration */}
          <header className="text-center mb-16 pb-12 border-b-4 border-double" style={{ borderColor: primaryColor }}>
            <div className="mb-4 text-3xl">🌿</div>
            <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4" style={{ color: primaryColor }}>
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
          <footer className="mt-20 pt-12 border-t-4 border-double text-center text-gray-700 text-sm" style={{ borderColor: primaryColor }}>
            <p className="mb-2">🌻</p>
            <p>Avec gratitude et tendresse</p>
          </footer>
        </div>

        {/* Bande droite rustique */}
        <div className="w-1 md:w-3 flex flex-col" style={{ backgroundColor: primaryColor, opacity: 0.12 }}>
          <div className="flex-1 flex flex-col gap-3 py-8 px-0.5">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-full h-1" style={{ backgroundColor: primaryColor, opacity: 0.3 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}