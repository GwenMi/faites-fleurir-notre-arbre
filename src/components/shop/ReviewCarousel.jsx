import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

export default function ReviewCarousel() {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const allReviews = await base44.entities.Review.list('-created_date', 100);
        const filteredReviews = allReviews.filter(r => r.rating >= 4);
        setReviews(filteredReviews);
      } catch (err) {
        console.error("Erreur chargement avis:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();

    const unsubscribe = base44.entities.Review.subscribe((event) => {
      if (event.type === 'create' && event.data.rating >= 4) {
        setReviews(prev => [event.data, ...prev]);
      }
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="px-6 md:px-12 py-16 max-w-4xl mx-auto text-center">
        <p className="text-gray-400">Chargement des avis...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  const currentReview = reviews[currentIndex];

  return (
    <div className="px-6 md:px-12 py-16 max-w-4xl mx-auto text-center">
      <p className="font-sans-shop text-xs tracking-[0.3em] uppercase text-rose-400 mb-2">Avis clients</p>
      <h2 className="font-serif-shop text-4xl font-bold text-gray-800 mb-10">Ils nous ont fait confiance</h2>

      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm max-w-2xl mx-auto relative">
        <div className="flex gap-0.5 justify-center mb-4">
          {Array.from({ length: currentReview.rating }).map((_, s) => (
            <Star key={s} className="w-5 h-5 text-amber-400 fill-amber-400" />
          ))}
        </div>

        <p className="font-sans-shop text-lg text-gray-600 leading-relaxed mb-6 italic">
          "{currentReview.message}"
        </p>

        <p className="font-sans-shop text-sm font-bold text-gray-800">{currentReview.pseudo}</p>

        {reviews.length > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={handlePrev}
              className="p-2 hover:bg-rose-50 rounded-full transition"
              aria-label="Avis précédent"
            >
              <ChevronLeft className="w-5 h-5 text-rose-400" />
            </button>

            <div className="flex gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition ${
                    i === currentIndex ? "bg-rose-400" : "bg-gray-300"
                  }`}
                  aria-label={`Aller à l'avis ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="p-2 hover:bg-rose-50 rounded-full transition"
              aria-label="Avis suivant"
            >
              <ChevronRight className="w-5 h-5 text-rose-400" />
            </button>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-4">
          {currentIndex + 1} / {reviews.length}
        </p>
      </div>
    </div>
  );
}