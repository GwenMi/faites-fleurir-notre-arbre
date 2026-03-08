import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Camera, MessageCircle, ChevronDown, ChevronUp, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ReactionBar from "./ReactionBar";

export default function GuestPhotoFeed({ event, photos, comments, reactions, guestName, onRefresh, tpl }) {
  const [commentText, setCommentText] = useState({});
  const [expandedPhoto, setExpandedPhoto] = useState(null);
  const [submitting, setSubmitting] = useState({});

  const primary = tpl?.primary || "#f43f5e";
  const secondary = tpl?.secondary || "#86efac";

  const approvedPhotos = (photos || [])
    .filter(p => p.approved)
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const submitComment = async (photoId) => {
    const text = (commentText[photoId] || "").trim();
    if (!text) return;
    setSubmitting(s => ({ ...s, [photoId]: true }));
    await base44.entities.Comment.create({
      photo_id: photoId,
      event_id: event.id,
      guest_name: guestName,
      message: text,
    });
    setCommentText(c => ({ ...c, [photoId]: "" }));
    onRefresh();
    setSubmitting(s => ({ ...s, [photoId]: false }));
  };

  if (approvedPhotos.length === 0) return (
    <div className="text-center py-14 text-gray-400 px-6">
      <Camera className="w-10 h-10 mx-auto mb-3 opacity-30" />
      <p className="text-sm">Aucune photo pour l'instant — soyez le premier !</p>
    </div>
  );

  return (
    <div className="space-y-4 px-4 pb-8 max-w-lg mx-auto">
      {approvedPhotos.map(photo => {
        const photoComments = (comments || []).filter(c => c.photo_id === photo.id);
        const isExpanded = expandedPhoto === photo.id;

        return (
          <div key={photo.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Image */}
            <img src={photo.image} alt={photo.guest_name} className="w-full object-cover max-h-96" />

            <div className="p-4">
              {/* Author */}
              <div className="flex items-start gap-2.5 mb-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: primary }}
                >
                  {photo.guest_name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800">{photo.guest_name}</p>
                  {photo.message && <p className="text-sm text-gray-500 leading-snug">{photo.message}</p>}
                  <p className="text-xs text-gray-300 mt-0.5">
                    {new Date(photo.created_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                  </p>
                </div>
              </div>

              {/* Reactions */}
              <ReactionBar
                targetId={photo.id}
                targetType="photo"
                reactions={reactions}
                guestName={guestName}
                eventId={event.id}
                onRefresh={onRefresh}
              />

              {/* Comments toggle */}
              <button
                onClick={() => setExpandedPhoto(isExpanded ? null : photo.id)}
                className="flex items-center gap-1.5 mt-3 text-xs text-gray-400 hover:text-gray-600 transition"
              >
                <MessageCircle className="w-4 h-4" />
                {photoComments.length > 0
                  ? `${photoComments.length} commentaire${photoComments.length > 1 ? "s" : ""}`
                  : "Commenter"}
                {photoComments.length > 0 && (isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
              </button>

              {/* Comments */}
              {isExpanded && (
                <div className="mt-3 space-y-2 border-t border-gray-50 pt-3">
                  {photoComments.map(c => (
                    <div key={c.id} className="flex items-start gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: secondary }}
                      >
                        {c.guest_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-xl px-3 py-2">
                          <p className="text-xs font-semibold text-gray-700 mb-0.5">{c.guest_name}</p>
                          <p className="text-sm text-gray-600">{c.message}</p>
                        </div>
                        {/* Reactions on comment */}
                        <div className="mt-1 ml-1">
                          <ReactionBar
                            targetId={c.id}
                            targetType="comment"
                            reactions={reactions}
                            guestName={guestName}
                            eventId={event.id}
                            onRefresh={onRefresh}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add comment */}
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: primary }}
                    >
                      {guestName?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <Input
                      placeholder="Ajouter un commentaire…"
                      value={commentText[photo.id] || ""}
                      onChange={e => setCommentText(c => ({ ...c, [photo.id]: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && submitComment(photo.id)}
                      className="rounded-full h-9 text-sm flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() => submitComment(photo.id)}
                      disabled={submitting[photo.id] || !commentText[photo.id]?.trim()}
                      className="rounded-full h-9 w-9 p-0 flex-shrink-0"
                      style={{ background: primary }}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}