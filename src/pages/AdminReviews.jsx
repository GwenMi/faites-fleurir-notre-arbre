import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Star, Check, X, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminGuard from "@/components/admin/AdminGuard";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending"); // "pending" | "approved" | "all"

  useEffect(() => {
    const loadData = async () => {
      const allReviews = await base44.entities.Review.list('-created_date', 100);
      setReviews(allReviews);
      setLoading(false);
    };
    loadData();

    // Abonnement aux mises à jour
    const unsubscribe = base44.entities.Review.subscribe((event) => {
      setReviews(prev => {
        if (event.type === 'create') {
          return [event.data, ...prev];
        } else if (event.type === 'update') {
          return prev.map(r => r.id === event.id ? event.data : r);
        } else if (event.type === 'delete') {
          return prev.filter(r => r.id !== event.id);
        }
        return prev;
      });
    });

    return unsubscribe;
  }, []);

  const filteredReviews = reviews.filter(r => {
    if (filter === "pending") return !r.approved;
    if (filter === "approved") return r.approved;
    return true;
  });

  const handleApprove = async (reviewId) => {
    try {
      await base44.entities.Review.update(reviewId, { approved: true });
    } catch (err) {
      console.error("Erreur lors de l'approbation:", err);
    }
  };

  const handleReject = async (reviewId) => {
    try {
      await base44.entities.Review.delete(reviewId);
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Accès réservé aux administrateurs.</p>
          <a href={createPageUrl("Home")} className="text-rose-600 hover:text-rose-700">
            Retourner à l'accueil
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        .font-serif-shop { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-shop { font-family: 'Lato', system-ui, sans-serif; }
      `}</style>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-gray-200 bg-white">
        <a href={createPageUrl("AdminDashboard")} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-sans-shop">Tableau de bord</span>
        </a>
        <h1 className="font-serif-shop text-2xl font-bold text-gray-800">Gestion des avis</h1>
        <div className="w-20"></div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-gray-800">
              {reviews.filter(r => !r.approved).length}
            </p>
            <p className="text-sm text-gray-600 mt-1">En attente de modération</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-green-600">
              {reviews.filter(r => r.approved).length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Approuvés</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-gray-800">
              {reviews.length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-8">
          <Button
            onClick={() => setFilter("pending")}
            variant={filter === "pending" ? "default" : "outline"}
          >
            En attente ({reviews.filter(r => !r.approved).length})
          </Button>
          <Button
            onClick={() => setFilter("approved")}
            variant={filter === "approved" ? "default" : "outline"}
          >
            Approuvés ({reviews.filter(r => r.approved).length})
          </Button>
          <Button
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "default" : "outline"}
          >
            Tous ({reviews.length})
          </Button>
        </div>

        {/* Liste des avis */}
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">
              {filter === "pending"
                ? "Aucun avis en attente de modération"
                : filter === "approved"
                ? "Aucun avis approuvé"
                : "Aucun avis"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map(review => (
              <div
                key={review.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-800">
                        {review.customer_name}
                      </h3>
                      <Badge
                        className={
                          review.approved
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {review.approved ? "Approuvé" : "En attente"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      Produit : <strong>{review.product_name}</strong>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(review.created_date).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* Note */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Commentaire */}
                <p className="text-gray-700 mb-5 bg-gray-50 p-4 rounded-lg">
                  {review.comment}
                </p>

                {/* Actions */}
                {!review.approved && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApprove(review.id)}
                      className="bg-green-600 hover:bg-green-700 gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Approuver
                    </Button>
                    <Button
                      onClick={() => handleReject(review.id)}
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 gap-2"
                    >
                      <X className="w-4 h-4" />
                      Rejeter
                    </Button>
                  </div>
                )}

                {review.approved && (
                  <Button
                    onClick={() => handleReject(review.id)}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}