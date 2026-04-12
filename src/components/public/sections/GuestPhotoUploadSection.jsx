import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { toast } from "sonner";

export default function GuestPhotoUploadSection({ event }) {
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState([]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.Photo.create({
        event_id: event.id,
        photo_url: file_url,
        uploaded_by: "guest",
      });
      toast.success("Photo ajoutée ! 📸");
    } catch {
      toast.error("Erreur lors du téléchargement");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="py-12">
      <h2 className="font-serif-elegant text-3xl font-bold mb-6 text-gray-900">📸 Partagez vos photos</h2>
      <div className="mb-6">
        <label className="block">
          <div className="w-full p-8 border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer hover:border-rose-400 hover:bg-rose-50 transition">
            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="font-semibold text-gray-700">Télécharger une photo</p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG jusqu'à 10MB</p>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>
    </section>
  );
}