export default function FestiveTemplate({ event, primaryColor, secondaryColor, fontHeading, fontBody, fontImportUrl, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-purple-50">
      <style>{`
        @import url('${fontImportUrl}');
        .font-serif-elegant { font-family: '${fontHeading}', Georgia, serif; }
        .font-sans-clean { font-family: '${fontBody}', system-ui, sans-serif; }
        
        .confetti-bg {
          background-image: 
            linear-gradient(45deg, ${primaryColor}22 25%, transparent 25%, transparent 75%, ${primaryColor}22 75%, ${primaryColor}22),
            linear-gradient(45deg, ${primaryColor}22 25%, transparent 25%, transparent 75%, ${primaryColor}22 75%, ${primaryColor}22),
            linear-gradient(45deg, ${secondaryColor}22 25%, transparent 25%, transparent 75%, ${secondaryColor}22 75%, ${secondaryColor}22);
          background-size: 40px 40px, 40px 40px, 80px 80px;
          background-position: 0 0, 20px 20px, 10px 10px;
        }
        
        .party-divider {
          text-align: center;
          font-size: 28px;
          letter-spacing: 8px;
          margin: 20px 0;
        }
      `}</style>

      {/* Header festif coloré */}
      <div className="confetti-bg relative overflow-hidden pt-16 pb-24 border-b-4" style={{ borderColor: primaryColor }}>
        {/* Emojis flottants */}
        <div className="absolute top-4 left-4 text-4xl animate-bounce">🎉</div>
        <div className="absolute top-12 right-8 text-5xl animate-pulse">🎊</div>
        <div className="absolute bottom-6 left-1/3 text-4xl">🎈</div>
        <div className="absolute bottom-12 right-1/4 text-5xl animate-bounce">🎉</div>

        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
          <div className="mb-6 text-6xl">🎉</div>
          
          <h1 className="font-serif-elegant text-6xl md:text-7xl font-bold text-transparent bg-clip-text"
            style={{ 
              backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` 
            }}>
            {event.couple_names}
          </h1>
          
          <div className="party-divider" style={{ color: primaryColor }}>
            ★ 🎊 ★
          </div>

          {event.welcome_message && (
            <p className="font-sans-clean text-gray-700 text-lg max-w-lg mx-auto leading-relaxed mb-6 font-bold">
              {event.welcome_message}
            </p>
          )}

          {event.event_date && (
            <p className="font-sans-clean text-sm font-bold uppercase tracking-widest mb-6"
              style={{ color: primaryColor }}>
              {new Date(event.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}

          <div className="flex justify-center gap-3 text-4xl">
            <span>🎈</span>
            <span>🎊</span>
            <span>🎈</span>
          </div>
        </div>
      </div>

      {/* Image hero avec overlay festif */}
      {event.cover_image && (
        <div className="h-64 md:h-80 overflow-hidden relative">
          <img src={event.cover_image} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${primaryColor}30, ${secondaryColor}30)` }}></div>
        </div>
      )}

      {/* Contenu avec sections colorées */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {children && typeof children === 'function' 
            ? children() 
            : Array.isArray(children) 
              ? children.map((child, i) => (
                  <div key={i} className="relative rounded-2xl shadow-lg p-6 md:p-8 overflow-hidden"
                    style={{ 
                      background: i % 2 === 0 
                        ? `linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))`
                        : `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)`
                    }}>
                    {i % 2 === 1 && (
                      <div className="absolute -top-8 -right-8 text-6xl opacity-10">🎉</div>
                    )}
                    <div className="relative z-10">{child}</div>
                  </div>
                ))
              : <div className="rounded-2xl shadow-lg p-6 md:p-8" style={{ background: 'rgba(255,255,255,0.95)' }}>
                  {children}
                </div>
          }
        </div>
      </div>

      {/* Footer festif */}
      <footer className="py-12 px-4 text-center border-t-4" style={{ borderColor: primaryColor }}>
        <div className="text-5xl mb-4">🎉 🎊 🎉</div>
        <p className="font-serif-elegant text-2xl font-bold mb-2" style={{ color: primaryColor }}>
          À très bientôt !
        </p>
        <p className="font-sans-clean text-sm text-gray-600">Créé avec Fleurs en fête 🌸</p>
      </footer>
    </div>
  );
}