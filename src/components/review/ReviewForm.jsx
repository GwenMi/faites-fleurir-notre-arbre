import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Star, Upload, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ReviewForm({ orderId, productId, productName, onSuccess }) {
  const [step, setStep] = useState("email"); // email | form | success
  const [email, setEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier format et taille
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Format accepté : JPG, PNG, WebP");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Taille max : 5 MB");
      return;
    }

    setPhoto(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    
    if (!customerName.trim() || rating === 0 || !comment.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    try {
      let photoUrl = null;

      // Upload photo si présente
      if (photo) {
        const uploadRes = await base44.integrations.Core.UploadFile({ file: photo });
        photoUrl = uploadRes.file_url;
      }

      // Créer l'avis
      await base44.entities.Review.create({
        order_id: orderId,
        product_id: productId,
        product_name: productName,
        customer_name: customerName.trim(),
        email: email.trim(),
        rating,
        comment: comment.trim(),
        photo_url: photoUrl,
        approved: false, // Modération requise
      });

      toast.success("Avis soumis ! Il sera publié après modération.");
      setStep("success");
      if (onSuccess) onSuccess();

      // Reset
      setTimeout(() => {
        setStep("email");
        setEmail("");
        setCustomerName("");
        setRating(0);
        setComment("");
        setPhoto(null);
        setPhotoPreview(null);
      }, 2000);
    } catch (error) {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  // Step: Vérification email
  if (step === "email") {
    return (
      <form onSubmit={(e) => { e.preventDefault(); if (email.trim()) setStep("form"); }} className="space-y-3">
        <Input
          type="email"
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-10 text-sm"
        />
        <Button
          type="submit"
          disabled={!email.trim()}
          className="w-full h-10 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold"
        >
          Continuer
        </Button>
      </form>
    );
  }

  // Step: Formulaire avis
  if (step === "form") {
    return (
      <form onSubmit={submitReview} className="space-y-4">
        {/* Email affiché */}
        <div className="text-xs text-gray-500 flex items-center justify-between">
          <span>{email}</span>
          <button
            type="button"
            onClick={() => setStep("email")}
            className="text-rose-500 hover:text-rose-600"
          >
            Changer
          </button>
        </div>

        {/* Nom */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Votre nom</label>
          <Input
            type="text"
            placeholder="Ex: Sophie D."
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            className="h-10 text-sm"
          />
        </div>

        {/* Note étoiles */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">Note</label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-5 h-5 ${
                    (hoveredRating || rating) >= star
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Commentaire */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Votre avis</label>
          <textarea
            placeholder="Partagez votre expérience avec ce kit fleur..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            required
            className="w-full h-24 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
          <p className="text-xs text-gray-400 mt-1">{comment.length}/500</p>
        </div>

        {/* Photo optionnelle */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">Photo (optionnelle)</label>
          {photoPreview ? (
            <div className="relative">
              <img src={photoPreview} alt="preview" className="w-full h-32 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 w-full h-20 border-2 border-dashed border-rose-200 rounded-lg cursor-pointer hover:border-rose-400 hover:bg-rose-50 transition">
              <Upload className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-medium text-gray-700">Cliquez pour ajouter une photo</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </label>
          )}
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · Max 5 MB</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setStep("email");
              setCustomerName("");
              setRating(0);
              setComment("");
              setPhoto(null);
              setPhotoPreview(null);
            }}
            className="flex-1 h-10"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading || !customerName.trim() || rating === 0 || !comment.trim()}
            className="flex-1 h-10 bg-rose-500 hover:bg-rose-600 text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Publier l'avis
          </Button>
        </div>
      </form>
    );
  }

  // Step: Succès
  return (
    <div className="text-center py-8">
      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
        <span className="text-xl">✓</span>
      </div>
      <h3 className="font-semibold text-gray-800 text-sm mb-1">Avis soumis !</h3>
      <p className="text-xs text-gray-500">
        Merci ! Il sera publié après modération.
      </p>
    </div>
  );
}