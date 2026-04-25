import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

export default function ReviewsSlider() {
  const [reviews, setReviews] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    base44.entities.Review.filter({ approved: true }, "-created_date", 20).then(data => {
      setReviews(data?.filter(r => r.comment) || []);
    });
  }, []);

  if (reviews.length === 0) return null;

  const prev = () => setCurrent(i => (i === 0 ? reviews.length - 1 : i - 1));
  const next = () => setCurrent(i => (i === reviews.length - 1 ? 0 : i + 1));

  const review = reviews[current];
  const avgRating = (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1);

  return (
    <div className="px-6 md:px-12 py-16 bg-gradient-to-br from-rose-50 to-pink-50">
      <div className="max-w-2xl mx-auto text-center">
        <p className="font-sans-clean text-xs tracking-[0.3em] uppercase text-rose-400 mb-2">Ils nous font confiance</p>
        <h2 className="font-serif-elegant text-4xl font-bold text-gray-800 mb-2">Avis clients</h2>

        {/* Moyenne */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
            ))}
          </div>
          <span className="font-sans-clean text-sm font-semibold text-gray-700">{avgRating} / 5</span>
          <span className="font-sans-clean text-xs text-gray-400">({reviews.length} avis)</span>
        </div>

        {/* Card avis */}
        <div className="bg-white rounded-3xl shadow-md px-8 py-8 mb-6 min-h-[160px] flex flex-col items-center justify-center relative">
          <div className="flex gap-0.5 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-5 h-5 ${i < (review.rating || 0) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
            ))}
          </div>
          {review.photo_url && (
            <img src={review.photo_url} alt="fleur du client" className="w-20 h-20 object-cover rounded-2xl mb-4 shadow-sm" />
          )}
          <p className="font-serif-elegant text-xl text-gray-700 leading-relaxed mb-4 italic">
            "{review.comment}"
          </p>
          <p className="font-sans-clean text-sm font-semibold text-gray-800">{review.customer_name}</p>
          {review.product_name && (
            <p className="font-sans-clean text-xs text-gray-400 mt-0.5">{review.product_name}</p>
          )}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold mt-2">
            ✓ Achat vérifié
          </span>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={prev} className="w-9 h-9 rounded-full border border-rose-200 flex items-center justify-center hover:bg-rose-50 transition">
            <ChevronLeft className="w-4 h-4 text-rose-400" />
          </button>
          <div className="flex gap-1.5">
            {reviews.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`rounded-full transition-all ${i === current ? "w-5 h-2 bg-rose-400" : "w-2 h-2 bg-rose-200"}`}
              />
            ))}
          </div>
          <button onClick={next} className="w-9 h-9 rounded-full border border-rose-200 flex items-center justify-center hover:bg-rose-50 transition">
            <ChevronRight className="w-4 h-4 text-rose-400" />
          </button>
        </div>
      </div>
    </div>
  );
}