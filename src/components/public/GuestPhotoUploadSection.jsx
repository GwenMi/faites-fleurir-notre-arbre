import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Upload, X, ChevronLeft, ChevronRight, ZoomIn, Clock } from "lucide-react";
import { toast } from "sonner";

function Lightbox({ photos, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const p = photos[current];
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white p-2"><X className="w-5 h-5" /></button>
      <button onClick={e => { e.stopPropagation(); setCurrent(i => (i - 1 + photos.length) % photos.length); }}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <img src={p.image} alt={p.guest_name} className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl" onClick={e => e.stopPropagation()} />
      <button onClick={e => { e.stopPropagation(); setCurrent(i => (i + 1) % photos.length); }}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full">
        <ChevronRight className="w-5 h-5" />
      </button>
      <div className="mt-3 text-center text-white" onClick={e => e.stopPropagation()}>
        <p className="font-semibold text-sm">{p.guest_name}</p>
        {p.message && <p className="text-white/60 text-xs mt-0.5 italic">"{p.message}"</p>}
      </div>
      <p className="text-white/30 text-xs mt-2">{current + 1} / {photos.length}</p>
    </div>
  );
}

export default function GuestPhotoUploadSection({ event, primaryColor }) {
  const [photos, setPhotos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [done, setDone] = useState(false);

  const color = primaryColor || "#f43f5e";

  useEffect(() => {
    loadPhotos();
    const unsub = base44.entities.Photo.subscribe((ev) => {
      if (ev.type === "update" && ev.data?.event_id === event.id && ev.data?.approved) {
        setPhotos(prev => prev.some(p => p.id === ev.id) ? prev.map(p => p.id === ev.id ? ev.data : p) : [...prev, ev.data]);
      }
    });
    return unsub;
  }, []);

  const loadPhotos = async () => {
    const result = await base44.entities.Photo.filter({ event_id: event.id, approved: true, type: "wedding" }, "-created_date");
    setPhotos(result || []);
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !guestName.trim()) { toast.error("Nom et photo requis"); return; }
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.Photo.create({
      event_id: event.id,
      guest_name: guestName.trim(),
      message: message.trim() || undefined,
      image: file_url,
      type: "wedding",
      approved: false,
    });
    // Notify couple
    if (event.created_by) {
      await base44.integrations.Core.SendEmail({
        to: event.created_by,
        subject: `📸 Nouvelle photo déposée — ${event.couple_names}`,
        body: `Bonjour,\n\n${guestName} vient de déposer une photo sur votre page "${event.couple_names}".\n\nConnectez-vous à votre espace mariés pour l'approuver.\n\nFleurs de fête 🌸`,
      }).catch(() => {});
    }
    setUploading(false);
    setDone(true);
    setShowForm(false);
    setFile(null); setPreview(null); setGuestName(""); setMessage("");
  };

  return (
    <div className="px-4 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-px flex-1 max-w-16" style={{ background: `linear-gradient(to right, transparent, ${color}66)` }} />
          <Camera className="w-5 h-5" style={{ color }} />
          <div className="h-px flex-1 max-w-16" style={{ background: `linear-gradient(to left, transparent, ${color}66)` }} />
        </div>
        <h2 className="font-serif-elegant text-3xl font-bold text-gray-800 mb-2">Vos photos du mariage</h2>
        <p className="font-sans-clean text-gray-500 text-sm max-w-sm mx-auto">
          Partagez vos plus beaux clichés de cette journée inoubliable !
        </p>
      </div>

      {/* Upload button */}
      {done ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center max-w-sm mx-auto mb-8">
          <p className="text-green-700 font-semibold font-sans-clean text-sm">📸 Votre photo a été envoyée !</p>
          <p className="text-green-500 text-xs mt-1">Elle sera visible après validation par les mariés.</p>
          <button onClick={() => setDone(false)} className="mt-3 text-xs underline text-green-600">Partager une autre photo</button>
        </div>
      ) : !showForm ? (
        <div className="flex justify-center mb-8">
          <Button
            onClick={() => setShowForm(true)}
            className="h-12 px-8 rounded-full text-white font-sans-clean font-semibold shadow-md hover:opacity-90 transition"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}
          >
            <Camera className="w-4 h-4 mr-2" /> Ajouter ma photo 📸
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 max-w-sm mx-auto mb-8 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-800 font-sans-clean text-sm">Partager une photo</h3>
            <button type="button" onClick={() => { setShowForm(false); setFile(null); setPreview(null); }}>
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Photo */}
          <label className="block cursor-pointer">
            {preview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={preview} className="w-full h-48 object-cover" alt="preview" />
                <button type="button" onClick={(e) => { e.preventDefault(); setFile(null); setPreview(null); }}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                  <X className="w-3 h-3 text-gray-600" />
                </button>
              </div>
            ) : (
              <div className="w-full h-36 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition bg-gray-50/50">
                <Camera className="w-8 h-8 text-gray-300" />
                <p className="text-xs text-gray-400">Choisir une photo</p>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
          </label>

          <Input
            placeholder="Votre prénom *"
            value={guestName}
            onChange={e => setGuestName(e.target.value)}
            className="h-10 rounded-xl font-sans-clean text-sm"
            required
          />
          <Input
            placeholder="Un petit mot (optionnel)"
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="h-10 rounded-xl font-sans-clean text-sm"
          />

          <Button
            type="submit"
            disabled={uploading || !file || !guestName.trim()}
            className="w-full h-11 rounded-xl text-white font-sans-clean font-semibold hover:opacity-90"
            style={{ background: color }}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Envoi en cours..." : "Envoyer ma photo"}
          </Button>
          <p className="text-xs text-center text-gray-400 font-sans-clean">
            <Clock className="w-3 h-3 inline mr-1" />
            Votre photo sera visible après validation
          </p>
        </form>
      )}

      {/* Gallery */}
      {photos.length > 0 && (
        <>
          <p className="font-sans-clean text-xs text-gray-400 text-center mb-4">{photos.length} photo{photos.length > 1 ? "s" : ""} partagée{photos.length > 1 ? "s" : ""}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {photos.map((photo, i) => (
              <div
                key={photo.id}
                className="relative group rounded-2xl overflow-hidden aspect-square bg-gray-100 shadow-sm hover:shadow-md transition cursor-pointer"
                onClick={() => setLightbox(i)}
              >
                <img src={photo.image} alt={photo.guest_name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 group-hover:opacity-100 transition">
                  <p className="font-sans-clean text-xs font-semibold truncate">{photo.guest_name}</p>
                  {photo.message && <p className="font-sans-clean text-xs text-white/70 truncate italic">{photo.message}</p>}
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                  <ZoomIn className="w-4 h-4 text-white drop-shadow" />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {lightbox !== null && (
        <Lightbox photos={photos} startIndex={lightbox} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}