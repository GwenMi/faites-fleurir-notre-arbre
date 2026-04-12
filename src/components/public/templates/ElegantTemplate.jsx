export default function ElegantTemplate({ event, primaryColor, secondaryColor, fontHeading, fontBody, fontImportUrl, children }) {
  return (
    <div style={{ fontFamily: fontBody }}>
      <style>{`
        @import url('${fontImportUrl}');
        .font-heading { font-family: '${fontHeading}', serif; }
        .font-body { font-family: '${fontBody}', sans-serif; }
      `}</style>
      
      <div className="flex min-h-screen" style={{ background: `linear-gradient(135deg, ${primaryColor}04 0%, white 50%, ${secondaryColor}04 100%)` }}>
        {/* Bande gauche élégante */}
        <div className="w-1 md:w-4" style={{
          background: `linear-gradient(to bottom, ${primaryColor}80, ${secondaryColor}80)`
        }} />
        
        <div className="flex-1 max-w-5xl mx-auto px-6 md:px-12 py-16">
          {/* Header avec encadrement */}
          <header className="text-center mb-16 pb-12">
            <div className="mb-8 text-3xl" style={{ color: primaryColor, opacity: 0.3 }}>❖ ✦ ❖</div>
            <div className="inline-block mb-8">
              <div style={{ borderColor: primaryColor, borderWidth: '3px 0' }} className="py-6 px-12">
                <p className="font-body text-xs text-gray-600 tracking-widest uppercase" style={{ color: primaryColor }}>Vous êtes invité(e) à</p>
              </div>
            </div>
            <h1 className="font-heading text-6xl md:text-7xl font-bold mb-6" style={{ color: primaryColor, letterSpacing: '0.01em', fontStyle: 'italic' }}>
              {event?.couple_names || "Votre événement"}
            </h1>
            {event?.event_name && (
              <p className="font-body text-lg text-gray-700 mb-6 italic">{event.event_name}</p>
            )}
            {event?.event_date && (
              <p className="font-body text-sm text-gray-600 font-semibold">{new Date(event.event_date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            )}
          </header>

          {/* Contenu */}
          <main className="space-y-16">
            {children}
          </main>

          {/* Footer */}
          <footer className="mt-20 pt-12 text-center">
            <div className="mb-8 text-3xl" style={{ color: secondaryColor, opacity: 0.3 }}>❖ ✦ ❖</div>
            <div style={{ borderColor: primaryColor, borderWidth: '3px 0' }} className="py-6 mb-4">
              <p className="font-body text-xs tracking-widest uppercase" style={{ color: primaryColor }}>Merci de votre amitié</p>
            </div>
          </footer>
        </div>

        {/* Bande droite élégante */}
        <div className="w-1 md:w-4" style={{
          background: `linear-gradient(to bottom, ${primaryColor}80, ${secondaryColor}80)`
        }} />
      </div>
    </div>
  );
}