import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function AddReviewModal({
  productId,
  productName,
  orderId,
  user,
  onClose,
  onReviewAdded
}) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError("Veuillez sélectionner une note");
      return;
    }

    if (!comment.trim()) {
      setError("Veuillez écrire un commentaire");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const newReview = await base44.entities.Review.create({
        order_id: orderId,
        product_id: productId,
        product_name: productName,
        customer_name: user.full_name || user.email,
        rating,
        comment: comment.trim(),
        approved: false // En attente de modération
      });

      onReviewAdded(newReview);
    } catch (err) {
      setError("Erreur lors de l'envoi de l'avis. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="font-serif-shop text-xl font-bold text-gray-800">
            Laisser un avis
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Produit */}
          <div>
            <p className="text-sm text-gray-600 mb-1">Produit</p>
            <p className="font-semibold text-gray-800">{productName}</p>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Votre note
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {["", "Mauvais", "Acceptable", "Bon", "Très bon", "Excellent"][rating]}
              </p>
            )}
          </div>

          {/* Commentaire */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Votre commentaire
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience avec ce produit..."
              className="resize-none"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 caractères
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {rating > 0 && comment.trim() && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              ✓ Votre avis sera modéré avant publication
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || rating === 0 || !comment.trim()}
              className="flex-1 bg-rose-400 hover:bg-rose-500 disabled:opacity-50"
            >
              {loading ? "Envoi..." : "Publier l'avis"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}