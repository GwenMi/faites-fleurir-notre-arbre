export default function MapSection({ event }) {
  if (!event.map_address && !event.map_embed_url) {
    return null;
  }

  return (
    <section className="py-12">
      <h2 className="font-serif-elegant text-3xl font-bold mb-6 text-gray-900">📍 Localisation</h2>
      <div className="space-y-4">
        {event.map_address && (
          <p className="text-gray-700 text-center text-lg font-semibold">{event.map_address}</p>
        )}
        {event.map_embed_url && (
          <div className="rounded-xl overflow-hidden border border-gray-200 h-96">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              src={event.map_embed_url}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        )}
      </div>
    </section>
  );
}