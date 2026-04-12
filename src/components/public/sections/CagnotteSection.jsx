export default function CagnotteSection({ event }) {
  if (!event.show_cagnotte || !event.cagnotte_url) {
    return null;
  }

  return (
    <section className="py-12 border-t border-gray-100">
      <h2 className="font-serif-elegant text-3xl font-bold mb-6 text-gray-900">💰 Cagnotte solidaire</h2>
      {event.cagnotte_message && (
        <p className="text-gray-700 text-center mb-6">{event.cagnotte_message}</p>
      )}
      <div className="text-center">
        <a
          href={event.cagnotte_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition"
        >
          Contribuer à la cagnotte 💚
        </a>
      </div>
    </section>
  );
}