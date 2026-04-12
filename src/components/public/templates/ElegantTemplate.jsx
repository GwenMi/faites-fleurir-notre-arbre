export default function ElegantTemplate({ event, primaryColor, secondaryColor, fontHeading, fontBody, fontImportUrl, children }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <style>{`
        @import url('${fontImportUrl}');
        .font-serif-elegant { font-family: '${fontHeading}', Georgia, serif; }
        .font-sans-clean { font-family: '${fontBody}', system-ui, sans-serif; }
        .accent-line { background: linear-gradient(90deg, transparent, ${primaryColor}, transparent); }
      `}</style>

      {/* Hero élégant et sombre */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {event.cover_image && (
          <div className="absolute inset-0 z-0">
            <img src={event.cover_image} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gray-900/70" />
          </div>
        )}
        <div className="relative z-10 text-center px-6 max-w-3xl">
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 rounded-full border-2" style={{ borderColor: primaryColor }}></div>
          </div>
          <h1 className="font-serif-elegant text-7xl md:text-8xl font-bold mb-6" style={{ color: primaryColor }}>
            {event.couple_names}
          </h1>
          <div className="h-px w-32 mx-auto mb-8 accent-line"></div>
          {event.welcome_message && (
            <p className="font-sans-clean text-lg text-gray-300 max-w-lg mx-auto mb-8 leading-relaxed">
              {event.welcome_message}
            </p>
          )}
          {event.event_date && (
            <p className="font-sans-clean text-sm tracking-[0.2em] uppercase text-gray-400">
              {new Date(event.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
        </div>
      </div>

      {/* Contenu avec panneaux */}
      <div className="py-20 space-y-8">
        {children}
      </div>

      {/* Footer élégant */}
      <footer className="py-12 px-6 text-center border-t" style={{ borderColor: primaryColor + "44" }}>
        <p className="font-sans-clean text-xs text-gray-500">Fleurs en fête © 2026</p>
      </footer>
    </div>
  );
}