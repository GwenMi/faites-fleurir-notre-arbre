import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Camera, Loader2, Filter, X, ChevronDown, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PlantTimeline() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filterGuest, setFilterGuest] = useState("all");
  const [guests, setGuests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ guest_name: "", note: "", week_number: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("event_id") || "";

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    setLoading(true);
    const query = eventId ? { event_id: eventId, approved: true } : { approved: true };
    const data = await base44.entities.PlantUpdate.filter(query, "created_date", 200);
    setUpdates(data);
    // Extraire la liste unique des invités
    const unique = [...new Map(data.map(u => [u.guest_name, u.guest_name])).values()];
    setGuests(unique);
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
    if (!form.guest_name.trim() || !file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.PlantUpdate.create({
      event_id: eventId,
      guest_name: form.guest_name.trim(),
      guest_identifier: form.guest_name.trim().toLowerCase().replace(/\s+/g, "-"),
      photo_url: file_url,
      note: form.note.trim(),
      week_number: form.week_number ? parseInt(form.week_number) : null,
      approved: true,
    });
    setForm({ guest_name: "", note: "", week_number: "" });
    setFile(null);
    setPreview(null);
    setShowForm(false);
    setUploading(false);
    fetchUpdates();
  };

  const filtered = filterGuest === "all"
    ? updates
    : updates.filter(u => u.guest_name === filterGuest);

  // Grouper par invité pour la vue "par invité"
  const groupedByGuest = filtered.reduce((acc, u) => {
    if (!acc[u.guest_name]) acc[u.guest_name] = [];
    acc[u.guest_name].push(u);
    return acc;
  }, {});

  const weekLabel = (n) => n ? `Semaine ${n}` : "";

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        .font-serif-tl { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-tl { font-family: 'Lato', system-ui, sans-serif; }
        .gold-line { background: linear-gradient(90deg, transparent, #c9a96e, transparent); height: 1px; }
      `}</style>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <a href={createPageUrl("Home")}>
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
            alt="Fleurs de fête" className="h-10"
          />
        </a>
        <Button
          onClick={() => setShowForm(v => !v)}
          className="bg-rose-400 hover:bg-rose-500 text-white rounded-full px-5 font-sans-tl text-sm font-semibold shadow-sm"
        >
          <Camera className="w-4 h-4 mr-2" /> Partager ma fleur
        </Button>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="font-sans-tl text-xs tracking-[0.3em] uppercase text-rose-400 mb-2">Jardin partagé</p>
          <h1 className="font-serif-tl text-4xl md:text-5xl font-bold text-gray-800 mb-3">
            L'évolution de nos fleurs
          </h1>
          <div className="gold-line max-w-[100px] mx-auto mb-4" />
          <p className="font-sans-tl text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
            Chaque semaine, partagez une photo de votre plante. Regardez comme elle grandit depuis le mariage.
          </p>
        </div>

        {/* Formulaire dépôt */}
        {showForm && (
          <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif-tl text-xl font-bold text-gray-800">Ajouter une photo</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-sans-tl text-xs font-semibold text-gray-600 mb-1 block">Votre prénom *</label>
                <Input
                  value={form.guest_name}
                  onChange={e => setForm(f => ({ ...f, guest_name: e.target.value }))}
                  placeholder="Sophie"
                  className="rounded-xl font-sans-tl"
                  required
                />
              </div>
              <div>
                <label className="font-sans-tl text-xs font-semibold text-gray-600 mb-1 block">Semaine de pousse</label>
                <Input
                  type="number"
                  min="1"
                  max="52"
                  value={form.week_number}
                  onChange={e => setForm(f => ({ ...f, week_number: e.target.value }))}
                  placeholder="Ex : 3"
                  className="rounded-xl font-sans-tl w-32"
                />
              </div>
              <div>
                <label className="font-sans-tl text-xs font-semibold text-gray-600 mb-1 block">Un mot sur votre fleur (optionnel)</label>
                <textarea
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  rows={2}
                  placeholder="Elle commence à pointer le bout de son nez…"
                  className="w-full rounded-xl border border-input px-3 py-2.5 text-sm font-sans-tl resize-none focus:outline-none focus:ring-1 focus:ring-rose-300"
                />
              </div>
              <div>
                <label className="font-sans-tl text-xs font-semibold text-gray-600 mb-1 block">Photo *</label>
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-rose-200 rounded-2xl cursor-pointer hover:bg-rose-50 transition overflow-hidden">
                  {preview ? (
                    <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Camera className="w-8 h-8" />
                      <span className="font-sans-tl text-xs">Cliquez pour choisir une photo</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
              <Button
                type="submit"
                disabled={uploading || !form.guest_name.trim() || !file}
                className="w-full h-12 rounded-xl bg-rose-400 hover:bg-rose-500 text-white font-sans-tl font-semibold"
              >
                {uploading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Envoi…</> : "Partager ma photo 🌸"}
              </Button>
            </form>
          </div>
        )}

        {/* Filtre par invité */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <button
            onClick={() => setFilterGuest("all")}
            className={`px-4 py-1.5 rounded-full font-sans-tl text-xs font-semibold transition border ${filterGuest === "all" ? "bg-rose-400 text-white border-rose-400" : "bg-white text-gray-600 border-gray-200 hover:border-rose-200"}`}
          >
            Tous les jardins
          </button>
          {guests.map(g => (
            <button
              key={g}
              onClick={() => setFilterGuest(g)}
              className={`px-4 py-1.5 rounded-full font-sans-tl text-xs font-semibold transition border ${filterGuest === g ? "bg-rose-400 text-white border-rose-400" : "bg-white text-gray-600 border-gray-200 hover:border-rose-200"}`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-rose-300" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Leaf className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="font-sans-tl text-gray-400">Aucune photo partagée pour l'instant.</p>
            <p className="font-sans-tl text-xs text-gray-300 mt-1">Soyez le premier à partager l'évolution de votre plante 🌱</p>
          </div>
        ) : filterGuest === "all" ? (
          /* Vue globale : toutes les photos par ordre chronologique */
          <div className="space-y-4">
            {filtered.map((u, i) => (
              <div key={u.id} className="flex gap-4 items-start bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
                <img src={u.photo_url} alt={u.guest_name} className="w-28 h-28 object-cover flex-shrink-0" />
                <div className="py-3 pr-4 flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-sans-tl font-bold text-gray-800 text-sm">{u.guest_name}</span>
                    {u.week_number && (
                      <span className="bg-rose-50 text-rose-400 text-xs px-2 py-0.5 rounded-full font-sans-tl font-semibold">{weekLabel(u.week_number)}</span>
                    )}
                  </div>
                  {u.note && <p className="font-sans-tl text-sm text-gray-600 leading-relaxed italic">"{u.note}"</p>}
                  <p className="font-sans-tl text-xs text-gray-400 mt-2">
                    {new Date(u.created_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Vue par invité filtré : timeline verticale chronologique */
          <div className="relative pl-6">
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-rose-100" />
            <div className="space-y-8">
              {(groupedByGuest[filterGuest] || []).map((u, i) => (
                <div key={u.id} className="relative">
                  <div className="absolute -left-6 top-3 w-4 h-4 rounded-full bg-rose-300 border-2 border-white shadow-sm flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">{i + 1}</span>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
                    <img src={u.photo_url} alt={u.guest_name} className="w-full h-64 object-cover" />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {u.week_number && (
                            <span className="bg-rose-50 text-rose-400 text-xs px-2.5 py-1 rounded-full font-sans-tl font-semibold">{weekLabel(u.week_number)}</span>
                          )}
                        </div>
                        <p className="font-sans-tl text-xs text-gray-400">
                          {new Date(u.created_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                        </p>
                      </div>
                      {u.note && (
                        <p className="font-sans-tl text-sm text-gray-600 italic leading-relaxed">"{u.note}"</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}