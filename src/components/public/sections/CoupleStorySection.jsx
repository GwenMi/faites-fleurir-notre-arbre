export default function CoupleStorySection({ event }) {
  if (!event.couple_story) {
    return null;
  }

  return (
    <section className="py-12">
      <h2 className="font-serif-elegant text-3xl font-bold mb-6 text-gray-900">💕 Notre histoire</h2>
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-8 border border-rose-100">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{event.couple_story}</p>
      </div>
    </section>
  );
}