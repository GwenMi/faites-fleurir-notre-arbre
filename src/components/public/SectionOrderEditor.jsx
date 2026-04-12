import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Eye, EyeOff } from "lucide-react";

const AVAILABLE_SECTIONS = [
  { id: "couple_story", label: "🔔 Histoire du couple", icon: "💑" },
  { id: "day_schedule", label: "⏰ Déroulé du jour", icon: "🕐" },
  { id: "rsvp", label: "💬 RSVP", icon: "✋" },
  { id: "best_of", label: "📸 Meilleur de l'album", icon: "⭐" },
  { id: "photo_gallery", label: "🖼️ Galerie photos", icon: "📷" },
  { id: "wishlist", label: "🎁 Liste de cadeaux", icon: "🎁" },
  { id: "seating_plan", label: "🪑 Plan de table", icon: "🪑" },
  { id: "faq", label: "❓ FAQ", icon: "❓" },
  { id: "map", label: "📍 Localisation", icon: "🗺️" },
  { id: "guest_photos", label: "📸 Photos des invités", icon: "🤳" },
  { id: "guestbook", label: "📖 Livre d'or", icon: "📝" },
  { id: "cagnotte", label: "🎯 Cagnotte", icon: "💰" },
];

export default function SectionOrderEditor({ order, onChange }) {
  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination || source.index === destination.index) return;

    const newOrder = Array.from(order);
    const [movedItem] = newOrder.splice(source.index, 1);
    newOrder.splice(destination.index, 0, movedItem);
    onChange(newOrder);
  };

  const toggleSection = (sectionId) => {
    const idx = order.indexOf(sectionId);
    if (idx > -1) {
      const newOrder = order.filter((s) => s !== sectionId);
      onChange(newOrder);
    } else {
      onChange([...order, sectionId]);
    }
  };

  const availableNotOrdered = AVAILABLE_SECTIONS.filter((s) => !order.includes(s.id));

  return (
    <div className="space-y-4">
      {/* Sections actives (ordonnées) */}
      <div className="space-y-2">
        <p className="font-semibold text-sm text-gray-700">Sections affichées (dans l'ordre)</p>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="active-sections" type="SECTION">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-2 p-4 rounded-xl border-2 transition ${
                  snapshot.isDraggingOver
                    ? "border-purple-400 bg-purple-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                {order.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">
                    Glissez des sections depuis le bas
                  </p>
                ) : (
                  order.map((sectionId, index) => {
                    const section = AVAILABLE_SECTIONS.find((s) => s.id === sectionId);
                    return (
                      <Draggable key={sectionId} draggableId={sectionId} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition ${
                              snapshot.isDragging
                                ? "bg-purple-100 border-purple-300 shadow-lg"
                                : "bg-gray-50 border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div {...provided.dragHandleProps} className="text-gray-400">
                              <GripVertical className="w-4 h-4" />
                            </div>
                            <span className="text-lg">{section?.icon}</span>
                            <span className="flex-1 font-medium text-sm text-gray-700">
                              {section?.label}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleSection(sectionId)}
                              className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-500 transition"
                            >
                              <EyeOff className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    );
                  })
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Sections disponibles (non affichées) */}
      {availableNotOrdered.length > 0 && (
        <div className="space-y-2">
          <p className="font-semibold text-sm text-gray-700">Sections disponibles</p>
          <div className="grid grid-cols-2 gap-2">
            {availableNotOrdered.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => toggleSection(section.id)}
                className="p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition text-left flex items-center gap-2"
              >
                <Eye className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs font-semibold text-gray-700">{section.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}