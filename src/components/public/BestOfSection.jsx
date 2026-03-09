import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Star } from "lucide-react";

export default function BestOfSection({ event, primaryColor }) {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    if (!event?.id) return;
    base44.entities.Photo.filter({ event_id: event.id, featured: true, approved: true })
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
          <Star className="w-5 h-5" style={{ color: primaryColor }} />
          <div className="h-px flex-1 max-w-16" style={{ background: `linear-gradient(to left, transparent, ${primaryColor}66)` }} />
        </div>
        <h2 className="font-serif-elegant text-3xl md:text-4xl font-bold text-gray-800">Le best of</h2>
        <p className="font-sans-clean text-sm text-gray-400 mt-1">Les photos sélectionnées par les mariés</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {photos.map(photo => (
          <div key={photo.id} className="relative rounded-2xl overflow-hidden aspect-square shadow-sm">
            <img src={photo.image} alt={photo.guest_name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            <div className="absolute top-2 right-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 drop-shadow" />
            </div>
            {photo.guest_name && (
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white text-xs font-semibold font-sans-clean truncate">{photo.guest_name}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}