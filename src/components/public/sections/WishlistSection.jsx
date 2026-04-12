import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export default function WishlistSection({ event }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadWishlist();
  }, [event?.id]);

  const loadWishlist = async () => {
    try {
      const data = await base44.entities.WishlistItem.filter({ event_id: event.id }, "order");
      setItems(data || []);
    } catch {}
  };

  if (items.length === 0) {
    return (
      <section className="py-12">
        <h2 className="font-serif-elegant text-3xl font-bold mb-6 text-gray-900">💝 Liste de cadeaux</h2>
        <p className="text-center text-gray-400 py-8">Aucun cadeau pour le moment</p>
      </section>
    );
  }

  return (
    <section className="py-12">
      <h2 className="font-serif-elegant text-3xl font-bold mb-8 text-gray-900">💝 Liste de cadeaux</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
            {item.image_url && (
              <img src={item.image_url} alt={item.title} className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
              <h3 className="font-semibold text-gray-800">{item.title}</h3>
              {item.description && <p className="text-sm text-gray-600 mt-2">{item.description}</p>}
              {item.price && <p className="text-lg font-bold text-rose-500 mt-3">{item.price}€</p>}
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-sm text-rose-500 font-semibold hover:underline"
                >
                  Voir le produit →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}