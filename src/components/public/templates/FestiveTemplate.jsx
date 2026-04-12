export default function FestiveTemplate({ event, primaryColor, secondaryColor, fontHeading, fontBody, fontImportUrl, children }) {
  return (
    <div style={{ fontFamily: fontBody }}>
      <style>{`
        @import url('${fontImportUrl}');
        .font-heading { font-family: '${fontHeading}', serif; }
        .font-body { font-family: '${fontBody}', sans-serif; }
      `}</style>
      
      <div className="flex min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-50">
        {/* Bande gauche festive avec carrés colorés */}
        <div className="w-2 md:w-4 flex flex-col gap-2 p-2" style={{ backgroundColor: primaryColor, opacity: 0.05 }}>
          {[...Array(15)].map((_, i) => (
            <div key={i} className="w-full h-3 rounded" style={{
              backgroundColor: i % 2 === 0 ? primaryColor : secondaryColor,
              opacity: 0.4
            }} />
          ))}
        </div>
        
        <div className="flex-1 max-w-5xl mx-auto px-6 md:px-12 py-16">
          {/* Header festif */}
          <header className="text-center mb-16 pb-12">
            <div className="mb-6 flex justify-center gap-3">
              <span className="text-3xl">✨</span>
              <span className="text-3xl">🎉</span>
              <span className="text-3xl">✨</span>
            </div>
            <h1 className="font-heading text-6xl md:text-7xl font-bold mb-4" style={{ color: primaryColor }}>
              {event?.couple_names || "Votre événement"}
            </h1>
            {event?.event_name && (
              <p className="font-body text-lg text-gray-700 mb-4">{event.event_name}</p>
            )}
            {event?.event_date && (
              <p className="font-body text-sm font-bold" style={{ color: secondaryColor }}>
                {new Date(event.event_date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
          </header>

          {/* Contenu */}
          <main className="space-y-16">
            {children}
          </main>

          {/* Footer */}
          <footer className="mt-20 pt-12 text-center">
            <div className="flex justify-center gap-2 mb-4">
              <span className="text-2xl">🎊</span>
              <span className="text-2xl">🎈</span>
              <span className="text-2xl">🎊</span>
            </div>
            <p className="font-body text-sm font-bold" style={{ color: primaryColor }}>Préparez-vous pour une belle fête !</p>
          </footer>
        </div>

        {/* Bande droite festive */}
        <div className="w-2 md:w-4 flex flex-col gap-2 p-2" style={{ backgroundColor: primaryColor, opacity: 0.05 }}>
          {[...Array(15)].map((_, i) => (
            <div key={i} className="w-full h-3 rounded" style={{
              backgroundColor: i % 2 === 0 ? primaryColor : secondaryColor,
              opacity: 0.4
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}