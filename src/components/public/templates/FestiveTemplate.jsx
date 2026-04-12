export default function FestiveTemplate({ event, primaryColor, secondaryColor, fontHeading, fontBody, fontImportUrl, children }) {
  return (
    <div style={{ fontFamily: fontBody }}>
      <style>{`
        @import url('${fontImportUrl}');
        .font-heading { font-family: '${fontHeading}', serif; }
        .font-body { font-family: '${fontBody}', sans-serif; }
      `}</style>
      
      <div className="flex min-h-screen" style={{ background: `linear-gradient(135deg, ${primaryColor}10 0%, ${secondaryColor}10 100%)` }}>
        {/* Bande gauche festive */}
        <div className="w-3 md:w-5 flex flex-col gap-4 p-3 items-center" style={{ background: `linear-gradient(180deg, ${primaryColor}15, ${secondaryColor}15)` }}>
          <div className="text-3xl">🎊</div>
          <div className="flex-1 flex flex-col gap-3 justify-center">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex gap-2 justify-center">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor, opacity: 0.5 }} />
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: secondaryColor, opacity: 0.5 }} />
              </div>
            ))}
          </div>
          <div className="text-3xl">🎉</div>
        </div>
        
        <div className="flex-1 max-w-5xl mx-auto px-6 md:px-12 py-16">
          {/* Header festif */}
          <header className="text-center mb-16 pb-12 relative">
            <div className="mb-8 flex justify-center gap-4 text-4xl flex-wrap">
              <span>🎉</span>
              <span>✨</span>
              <span>🎊</span>
              <span>✨</span>
              <span>🎉</span>
            </div>
            <h1 className="font-heading text-6xl md:text-7xl font-bold mb-4" style={{ color: primaryColor, textShadow: `2px 2px 0 ${secondaryColor}20` }}>
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
        <div className="w-3 md:w-5 flex flex-col gap-4 p-3 items-center" style={{ background: `linear-gradient(180deg, ${primaryColor}15, ${secondaryColor}15)` }}>
          <div className="text-3xl">🎊</div>
          <div className="flex-1 flex flex-col gap-3 justify-center">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex gap-2 justify-center">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor, opacity: 0.5 }} />
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: secondaryColor, opacity: 0.5 }} />
              </div>
            ))}
          </div>
          <div className="text-3xl">🎉</div>
        </div>
      </div>
    </div>
  );
}