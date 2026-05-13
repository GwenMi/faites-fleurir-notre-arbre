import CountdownWidget from "@/components/challenge/CountdownWidget";

const EVENT_LABELS = {
  mariage: "Mariage", fiançailles: "Fiançailles", anniversaire: "Anniversaire",
  bapteme: "Baptême", communion: "Communion", fete_entreprise: "Fête d'entreprise",
  maison_hote: "Maison d'hôte", autre: "Événement",
};

export default function ClassicTemplate({ event, primaryColor, secondaryColor, fontHeading, fontBody, fontImportUrl, children }) {
  const c = primaryColor || "#c9a96e";
  const label = EVENT_LABELS[event?.event_type] || "Événement";

  return (
    <div style={{ background: "#FEFCF5", fontFamily: fontBody, backgroundImage: `radial-gradient(circle at 20% 80%, ${c}06 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${c}05 0%, transparent 50%)` }}>
      <style>{`
        @import url('${fontImportUrl}');
        .cl-head { font-family: '${fontHeading}', Georgia, serif; }
        .cl-body { font-family: '${fontBody}', system-ui, sans-serif; }
        .cl-rule { height: 1px; background: linear-gradient(90deg, transparent, ${c}55, transparent); }
        .cl-thin  { height: 1px; background: ${c}22; }
      `}</style>

      {/* ── Hero ── */}
      {event?.cover_image ? (
        <div className="relative overflow-hidden" style={{ height: "65vh", minHeight: 380 }}>
          <img src={event.cover_image} alt="" className="w-full h-full object-cover" />
          {/* gradient fade bottom */}
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${c}08 0%, transparent 40%, #FEFCF5 100%)` }} />
          {/* floating name card */}
          <div className="absolute bottom-0 inset-x-0 text-center pb-10 px-6">
            <p className="cl-body text-xs tracking-[0.4em] uppercase mb-3" style={{ color: c }}>{label}</p>
            <h1 className="cl-head font-bold italic leading-none" style={{ fontSize: "clamp(2.5rem,8vw,6rem)", color: c, textShadow: "0 2px 30px rgba(255,255,255,.6)" }}>
              {event?.couple_names}
            </h1>
          </div>
        </div>
      ) : (
        /* No photo: ornamental header */
        <div className="text-center px-6 py-20">
          <div className="cl-rule max-w-[100px] mx-auto mb-8" />
          <p className="cl-body text-xs tracking-[0.4em] uppercase mb-5" style={{ color: c }}>{label}</p>
          <h1 className="cl-head font-bold italic leading-none mb-6" style={{ fontSize: "clamp(3rem,9vw,7rem)", color: c }}>
            {event?.couple_names}
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="cl-rule w-20" />
            <span style={{ color: c + "66", fontSize: 18 }}>◈</span>
            <div className="cl-rule w-20" />
          </div>
        </div>
      )}

      {/* ── Date / welcome / countdown ── */}
      <div className="text-center px-6 py-10">
        {event?.event_date && (
          <p className="cl-body text-sm uppercase tracking-[0.25em] text-gray-500">
            {new Date(event.event_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}
        {event?.welcome_message && (
          <p className="cl-body text-gray-600 max-w-lg mx-auto leading-relaxed mt-5 font-light italic text-base" style={{ borderLeft: `2px solid ${c}44`, paddingLeft: 20, textAlign: "left", display: "inline-block" }}>
            {event.welcome_message}
          </p>
        )}
        {event?.event_date && <CountdownWidget eventDate={event.event_date} primaryColor={c} />}
        {event?.seed_type && (
          <div className="inline-flex items-center gap-2 mt-6 px-5 py-2 rounded-full cl-body text-sm" style={{ background: c + "15", color: c }}>
            🌱 Graine offerte : {event.seed_type}
          </div>
        )}
      </div>

      {/* ── Diamond divider ── */}
      <div className="flex items-center gap-4 max-w-2xl mx-auto px-6 py-2">
        <div className="cl-rule flex-1" />
        <span style={{ color: c + "55", fontSize: 14 }}>◇</span>
        <div className="cl-rule flex-1" />
      </div>

      {/* ── Sections ── */}
      <div className="pb-24">
        {children}
      </div>

      {/* ── Footer ── */}
      <footer className="py-14 px-6 text-center" style={{ borderTop: `1px solid ${c}20` }}>
        <div className="cl-rule max-w-[60px] mx-auto mb-6" />
        <p className="cl-head text-2xl italic mb-2" style={{ color: c + "99" }}>{event?.couple_names}</p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="cl-thin w-8" />
          <p className="cl-body text-xs text-gray-300 tracking-widest uppercase">Créé avec Fleurs en fête</p>
          <div className="cl-thin w-8" />
        </div>
      </footer>
    </div>
  );
}