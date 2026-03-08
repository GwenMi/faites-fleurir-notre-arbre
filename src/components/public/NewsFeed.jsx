import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function NewsFeed({ posts, tpl }) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="px-4 py-8">
      <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: tpl.fontTitle, color: tpl.primary }}>
        📢 Actualités
      </h2>
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className={`bg-white ${tpl.cardStyle} overflow-hidden`}>
            {post.image && (
              <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
              <p className="text-xs text-gray-400 mb-1">
                {post.created_date ? format(new Date(post.created_date), "d MMMM yyyy", { locale: fr }) : ""}
              </p>
              <h3 className="font-bold text-gray-800 text-lg mb-2" style={{ fontFamily: tpl.fontTitle }}>
                {post.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}