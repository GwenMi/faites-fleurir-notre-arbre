import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Flower, Camera } from "lucide-react";
import { toast } from "sonner";

export default function PhotoModeration({ photos, onRefresh }) {
  const [loading, setLoading] = useState({});

  const pending = photos.filter((p) => !p.approved);
  const approved = photos.filter((p) => p.approved);

  const approve = async (photo) => {
    setLoading((l) => ({ ...l, [photo.id]: true }));
    await base44.entities.Photo.update(photo.id, { approved: true });
    toast.success("Photo approuvée !");
    onRefresh();
    setLoading((l) => ({ ...l, [photo.id]: false }));
  };

  const reject = async (photo) => {
    setLoading((l) => ({ ...l, [photo.id]: true }));
    await base44.entities.Photo.delete(photo.id);
    toast.success("Photo supprimée");
    onRefresh();
    setLoading((l) => ({ ...l, [photo.id]: false }));
  };

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            En attente ({pending.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {pending.map((photo) => (
              <div key={photo.id} className="relative rounded-xl overflow-hidden border-2 border-amber-200 bg-white shadow-sm">
                <img src={photo.image} alt={photo.guest_name} className="w-full h-36 object-cover" />
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

      {approved.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            Approuvées ({approved.length})
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {approved.map((photo) => (
              <div key={photo.id} className="relative rounded-xl overflow-hidden group shadow-sm">
                <img src={photo.image} alt={photo.guest_name} className="w-full h-24 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <button onClick={() => reject(photo)} className="bg-red-500 text-white rounded-full p-1.5">
                    <X className="w-3 h-3" />
                  </button>
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