import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Trash2, MessageCircle, Smile } from "lucide-react";
import { toast } from "sonner";

export default function CommentModeration({ comments, reactions, photos, onRefresh }) {
  const [loading, setLoading] = useState({});

  const deleteComment = async (comment) => {
    setLoading(l => ({ ...l, [comment.id]: true }));
    await base44.entities.Comment.delete(comment.id);
    toast.success("Commentaire supprimé");
    onRefresh();
    setLoading(l => ({ ...l, [comment.id]: false }));
  };

  const deleteReaction = async (reaction) => {
    setLoading(l => ({ ...l, [reaction.id]: true }));
    await base44.entities.Reaction.delete(reaction.id);
    toast.success("Réaction supprimée");
    onRefresh();
    setLoading(l => ({ ...l, [reaction.id]: false }));
  };

  const getPhotoForComment = (comment) => photos.find(p => p.id === comment.photo_id);

  return (
    <div className="space-y-8">
      {/* Comments */}
      <div>
        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-blue-400" />
          Commentaires ({comments.length})
        </h3>
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucun commentaire pour l'instant</p>
          </div>
        ) : (
          <div className="space-y-2">
            {comments.map(c => {
              const photo = getPhotoForComment(c);
              return (
                <div key={c.id} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-semibold text-sm text-gray-800">{c.guest_name}</span>
                      {photo && (
                        <span className="text-xs text-gray-400 bg-gray-200 rounded-full px-2 py-0.5">
                          📸 sur la photo de {photo.guest_name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{c.message}</p>
                    <p className="text-xs text-gray-300 mt-1">
                      {new Date(c.created_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteComment(c)}
                    disabled={loading[c.id]}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl h-8 w-8 p-0 flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reactions */}
      <div>
        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Smile className="w-4 h-4 text-rose-400" />
          Réactions ({reactions.length})
        </h3>
        {reactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Smile className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucune réaction pour l'instant</p>
          </div>
        ) : (
          <div className="space-y-2">
            {reactions.map(r => (
              <div key={r.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <span className="text-xl">{r.emoji}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-gray-700">{r.guest_name}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {r.target_type === "photo" ? "sur une photo" : "sur un commentaire"}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteReaction(r)}
                  disabled={loading[r.id]}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl h-8 w-8 p-0 flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}