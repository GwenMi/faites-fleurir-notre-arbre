export default function MinimalTemplate({ event, primaryColor, secondaryColor, fontHeading, fontBody, fontImportUrl, children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @import url('${fontImportUrl}');
        .font-serif-elegant { font-family: '${fontHeading}', Georgia, serif; }
        .font-sans-clean { font-family: '${fontBody}', system-ui, sans-serif; }
        
        .subtle-bg {
          background: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(240,240,240,0.8) 100%);
        }
      `}</style>

      {/* Header minimaliste épuré */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="font-serif-elegant text-7xl md:text-8xl font-light text-gray-900 mb-1 tracking-tight">
              {event.couple_names}
            </h1>
            <div className="w-16 h-px bg-gray-400 mx-auto my-6"></div>
            {event.welcome_message && (
              <p className="font-sans-clean text-gray-600 max-w-md mx-auto text-base leading-relaxed">
                {event.welcome_message}
              </p>
            )}
            {event.event_date && (
              <p className="font-sans-clean text-xs text-gray-400 tracking-widest uppercase mt-6">
                {new Date(event.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Image hero minimaliste */}
      {event.cover_image && (
        <div className="h-56 md:h-72 overflow-hidden">
          <img src={event.cover_image} className="w-full h-full object-cover grayscale opacity-80" alt="" />
        </div>
      )}

      {/* Contenu épuré */}
      <main className="max-w-2xl mx-auto px-6 py-20">
        <div className="space-y-20">
          {children && typeof children === 'function' 
            ? children() 
            : Array.isArray(children) 
              ? children.map((child, i) => (
                  <section key={i} className="subtle-bg rounded-sm p-8 border border-gray-200">
                    {child}
                  </section>
                ))
              : <section className="subtle-bg rounded-sm p-8 border border-gray-200">{children}</section>
          }
        </div>
      </main>

      {/* Footer minimaliste */}
      <footer className="py-12 px-6 text-center border-t border-gray-200 bg-white">
        <p className="font-sans-clean text-xs tracking-widest text-gray-400">FLEURS EN FÊTE</p>
      </footer>
    </div>
  );
}