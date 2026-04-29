import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Camera, X, Loader2, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import GuestAuth, { getGuestSession, clearGuestSession } from "./GuestAuth";

export default function CookingGallerySection({ event }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guest, setGuest] = useState(getGuestSession());
  const [showForm, setShowForm] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const eventId = event?.id;

  useEffect(() => {
    fetchPosts();
  }, [eventId]);

  const fetchPosts = async () => {
    setLoading(true);
    const data = await base44.entities.FlowerPost.filter({ event_id: eventId, type: "cooking" });
    setPosts(data || []);
    setLoading(false);
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!file) { toast.error("Veuillez choisir une photo"); return; }
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.FlowerPost.create({
      event_id: eventId,
      user_pseudo: guest.pseudo,
      user_email: guest.email,
      type: "cooking",
      image: file_url,
      caption: caption.trim() || undefined,
    });
    toast.success("Votre photo est partagée ! 🍪");
    setFile(null);
    setPreview(null);
    setCaption("");
    setShowForm(false);
    setUploading(false);
    fetchPosts();
  };

  return (
    <div className="mt-12">
      <style>{`
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
      `}</style>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-200 max-w-16" />
          <UtensilsCrossed className="w-6 h-6 text-amber-500" />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-200 max-w-16" />
        </div>
        <h2 className="font-serif-elegant text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          L'album des crackers
        </h2>
        <p className="font-sans-clean text-gray-500 text-sm max-w-md mx-auto">
          Partagez vos photos de cuisine — on veut voir vos créations !
        </p>
      </div>

      {/* Auth */}
      {!guest ? (
        <div className="mb-6">
          <GuestAuth eventId={eventId} onAuthenticated={setGuest} />
        </div>
      ) : (
        <div className="mb-6 flex items-center justify-between bg-white border border-amber-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-amber-600 font-bold text-sm">{guest.pseudo[0].toUpperCase()}</span>
            </div>
            <div>
              <p className="font-sans-clean font-semibold text-gray-800 text-sm">{guest.pseudo}</p>
              <p className="font-sans-clean text-xs text-gray-400">{guest.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowForm(v => !v)}
              className="bg-amber-400 hover:bg-amber-500 text-white rounded-full px-4 text-sm font-sans-clean font-semibold"
            >
              <Camera className="w-4 h-4 mr-1.5" /> Partager
            </Button>
            <button onClick={() => { clearGuestSession(); setGuest(null); }} className="text-gray-300 hover:text-gray-500 transition p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Formulaire upload */}
      {showForm && guest && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-serif-elegant text-lg font-bold text-gray-800">Ajouter ma photo 🍪</p>
            <button onClick={() => { setShowForm(false); setPreview(null); setFile(null); }}>
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
          <div className="space-y-3">
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-amber-200 rounded-2xl cursor-pointer hover:bg-amber-50 transition overflow-hidden">
              {preview
                ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                : <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Camera className="w-8 h-8 text-amber-300" />
                    <span className="font-sans-clean text-xs">Choisir une photo</span>
                  </div>
              }
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
            </label>
            <Input
              placeholder="Un commentaire sur votre recette… (optionnel)"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              className="rounded-xl"
            />
            <Button
              onClick={handleSubmit}
              disabled={uploading || !file}
              className="w-full h-11 rounded-xl bg-amber-400 hover:bg-amber-500 text-white font-sans-clean font-semibold"
            >
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Envoi…</> : "Partager ma création 🍪"}
            </Button>
          </div>
        </div>
      )}

      {/* Galerie */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-amber-300" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-10">
          <UtensilsCrossed className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-sans-clean text-sm text-gray-400">Personne n'a encore partagé de photo.</p>
          <p className="font-sans-clean text-xs text-gray-300 mt-1">Soyez le premier à partager vos crackers ! 🍪</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {posts.map((post, idx) => (
            <div
              key={post.id || idx}
              onClick={() => setLightbox(post)}
              className="relative group cursor-pointer rounded-2xl overflow-hidden aspect-square bg-gray-100 shadow-sm hover:shadow-md transition"
            >
              <img src={post.image} alt={post.user_pseudo} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 group-hover:opacity-100 transition">
                <p className="font-sans-clean text-xs font-semibold truncate">{post.user_pseudo}</p>
                {post.caption && <p className="font-sans-clean text-xs text-white/80 truncate">{post.caption}</p>}
              </div>
              <div className="absolute top-2 right-2 text-lg">🍪</div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {posts.length > 0 && (
        <p className="font-sans-clean text-xs text-gray-400 text-center mt-4">
          {posts.length} création{posts.length > 1 ? "s" : ""} partagée{posts.length > 1 ? "s" : ""}
        </p>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <div className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={lightbox.image} alt={lightbox.user_pseudo} className="w-full object-cover max-h-[70vh]" />
            <div className="p-4">
              <p className="font-sans-clean font-semibold text-gray-800">🍪 {lightbox.user_pseudo}</p>
              {lightbox.caption && <p className="font-sans-clean text-sm text-gray-500 mt-1 italic">"{lightbox.caption}"</p>}
              <p className="font-sans-clean text-xs text-gray-300 mt-2">
                {new Date(lightbox.created_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <button onClick={() => setLightbox(null)} className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 transition">
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}