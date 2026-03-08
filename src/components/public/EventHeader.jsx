import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Heart, Calendar } from "lucide-react";

export default function EventHeader({ event, tpl }) {
  const formattedDate = event.event_date
    ? format(new Date(event.event_date), "d MMMM yyyy", { locale: fr })
    : "";

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${tpl.primary}22, ${tpl.secondary}33)` }}
    >
      {event.cover_image && (
        <div className="relative h-64 md:h-80 w-full">
          <img
            src={event.cover_image}
            alt="couverture"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/50" />
        </div>
      )}

      <div className={`relative z-10 text-center px-6 py-10 ${event.cover_image ? "absolute bottom-0 left-0 right-0" : ""}`}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="w-4 h-4" style={{ color: tpl.primary }} fill="currentColor" />
          <span className="text-sm font-medium tracking-widest uppercase opacity-70"
            style={{ color: event.cover_image ? "white" : tpl.primary }}>
            {event.event_type || "Mariage"}
          </span>
          <Heart className="w-4 h-4" style={{ color: tpl.primary }} fill="currentColor" />
        </div>
        <h1
          className="text-3xl md:text-5xl font-bold mb-2"
          style={{
            fontFamily: tpl.fontTitle,
            color: event.cover_image ? "white" : "#2d1b4e",
          }}
        >
          {event.couple_names}
        </h1>
        {formattedDate && (
          <div className={`flex items-center justify-center gap-2 text-sm ${event.cover_image ? "text-white/80" : "text-gray-500"}`}>
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
        )}
        {event.welcome_message && (
          <p className={`mt-4 max-w-md mx-auto text-sm leading-relaxed italic ${event.cover_image ? "text-white/90" : "text-gray-600"}`}>
            "{event.welcome_message}"
          </p>
        )}
      </div>
    </div>
  );
}