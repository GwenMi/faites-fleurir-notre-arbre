import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Camera, Loader2, X, Filter, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PlantTimelineSection({ eventId, guest }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filterGuest, setFilterGuest] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ note: "", week_number: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    fetchUpdates();
  }, [eventId]);

  const fetchUpdates = async () => {
    setLoading(true);
    // Strictement filtrés par event_id — aucune fuite inter-événements
    const data = await base44.entities.PlantUpdate.filter(
      { event_id: eventId, approved: true },
      "created_date",
      300
    );
    setUpdates(data);
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !guest) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.PlantUpdate.create({
      event_id: eventId,
      guest_name: guest.pseudo,
      guest_identifier: guest.email,
      photo_url: file_url,
      note: form.note.trim(),
      week_number: form.week_number ? parseInt(form.week_number) : null,
      approved: true,
    });
    setForm({ note: "", week_number: "" });
    setFile(null);
    setPreview(null);
    setShowForm(false);
    setUploading(false);
    fetchUpdates();
  };

  const guests = [...new Map(updates.map(u => [u.guest_name, u.guest_name])).values()];
  const filtered = filterGuest === "all" ? updates : updates.filter(u => u.guest_name === filterGuest);
  const grouped = filtered.reduce((acc, u) => {
    if (!acc[u.guest_name]) acc[u.guest_name] = [];
    acc[u.guest_name].push(u);
    return acc;
  }, {});

  return (
    <div className="mt-8">
      <style>{`
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-serif-elegant text-2xl font-bold text-gray-800">
            🌱 L'évolution de nos plantes
          </h3>
          <p className="font-sans-clean text-xs text-gray-400 mt-0.5">
            Partagez une photo chaque semaine — suivez la croissance de votre fleur
          </p>
        </div>
        {guest && (
          <Button
            onClick={() => setShowForm(v => !v)}
            className="bg-emerald-400 hover:bg-emerald-500 text-white rounded-full px-4 text-sm font-sans-clean font-semibold shadow-sm"
          >
            <Camera className="w-4 h-4 mr-1.5" /> Partager
          </Button>
        )}
      </div>

      {/* Formulaire — uniquement pour les invités authentifiés */}
      {showForm && guest && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-serif-elegant text-lg font-bold text-gray-800">Ajouter une photo</p>
            <button onClick={() => { setShowForm(false); setPreview(null); setFile(null); }}>
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="font-sans-clean text-xs font-semibold text-gray-600 mb-1 block">Semaine de pousse (optionnel)</label>
              <Input
                type="number" min="1" max="52"
                value={form.week_number}
                onChange={e => setForm(f => ({ ...f, week_number: e.target.value }))}
                placeholder="Ex : 3"
                className="rounded-xl font-sans-clean w-28"
              />
            </div>
            <div>
              <label className="font-sans-clean text-xs font-semibold text-gray-600 mb-1 block">Un mot (optionnel)</label>
              <textarea
                value={form.note}
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                rows={2}
                placeholder="Elle commence à pousser…"
                className="w-full rounded-xl border border-input px-3 py-2.5 text-sm font-sans-clean resize-none focus:outline-none focus:ring-1 focus:ring-emerald-300"
              />
            </div>
            <div>
              <label className="font-sans-clean text-xs font-semibold text-gray-600 mb-1 block">Photo *</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-emerald-200 rounded-2xl cursor-pointer hover:bg-emerald-50 transition overflow-hidden">
                {preview
                  ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  : <div className="flex flex-col items-center gap-1 text-gray-400">
                      <Camera className="w-7 h-7" />
                      <span className="font-sans-clean text-xs">Choisir une photo</span>
                    </div>
                }
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
            <Button
              type="submit"
              disabled={uploading || !file}
              className="w-full h-11 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-white font-sans-clean font-semibold"
            >
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Envoi…</> : "Partager 🌱"}
            </Button>
          </form>
        </div>
      )}

      {/* Message si non connecté */}
      {!guest && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-6 text-center">
          <p className="font-sans-clean text-sm text-gray-500">Connectez-vous pour partager l'évolution de votre plante.</p>
        </div>
      )}

      {/* Filtres par invité */}
      {updates.length > 0 && (
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
          <button
            onClick={() => setFilterGuest("all")}
            className={`px-3 py-1 rounded-full font-sans-clean text-xs font-semibold transition border ${filterGuest === "all" ? "bg-emerald-400 text-white border-emerald-400" : "bg-white text-gray-500 border-gray-200 hover:border-emerald-200"}`}
          >
            Tous
          </button>
          {guests.map(g => (
            <button
              key={g}
              onClick={() => setFilterGuest(g)}
              className={`px-3 py-1 rounded-full font-sans-clean text-xs font-semibold transition border ${filterGuest === g ? "bg-emerald-400 text-white border-emerald-400" : "bg-white text-gray-500 border-gray-200 hover:border-emerald-200"}`}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {/* Contenu */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-emerald-300" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10">
          <Leaf className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-sans-clean text-sm text-gray-400">Personne n'a encore partagé de photo.</p>
          <p className="font-sans-clean text-xs text-gray-300 mt-1">Soyez le premier à partager l'évolution de votre plante 🌱</p>
        </div>
      ) : filterGuest === "all" ? (
        /* Vue globale : grille chronologique */
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map(u => (
            <div
              key={u.id}
              onClick={() => setLightbox(u)}
              className="relative group cursor-pointer rounded-2xl overflow-hidden aspect-square bg-gray-100 shadow-sm hover:shadow-md transition"
            >
              <img src={u.photo_url} alt={u.guest_name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition" />
              <div className="absolute bottom-0 left-0 right-0 p-2 text-white opacity-0 group-hover:opacity-100 transition">
                <p className="font-sans-clean text-xs font-semibold truncate">{u.guest_name}</p>
                {u.week_number && <p className="font-sans-clean text-xs text-white/70">Semaine {u.week_number}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Vue par invité filtré : timeline verticale */
        <div className="relative pl-6">
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-emerald-100" />
          <div className="space-y-6">
            {(grouped[filterGuest] || []).map((u, i) => (
              <div key={u.id} className="relative">
                <div className="absolute -left-[1.45rem] top-4 w-4 h-4 rounded-full bg-emerald-300 border-2 border-white shadow-sm flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold">{i + 1}</span>
                </div>
                <div
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer"
                  onClick={() => setLightbox(u)}
                >
                  <img src={u.photo_url} alt={u.guest_name} className="w-full h-56 object-cover" />
                  <div className="p-4 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {u.note && <p className="font-sans-clean text-sm text-gray-600 italic leading-relaxed">"{u.note}"</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      {u.week_number && (
                        <span className="inline-block bg-emerald-50 text-emerald-500 text-xs px-2.5 py-1 rounded-full font-sans-clean font-semibold mb-1">
                          Semaine {u.week_number}
                        </span>
                      )}
                      <p className="font-sans-clean text-xs text-gray-400 block">
                        {new Date(u.created_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <div className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={lightbox.photo_url} alt={lightbox.guest_name} className="w-full object-cover max-h-[70vh]" />
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-sans-clean font-bold text-gray-800 text-sm">🌱 {lightbox.guest_name}</p>
                {lightbox.week_number && (
                  <span className="bg-emerald-50 text-emerald-500 text-xs px-2 py-0.5 rounded-full font-sans-clean font-semibold">
                    Semaine {lightbox.week_number}
                  </span>
                )}
              </div>
              {lightbox.note && <p className="font-sans-clean text-sm text-gray-500 italic">"{lightbox.note}"</p>}
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