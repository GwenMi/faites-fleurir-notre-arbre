import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Star } from "lucide-react";

function StarRow({ rating, size = "w-4 h-4" }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          className={size}
          fill={rating >= s ? "#f87171" : "none"}
          stroke={rating >= s ? "#f87171" : "#d1d5db"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export function StarSummary({ productId, reviews: reviewsProp }) {
  const reviews = (reviewsProp || []).filter(r => r.product_id === productId && r.approved);
  if (!reviews.length) return null;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return (
    <div className="flex items-center gap-1.5 mt-1">
      <StarRow rating={Math.round(avg)} size="w-3.5 h-3.5" />
      <span className="text-xs text-gray-500 font-sans-clean">{avg.toFixed(1)} ({reviews.length} avis)</span>
    </div>
  );
}

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Review.filter({ product_id: productId, approved: true }).then(data => {
      setReviews(data || []);
      setLoading(false);
    });
  }, [productId]);

  if (loading || reviews.length === 0) return null;

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 mb-4">
        <StarRow rating={Math.round(avg)} size="w-5 h-5" />
        <span className="font-serif-elegant text-lg font-bold text-gray-700">{avg.toFixed(1)}</span>
        <span className="font-sans-clean text-sm text-gray-400">{reviews.length} avis client{reviews.length > 1 ? "s" : ""}</span>
      </div>
      <div className="space-y-4">
        {reviews.map(r => (
          <div key={r.id} className="bg-rose-50 rounded-2xl px-5 py-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-sans-clean text-sm font-semibold text-gray-700">{r.customer_name}</span>
              <StarRow rating={r.rating} size="w-3.5 h-3.5" />
            </div>
            {r.comment && <p className="font-sans-clean text-sm text-gray-600 leading-relaxed">{r.comment}</p>}
            <p className="font-sans-clean text-xs text-gray-300 mt-2">
              {new Date(r.created_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}