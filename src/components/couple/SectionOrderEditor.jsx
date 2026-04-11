import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";

const SECTION_LABELS = {
  couple_story:  { label: "Notre histoire", icon: "💑" },
  day_schedule:  { label: "Programme de la journée", icon: "📅" },
  rsvp:          { label: "RSVP", icon: "✉️" },
  best_of:       { label: "Best of", icon: "⭐" },
  photo_gallery: { label: "Galerie photo", icon: "📸" },
  wishlist:      { label: "Liste de cadeaux", icon: "🎁" },
  seating_plan:  { label: "Plan de table", icon: "🪑" },
  faq:           { label: "FAQ", icon: "❓" },
  map:           { label: "Plan d'accès", icon: "📍" },
  guest_photos:  { label: "Photos des invités", icon: "🌸" },
  guestbook:     { label: "Livre d'or", icon: "📖" },
  cagnotte:      { label: "Cagnotte", icon: "💝" },
};

export const DEFAULT_SECTIONS_ORDER = Object.keys(SECTION_LABELS);

export default function SectionOrderEditor({ order, onChange }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(order);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    onChange(items);
  };

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Glissez pour réordonner les sections
      </p>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {order.map((key, index) => {
                const section = SECTION_LABELS[key];
                if (!section) return null;
                return (
                  <Draggable key={key} draggableId={key} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 bg-white transition-shadow ${
                          snapshot.isDragging
                            ? "border-rose-300 shadow-lg"
                            : "border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <span className="text-base">{section.icon}</span>
                        <span className="text-sm font-medium text-gray-700 flex-1">{section.label}</span>
                        <span className="text-xs text-gray-300">#{index + 1}</span>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}