import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export default function BestOfSection({ event }) {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    loadPhotos();
  }, [event?.id]);

  const loadPhotos = async () => {
    try {
      const data = await base44.entities.Photo.filter({ event_id: event.id });
      setPhotos(data || []);
    } catch {}
  };

  if (photos.length === 0) {
    return (
      <section className="py-12">
        <h2 className="font-serif-elegant text-3xl font-bold mb-6 text-gray-900">✨ Best-of</h2>
        <p className="text-center text-gray-400 py-8">Photos à venir</p>
      </section>
    );
  }

  return (
    <section className="py-12">
      <h2 className="font-serif-elegant text-3xl font-bold mb-8 text-gray-900">✨ Best-of</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.slice(0, 6).map((photo) => (
          <div key={photo.id} className="aspect-square rounded-lg overflow-hidden bg-gray-200">
            <img src={photo.photo_url} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
}