export default function CoupleStorySection({ event, primaryColor }) {
  return (
    <section className="py-12 px-4">
      <div className="text-center mb-8">
        <p className="text-xs tracking-[0.3em] uppercase font-semibold mb-3" style={{ color: primaryColor }}>Notre histoire</p>
        <h2 className="font-serif-elegant text-3xl font-bold text-gray-800 mb-3">{event.couple_names}</h2>
        <div className="h-px max-w-xs mx-auto" style={{ background: `linear-gradient(90deg, transparent, ${primaryColor}88, transparent)` }} />
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 max-w-xl mx-auto">
        <p className="font-sans-clean text-gray-600 text-base leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: `'${event.font_body || "Lato"}', system-ui, sans-serif` }}>
          {event.couple_story}
        </p>
        <div className="mt-5 text-center text-2xl">💍</div>
      </div>
    </section>
  );
}