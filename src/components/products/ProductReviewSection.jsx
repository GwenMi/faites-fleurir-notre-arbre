import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Star, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddReviewModal from "./AddReviewModal";

export default function ProductReviewSection({ productId, productName, orderId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);
  const [user, setUser] = useState(null);
  const [userHasOrdered, setUserHasOrdered] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger l'utilisateur
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Charger les avis approuvés
        const productReviews = await base44.entities.Review.filter({
          product_id: productId,
          approved: true
        }, '-created_date', 10);
        setReviews(productReviews);

        // Vérifier si l'utilisateur a une commande pour ce produit
        if (currentUser && orderId) {
          const userOrders = await base44.entities.Order.filter({
            customer_email: currentUser.email,
            product_id: productId
          });
          setUserHasOrdered(userOrders.length > 0);
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();

    // Abonnement aux nouvelles avis approuvés
    const unsubscribe = base44.entities.Review.subscribe((event) => {
      if (event.data?.product_id === productId && event.data?.approved) {
        if (event.type === 'create') {
          setReviews(prev => [event.data, ...prev].slice(0, 10));
        } else if (event.type === 'update') {
          setReviews(prev => prev.map(r => r.id === event.id ? event.data : r));
        }
      }
    });

    return unsubscribe;
  }, [productId, orderId]);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* En-tête des avis */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif-shop text-2xl font-bold text-gray-800">Avis clients</h3>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {averageRating && `${averageRating}/5`} ({reviews.length} avis)
              </span>
            </div>
          </div>

          {user && userHasOrdered && (
            <Button
              onClick={() => setShowAddReview(true)}
              className="bg-rose-400 hover:bg-rose-500 gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Laisser un avis
            </Button>
          )}
        </div>
      </div>

      {/* Modal d'ajout d'avis */}
      {showAddReview && (
        <AddReviewModal
          productId={productId}
          productName={productName}
          orderId={orderId}
          user={user}
          onClose={() => setShowAddReview(false)}
          onReviewAdded={(newReview) => {
            setReviews(prev => [newReview, ...prev].slice(0, 10));
            setShowAddReview(false);
          }}
        />
      )}

      {/* Liste des avis */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Chargement des avis...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">Aucun avis pour le moment</p>
          {user && userHasOrdered && (
            <p className="text-sm text-gray-500 mt-2">Soyez le premier à partager votre expérience !</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-800">{review.customer_name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(review.created_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 text-sm">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}