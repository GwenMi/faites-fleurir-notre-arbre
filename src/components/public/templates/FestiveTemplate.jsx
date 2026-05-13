import CountdownWidget from "@/components/challenge/CountdownWidget";

const EVENT_LABELS = {
  mariage: "Mariage", fiançailles: "Fiançailles", anniversaire: "Anniversaire",
  bapteme: "Baptême", communion: "Communion", fete_entreprise: "Fête d'entreprise",
  maison_hote: "Maison d'hôte", autre: "Événement",
};

/* Polka-dot CSS pattern overlay */
function DotPattern({ color }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{
      backgroundImage: `radial-gradient(circle, ${color}33 1.5px, transparent 1.5px)`,
      backgroundSize: "28px 28px",
    }} />
  );
}

export default function FestiveTemplate({ event, primaryColor, secondaryColor, fontHeading, fontBody, fontImportUrl, children }) {
  const c = primaryColor || "#f43f5e";
  const s = secondaryColor || "#86efac";
  const label = EVENT_LABELS[event?.event_type] || "Événement";

  return (
    <div style={{ minHeight: "100vh", fontFamily: fontBody, backgroundImage: `radial-gradient(circle at 15% 85%, ${c}04 0%, transparent 30%), radial-gradient(circle at 85% 15%, ${s}04 0%, transparent 30%)` }}>
      <style>{`
        @import url('${fontImportUrl}');
        .ft-head { font-family: '${fontHeading}', Georgia, serif; }
        .ft-body { font-family: '${fontBody}', system-ui, sans-serif; }
        .ft-card { background: #fff; border-radius: 2rem; box-shadow: 0 4px 32px rgba(0,0,0,.08); }
      `}</style>

      {/* ── Hero gradient zone ── */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${c} 0%, ${s} 100%)`, paddingBottom: 60 }}>
        <DotPattern color="#fff" />

        <div className="relative z-10 text-center px-6 pt-16 pb-4">
          <p className="ft-body text-xs tracking-[0.4em] uppercase mb-6 text-white/70">{label}</p>

          {/* Cover photo: rounded card */}
          {event?.cover_image && (
            <div className="mx-auto mb-8 ft-card overflow-hidden" style={{ width: 240, height: 300, borderRadius: "2rem", border: "4px solid rgba(255,255,255,.6)" }}>
              <img src={event.cover_image} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Names on colored bg */}
          <h1 className="ft-head font-bold text-white leading-tight mb-4" style={{ fontSize: "clamp(2.8rem,8vw,6rem)", textShadow: "0 2px 20px rgba(0,0,0,.15)" }}>
            {event?.couple_names}
          </h1>
          {event?.event_name && <p className="ft-body text-white/80 text-lg mb-4">{event.event_name}</p>}
          {event?.event_date && (
            <p className="ft-body text-sm text-white/70">
              {new Date(event.event_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
          <div className="text-3xl mt-8 tracking-widest">🎉 ✨ 🎊</div>
        </div>

        {/* White wave bottom */}
        <div className="absolute bottom-0 inset-x-0">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 60 }}>
            <path d="M0,60 C360,0 1080,60 1440,20 L1440,60 Z" fill="#F8F8F8" />
          </svg>
        </div>
      </div>

      {/* ── Welcome / countdown ── */}
      <div className="text-center px-6 py-10" style={{ background: "#F8F8F8" }}>
        {event?.welcome_message && (
          <div className="ft-card max-w-lg mx-auto px-6 py-5 mb-6" style={{ borderTop: `3px solid ${c}` }}>
            <p className="ft-body text-gray-600 leading-relaxed italic">{event.welcome_message}</p>
          </div>
        )}
        {event?.event_date && <CountdownWidget eventDate={event.event_date} primaryColor={c} />}
        {event?.seed_type && (
          <div className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full ft-body text-sm font-semibold text-white" style={{ background: `linear-gradient(90deg, ${c}, ${s})` }}>
            🌱 Graine offerte : {event.seed_type}
          </div>
        )}
      </div>

      {/* ── Sections on light bg ── */}
      <div style={{ background: "#F8F8F8" }} className="pb-24">
        {children}
      </div>

      {/* ── Footer ── */}
      <footer className="py-14 px-6 text-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${c} 0%, ${s} 100%)` }}>
        <DotPattern color="#fff" />
        <div className="relative z-10">
          <div className="text-3xl mb-4 tracking-widest">🎊 🎈 🎊</div>
          <p className="ft-head text-2xl font-bold text-white mb-2">{event?.couple_names}</p>
          <p className="ft-body text-xs text-white/60 tracking-widest uppercase">Un moment inoubliable · Fleurs en fête</p>
        </div>
      </footer>
    </div>
  );
}