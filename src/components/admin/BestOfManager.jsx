import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Star, StarOff, Image, MessageSquare, RefreshCw } from "lucide-react";
import { toast } from "sonner";

function PhotoCard({ photo, onToggle }) {
  const [loading, setLoading] = useState(false);
  const toggle = async () => {
    setLoading(true);
    await base44.entities.Photo.update(photo.id, { featured: !photo.featured });
    onToggle();
    setLoading(false);
    toast.success(photo.featured ? "Retiré du Best of" : "Ajouté au Best of !");
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden border-2 transition-all ${photo.featured ? "border-amber-400 shadow-md shadow-amber-100" : "border-transparent"}`}>
      <img src={photo.image} alt={photo.guest_name} className="w-full aspect-square object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <p className="text-white text-xs font-semibold truncate">{photo.guest_name}</p>
        {photo.message && <p className="text-white/70 text-xs truncate">{photo.message}</p>}
      </div>
      <button
        onClick={toggle}
        disabled={loading}
        className={`absolute top-2 right-2 p-1.5 rounded-full shadow transition ${
          photo.featured ? "bg-amber-400 text-white" : "bg-white/80 text-gray-400 hover:bg-amber-50 hover:text-amber-400"
        }`}
      >
        <Star className="w-4 h-4" fill={photo.featured ? "currentColor" : "none"} />
      </button>
      {photo.featured && (
        <div className="absolute top-2 left-2 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">Best of</div>
      )}
    </div>
  );
}

function TestimonialCard({ entry, onToggle }) {
  const [loading, setLoading] = useState(false);
  const toggle = async () => {
    setLoading(true);
    await base44.entities.GuestbookEntry.update(entry.id, { featured: !entry.featured });
    onToggle();
    setLoading(false);
    toast.success(entry.featured ? "Retiré du Best of" : "Ajouté au Best of !");
  };

  return (
    <div className={`relative rounded-2xl p-4 border-2 transition-all bg-white ${entry.featured ? "border-amber-400 shadow-md shadow-amber-100" : "border-gray-100"}`}>
      {entry.featured && (
        <div className="absolute top-3 left-3 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">Best of</div>
      )}
      <button
        onClick={toggle}
        disabled={loading}
        className={`absolute top-3 right-3 p-1.5 rounded-full transition ${
          entry.featured ? "bg-amber-400 text-white" : "bg-gray-100 text-gray-400 hover:bg-amber-50 hover:text-amber-400"
        }`}
      >
        <Star className="w-4 h-4" fill={entry.featured ? "currentColor" : "none"} />
      </button>
      <div className="mt-5">
        <p className="text-sm text-gray-700 leading-relaxed italic">"{entry.message}"</p>
        <p className="text-xs font-bold text-gray-500 mt-2">— {entry.pseudo}</p>
      </div>
    </div>
  );
}

export default function BestOfManager({ event }) {
  const [photos, setPhotos] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("photos");

  useEffect(() => { loadData(); }, [event?.id]);

  const loadData = async () => {
    setLoading(true);
    const [ph, en] = await Promise.all([
      base44.entities.Photo.filter({ event_id: event.id, approved: true }),
      base44.entities.GuestbookEntry.filter({ event_id: event.id }),
    ]);
    setPhotos(ph || []);
    setEntries(en || []);
    setLoading(false);
  };

  if (loading) return <div className="py-10 text-center text-gray-400 text-sm">Chargement...</div>;

  const featuredPhotos = photos.filter(p => p.featured).length;
  const featuredEntries = entries.filter(e => e.featured).length;

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-800">✨ Best of — Sélection des mariés</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Cliquez sur l'étoile pour mettre en avant un contenu sur la page publique.
          </p>
        </div>
        <button onClick={loadData} className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 transition">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("photos")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            tab === "photos" ? "bg-amber-400 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          <Image className="w-4 h-4" />
          Photos
          {featuredPhotos > 0 && (
            <span className={`text-xs rounded-full px-1.5 ${tab === "photos" ? "bg-white/30" : "bg-amber-400 text-white"}`}>
              {featuredPhotos}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("testimonials")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            tab === "testimonials" ? "bg-amber-400 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Témoignages
          {featuredEntries > 0 && (
            <span className={`text-xs rounded-full px-1.5 ${tab === "testimonials" ? "bg-white/30" : "bg-amber-400 text-white"}`}>
              {featuredEntries}
            </span>
          )}
        </button>
      </div>

      {tab === "photos" && (
        photos.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            <Image className="w-10 h-10 mx-auto mb-2 text-gray-200" />
            Aucune photo approuvée pour cet événement.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {photos.map(p => (
              <PhotoCard key={p.id} photo={p} onToggle={loadData} />
            ))}
          </div>
        )
      )}

      {tab === "testimonials" && (
        entries.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-200" />
            Aucun message dans le livre d'or pour l'instant.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {entries.map(e => (
              <TestimonialCard key={e.id} entry={e} onToggle={loadData} />
            ))}
          </div>
        )
      )}
    </div>
  );
}