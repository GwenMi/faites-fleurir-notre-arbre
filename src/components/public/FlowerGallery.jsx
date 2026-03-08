import { useState } from "react";
import { Camera, Heart, MessageCircle, X, ChevronLeft, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function FlowerGallery({ event, photos, onPhotoAdded, tpl }) {
  const [showUpload, setShowUpload] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [form, setForm] = useState({ guest_name: "", message: "", image: null });
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const flowerPhotos = photos.filter((p) => p.type === "flower" && p.approved);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((f) => ({ ...f, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.guest_name || !form.image) {
      toast.error("Merci de renseigner votre prénom et une photo");
      return;
    }
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: form.image });
    await base44.entities.Photo.create({
      event_id: event.id,
      guest_name: form.guest_name,
      message: form.message,
      image: file_url,
      type: "flower",
      approved: false,
    });
    setUploading(false);
    setShowUpload(false);
    setForm({ guest_name: "", message: "", image: null });
    setPreview(null);
    toast.success("🌸 Votre fleur a rejoint notre arbre ! Elle sera visible après validation.");
    onPhotoAdded && onPhotoAdded();
  };

  return (
    <section className="px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: tpl.fontTitle, color: tpl.primary }}>
            🌻 Notre Arbre
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {flowerPhotos.length} fleur{flowerPhotos.length !== 1 ? "s" : ""} ont rejoint notre arbre
          </p>
        </div>
        <Button
          onClick={() => setShowUpload(!showUpload)}
          className="rounded-full px-4 py-2 text-sm font-semibold shadow-lg"
          style={{ background: tpl.primary, color: "white" }}
        >
          <Camera className="w-4 h-4 mr-1" /> Ma fleur
        </Button>
      </div>

      {showUpload && (
        <div className="mb-6 p-5 rounded-2xl border-2 border-dashed shadow-inner bg-white"
          style={{ borderColor: tpl.primary + "44" }}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-center font-semibold text-gray-700 mb-2">
              🌱 Partagez votre fleur
            </p>
            <Input
              placeholder="Votre prénom"
              value={form.guest_name}
              onChange={(e) => setForm((f) => ({ ...f, guest_name: e.target.value }))}
              className="rounded-xl text-base h-12"
            />
            <Textarea
              placeholder="Un petit mot pour les mariés..."
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              className="rounded-xl text-base"
              rows={2}
            />
            <label className="block cursor-pointer">
              {preview ? (
                <div className="relative">
                  <img src={preview} className="w-full h-48 object-cover rounded-xl" alt="preview" />
                  <button type="button" onClick={() => { setPreview(null); setForm(f => ({ ...f, image: null })); }}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              ) : (
                <div className="w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 text-gray-400 hover:bg-gray-50 transition"
                  style={{ borderColor: tpl.secondary }}>
                  <Camera className="w-8 h-8" />
                  <span className="text-sm">Appuyer pour ajouter une photo</span>
                </div>
              )}
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
            </label>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1 rounded-xl h-12" onClick={() => setShowUpload(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={uploading} className="flex-1 rounded-xl h-12 font-semibold"
                style={{ background: tpl.primary, color: "white" }}>
                {uploading ? "Envoi..." : "Envoyer 🌸"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {flowerPhotos.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <span className="text-4xl">🌱</span>
          <p className="mt-2 text-sm">Soyez le premier à partager votre fleur !</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {flowerPhotos.map((photo, idx) => (
            <div key={photo.id} className={`${tpl.cardStyle} overflow-hidden cursor-pointer`}
              onClick={() => setLightbox(idx)}>
              <img src={photo.image} alt={photo.guest_name} className="w-full h-40 object-cover" />
              <div className="p-2">
                <p className="text-xs font-semibold text-gray-700">{photo.guest_name}</p>
                {photo.message && <p className="text-xs text-gray-400 truncate">{photo.message}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setLightbox(null)}>
            <X className="w-8 h-8" />
          </button>
          <img src={flowerPhotos[lightbox]?.image} className="max-h-screen max-w-full rounded-xl object-contain"
            alt={flowerPhotos[lightbox]?.guest_name} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </section>
  );
}