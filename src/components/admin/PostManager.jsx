import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Camera, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function PostManager({ eventId, posts, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", image: "" });
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
  };

  const handleCreate = async () => {
    if (!form.title || !form.content) { toast.error("Titre et contenu requis"); return; }
    setSaving(true);
    let imageUrl = form.image;
    if (imgFile) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: imgFile });
      imageUrl = file_url;
    }
    await base44.entities.Post.create({ ...form, event_id: eventId, image: imageUrl });
    setShowForm(false);
    setForm({ title: "", content: "", image: "" });
    setImgFile(null);
    setImgPreview(null);
    toast.success("Actualité publiée !");
    onRefresh();
    setSaving(false);
  };

  const deletePost = async (post) => {
    await base44.entities.Post.delete(post.id);
    toast.success("Actualité supprimée");
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-gray-700">Actualités ({posts.length})</h3>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="rounded-xl bg-purple-500 hover:bg-purple-600 text-white">
          <Plus className="w-4 h-4 mr-1" /> Nouvelle
        </Button>
      </div>

      {showForm && (
        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 space-y-3">
          <Input placeholder="Titre" value={form.title} onChange={e => set("title", e.target.value)} className="rounded-xl h-11" />
          <Textarea placeholder="Contenu de l'actualité..." value={form.content} onChange={e => set("content", e.target.value)} className="rounded-xl" rows={4} />
          <label className="block cursor-pointer">
            {imgPreview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={imgPreview} className="w-full h-32 object-cover" />
                <button type="button" onClick={(e) => { e.preventDefault(); setImgPreview(null); setImgFile(null); }}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                  <X className="w-3 h-3 text-gray-600" />
                </button>
              </div>
            ) : (
              <div className="w-full h-24 rounded-xl border-2 border-dashed border-purple-200 flex items-center justify-center gap-2 text-purple-300 hover:bg-purple-50/50 transition">
                <Camera className="w-5 h-5" />
                <span className="text-sm">Ajouter une image</span>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImg} />
          </label>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button onClick={handleCreate} disabled={saving} className="flex-1 rounded-xl bg-purple-500 hover:bg-purple-600 text-white">
              {saving ? "Publication..." : "Publier"}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {post.image && <img src={post.image} className="w-full h-32 object-cover" alt={post.title} />}
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{post.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {post.created_date ? format(new Date(post.created_date), "d MMM yyyy", { locale: fr }) : ""}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.content}</p>
                </div>
                <button onClick={() => deletePost(post)} className="ml-3 text-gray-300 hover:text-red-400 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Aucune actualité publiée</p>
          </div>
        )}
      </div>
    </div>
  );
}