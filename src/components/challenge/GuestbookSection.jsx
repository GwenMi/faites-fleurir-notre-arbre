import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { BookOpen, Send, Heart } from "lucide-react";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function GuestbookSection({ event, guest }) {
  const [entries, setEntries] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadEntries();
  }, [event?.id]);

  const loadEntries = async () => {
    setLoading(true);
    const data = await base44.entities.GuestbookEntry.filter({ event_id: event.id, approved: true });
    setEntries((data || []).sort((a, b) => {
      if (b.featured !== a.featured) return b.featured ? 1 : -1;
      return new Date(b.created_date) - new Date(a.created_date);
    }));
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!message.trim()) return;
    if (!guest) { toast.error("Connectez-vous pour laisser un message"); return; }
    setSending(true);
    await base44.entities.GuestbookEntry.create({
      event_id: event.id,
      pseudo: guest.pseudo,
      email: guest.email,
      message: message.trim(),
      approved: false,
    });
    setMessage("");
    toast.success("Votre message a été envoyé — il sera visible après validation des mariés 💌");
    await loadEntries();
    setSending(false);
  };

  const hasAlreadyWritten = guest ? entries.some(e => e.email === guest.email) : false;

  return (
    <div className="mt-12">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-purple-200 max-w-16" />
          <BookOpen className="w-6 h-6 text-purple-400" />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-purple-200 max-w-16" />
        </div>
        <h2 className="font-serif-elegant text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Livre d'or
        </h2>
        <p className="font-sans-clean text-gray-500 text-sm max-w-md mx-auto">
          Laissez un message personnel aux {event.couple_names} pour immortaliser ce souvenir.
        </p>
      </div>

      {/* Write message */}
      {guest && !hasAlreadyWritten && (
        <div className="bg-white border border-purple-100 rounded-2xl p-5 mb-6 shadow-sm">
          <p className="font-sans-clean text-sm font-semibold text-gray-700 mb-3">✍️ Écrire un message</p>
          <Textarea
            placeholder={`Cher(s) ${event.couple_names}, ...`}
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="rounded-xl resize-none font-sans-clean text-sm mb-3"
            rows={4}
          />
          <Button
            onClick={handleSubmit}
            disabled={sending || !message.trim()}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 text-white font-semibold hover:opacity-90 transition"
          >
            <Send className="w-4 h-4 mr-2" />
            {sending ? "Envoi..." : "Ajouter au livre d'or"}
          </Button>
        </div>
      )}

      {guest && hasAlreadyWritten && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-6 text-center">
          <p className="text-purple-600 font-semibold font-sans-clean text-sm">💌 Votre message figure déjà dans le livre d'or !</p>
        </div>
      )}

      {!guest && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6 text-center">
          <p className="text-gray-500 font-sans-clean text-sm">Connectez-vous pour laisser un message dans le livre d'or.</p>
        </div>
      )}

      {/* Entries */}
      {loading ? (
        <div className="text-center py-8 text-gray-400 text-sm">Chargement...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Heart className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Soyez le premier à laisser un message 💌</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => (
            <div key={entry.id} className={`bg-white border rounded-2xl p-5 shadow-sm ${entry.featured ? "border-yellow-300 ring-1 ring-yellow-200" : "border-gray-100"}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-500 font-bold text-sm">{entry.pseudo[0].toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-gray-800 font-sans-clean">{entry.pseudo}</p>
                    {entry.featured && <span className="text-xs">⭐</span>}
                  </div>
                  <p className="text-xs text-gray-400 font-sans-clean">{formatDate(entry.created_date)}</p>
                </div>
              </div>
              <p className="font-serif-elegant text-gray-700 text-base leading-relaxed italic">"{entry.message}"</p>
              {entry.photo_url && (
                <img src={entry.photo_url} alt="" className="mt-3 rounded-xl max-h-48 object-cover border border-gray-100" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}