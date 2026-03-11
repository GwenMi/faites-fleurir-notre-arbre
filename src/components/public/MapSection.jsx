import { MapPin, Navigation } from "lucide-react";

export default function MapSection({ event, primaryColor }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.map_address)}`;
  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <p className="text-xs tracking-[0.3em] uppercase font-semibold mb-3" style={{ color: primaryColor }}>Plan d'accès</p>
        <h2 className="font-serif-elegant text-3xl font-bold text-gray-800">Nous y serons</h2>
        <div className="h-px max-w-xs mx-auto mt-3" style={{ background: `linear-gradient(90deg, transparent, ${primaryColor}88, transparent)` }} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Address bar */}
        <div className="flex items-center justify-between px-5 py-4 gap-3 border-b border-gray-100">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: primaryColor }} />
            <p className="text-sm font-semibold text-gray-700 truncate">{event.map_address}</p>
          </div>
          <a href={mapsUrl} target="_blank" rel="noreferrer"
            className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full text-white transition hover:opacity-90"
            style={{ background: primaryColor }}>
            <Navigation className="w-3.5 h-3.5" /> Itinéraire
          </a>
        </div>

        {/* Map embed or fallback */}
        {event.map_embed_url ? (
          <div className="h-56 sm:h-72">
            <iframe src={event.map_embed_url} width="100%" height="100%" className="border-0" loading="lazy" title="Plan d'accès" />
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center bg-gray-50">
            <a href={mapsUrl} target="_blank" rel="noreferrer"
              className="text-sm font-semibold flex items-center gap-2 hover:underline" style={{ color: primaryColor }}>
              <MapPin className="w-4 h-4" /> Voir sur Google Maps
            </a>
          </div>
        )}
      </div>
    </section>
  );
}