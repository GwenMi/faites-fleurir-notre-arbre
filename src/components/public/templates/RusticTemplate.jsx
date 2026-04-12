import CountdownWidget from "@/components/challenge/CountdownWidget";

const EVENT_LABELS = {
  mariage: "Mariage", fiançailles: "Fiançailles", anniversaire: "Anniversaire",
  bapteme: "Baptême", communion: "Communion", fete_entreprise: "Fête d'entreprise",
  maison_hote: "Maison d'hôte", autre: "Événement",
};

/* Botanical SVG leaf — pure CSS inline */
function Leaf({ style }) {
  return (
    <svg viewBox="0 0 60 80" style={{ width: 40, opacity: 0.18, ...style }} fill="currentColor">
      <path d="M30 0 C30 0 60 20 60 45 C60 65 45 78 30 80 C15 78 0 65 0 45 C0 20 30 0 30 0Z" />
      <line x1="30" y1="10" x2="30" y2="75" stroke="white" strokeWidth="2" fill="none" />
    </svg>
  );
}

export default function RusticTemplate({ event, primaryColor, secondaryColor, fontHeading, fontBody, fontImportUrl, children }) {
  const c = primaryColor || "#8a9a5b";
  const warm = "#F5F0E8";
  const label = EVENT_LABELS[event?.event_type] || "Événement";

  return (
    <div style={{ background: warm, fontFamily: fontBody, minHeight: "100vh" }}>
      <style>{`
        @import url('${fontImportUrl}');
        .rs-head { font-family: '${fontHeading}', Georgia, serif; }
        .rs-body { font-family: '${fontBody}', system-ui, sans-serif; }
        .rs-card { background: #fff; border-radius: 1.5rem; border: 1px solid ${c}18; }
      `}</style>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden" style={{ background: warm }}>
        {/* Botanical corners */}
        <div className="absolute top-4 left-4" style={{ color: c }}><Leaf /></div>
        <div className="absolute top-4 right-4" style={{ color: c, transform: "scaleX(-1)" }}><Leaf /></div>
        <div className="absolute bottom-4 left-8" style={{ color: secondaryColor || c, transform: "rotate(40deg)" }}><Leaf style={{ width: 28 }} /></div>
        <div className="absolute bottom-4 right-8" style={{ color: secondaryColor || c, transform: "rotate(-40deg) scaleX(-1)" }}><Leaf style={{ width: 28 }} /></div>

        <div className="text-center px-8 pt-16 pb-10 relative z-10">
          <p className="rs-body text-xs tracking-[0.4em] uppercase mb-4" style={{ color: c }}>
            🌿 {label} 🌿
          </p>

          {/* Cover photo: oval frame */}
          {event?.cover_image && (
            <div className="mx-auto mb-8" style={{ width: 220, height: 280, borderRadius: "50% / 60%", overflow: "hidden", border: `6px solid ${c}33`, boxShadow: `0 4px 24px ${c}22` }}>
              <img src={event.cover_image} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          <h1 className="rs-head font-bold leading-tight mb-4" style={{ fontSize: "clamp(2.8rem,8vw,5.5rem)", color: c }}>
            {event?.couple_names}
          </h1>
          {event?.event_name && <p className="rs-body text-gray-600 text-lg mb-4">{event.event_name}</p>}
          {event?.event_date && (
            <p className="rs-body text-sm text-gray-500 tracking-wide">
              {new Date(event.event_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
        </div>
      </div>

      {/* ── Welcome / countdown ── */}
      <div className="text-center px-6 py-6">
        {event?.welcome_message && (
          <div className="rs-card max-w-lg mx-auto px-6 py-5 mb-6 text-left" style={{ borderLeft: `3px solid ${c}` }}>
            <p className="rs-body text-gray-600 leading-relaxed italic">{event.welcome_message}</p>
          </div>
        )}
        {event?.event_date && <CountdownWidget eventDate={event.event_date} primaryColor={c} />}
        {event?.seed_type && (
          <div className="inline-flex items-center gap-2 mt-6 px-5 py-2 rounded-full rs-body text-sm" style={{ background: c + "18", color: c }}>
            🌱 Graine offerte : {event.seed_type}
          </div>
        )}
      </div>

      {/* ── Vine divider ── */}
      <div className="text-center py-4" style={{ color: c + "55", fontSize: 22, letterSpacing: 8 }}>
        🌿 ❧ 🌿
      </div>

      {/* ── Sections ── */}
      <div className="pb-24">
        {children}
      </div>

      {/* ── Footer ── */}
      <footer className="py-14 px-6 text-center" style={{ background: c + "12", borderTop: `1px solid ${c}22` }}>
        <div className="text-3xl mb-4" style={{ letterSpacing: 16 }}>🌸 🌿 🌸</div>
        <p className="rs-head text-xl italic mb-2" style={{ color: c }}>{event?.couple_names}</p>
        <p className="rs-body text-xs text-gray-400 tracking-wide">Avec amour et nature · Fleurs en fête</p>
      </footer>
    </div>
  );
}
