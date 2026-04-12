export default function ElegantTemplate({ event, primaryColor, secondaryColor, fontHeading, fontBody, fontImportUrl, children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <style>{`
        @import url('${fontImportUrl}');
        .font-serif-elegant { font-family: '${fontHeading}', Georgia, serif; }
        .font-sans-clean { font-family: '${fontBody}', system-ui, sans-serif; }
        
        .accent-bar {
          width: 40px;
          height: 3px;
          background: ${primaryColor};
          margin: 16px auto;
        }
        
        .card-elegant {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
        }
      `}</style>

      {/* Background pattern */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, ${primaryColor}44 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${secondaryColor}44 0%, transparent 50%)`,
        }}></div>
      </div>

      {/* Hero élégant et dramatique */}
      <div className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background image */}
        {event.cover_image && (
          <div className="absolute inset-0 z-0">
            <img src={event.cover_image} className="w-full h-full object-cover opacity-20" alt="" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/90" />
          </div>
        )}

        <div className="relative z-10 text-center px-6 max-w-3xl">
          {/* Decorative elements */}
          <div className="mb-12 flex justify-center gap-4 text-3xl opacity-50">
            <span>✦</span>
            <span>◆</span>
            <span>✦</span>
          </div>

          <h1 className="font-serif-elegant text-7xl md:text-8xl font-bold mb-4 leading-tight">
            {event.couple_names}
          </h1>

          <div className="accent-bar"></div>

          {event.welcome_message && (
            <p className="font-sans-clean text-lg text-gray-300 max-w-lg mx-auto mb-8 leading-relaxed font-light">
              {event.welcome_message}
            </p>
          )}

          {event.event_date && (
            <div className="flex items-center justify-center gap-3 mb-12">
              <div className="w-8 h-px bg-gradient-to-r from-transparent" style={{ borderColor: primaryColor }}></div>
              <p className="font-sans-clean text-sm tracking-[0.15em] uppercase text-gray-400">
                {new Date(event.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <div className="w-8 h-px bg-gradient-to-l from-transparent" style={{ borderColor: primaryColor }}></div>
            </div>
          )}

          {/* Scroll indicator */}
          <div className="mt-16 text-gray-500 text-sm animate-bounce">
            ↓ Découvrez
          </div>
        </div>
      </div>

      {/* Contenu avec cards élégantes */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-20">
        <div className="space-y-8">
          {children && typeof children === 'function' 
            ? children() 
            : Array.isArray(children) 
              ? children.map((child, i) => (
                  <div key={i} className="card-elegant rounded-lg p-8 md:p-10">
                    {child}
                  </div>
                ))
              : <div className="card-elegant rounded-lg p-8 md:p-10">{children}</div>
          }
        </div>
      </div>

      {/* Footer élégant */}
      <footer className="relative z-10 py-12 px-6 text-center border-t border-gray-900">
        <p className="font-serif-elegant text-lg text-gray-400 mb-2">
          <span style={{ color: primaryColor }}>✿</span>
        </p>
        <p className="font-sans-clean text-xs tracking-widest uppercase text-gray-500">
          Fleurs en fête © 2026
        </p>
      </footer>
    </div>
  );
}