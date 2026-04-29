import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";

export default function PhotoGallerySection({ event }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    base44.entities.Photo.filter({ event_id: event.id, approved: true }, "-created_date")
      .then(data => setPhotos(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [event.id]);

  if (loading) return null;

  if (photos.length === 0) {
    return (
      <section className="py-8">
        <h2 className="font-serif-elegant text-3xl font-bold mb-6 text-gray-900">🖼️ Galerie photos</h2>
        <div className="p-12 bg-gray-50 rounded-xl text-center border-2 border-dashed border-gray-200">
          <p className="text-gray-400 mb-2">📸 Galerie en construction</p>
          <p className="text-sm text-gray-400">Les photos seront publiées après l'événement</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <h2 className="font-serif-elegant text-3xl font-bold mb-6 text-gray-900">🖼️ Galerie photos</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="aspect-square rounded-xl overflow-hidden bg-gray-200 cursor-pointer hover:opacity-90 transition"
            onClick={() => setLightbox(photo)}
          >
            <img src={photo.url} alt={photo.caption || ""} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {lightbox && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <img src={lightbox.url} alt={lightbox.caption || ""} className="w-full rounded-2xl object-contain max-h-[80vh]" />
            {lightbox.caption && <p className="text-white text-sm text-center mt-3 opacity-80">{lightbox.caption}</p>}
            <button onClick={() => setLightbox(null)} className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-md">
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}