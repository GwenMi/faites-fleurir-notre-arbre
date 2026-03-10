import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import FlowerChallengeSection from "@/components/challenge/FlowerChallengeSection";
import CountdownWidget from "@/components/challenge/CountdownWidget";
import RSVPSection from "@/components/public/RSVPSection";
import DayScheduleSection from "@/components/public/DayScheduleSection";
import BestOfSection from "@/components/public/BestOfSection";
import PhotoGallery from "@/components/public/PhotoGallery";
import GuestPhotoUploadSection from "@/components/public/GuestPhotoUploadSection";
import WishlistSection from "@/components/public/WishlistSection";
import FAQSection from "@/components/public/FAQSection";
import SeatingPlanSection from "@/components/public/SeatingPlanSection";

export default function EventPublic() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");
    if (!slug) { setNotFound(true); setLoading(false); return; }
    loadEvent(slug);
  }, []);

  const loadEvent = async (slug) => {
    const events = await base44.entities.Event.filter({ slug });
    if (!events || events.length === 0) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setEvent(events[0]);
    setLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-rose-50">
      <Loader2 className="w-8 h-8 animate-spin text-rose-300" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50 text-center p-8">
      <span className="text-6xl mb-4">🌸</span>
      <h1 className="text-2xl font-bold text-gray-700 mb-2">Événement introuvable</h1>
      <p className="text-gray-500 text-sm">Vérifiez le lien partagé par les organisateurs.</p>
    </div>
  );

  const primaryColor = event.primary_color || "#f43f5e";
  const secondaryColor = event.secondary_color || "#86efac";

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
        .gold-line { background: linear-gradient(90deg, transparent, #c9a96e, transparent); height: 1px; }
      `}</style>

      {/* Hero */}
      <div className="relative text-center py-20 px-6 overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${primaryColor}15 0%, #fff 60%, ${secondaryColor}15 100%)` }}>
        {event.cover_image && (
          <div className="absolute inset-0 z-0">
            <img src={event.cover_image} className="w-full h-full object-cover opacity-20" alt="" />
            <div className="absolute inset-0 bg-white/60" />
          </div>
        )}
        <div className="relative z-10">
          <p className="font-sans-clean text-xs tracking-[0.3em] uppercase mb-4" style={{ color: primaryColor }}>
            {event.event_type === "mariage" ? "Mariage" :
             event.event_type === "anniversaire" ? "Anniversaire" :
             event.event_type === "bapteme" ? "Baptême" :
             event.event_type === "fete_entreprise" ? "Fête d'entreprise" :
             event.event_type === "maison_hote" ? "Maison d'hôte" :
             "Événement"}
          </p>
          <h1 className="font-serif-elegant text-5xl md:text-7xl font-bold text-gray-800 mb-4">
            {event.couple_names}
          </h1>
          <div className="gold-line max-w-xs mx-auto mb-5" />
          {event.welcome_message && (
            <p className="font-sans-clean text-gray-600 text-base max-w-lg mx-auto leading-relaxed font-light mb-4">
              {event.welcome_message}
            </p>
          )}
          {event.event_date && (
            <p className="font-sans-clean text-sm text-gray-400">
              {new Date(event.event_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
          {event.seed_type && (
            <div className="inline-block mt-4 px-5 py-2 rounded-full border text-sm font-sans-clean text-gray-500"
              style={{ borderColor: primaryColor + "44", background: primaryColor + "11" }}>
              🌱 Graine offerte : {event.seed_type}
            </div>
          )}
          {event.event_date && (
            <CountdownWidget eventDate={event.event_date} primaryColor={primaryColor} />
          )}
        </div>
      </div>

      {/* Day Schedule Section */}
      <div className="max-w-2xl mx-auto px-4">
        <DayScheduleSection event={event} primaryColor={primaryColor} />
      </div>

      {/* RSVP Section */}
      <div className="max-w-2xl mx-auto px-4">
        <RSVPSection event={event} primaryColor={primaryColor} />
      </div>

      {/* Best of Section */}
      <div className="max-w-2xl mx-auto">
        <BestOfSection event={event} primaryColor={primaryColor} />
      </div>

      {/* Photo Gallery */}
      <div className="max-w-2xl mx-auto">
        <PhotoGallery event={event} primaryColor={primaryColor} />
      </div>

      {/* Wishlist Section */}
      <div className="max-w-2xl mx-auto">
        <WishlistSection event={event} primaryColor={primaryColor} />
      </div>

      {/* Seating Plan Section */}
      <div className="max-w-2xl mx-auto">
        <SeatingPlanSection event={event} primaryColor={primaryColor} />
      </div>

      {/* FAQ Section */}
      <div className="max-w-2xl mx-auto">
        <FAQSection event={event} primaryColor={primaryColor} />
      </div>

      {/* Guest Photos Section */}
      <div className="max-w-2xl mx-auto">
        <GuestPhotoUploadSection event={event} primaryColor={primaryColor} />
      </div>

      {/* Flower Challenge Section */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <FlowerChallengeSection event={event} />
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-100 text-center">
        <p className="font-sans-clean text-xs text-gray-300 mb-3">Créé avec Fleurs en fête 🌸</p>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-300 font-sans-clean">
          <a href="/app/cgv" className="hover:text-rose-300 transition">CGV</a>
          <span>·</span>
          <a href="/app/mentionslegales" className="hover:text-rose-300 transition">Mentions légales</a>
          <span>·</span>
          <a href="/app/contact" className="hover:text-rose-300 transition">Contact</a>
        </div>
      </footer>
    </div>
  );
}