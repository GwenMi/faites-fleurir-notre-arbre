import CountdownWidget from "@/components/challenge/CountdownWidget";

const EVENT_LABELS = {
  mariage: "Mariage", fiançailles: "Fiançailles", anniversaire: "Anniversaire",
  bapteme: "Baptême", communion: "Communion", fete_entreprise: "Fête d'entreprise",
  maison_hote: "Maison d'hôte", autre: "Événement",
};

export default function MinimalTemplate({ event, primaryColor, secondaryColor, fontHeading, fontBody, fontImportUrl, children }) {
  const c = primaryColor || "#111111";
  const label = EVENT_LABELS[event?.event_type] || "Événement";

  return (
    <div style={{ background: "#FFFFFF", fontFamily: fontBody, minHeight: "100vh" }}>
      <style>{`
        @import url('${fontImportUrl}');
        .mn-head { font-family: '${fontHeading}', Georgia, serif; }
        .mn-body { font-family: '${fontBody}', system-ui, sans-serif; }
      `}</style>

      {/* ── Hero ── */}
      {event?.cover_image ? (
        /* Full-bleed photo with bottom overlay */
        <div className="relative" style={{ height: "100vh", maxHeight: 700 }}>
          <img src={event.cover_image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,.65) 100%)" }} />
          {/* Thin top bar */}
          <div className="absolute top-0 inset-x-0 flex items-center justify-between px-8 py-6">
            <div style={{ width: 40, height: 1, background: "rgba(255,255,255,.5)" }} />
            <p className="mn-body text-white text-xs tracking-[0.5em] uppercase opacity-70">{label}</p>
            <div style={{ width: 40, height: 1, background: "rgba(255,255,255,.5)" }} />
          </div>
          {/* Bottom text */}
          <div className="absolute bottom-0 inset-x-0 px-8 pb-14 text-white">
            <h1 className="mn-head font-light leading-none mb-3" style={{ fontSize: "clamp(3rem,10vw,7rem)", letterSpacing: "-0.02em" }}>
              {event?.couple_names}
            </h1>
            {event?.event_date && (
              <p className="mn-body text-white/60 text-xs tracking-[0.35em] uppercase">
                {new Date(event.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            )}
          </div>
        </div>
      ) : (
        /* No photo: huge light-weight title */
        <div className="flex flex-col items-center justify-center text-center px-8 py-32" style={{ minHeight: "50vh" }}>
          <p className="mn-body text-xs tracking-[0.6em] uppercase mb-10" style={{ color: c + "55" }}>{label}</p>
          <h1 className="mn-head font-extralight leading-[0.9] mb-10" style={{ fontSize: "clamp(4rem,14vw,10rem)", color: "#111", letterSpacing: "-0.03em" }}>
            {event?.couple_names}
          </h1>
          {event?.event_date && (
            <p className="mn-body text-xs tracking-[0.4em] uppercase" style={{ color: "#999" }}>
              {new Date(event.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
          <div style={{ width: 1, height: 60, background: c + "33", marginTop: 48 }} />
        </div>
      )}

      {/* ── Welcome / countdown ── */}
      <div className="max-w-xl mx-auto text-center px-8 py-12">
        {event?.welcome_message && (
          <p className="mn-body text-gray-500 leading-relaxed text-base mb-8" style={{ borderTop: `1px solid #eee`, paddingTop: 32 }}>
            {event.welcome_message}
          </p>
        )}
        {event?.event_date && <CountdownWidget eventDate={event.event_date} primaryColor={c} />}
        {event?.seed_type && (
          <p className="mn-body text-xs tracking-[0.3em] uppercase mt-8" style={{ color: c + "77" }}>
            🌱 {event.seed_type}
          </p>
        )}
        {/* Hairline */}
        <div style={{ width: "100%", height: 1, background: "#f0f0f0", marginTop: 48 }} />
      </div>

      {/* ── Sections ── */}
      <div className="pb-24">
        {children}
      </div>

      {/* ── Footer ── */}
      <footer className="py-16 px-8 text-center" style={{ borderTop: "1px solid #f0f0f0" }}>
        <p className="mn-head font-light text-3xl mb-4" style={{ color: "#ddd", letterSpacing: "-0.02em" }}>{event?.couple_names}</p>
        <p className="mn-body text-xs tracking-[0.5em] uppercase" style={{ color: "#ccc" }}>Fleurs en fête</p>
      </footer>
    </div>
  );
}
