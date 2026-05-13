import CountdownWidget from "@/components/challenge/CountdownWidget";

const EVENT_LABELS = {
  mariage: "Mariage", fiançailles: "Fiançailles", anniversaire: "Anniversaire",
  bapteme: "Baptême", communion: "Communion", fete_entreprise: "Fête d'entreprise",
  maison_hote: "Maison d'hôte", autre: "Événement",
};

const GOLD = "#C9A96E";

export default function ElegantTemplate({ event, primaryColor, secondaryColor, fontHeading, fontBody, fontImportUrl, children }) {
  const label = EVENT_LABELS[event?.event_type] || "Événement";
  const dark = "#1A1A2E";

  return (
    <div style={{ background: "#FAFAF8", fontFamily: fontBody, minHeight: "100vh", backgroundImage: `radial-gradient(circle at 30% 70%, ${GOLD}08 0%, transparent 40%), radial-gradient(circle at 70% 30%, ${GOLD}06 0%, transparent 40%)` }}>
      <style>{`
        @import url('${fontImportUrl}');
        .el-head { font-family: '${fontHeading}', Georgia, serif; }
        .el-body { font-family: '${fontBody}', system-ui, sans-serif; }
        .el-gold { color: ${GOLD}; }
        .el-rule { height: 1px; background: linear-gradient(90deg, transparent, ${GOLD}66, transparent); }
      `}</style>

      {/* ── Full-screen dark hero ── */}
      <div className="relative flex flex-col items-center justify-center text-center px-8"
        style={{ minHeight: "100vh", maxHeight: 800, background: event?.cover_image ? undefined : `linear-gradient(160deg, ${dark} 0%, #16213E 50%, #0F3460 100%)` }}>

        {event?.cover_image && (
          <>
            <img src={event.cover_image} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${dark}ee 0%, ${dark}cc 50%, ${dark}aa 100%)` }} />
          </>
        )}

        {/* Top ornament */}
        <div className="relative z-10 mb-12">
          <div className="el-rule w-24 mx-auto mb-6" />
          <p className="el-body text-xs tracking-[0.5em] uppercase el-gold opacity-70">{label}</p>
        </div>

        {/* Names */}
        <h1 className="relative z-10 el-head font-bold italic leading-tight el-gold mb-6"
          style={{ fontSize: "clamp(3rem,9vw,6.5rem)" }}>
          {event?.couple_names}
        </h1>

        {/* Date */}
        {event?.event_date && (
          <p className="relative z-10 el-body text-sm tracking-[0.3em] uppercase" style={{ color: "rgba(255,255,255,.5)" }}>
            {new Date(event.event_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}

        {/* Bottom ornament */}
        <div className="relative z-10 mt-12">
          <p className="el-body text-2xl el-gold opacity-40 tracking-widest">◆ ✦ ◆</p>
          <div className="el-rule w-24 mx-auto mt-6" />
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 inset-x-0 flex flex-col items-center gap-1 z-10 opacity-40">
          <div style={{ width: 1, height: 40, background: GOLD }} />
          <p className="el-body text-xs tracking-widest uppercase" style={{ color: GOLD }}>Défiler</p>
        </div>
      </div>

      {/* ── Welcome / countdown ── */}
      <div className="max-w-2xl mx-auto text-center px-8 py-14">
        {event?.welcome_message && (
          <div className="mb-8 px-8 py-6 border-t border-b" style={{ borderColor: GOLD + "33" }}>
            <p className="el-head text-xl italic text-gray-600 leading-relaxed">"{event.welcome_message}"</p>
          </div>
        )}
        {event?.event_date && <CountdownWidget eventDate={event.event_date} primaryColor={GOLD} />}
        {event?.seed_type && (
          <div className="inline-flex items-center gap-2 mt-8 px-5 py-2 rounded-full el-body text-sm" style={{ background: GOLD + "18", color: GOLD }}>
            🌱 Graine offerte : {event.seed_type}
          </div>
        )}
        <div className="el-rule max-w-[100px] mx-auto mt-10" />
      </div>

      {/* ── Sections ── */}
      <div className="pb-24">
        {children}
      </div>

      {/* ── Dark footer ── */}
      <footer className="py-16 px-8 text-center" style={{ background: dark }}>
        <div className="el-rule max-w-[80px] mx-auto mb-8" />
        <p className="el-head text-3xl italic el-gold mb-3">{event?.couple_names}</p>
        <p className="el-body text-xs tracking-[0.4em] uppercase" style={{ color: "rgba(255,255,255,.3)" }}>
          Créé avec Fleurs en fête
        </p>
        <div className="el-rule max-w-[80px] mx-auto mt-8" />
      </footer>
    </div>
  );
}