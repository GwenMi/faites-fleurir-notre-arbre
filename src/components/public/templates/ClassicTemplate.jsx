export default function ClassicTemplate({ event, primaryColor, secondaryColor, fontHeading, fontBody, fontImportUrl, children }) {
  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('${fontImportUrl}');
        .font-serif-elegant { font-family: '${fontHeading}', Georgia, serif; }
        .font-sans-clean { font-family: '${fontBody}', system-ui, sans-serif; }
        
        .gold-divider {
          height: 2px;
          background: linear-gradient(90deg, transparent, ${primaryColor}88, transparent);
          margin: 16px 0;
        }
        
        .accent-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          background: ${primaryColor};
          border-radius: 50%;
          margin: 0 8px;
        }
      `}</style>

      {/* Header classique élégant */}
      <div className="border-b" style={{ borderColor: primaryColor + "22" }}>
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="text-center">
            <p className="font-sans-clean text-xs tracking-[0.3em] uppercase mb-6" style={{ color: primaryColor }}>
              ✨ Un moment précieux ✨
            </p>
            <h1 className="font-serif-elegant text-6xl md:text-7xl font-bold text-gray-900 mb-2">
              {event.couple_names}
            </h1>
            <div className="gold-divider max-w-xs mx-auto"></div>
            {event.welcome_message && (
              <p className="font-sans-clean text-gray-700 text-lg max-w-lg mx-auto leading-relaxed mt-6">
                {event.welcome_message}
              </p>
            )}
            {event.event_date && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <span style={{ color: primaryColor }}>✦</span>
                <p className="font-sans-clean text-sm text-gray-500">
                  {new Date(event.event_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
                <span style={{ color: primaryColor }}>✦</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image de couverture si existante */}
      {event.cover_image && (
        <div className="h-64 md:h-80 overflow-hidden">
          <img src={event.cover_image} className="w-full h-full object-cover" alt="" />
        </div>
      )}

      {/* Contenu principal */}
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="space-y-12">
          {/* Wrapper élégant des sections */}
          {children && typeof children === 'function' 
            ? children() 
            : Array.isArray(children) 
              ? children.map((child, i) => (
                  <div key={i}>
                    {i > 0 && <div className="gold-divider my-8"></div>}
                    {child}
                  </div>
                ))
              : <div>{children}</div>
          }
        </div>
      </div>

      {/* Footer classique */}
      <footer className="py-12 px-6 border-t text-center" style={{ borderColor: primaryColor + "22" }}>
        <p className="font-serif-elegant text-lg text-gray-800 mb-2">
          <span style={{ color: primaryColor }}>✿</span> Merci <span style={{ color: primaryColor }}>✿</span>
        </p>
        <p className="font-sans-clean text-sm text-gray-500">Créé avec Fleurs en fête 🌸</p>
      </footer>
    </div>
  );
}