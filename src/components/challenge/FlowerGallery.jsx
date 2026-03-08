import { useState } from "react";
import { X } from "lucide-react";

export default function FlowerGallery({ posts, type = "flower" }) {
  const [lightbox, setLightbox] = useState(null);

  if (!posts || posts.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {posts.map((post, idx) => (
          <div
            key={post.id || idx}
            className="relative group cursor-pointer rounded-2xl overflow-hidden aspect-square bg-gray-100 shadow-sm hover:shadow-md transition"
            onClick={() => setLightbox(post)}
          >
            <img
              src={post.image}
              alt={post.user_pseudo}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition" />
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 group-hover:opacity-100 transition">
              <p className="font-sans-clean text-xs font-semibold truncate">{post.user_pseudo}</p>
              {post.caption && <p className="font-sans-clean text-xs text-white/80 truncate">{post.caption}</p>}
            </div>
            <div className={`absolute top-2 right-2 text-lg ${type === "challenge" ? "opacity-0 group-hover:opacity-100" : ""}`}>
              {type === "flower" ? "🌸" : "🎭"}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <img src={lightbox.image} alt={lightbox.user_pseudo} className="w-full object-cover max-h-[70vh]" />
            <div className="p-4">
              <p className="font-sans-clean font-semibold text-gray-800">
                {type === "flower" ? "🌸" : "🎭"} {lightbox.user_pseudo}
              </p>
              {lightbox.caption && (
                <p className="font-sans-clean text-sm text-gray-500 mt-1 italic">"{lightbox.caption}"</p>
              )}
              <p className="font-sans-clean text-xs text-gray-300 mt-2">
                {new Date(lightbox.created_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 transition"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}