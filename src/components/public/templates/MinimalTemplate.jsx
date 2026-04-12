export default function MinimalTemplate({ event, primaryColor, secondaryColor, fontHeading, fontBody, fontImportUrl, children }) {
  return (
    <div style={{ fontFamily: fontBody }}>
      <style>{`
        @import url('${fontImportUrl}');
        .font-heading { font-family: '${fontHeading}', serif; }
        .font-body { font-family: '${fontBody}', sans-serif; }
      `}</style>
      
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-8 md:px-12 py-24">
          {/* Header minimaliste épuré */}
          <header className="text-center mb-24">
            <div className="mb-12 flex justify-center">
              <div style={{ width: '60px', height: '1px', backgroundColor: primaryColor }} />
            </div>
            <h1 className="font-heading text-5xl md:text-6xl font-light mb-8" style={{ color: primaryColor, letterSpacing: '0.02em' }}>
              {event?.couple_names || "Votre événement"}
            </h1>
            {event?.event_name && (
              <p className="font-body text-sm text-gray-600 uppercase tracking-widest mb-8">{event.event_name}</p>
            )}
            {event?.event_date && (
              <p className="font-body text-xs text-gray-500 tracking-wide">{new Date(event.event_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            )}
          </header>

          {/* Contenu */}
          <main className="space-y-20">
            {children}
          </main>

          {/* Footer épuré */}
          <footer className="mt-28 pt-12">
            <div className="flex justify-center mb-6">
              <div style={{ width: '40px', height: '1px', backgroundColor: primaryColor }} />
            </div>
            <p className="font-body text-center text-xs text-gray-500 uppercase tracking-widest">Merci</p>
          </footer>
        </div>
      </div>
    </div>
  );
}