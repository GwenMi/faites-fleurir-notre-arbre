export default function FestiveTemplate({ event, primaryColor, secondaryColor, fontHeading, fontBody, fontImportUrl, children }) {
  return (
    <div style={{ fontFamily: fontBody }}>
      <style>{`
        @import url('${fontImportUrl}');
        .font-heading { font-family: '${fontHeading}', serif; }
        .font-body { font-family: '${fontBody}', sans-serif; }
      `}</style>
      
      <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${primaryColor}12, ${secondaryColor}12)` }}>
        <div className="max-w-5xl mx-auto px-8 md:px-16 py-20">
          {/* Header festif vibrant */}
          <header className="text-center mb-20 pb-12">
            <div className="mb-12 flex justify-center gap-6 text-5xl flex-wrap">
              <span>🎉</span>
              <span>✨</span>
              <span>🎊</span>
              <span>✨</span>
              <span>🎉</span>
            </div>
            <h1 className="font-heading text-6xl md:text-7xl font-bold mb-6" style={{ color: primaryColor }}>
              {event?.couple_names || "Votre événement"}
            </h1>
            {event?.event_name && (
              <p className="font-body text-xl text-gray-700 mb-8">{event.event_name}</p>
            )}
            {event?.event_date && (
              <p className="font-body text-sm font-bold" style={{ color: secondaryColor }}>
                {new Date(event.event_date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
          </header>

          {/* Contenu */}
          <main className="space-y-20">
            {children}
          </main>

          {/* Footer festif */}
          <footer className="mt-28 pt-12 text-center">
            <div className="mb-8 flex justify-center gap-4 text-4xl">
              <span>🎊</span>
              <span>🎈</span>
              <span>🎊</span>
            </div>
            <p className="font-body text-gray-700 font-semibold">Un moment de fête inoubliable</p>
          </footer>
        </div>
      </div>
    </div>
  );
}