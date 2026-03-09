import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Camera, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

function Lightbox({ photos, index, onClose }) {
  const [current, setCurrent] = useState(index);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft") setCurrent(i => (i - 1 + photos.length) % photos.length);
      if (e.key === "ArrowRight") setCurrent(i => (i + 1) % photos.length);
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [photos.length, onClose]);

  const photo = photos[current];
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white p-2">
        <X className="w-5 h-5" />
      </button>
      <button onClick={e => { e.stopPropagation(); setCurrent(i => (i - 1 + photos.length) % photos.length); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-full text-white hover:bg-white/20">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <img src={photo.image} alt={photo.guest_name}
        className="max-h-[82vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
        onClick={e => e.stopPropagation()} />
      <button onClick={e => { e.stopPropagation(); setCurrent(i => (i + 1) % photos.length); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-full text-white hover:bg-white/20">
        <ChevronRight className="w-6 h-6" />
      </button>
      <div className="mt-3 text-center" onClick={e => e.stopPropagation()}>
        {photo.guest_name && <p className="text-white text-sm font-semibold">{photo.guest_name}</p>}
        {photo.message && <p className="text-white/60 text-xs mt-0.5">{photo.message}</p>}
      </div>
      <p className="text-white/30 text-xs mt-2">{current + 1} / {photos.length}</p>
    </div>
  );
}

export default function PhotoGallery({ event, primaryColor }) {
  const [photos, setPhotos] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    if (!event?.id) return;
    base44.entities.Photo.filter({ event_id: event.id, approved: true, type: "wedding" })
      .then(res => setPhotos(res || []));
  }, [event?.id]);

  if (photos.length === 0) return null;

  return (
    <div className="px-4 py-12">
      <style>{`
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
      `}</style>

      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-px flex-1 max-w-16" style={{ background: `linear-gradient(to right, transparent, ${primaryColor}66)` }} />
          <Camera className="w-5 h-5" style={{ color: primaryColor }} />
          <div className="h-px flex-1 max-w-16" style={{ background: `linear-gradient(to left, transparent, ${primaryColor}66)` }} />
        </div>
        <h2 className="font-serif-elegant text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Album du mariage
        </h2>
        <p className="font-sans-clean text-sm text-gray-400">{photos.length} photo{photos.length > 1 ? "s" : ""} partagée{photos.length > 1 ? "s" : ""}</p>
      </div>

      <div className="columns-2 md:columns-3 gap-2 space-y-2">
        {photos.map((photo, i) => (
          <div key={photo.id}
            className="relative group cursor-pointer overflow-hidden rounded-xl break-inside-avoid"
            onClick={() => setLightboxIndex(i)}>
            <img src={photo.image} alt={photo.guest_name}
              className="w-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition" />
            </div>
            {photo.guest_name && (
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition">
                <p className="text-white text-xs font-semibold truncate">{photo.guest_name}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox photos={photos} index={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </div>
  );
}