import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Star, Loader2 } from "lucide-react";

export default function ReviewsList({ productId, eventId, limit = 6 }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [productId, eventId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      let query = { approved: true };
      if (productId) query.product_id = productId;
      
      const data = await base44.entities.Review.filter(query, "-created_date", 50);
      setReviews(data || []);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const displayedReviews = showAll ? reviews : reviews.slice(0, limit);
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-5 h-5 text-rose-300 animate-spin" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-sm font-sans-clean">Aucun avis pour le moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
              />
            ))}
          </div>
          <p className="font-sans-clean font-semibold text-gray-800">
            <span className="text-lg">{avgRating}</span>
            <span className="text-xs text-gray-500 ml-1">({reviews.length} avis)</span>
          </p>
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {displayedReviews.map((review) => (
          <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-sans-clean font-semibold text-gray-800 text-sm">{review.customer_name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < (review.rating || 0) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(review.created_date).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
            </div>

            {/* Photo si présente */}
            {review.photo_url && (
              <div className="mb-3 h-32 overflow-hidden rounded-lg">
                <img src={review.photo_url} alt="Review" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Commentaire */}
            <p className="font-sans-clean text-sm text-gray-700 leading-relaxed">{review.comment}</p>

            {/* Badge vérifié */}
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                ✓ Achat vérifié
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Show more */}
      {!showAll && reviews.length > limit && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-2 text-sm font-semibold text-rose-500 hover:text-rose-600 transition border border-rose-200 rounded-lg hover:bg-rose-50"
        >
          Voir tous les avis ({reviews.length})
        </button>
      )}
    </div>
  );
}