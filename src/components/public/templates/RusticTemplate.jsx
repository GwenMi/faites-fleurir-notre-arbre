export default function RusticTemplate({ event, primaryColor, secondaryColor, fontHeading, fontBody, fontImportUrl, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-amber-50 to-amber-100">
      <style>{`
        @import url('${fontImportUrl}');
        .font-serif-elegant { font-family: '${fontHeading}', Georgia, serif; }
        .font-sans-clean { font-family: '${fontBody}', system-ui, sans-serif; }
        
        .leaf-pattern {
          background-image: 
            linear-gradient(45deg, transparent 48%, ${primaryColor}15 49%, ${primaryColor}15 51%, transparent 52%),
            linear-gradient(-45deg, transparent 48%, ${primaryColor}15 49%, ${primaryColor}15 51%, transparent 52%);
          background-size: 60px 60px;
          background-position: 0 0, 30px 30px;
        }
        
        .flower-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
        }
        
        .flower-divider::before,
        .flower-divider::after {
          content: '';
          flex: 1;
          height: 2px;
          background: linear-gradient(90deg, transparent, ${primaryColor}44, transparent);
        }
        
        .section-card {
          background: rgba(255,255,255,0.8);
          border-left: 4px solid ${primaryColor};
          backdrop-filter: blur(10px);
        }
      `}</style>

      {/* Hero champêtre */}
      <div className="relative overflow-hidden pt-16 pb-24">
        {/* Décoration feuilles en arrière */}
        <div className="absolute top-0 left-0 opacity-30 text-6xl">🍂</div>
        <div className="absolute top-20 right-10 opacity-25 text-7xl">🌾</div>
        <div className="absolute bottom-10 left-1/4 opacity-20 text-8xl">🌿</div>

        {/* Image de couverture */}
        {event.cover_image && (
          <div className="absolute inset-0 z-0">
            <img src={event.cover_image} className="w-full h-full object-cover opacity-25 sepia" alt="" />
            <div className="absolute inset-0 bg-gradient-to-b from-amber-50/80 via-amber-50/60 to-amber-100/80" />
          </div>
        )}

        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
          <div className="mb-6 text-5xl">🌾</div>
          
          <h1 className="font-serif-elegant text-6xl md:text-7xl font-bold text-amber-900 mb-2 drop-shadow-sm">
            {event.couple_names}
          </h1>
          
          <div className="flower-divider justify-center">
            <span style={{ color: primaryColor }}>🌸</span>
          </div>

          {event.welcome_message && (
            <p className="font-sans-clean text-amber-800 text-lg max-w-lg mx-auto leading-relaxed mb-6 italic font-light">
              « {event.welcome_message} »
            </p>
          )}

          {event.event_date && (
            <p className="font-sans-clean text-sm text-amber-700 font-semibold tracking-widest uppercase">
              {new Date(event.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}

          <div className="mt-8 flex justify-center gap-4 text-3xl">
            <span>🌿</span>
            <span>🌾</span>
            <span>🌿</span>
          </div>
        </div>
      </div>

      {/* Bande décorée */}
      <div className="leaf-pattern h-8 mb-12"></div>

      {/* Contenu avec sections décorées */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="space-y-12">
          {/* Wrapper des sections avec style */}
          {children && typeof children === 'function' 
            ? children() 
            : Array.isArray(children) 
              ? children.map((child, i) => (
                  <div key={i} className="section-card rounded-lg shadow-sm p-6 md:p-8">
                    {child}
                  </div>
                ))
              : <div className="section-card rounded-lg shadow-sm p-6 md:p-8">{children}</div>
          }
        </div>
      </div>

      {/* Bande décorée fin */}
      <div className="leaf-pattern h-8 my-12"></div>

      {/* Footer chaleureux */}
      <footer className="py-12 px-4 text-center" style={{ background: `${primaryColor}22` }}>
        <p className="font-serif-elegant text-2xl text-amber-900 mb-2">🌸 Merci 🌸</p>
        <p className="font-sans-clean text-sm text-amber-800 mb-4">Merci d'avoir partagé ce moment avec nous</p>
        <p className="font-sans-clean text-xs text-amber-700">Créé avec Fleurs en fête 🌸</p>
      </footer>
    </div>
  );
}