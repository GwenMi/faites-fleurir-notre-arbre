import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import ClassicTemplate from "@/components/public/templates/ClassicTemplate";
import RusticTemplate from "@/components/public/templates/RusticTemplate";
import MinimalTemplate from "@/components/public/templates/MinimalTemplate";
import ElegantTemplate from "@/components/public/templates/ElegantTemplate";
import FestiveTemplate from "@/components/public/templates/FestiveTemplate";
import FlowerChallengeSection from "@/components/challenge/FlowerChallengeSection";
import CountdownWidget from "@/components/challenge/CountdownWidget";
import RSVPSection from "@/components/public/sections/RSVPSection";
import GuestbookSection from "@/components/public/sections/GuestbookSection";
import PhotoGallerySection from "@/components/public/sections/PhotoGallerySection";
import FAQSectionNew from "@/components/public/sections/FAQSection";
import DayScheduleSection from "@/components/public/DayScheduleSection";
import BestOfSection from "@/components/public/BestOfSection";
import GuestPhotoUploadSection from "@/components/public/GuestPhotoUploadSection";
import WishlistSection from "@/components/public/WishlistSection";
import SeatingPlanSection from "@/components/public/SeatingPlanSection";
import CoupleStorySection from "@/components/public/sections/CoupleStorySection";
import MapSection from "@/components/public/sections/MapSection";
import CagnotteSection from "@/components/public/sections/CagnotteSection";
import ReviewForm from "@/components/review/ReviewForm";

export default function EventPublic() {
  const [event, setEvent] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [hasPotOrder, setHasPotOrder] = useState(false);
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
    loadFAQs(events[0].id);
    checkPotOrders(events[0].id);
    setLoading(false);
  };

  const loadFAQs = async (eventId) => {
    try {
      const data = await base44.entities.FAQItem.filter({ event_id: eventId }, "order");
      setFaqs(data || []);
    } catch {}
  };

  const checkPotOrders = async (eventId) => {
    try {
      const orders = await base44.entities.Order.filter({ event_id: eventId });
      const hasPot = orders?.some(order => {
        const category = order.product_id ? (order.product_name?.toLowerCase().includes('pot') || order.product_name?.toLowerCase().includes('kit')) : false;
        return category && order.status !== 'cancelled';
      });
      setHasPotOrder(hasPot || false);
    } catch {
      setHasPotOrder(false);
    }
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

  const getTemplateComponent = (templateKey) => {
    const map = {
      classique: ClassicTemplate,
      champetre: RusticTemplate,
      minimal: MinimalTemplate,
      elegant: ElegantTemplate,
      boheme: RusticTemplate,
      floral: RusticTemplate,
      moderne: MinimalTemplate,
      joyeux: FestiveTemplate,
      festif: FestiveTemplate,
      vintage_anni: RusticTemplate,
      douceur: ClassicTemplate,
      nuage: MinimalTemplate,
      nature_bebe: RusticTemplate,
      lumiere: ElegantTemplate,
      azur: ElegantTemplate,
      rose_communion: FestiveTemplate,
      corporate: MinimalTemplate,
      dynamique: ElegantTemplate,
      nature: RusticTemplate,
      provencal: RusticTemplate,
      sobre: MinimalTemplate,
    };
    return map[templateKey] || ClassicTemplate;
  };

  const isPremium = event.plan === "premium";
  const primaryColor = event.primary_color || "#f43f5e";

  const DEFAULT_ORDER = ["couple_story","day_schedule","rsvp","best_of","photo_gallery","wishlist","seating_plan","faq","map","guest_photos","guestbook","cagnotte"];
  const sectionsOrder = event.sections_order?.length ? event.sections_order : DEFAULT_ORDER;

  const SECTION_RENDERS = {
    couple_story: isPremium && event.show_couple_story && event.couple_story && (
      <div key="couple_story" className="max-w-2xl mx-auto px-4"><CoupleStorySection event={event} /></div>
    ),
    day_schedule: isPremium && event.event_date && (
      <div key="day_schedule" className="max-w-2xl mx-auto px-4"><DayScheduleSection event={event} /></div>
    ),
    rsvp: isPremium && (
      <div key="rsvp" className="max-w-2xl mx-auto px-4"><RSVPSection event={event} /></div>
    ),
    best_of: isPremium && (
      <div key="best_of" className="max-w-2xl mx-auto px-4"><BestOfSection event={event} /></div>
    ),
    photo_gallery: isPremium && event.show_photo_gallery !== false && (
      <div key="photo_gallery" className="max-w-2xl mx-auto px-4"><PhotoGallerySection event={event} /></div>
    ),
    wishlist: isPremium && event.show_wishlist !== false && (
      <div key="wishlist" className="max-w-2xl mx-auto px-4"><WishlistSection event={event} /></div>
    ),
    seating_plan: isPremium && (
      <div key="seating_plan" className="max-w-2xl mx-auto px-4"><SeatingPlanSection event={event} /></div>
    ),
    faq: isPremium && event.show_faq !== false && (
      <div key="faq" className="max-w-2xl mx-auto px-4"><FAQSectionNew event={event} faqs={faqs} /></div>
    ),
    map: isPremium && event.show_map && event.map_address && (
      <div key="map" className="max-w-2xl mx-auto px-4"><MapSection event={event} /></div>
    ),
    guest_photos: isPremium && (
      <div key="guest_photos" className="max-w-2xl mx-auto px-4"><GuestPhotoUploadSection event={event} /></div>
    ),
    guestbook: isPremium && event.show_guestbook !== false && (
      <div key="guestbook" className="max-w-2xl mx-auto border-t border-gray-100 px-4"><GuestbookSection event={event} /></div>
    ),
    cagnotte: isPremium && event.show_cagnotte && event.cagnotte_url && (
      <div key="cagnotte" className="max-w-2xl mx-auto px-4 border-t border-gray-100"><CagnotteSection event={event} /></div>
    ),
  };
  
  const secondaryColor = event.secondary_color || "#86efac";
  const fontHeading = event.font_heading || "Cormorant Garamond";
  const fontBody = event.font_body || "Lato";
  const fontImportUrl = `https://fonts.googleapis.com/css2?family=${fontHeading.replace(/ /g, "+")}:wght@400;600;700&family=${fontBody.replace(/ /g, "+")}:wght@300;400;700&display=swap`;

  const TemplateComponent = getTemplateComponent(event.template || "classique");

  const templateContent = (
    <>
      {/* Sections dans l'ordre personnalisé */}
      {sectionsOrder.map(key => SECTION_RENDERS[key] || null)}

      {/* Flower Challenge Section - only if flower pot was ordered */}
      {hasPotOrder && (
        <div className="max-w-2xl mx-auto px-4 pb-16">
          <FlowerChallengeSection event={event} />
        </div>
      )}


    </>
  );

  return (
    <TemplateComponent
      event={event}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      fontHeading={fontHeading}
      fontBody={fontBody}
      fontImportUrl={fontImportUrl}
    >
      {templateContent}
    </TemplateComponent>
  );
}