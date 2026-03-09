import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Star } from "lucide-react";

export default function BestOfSection({ event, primaryColor }) {
  const [photos, setPhotos] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    if (!event?.id) return;
    Promise.all([
      base44.entities.Photo.filter({ event_id: event.id, featured: true, approved: true }),
      base44.entities.GuestbookEntry.filter({ event_id: event.id, featured: true }),
    ]).then(([ph, en]) => {
      setPhotos(ph || []);
      setEntries(en || []);
      setLoaded(true);
    });
  }, [event?.id]);

  if (!loaded || (photos.length === 0 && entries.length === 0)) return null;

  return (
    <section className="py-12 px-4">
      {/* Section title */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Star className="w-5 h-5" style={{ color: primaryColor }} fill={primaryColor} />
          <h2 className="font-serif-elegant text-3xl md:text-4xl text-gray-800">Best of</h2>
          <Star className="w-5 h-5" style={{ color: primaryColor }} fill={primaryColor} />
        </div>
        <p className="font-sans-clean text-sm text-gray-400">Les coups de cœur des mariés</p>
        <div className="mt-3 max-w-xs mx-auto h-px" style={{ background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)` }} />
      </div>

      {/* Featured photos */}
      {photos.length > 0 && (
        <div className="mb-10">
          <div className={`grid gap-3 ${photos.length === 1 ? "grid-cols-1 max-w-sm mx-auto" : photos.length === 2 ? "grid-cols-2 max-w-lg mx-auto" : "grid-cols-2 md:grid-cols-3"}`}>
            {photos.map(photo => (
              <div key={photo.id}
                className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-lg transition-all"
                onClick={() => setLightbox(photo)}
              >
                <img src={photo.image} alt={photo.guest_name} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-xs font-semibold">{photo.guest_name}</p>
                  {photo.message && <p className="text-white/80 text-xs mt-0.5 line-clamp-2">{photo.message}</p>}
                </div>
                <div className="absolute top-2 right-2 p-1 rounded-full bg-amber-400/90">
                  <Star className="w-3 h-3 text-white" fill="white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured testimonials */}
      {entries.length > 0 && (
        <div className={`grid gap-4 ${entries.length === 1 ? "grid-cols-1 max-w-md mx-auto" : "grid-cols-1 md:grid-cols-2"}`}>
          {entries.map(entry => (
            <div key={entry.id} className="relative bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="absolute top-4 right-4 p-1 rounded-full bg-amber-100">
                <Star className="w-3 h-3 text-amber-400" fill="currentColor" />
              </div>
              <p className="font-sans-clean text-gray-600 text-sm leading-relaxed italic mb-3">"{entry.message}"</p>
              <p className="font-sans-clean text-xs font-bold" style={{ color: primaryColor }}>— {entry.pseudo}</p>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <div className="max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <img src={lightbox.image} alt={lightbox.guest_name} className="w-full rounded-2xl" />
            {(lightbox.guest_name || lightbox.message) && (
              <div className="text-center mt-3">
                <p className="text-white font-semibold">{lightbox.guest_name}</p>
                {lightbox.message && <p className="text-white/70 text-sm mt-1">{lightbox.message}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}