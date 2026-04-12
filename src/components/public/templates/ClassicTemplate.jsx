export default function ClassicTemplate({ event, primaryColor, secondaryColor, fontHeading, fontBody, fontImportUrl, children }) {
  return (
    <div style={{ fontFamily: fontBody }}>
      <style>{`
        @import url('${fontImportUrl}');
        .font-heading { font-family: '${fontHeading}', serif; }
        .font-body { font-family: '${fontBody}', sans-serif; }
      `}</style>
      
      <div className="flex min-h-screen bg-white">
        {/* Bande gauche élégante */}
        <div className="hidden md:flex w-1 flex-col" style={{ background: `linear-gradient(180deg, ${primaryColor}15, transparent)` }} />
        
        <div className="flex-1 max-w-5xl mx-auto px-8 md:px-16 py-20">
          {/* Header classique */}
          <header className="text-center mb-20 pb-16" style={{ borderBottom: `2px solid ${primaryColor}25` }}>
            <h1 className="font-heading text-6xl md:text-7xl font-bold mb-6 tracking-tight" style={{ color: primaryColor }}>
              {event?.couple_names || "Votre événement"}
            </h1>
            {event?.event_name && (
              <p className="font-body text-xl text-gray-700 mb-6 font-light">{event.event_name}</p>
            )}
            {event?.event_date && (
              <p className="font-body text-sm text-gray-600 tracking-widest uppercase">{new Date(event.event_date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            )}
          </header>

          {/* Contenu */}
          <main className="space-y-20">
            {children}
          </main>

          {/* Footer classique */}
          <footer className="mt-28 pt-16" style={{ borderTop: `2px solid ${primaryColor}25` }}>
            <p className="font-body text-center text-gray-600 text-sm">Merci de votre présence</p>
          </footer>
        </div>

        {/* Bande droite */}
        <div className="hidden md:flex w-1 flex-col" style={{ background: `linear-gradient(180deg, transparent, ${primaryColor}15)` }} />
      </div>
    </div>
  );
}