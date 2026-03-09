import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Camera, X, Upload, Flower2, Trophy } from "lucide-react";

export default function PostUploadModal({ type, eventId, guest, challenge, onClose, onSuccess }) {
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const isFlower = type === "flower";

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      toast.error("Veuillez choisir une photo");
      return;
    }
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });
    await base44.entities.FlowerPost.create({
      event_id: eventId,
      user_pseudo: guest.pseudo,
      user_email: guest.email,
      type,
      image: file_url,
      caption: caption.trim() || undefined,
    });

    // Notify the event owner
    const events = await base44.entities.Event.filter({ id: eventId }).catch(() => []);
    const event = events?.[0];
    if (event?.created_by) {
      const label = isFlower ? "🌸 fleur" : "🎭 défi";
      await base44.integrations.Core.SendEmail({
        to: event.created_by,
        subject: `Nouvelle ${label} partagée — ${event.couple_names}`,
        body: `Bonjour,\n\n${guest.pseudo} vient de partager une ${label} sur votre page "${event.couple_names}".\n${caption ? `\nCaption : "${caption}"` : ""}\n\nConnectez-vous à votre tableau de bord pour modérer les photos.\n\nFleurs de fête 🌸`,
      }).catch(() => {});
    }

    toast.success(isFlower ? "Votre fleur est partagée ! 🌸" : "Gage relevé avec brio ! 🎭");
    setUploading(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-5 text-white ${isFlower ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-gradient-to-r from-orange-400 to-amber-500"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isFlower ? <Flower2 className="w-6 h-6" /> : <Trophy className="w-6 h-6" />}
              <div>
                <h3 className="font-semibold text-lg">
                  {isFlower ? "Partager ma fleur 🌸" : "Relever le défi 🎭"}
                </h3>
                <p className="text-white/80 text-xs">
                  {isFlower ? "Montrez au monde votre belle fleur !" : challenge?.challenge_secret || "Relevez le gage !"}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="bg-white/20 rounded-full p-1.5 hover:bg-white/30 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Photo upload */}
          <div>
            <Label className="text-xs text-gray-500 mb-2 block">Photo *</Label>
            <label className="block cursor-pointer">
              {preview ? (
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={preview} className="w-full h-52 object-cover" alt="preview" />
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setPreview(null); setImageFile(null); }}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              ) : (
                <div className={`w-full h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 hover:bg-gray-50 transition ${isFlower ? "border-green-300 bg-green-50/30" : "border-orange-300 bg-orange-50/30"}`}>
                  <Camera className={`w-10 h-10 ${isFlower ? "text-green-400" : "text-orange-400"}`} />
                  <p className="text-sm text-gray-500 font-medium">Choisir une photo</p>
                  <p className="text-xs text-gray-400">Depuis votre galerie ou appareil photo</p>
                </div>
              )}
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
            </label>
          </div>

          {/* Caption */}
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Petit message (optionnel)</Label>
            <Input
              placeholder={isFlower ? "Ma belle fleur a poussé en 3 semaines !" : "J'assume mon gage ! 😄"}
              value={caption}
              onChange={e => setCaption(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={uploading || !imageFile}
            className={`w-full h-13 rounded-2xl font-semibold text-white text-base ${isFlower ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-gradient-to-r from-orange-400 to-amber-500"} hover:opacity-90 transition`}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Envoi en cours..." : isFlower ? "Partager ma fleur 🌸" : "Publier mon gage 🎭"}
          </Button>
        </div>
      </div>
    </div>
  );
}