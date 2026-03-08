import { useState } from "react";
import { base44 } from "@/api/base44Client";

const EMOJIS = ["❤️", "😂", "😮", "😢", "👏", "🎉"];

export default function ReactionBar({ targetId, targetType, reactions, guestName, eventId, onRefresh }) {
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const targetReactions = reactions.filter(r => r.target_id === targetId);

  const grouped = EMOJIS.map(emoji => ({
    emoji,
    count: targetReactions.filter(r => r.emoji === emoji).length,
    mine: targetReactions.some(r => r.emoji === emoji && r.guest_name === guestName),
    reaction: targetReactions.find(r => r.emoji === emoji && r.guest_name === guestName),
  })).filter(g => g.count > 0);

  const toggle = async (emoji) => {
    if (loading) return;
    setLoading(true);
    const existing = targetReactions.find(r => r.emoji === emoji && r.guest_name === guestName);
    if (existing) {
      await base44.entities.Reaction.delete(existing.id);
    } else {
      await base44.entities.Reaction.create({
        event_id: eventId,
        target_id: targetId,
        target_type: targetType,
        emoji,
        guest_name: guestName,
      });
    }
    setShowPicker(false);
    onRefresh();
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-1 flex-wrap relative">
      {grouped.map(g => (
        <button
          key={g.emoji}
          onClick={() => toggle(g.emoji)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-sm border transition ${
            g.mine ? "bg-rose-50 border-rose-300 shadow-sm" : "bg-gray-50 border-gray-200 hover:bg-gray-100"
          }`}
        >
          {g.emoji} <span className="text-xs text-gray-500 font-medium">{g.count}</span>
        </button>
      ))}

      <div className="relative">
        <button
          onClick={() => setShowPicker(p => !p)}
          className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-base transition leading-none"
        >
          +
        </button>
        {showPicker && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setShowPicker(false)} />
            <div className="absolute bottom-9 left-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 flex gap-1 z-30">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => toggle(e)}
                  disabled={loading}
                  className="text-xl hover:scale-125 transition-transform w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50"
                >
                  {e}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}