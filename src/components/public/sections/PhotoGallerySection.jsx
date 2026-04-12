import { useState } from "react";

export default function PhotoGallerySection({ event }) {
  const [photos, setPhotos] = useState([]);

  if (photos.length === 0) {
    return (
      <section>
        <h2 className="font-serif-elegant text-3xl font-bold mb-6 text-gray-900">🖼️ Galerie photos</h2>
        <div className="p-12 bg-gray-50 rounded-xl text-center border-2 border-dashed border-gray-200">
          <p className="text-gray-400 mb-2">📸 Galerie en construction</p>
          <p className="text-sm text-gray-400">Les photos seront publiées après l'événement</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="font-serif-elegant text-3xl font-bold mb-6 text-gray-900">🖼️ Galerie photos</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="aspect-square rounded-lg overflow-hidden bg-gray-200">
            <img src={photo.url} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
}