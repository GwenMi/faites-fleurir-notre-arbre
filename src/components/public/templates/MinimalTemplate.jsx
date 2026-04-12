export default function MinimalTemplate({ event, primaryColor, secondaryColor, fontHeading, fontBody, fontImportUrl, children }) {
  return (
    <div style={{ fontFamily: fontBody }}>
      <style>{`
        @import url('${fontImportUrl}');
        .font-heading { font-family: '${fontHeading}', serif; }
        .font-body { font-family: '${fontBody}', sans-serif; }
      `}</style>
      
      <div className="flex min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Bande gauche géométrique */}
        <div className="w-2 md:w-3 flex flex-col items-center py-20 gap-6" style={{ backgroundColor: `${primaryColor}08` }}>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor, opacity: 0.3 + (i * 0.05) }} />
          ))}
        </div>
        
        <div className="flex-1 max-w-5xl mx-auto px-6 md:px-12 py-16">
          {/* Header */}
          <header className="text-center mb-16 pb-12 relative">
            <div className="mb-8 flex justify-center">
              <div style={{ width: '40px', height: '2px', backgroundColor: primaryColor }} />
            </div>
            <h1 className="font-heading text-5xl md:text-6xl font-light mb-4" style={{ color: primaryColor, letterSpacing: '0.05em' }}>
              {event?.couple_names || "Votre événement"}
            </h1>
            {event?.event_name && (
              <p className="font-body text-base text-gray-600 mb-4 tracking-widest text-xs uppercase">{event.event_name}</p>
            )}
            {event?.event_date && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <div style={{ backgroundColor: primaryColor }} className="flex-1 h-px" />
                <p className="font-body text-xs text-gray-500">{new Date(event.event_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <div style={{ backgroundColor: primaryColor }} className="flex-1 h-px" />
              </div>
            )}
          </header>

          {/* Contenu */}
          <main className="space-y-16">
            {children}
          </main>

          {/* Footer */}
          <footer className="mt-20 pt-12 text-center">
            <div style={{ backgroundColor: primaryColor }} className="w-8 h-px mx-auto mb-4" />
            <p className="font-body text-xs text-gray-500 tracking-widest uppercase">Merci</p>
          </footer>
        </div>

        {/* Bande droite géométrique */}
        <div className="w-2 md:w-3 flex flex-col items-center py-20 gap-6" style={{ backgroundColor: `${primaryColor}08` }}>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor, opacity: 0.3 + (i * 0.05) }} />
          ))}
        </div>
      </div>
    </div>
  );
}