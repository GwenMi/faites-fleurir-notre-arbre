import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { X, ChevronLeft, ChevronRight, Play, Pause, Download, ZoomIn, User, Calendar, Filter } from "lucide-react";

function Slideshow({ photos, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const [playing, setPlaying] = useState(false);

  const prev = useCallback(() => setCurrent(i => (i - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setCurrent(i => (i + 1) % photos.length), [photos.length]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next, onClose]);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(next, 3000);
    return () => clearTimeout(t);
  }, [playing, current, next]);

  const photo = photos[current];

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={onClose}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
        <span className="text-white/60 text-sm">{current + 1} / {photos.length}</span>
        <div className="flex items-center gap-3">
          <button onClick={() => setPlaying(p => !p)}
            className="text-white/70 hover:text-white transition p-2 rounded-full hover:bg-white/10">
            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <a href={photo.image} download target="_blank" rel="noopener noreferrer"
            className="text-white/70 hover:text-white transition p-2 rounded-full hover:bg-white/10">
            <Download className="w-5 h-5" />
          </a>
          <button onClick={onClose} className="text-white/70 hover:text-white transition p-2 rounded-full hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center relative px-12 min-h-0" onClick={e => e.stopPropagation()}>
        <button onClick={prev}
          className="absolute left-2 md:left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <img
          key={photo.id}
          src={photo.image}
          alt={photo.guest_name}
          className="max-h-full max-w-full object-contain rounded-lg select-none"
          style={{ maxHeight: "calc(100vh - 160px)" }}
        />
        <button onClick={next}
          className="absolute right-2 md:right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Caption */}
      <div className="px-6 py-4 text-center flex-shrink-0" onClick={e => e.stopPropagation()}>
        <p className="text-white font-semibold text-sm">{photo.guest_name}</p>
        {photo.message && <p className="text-white/60 text-xs mt-0.5">{photo.message}</p>}
        <p className="text-white/40 text-xs mt-1">
          {new Date(photo.created_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-1.5 px-4 pb-4 overflow-x-auto flex-shrink-0 justify-center" onClick={e => e.stopPropagation()}>
        {photos.map((p, i) => (
          <button key={p.id} onClick={() => setCurrent(i)}
            className={`flex-shrink-0 rounded-md overflow-hidden transition border-2 ${i === current ? "border-white" : "border-transparent opacity-50 hover:opacity-80"}`}>
            <img src={p.image} alt="" className="w-12 h-12 object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PhotoGallery({ event, primaryColor }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterGuest, setFilterGuest] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [slideshowIndex, setSlideshowIndex] = useState(null);

  useEffect(() => {
    if (!event?.id) return;
    base44.entities.Photo.filter({ event_id: event.id, approved: true }).then(data => {
      setPhotos(data || []);
      setLoading(false);
    });
  }, [event?.id]);

  if (loading || photos.length === 0) return null;

  // Build filter options
  const guests = ["all", ...Array.from(new Set(photos.map(p => p.guest_name).filter(Boolean)))];

  const dateGroups = Array.from(
    new Set(photos.map(p => p.created_date?.slice(0, 10)).filter(Boolean))
  ).sort((a, b) => b.localeCompare(a));
  const dateOptions = ["all", ...dateGroups];

  // Filter
  const filtered = photos.filter(p => {
    const guestMatch = filterGuest === "all" || p.guest_name === filterGuest;
    const dateMatch = filterDate === "all" || p.created_date?.startsWith(filterDate);
    return guestMatch && dateMatch;
  });

  return (
    <section className="py-12 px-4">
      {slideshowIndex !== null && (
        <Slideshow photos={filtered} startIndex={slideshowIndex} onClose={() => setSlideshowIndex(null)} />
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: primaryColor }}>Souvenirs</p>
        <h2 className="font-serif-elegant text-3xl font-bold text-gray-800">Galerie photos</h2>
        <div className="mx-auto mt-3 mb-0 gold-line max-w-[80px]" />
      </div>

      {/* Filters */}
      {(guests.length > 2 || dateGroups.length > 1) && (
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {guests.length > 2 && (
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <select value={filterGuest} onChange={e => setFilterGuest(e.target.value)}
                className="text-xs text-gray-600 bg-transparent border-0 outline-none cursor-pointer">
                <option value="all">Tous les invités</option>
                {guests.slice(1).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          )}
          {dateGroups.length > 1 && (
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <select value={filterDate} onChange={e => setFilterDate(e.target.value)}
                className="text-xs text-gray-600 bg-transparent border-0 outline-none cursor-pointer">
                <option value="all">Toutes les dates</option>
                {dateGroups.map(d => (
                  <option key={d} value={d}>
                    {new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                  </option>
                ))}
              </select>
            </div>
          )}
          {(filterGuest !== "all" || filterDate !== "all") && (
            <button onClick={() => { setFilterGuest("all"); setFilterDate("all"); }}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full px-3 py-1.5 transition">
              <X className="w-3 h-3" /> Réinitialiser
            </button>
          )}
        </div>
      )}

      {/* Count + diaporama button */}
      <div className="flex items-center justify-between mb-4 max-w-2xl mx-auto">
        <p className="text-xs text-gray-400">{filtered.length} photo{filtered.length !== 1 ? "s" : ""}</p>
        {filtered.length > 0 && (
          <button onClick={() => setSlideshowIndex(0)}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full text-white shadow-sm transition hover:opacity-90"
            style={{ background: primaryColor }}>
            <Play className="w-3.5 h-3.5" /> Diaporama
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-8">Aucune photo pour ce filtre.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-2xl mx-auto">
          {filtered.map((photo, i) => (
            <button key={photo.id} onClick={() => setSlideshowIndex(i)}
              className="group relative rounded-2xl overflow-hidden aspect-square shadow-sm hover:shadow-md transition-all">
              <img src={photo.image} alt={photo.guest_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 group-hover:opacity-100 transition">
                <p className="text-white text-xs font-semibold truncate">{photo.guest_name}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}