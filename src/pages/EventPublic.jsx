import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { getTemplateVars } from "@/components/public/TemplateConfig";
import EventHeader from "@/components/public/EventHeader";
import FlowerGallery from "@/components/public/FlowerGallery";
import WeddingAlbum from "@/components/public/WeddingAlbum";
import NewsFeed from "@/components/public/NewsFeed";
import PollsSection from "@/components/public/PollsSection";
import { Loader2, Flower } from "lucide-react";

export default function EventPublic() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug") || window.location.pathname.split("/e/")[1];

  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [posts, setPosts] = useState([]);
  const [polls, setPolls] = useState([]);
  const [pollResponses, setPollResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) loadEvent();
  }, [slug]);

  const loadEvent = async () => {
    setLoading(true);
    const events = await base44.entities.Event.filter({ slug });
    if (!events || events.length === 0) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const ev = events[0];
    setEvent(ev);
    await loadData(ev.id);
    setLoading(false);
  };

  const loadData = async (eventId) => {
    const [ph, po, pl, prArr] = await Promise.all([
      base44.entities.Photo.filter({ event_id: eventId }),
      base44.entities.Post.filter({ event_id: eventId }),
      base44.entities.Poll.filter({ event_id: eventId }),
      base44.entities.PollResponse.list(),
    ]);
    setPhotos(ph || []);
    setPosts(po || []);
    setPolls(pl || []);
    setPollResponses(prArr || []);

    const photoIds = (ph || []).map((p) => p.id);
    if (photoIds.length > 0) {
      const [cm, lk] = await Promise.all([
        base44.entities.Comment.list(),
        base44.entities.Like.list(),
      ]);
      setComments((cm || []).filter((c) => photoIds.includes(c.photo_id)));
      setLikes((lk || []).filter((l) => photoIds.includes(l.photo_id)));
    }
  };

  const refresh = () => event && loadData(event.id);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-rose-50">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-pink-400 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Chargement de votre événement...</p>
      </div>
    </div>
  );

  if (notFound || !event) return (
    <div className="min-h-screen flex items-center justify-center bg-rose-50">
      <div className="text-center px-6">
        <span className="text-5xl">🌱</span>
        <h1 className="text-2xl font-bold text-gray-700 mt-4">Événement introuvable</h1>
        <p className="text-gray-500 mt-2 text-sm">Le lien que vous avez utilisé ne correspond à aucun événement.</p>
      </div>
    </div>
  );

  const tpl = getTemplateVars(event);
  const isPremium = event.plan === "premium";
  const flowerCount = photos.filter((p) => p.type === "flower" && p.approved).length;

  return (
    <div className="min-h-screen" style={{ background: tpl.bgPattern.includes("bg-") ? undefined : tpl.bgPattern, fontFamily: tpl.fontBody }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Dancing+Script:wght@600&family=Great+Vibes&family=Cormorant+Garamond:wght@400;600&family=Lato&family=Raleway&family=Nunito&family=Josefin+Sans&display=swap');
        body { background: ${tpl.primary}08; }
      `}</style>

      <EventHeader event={event} tpl={tpl} />

      {/* Flower counter banner */}
      <div className="mx-4 mt-4 rounded-2xl py-4 px-6 text-center text-white font-semibold shadow-lg"
        style={{ background: `linear-gradient(135deg, ${tpl.primary}, ${tpl.secondary})` }}>
        <Flower className="w-5 h-5 inline mr-2 mb-0.5" />
        {flowerCount === 0
          ? "Soyez le premier à faire fleurir notre arbre ! 🌱"
          : `${flowerCount} fleur${flowerCount > 1 ? "s" : ""} ont rejoint notre arbre 🌸`}
      </div>

      {/* Navigation tabs */}
      <div className="flex overflow-x-auto gap-2 px-4 py-4 no-scrollbar">
        {[
          { label: "🌻 Notre Arbre", show: true },
          { label: "📸 Album", show: isPremium },
          { label: "📢 Actualités", show: isPremium && posts.length > 0 },
          { label: "🗳 Sondages", show: isPremium && polls.length > 0 },
        ].filter(t => t.show).map((tab) => (
          <a key={tab.label} href={`#${tab.label}`}
            className="flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-full border transition"
            style={{ borderColor: tpl.primary + "66", color: tpl.primary, background: tpl.primary + "11" }}>
            {tab.label}
          </a>
        ))}
      </div>

      <FlowerGallery event={event} photos={photos} onPhotoAdded={refresh} tpl={tpl} />

      {isPremium && (
        <>
          <div className="h-2 mx-4 rounded-full opacity-20" style={{ background: tpl.secondary }} />
          <WeddingAlbum event={event} photos={photos} comments={comments} likes={likes} onRefresh={refresh} tpl={tpl} />
          {posts.length > 0 && (
            <>
              <div className="h-2 mx-4 rounded-full opacity-20" style={{ background: tpl.secondary }} />
              <NewsFeed posts={posts} tpl={tpl} />
            </>
          )}
          {polls.length > 0 && (
            <>
              <div className="h-2 mx-4 rounded-full opacity-20" style={{ background: tpl.secondary }} />
              <PollsSection polls={polls} responses={pollResponses} onRefresh={refresh} tpl={tpl} />
            </>
          )}
        </>
      )}

      <footer className="text-center py-8 px-4 text-xs text-gray-400">
        <p className="italic">"Merci d'avoir partagé ce moment avec nous"</p>
        <p className="mt-1">Faites Fleurir Notre Arbre 🌸</p>
      </footer>
    </div>
  );
}