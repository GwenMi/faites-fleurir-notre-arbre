import { useState } from "react";
import { Camera, Heart, MessageCircle, X, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function WeddingAlbum({ event, photos, comments, likes, onRefresh, tpl }) {
  const [showUpload, setShowUpload] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [form, setForm] = useState({ guest_name: "", message: "", image: null });
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [commentForm, setCommentForm] = useState({});
  const [showComments, setShowComments] = useState({});

  const weddingPhotos = photos.filter((p) => p.type === "wedding" && p.approved);

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
      type: "wedding",
      approved: false,
    });
    setUploading(false);
    setShowUpload(false);
    setForm({ guest_name: "", message: "", image: null });
    setPreview(null);
    toast.success("📸 Photo partagée ! Elle sera visible après validation.");
    onRefresh && onRefresh();
  };

  const handleLike = async (photoId) => {
    await base44.entities.Like.create({ photo_id: photoId });
    onRefresh && onRefresh();
  };

  const handleComment = async (photoId) => {
    const val = commentForm[photoId];
    if (!val?.name || !val?.message) return;
    await base44.entities.Comment.create({
      photo_id: photoId,
      guest_name: val.name,
      message: val.message,
    });
    setCommentForm((f) => ({ ...f, [photoId]: { name: "", message: "" } }));
    onRefresh && onRefresh();
  };

  const getLikes = (photoId) => likes.filter((l) => l.photo_id === photoId).length;
  const getComments = (photoId) => comments.filter((c) => c.photo_id === photoId);

  return (
    <section className="px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: tpl.fontTitle, color: tpl.primary }}>
            📸 Album du Mariage
          </h2>
          <p className="text-sm text-gray-500 mt-1">{weddingPhotos.length} photo{weddingPhotos.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => setShowUpload(!showUpload)} className="rounded-full px-4 text-sm font-semibold shadow-lg"
          style={{ background: tpl.primary, color: "white" }}>
          <Camera className="w-4 h-4 mr-1" /> Ajouter
        </Button>
      </div>

      {showUpload && (
        <div className="mb-6 p-5 rounded-2xl border-2 border-dashed shadow-inner bg-white"
          style={{ borderColor: tpl.primary + "44" }}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-center font-semibold text-gray-700 mb-2">📸 Partagez un souvenir</p>
            <Input placeholder="Votre prénom" value={form.guest_name}
              onChange={(e) => setForm((f) => ({ ...f, guest_name: e.target.value }))}
              className="rounded-xl text-base h-12" />
            <Textarea placeholder="Un message pour les mariés..." value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              className="rounded-xl text-base" rows={2} />
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
                <div className="w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 text-gray-400"
                  style={{ borderColor: tpl.secondary }}>
                  <Camera className="w-8 h-8" />
                  <span className="text-sm">Appuyer pour ajouter une photo</span>
                </div>
              )}
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
            </label>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1 rounded-xl h-12" onClick={() => setShowUpload(false)}>Annuler</Button>
              <Button type="submit" disabled={uploading} className="flex-1 rounded-xl h-12 font-semibold"
                style={{ background: tpl.primary, color: "white" }}>
                {uploading ? "Envoi..." : "Partager 📸"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {weddingPhotos.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <span className="text-4xl">📷</span>
          <p className="mt-2 text-sm">Soyez le premier à partager un souvenir !</p>
        </div>
      ) : (
        <div className="space-y-4">
          {weddingPhotos.map((photo) => (
            <div key={photo.id} className={`bg-white ${tpl.cardStyle} overflow-hidden`}>
              <img src={photo.image} alt={photo.guest_name} className="w-full object-cover cursor-pointer"
                style={{ maxHeight: 320 }} onClick={() => setLightboxPhoto(photo)} />
              <div className="p-4">
                <p className="font-semibold text-gray-800">{photo.guest_name}</p>
                {photo.message && <p className="text-sm text-gray-500 mt-1 italic">"{photo.message}"</p>}
                <div className="flex items-center gap-4 mt-3">
                  <button onClick={() => handleLike(photo.id)}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-rose-500 transition">
                    <Heart className="w-5 h-5" style={{ color: getLikes(photo.id) > 0 ? tpl.primary : undefined }} />
                    <span>{getLikes(photo.id)}</span>
                  </button>
                  <button onClick={() => setShowComments(s => ({ ...s, [photo.id]: !s[photo.id] }))}
                    className="flex items-center gap-1 text-sm text-gray-500">
                    <MessageCircle className="w-5 h-5" />
                    <span>{getComments(photo.id).length}</span>
                  </button>
                </div>
                {showComments[photo.id] && (
                  <div className="mt-3 space-y-2">
                    {getComments(photo.id).map((c) => (
                      <div key={c.id} className="bg-gray-50 rounded-xl px-3 py-2 text-sm">
                        <span className="font-medium text-gray-700">{c.guest_name}</span>
                        <span className="text-gray-500 ml-2">{c.message}</span>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                      <Input placeholder="Prénom" value={commentForm[photo.id]?.name || ""}
                        onChange={(e) => setCommentForm(f => ({ ...f, [photo.id]: { ...f[photo.id], name: e.target.value } }))}
                        className="rounded-xl text-sm h-9 w-24 flex-shrink-0" />
                      <Input placeholder="Votre commentaire..." value={commentForm[photo.id]?.message || ""}
                        onChange={(e) => setCommentForm(f => ({ ...f, [photo.id]: { ...f[photo.id], message: e.target.value } }))}
                        className="rounded-xl text-sm h-9 flex-1" />
                      <Button size="sm" onClick={() => handleComment(photo.id)} className="rounded-xl h-9 px-3"
                        style={{ background: tpl.primary, color: "white" }}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}>
          <button className="absolute top-4 right-4 text-white"><X className="w-8 h-8" /></button>
          <img src={lightboxPhoto.image} className="max-h-screen max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </section>
  );
}