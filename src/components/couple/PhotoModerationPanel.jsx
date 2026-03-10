import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Check, X, ZoomIn, ChevronLeft, ChevronRight, Loader2, Camera } from "lucide-react";
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
      <p className="text-white font-semibold text-sm mt-3">{p.guest_name}</p>
      {p.message && <p className="text-white/50 text-xs mt-0.5 italic">"{p.message}"</p>}
      <p className="text-white/30 text-xs mt-2">{current + 1} / {photos.length}</p>
    </div>
  );
}

export default function PhotoModerationPanel({ event }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({});
  const [lightbox, setLightbox] = useState(null); // { list, index }

  useEffect(() => {
    fetchPhotos();
    const unsub = base44.entities.Photo.subscribe((ev) => {
      if (ev.type === "create") setPhotos(p => [...p, ev.data]);
      else if (ev.type === "update") setPhotos(p => p.map(x => x.id === ev.id ? ev.data : x));
      else if (ev.type === "delete") setPhotos(p => p.filter(x => x.id !== ev.id));
    });
    return unsub;
  }, []);

  const fetchPhotos = async () => {
    const result = await base44.entities.Photo.filter({ event_id: event.id, type: "wedding" }, "-created_date");
    setPhotos(result || []);
    setLoading(false);
  };

  const approve = async (photo) => {
    setBusy(b => ({ ...b, [photo.id]: true }));
    await base44.entities.Photo.update(photo.id, { approved: true });
    toast.success("Photo approuvée ✓");
    setBusy(b => ({ ...b, [photo.id]: false }));
  };

  const reject = async (photo) => {
    setBusy(b => ({ ...b, [photo.id]: true }));
    await base44.entities.Photo.delete(photo.id);
    toast.success("Photo supprimée");
    setBusy(b => ({ ...b, [photo.id]: false }));
  };

  const pending = photos.filter(p => !p.approved);
  const approved = photos.filter(p => p.approved);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-rose-400" /></div>;

  return (
    <div className="space-y-6">
      {lightbox && (
        <Lightbox photos={lightbox.list} startIndex={lightbox.index} onClose={() => setLightbox(null)} />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-amber-200 p-4 text-center">
          <p className="text-3xl font-bold font-serif-elegant text-amber-600">{pending.length}</p>
          <p className="text-xs text-gray-500 font-sans-clean mt-1 flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" /> En attente de validation
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-green-200 p-4 text-center">
          <p className="text-3xl font-bold font-serif-elegant text-green-600">{approved.length}</p>
          <p className="text-xs text-gray-500 font-sans-clean mt-1">Photos approuvées</p>
        </div>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-700 font-sans-clean text-sm mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            En attente de validation ({pending.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {pending.map(photo => (
              <div key={photo.id} className="bg-white rounded-2xl overflow-hidden border-2 border-amber-200 shadow-sm">
                <div className="relative cursor-pointer" onClick={() => setLightbox({ list: pending, index: pending.indexOf(photo) })}>
                  <img src={photo.image} alt={photo.guest_name} className="w-full h-36 object-cover" />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition flex items-center justify-center">
                    <ZoomIn className="w-5 h-5 text-white opacity-0 hover:opacity-100 transition drop-shadow" />
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-semibold text-gray-800 truncate font-sans-clean">{photo.guest_name}</p>
                  {photo.message && <p className="text-xs text-gray-400 italic truncate">{photo.message}</p>}
                  <div className="flex gap-1.5 mt-2">
                    <Button size="sm" onClick={() => approve(photo)} disabled={!!busy[photo.id]}
                      className="flex-1 h-8 text-xs rounded-lg bg-green-500 hover:bg-green-600 text-white">
                      <Check className="w-3 h-3 mr-1" /> Approuver
                    </Button>
                    <Button size="sm" onClick={() => reject(photo)} disabled={!!busy[photo.id]}
                      variant="outline" className="flex-1 h-8 text-xs rounded-lg border-red-200 text-red-500 hover:bg-red-50">
                      <X className="w-3 h-3 mr-1" /> Refuser
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved */}
      {approved.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-700 font-sans-clean text-sm mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            Photos approuvées ({approved.length})
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {approved.map((photo, i) => (
              <div key={photo.id} className="relative rounded-xl overflow-hidden group cursor-pointer aspect-square"
                onClick={() => setLightbox({ list: approved, index: i })}>
                <img src={photo.image} alt={photo.guest_name} className="w-full h-full object-cover group-hover:scale-105 transition duration-200" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-end p-1.5">
                  <p className="text-white text-xs truncate font-sans-clean">{photo.guest_name}</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); reject(photo); }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {pending.length === 0 && approved.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Camera className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-sans-clean">Aucune photo reçue pour le moment.</p>
          <p className="text-gray-400 text-xs mt-1">Les invités peuvent en déposer sur votre page publique.</p>
        </div>
      )}
    </div>
  );
}