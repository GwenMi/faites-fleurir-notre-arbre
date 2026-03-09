import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Flower, Camera, Download, Archive, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

function Lightbox({ photos, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const photo = photos[current];
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white p-2"><X className="w-5 h-5" /></button>
      <button onClick={e => { e.stopPropagation(); setCurrent(i => (i - 1 + photos.length) % photos.length); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 bg-white/10 rounded-full">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <img src={photo.image} alt={photo.guest_name} className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl" onClick={e => e.stopPropagation()} />
      <button onClick={e => { e.stopPropagation(); setCurrent(i => (i + 1) % photos.length); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 bg-white/10 rounded-full">
        <ChevronRight className="w-6 h-6" />
      </button>
      <div className="mt-3 text-center" onClick={e => e.stopPropagation()}>
        <p className="text-white font-semibold text-sm">{photo.guest_name}</p>
        {photo.message && <p className="text-white/60 text-xs mt-0.5">{photo.message}</p>}
        <a href={photo.image} download target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-2 text-xs text-white/70 hover:text-white underline">
          <Download className="w-3.5 h-3.5" /> Télécharger
        </a>
      </div>
      <p className="text-white/40 text-xs mt-2">{current + 1} / {photos.length}</p>
    </div>
  );
}

export default function PhotoModeration({ photos, onRefresh }) {
  const [loading, setLoading] = useState({});
  const [lightbox, setLightbox] = useState(null); // { list, index }
  const [downloading, setDownloading] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const pending = photos.filter(p => !p.approved);
  const approved = photos.filter(p => p.approved);

  const approve = async (photo) => {
    setLoading(l => ({ ...l, [photo.id]: true }));
    await base44.entities.Photo.update(photo.id, { approved: true });
    toast.success("Photo approuvée !");
    onRefresh();
    setLoading(l => ({ ...l, [photo.id]: false }));
  };

  const reject = async (photo) => {
    setLoading(l => ({ ...l, [photo.id]: true }));
    await base44.entities.Photo.delete(photo.id);
    toast.success("Photo supprimée");
    onRefresh();
    setLoading(l => ({ ...l, [photo.id]: false }));
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(approved.map(p => p.id)));
  const clearSelection = () => setSelectedIds(new Set());

  const downloadSelected = async () => {
    const targets = approved.filter(p => selectedIds.has(p.id));
    if (targets.length === 0) { toast.error("Sélectionnez au moins une photo"); return; }
    setDownloading(true);
    toast.info(`Téléchargement de ${targets.length} photo(s)…`);
    for (const photo of targets) {
      try {
        const res = await fetch(photo.image);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${photo.guest_name || "photo"}_${photo.id.slice(0, 6)}.jpg`;
        a.click();
        URL.revokeObjectURL(url);
        await new Promise(r => setTimeout(r, 300));
      } catch {}
    }
    toast.success("Téléchargement terminé !");
    setDownloading(false);
  };

  return (
    <div className="space-y-6">
      {lightbox && (
        <Lightbox photos={lightbox.list} startIndex={lightbox.index} onClose={() => setLightbox(null)} />
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            En attente ({pending.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {pending.map(photo => (
              <div key={photo.id} className="relative rounded-xl overflow-hidden border-2 border-amber-200 bg-white shadow-sm">
                <div className="relative cursor-pointer" onClick={() => setLightbox({ list: pending, index: pending.indexOf(photo) })}>
                  <img src={photo.image} alt={photo.guest_name} className="w-full h-36 object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition">
                    <ZoomIn className="w-5 h-5 text-white opacity-0 hover:opacity-100 transition" />
                  </div>
                </div>
                <div className="absolute top-2 left-2">
                  <Badge className={photo.type === "flower" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}>
                    {photo.type === "flower" ? <Flower className="w-3 h-3 mr-1" /> : <Camera className="w-3 h-3 mr-1" />}
                    {photo.type === "flower" ? "Fleur" : "Mariage"}
                  </Badge>
                </div>
                <div className="p-2">
                  <p className="text-xs font-semibold text-gray-700 truncate">{photo.guest_name}</p>
                  {photo.message && <p className="text-xs text-gray-400 truncate">{photo.message}</p>}
                  <div className="flex gap-1 mt-2">
                    <Button size="sm" onClick={() => approve(photo)} disabled={loading[photo.id]}
                      className="flex-1 h-8 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs">
                      <Check className="w-3 h-3 mr-1" /> Approuver
                    </Button>
                    <Button size="sm" onClick={() => reject(photo)} disabled={loading[photo.id]}
                      variant="outline" className="flex-1 h-8 rounded-lg border-red-200 text-red-500 text-xs hover:bg-red-50">
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              Approuvées ({approved.length})
            </h3>
            <div className="flex items-center gap-2">
              <button onClick={selectedIds.size === approved.length ? clearSelection : selectAll}
                className="text-xs text-purple-500 hover:underline">
                {selectedIds.size === approved.length ? "Tout désélect." : "Tout sélect."}
              </button>
              <Button size="sm" onClick={downloadSelected} disabled={downloading || selectedIds.size === 0}
                className="rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs h-8">
                <Download className="w-3 h-3 mr-1" />
                {downloading ? "…" : `Télécharger${selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}`}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {approved.map((photo, i) => (
              <div key={photo.id}
                className={`relative rounded-xl overflow-hidden group shadow-sm cursor-pointer border-2 transition ${selectedIds.has(photo.id) ? "border-purple-400" : "border-transparent"}`}>
                <img src={photo.image} alt={photo.guest_name}
                  className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-200"
                  onClick={() => setLightbox({ list: approved, index: i })} />
                {/* Checkbox overlay */}
                <button
                  onClick={e => { e.stopPropagation(); toggleSelect(photo.id); }}
                  className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center transition"
                  style={{ background: selectedIds.has(photo.id) ? "#8b5cf6" : "rgba(0,0,0,0.3)" }}>
                  {selectedIds.has(photo.id) && <Check className="w-2.5 h-2.5 text-white" />}
                </button>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-end justify-between p-1.5 pointer-events-none">
                  <ZoomIn className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-center py-1 text-gray-600 truncate px-1">{photo.guest_name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {pending.length === 0 && approved.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <Camera className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Aucune photo pour l'instant</p>
        </div>
      )}
    </div>
  );
}