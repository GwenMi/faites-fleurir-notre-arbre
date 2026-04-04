import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen, Send, Loader2 } from "lucide-react";

export default function GuestbookSection({ event, primaryColor }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pseudo, setPseudo] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { loadEntries(); }, [event?.id]);

  const loadEntries = async () => {
    const data = await base44.entities.GuestbookEntry.filter({ event_id: event.id, approved: true });
    setEntries((data || []).sort((a, b) => {
      if (b.featured && !a.featured) return 1;
      if (a.featured && !b.featured) return -1;
      return new Date(b.created_date) - new Date(a.created_date);
    }));
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pseudo.trim() || !message.trim()) return;
    setSubmitting(true);
    await base44.entities.GuestbookEntry.create({
      event_id: event.id,
      pseudo: pseudo.trim(),
      message: message.trim(),
      approved: false,
    });
    setPseudo("");
    setMessage("");
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div className="py-16 px-4">
      <div className="text-center mb-10">
        <p className="text-xs tracking-[0.25em] uppercase mb-2 font-sans-clean" style={{ color: primaryColor }}>
          Livre d'or
        </p>
        <h2 className="font-serif-elegant text-4xl font-bold text-gray-800">Laissez un message</h2>
        <div className="h-px max-w-[80px] mx-auto mt-4" style={{ background: primaryColor + "66" }} />
      </div>

      {/* Form */}
      {!submitted ? (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto mb-12 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Votre prénom</label>
            <input
              type="text"
              value={pseudo}
              onChange={e => setPseudo(e.target.value)}
              placeholder="Marie"
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ "--tw-ring-color": primaryColor + "44" }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Votre message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Tous mes vœux de bonheur…"
              required
              rows={4}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !pseudo.trim() || !message.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-semibold text-sm transition disabled:opacity-50"
            style={{ background: primaryColor }}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Envoyer mon message
          </button>
        </form>
      ) : (
        <div className="max-w-lg mx-auto mb-12 text-center py-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-3xl block mb-2">💌</span>
          <p className="font-sans-clean font-semibold text-gray-700">Merci pour votre message !</p>
          <p className="font-sans-clean text-sm text-gray-400 mt-1">Il sera visible après validation par les organisateurs.</p>
        </div>
      )}

      {/* Entries */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-sans-clean text-sm text-gray-400">Soyez le premier à laisser un message !</p>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto columns-1 sm:columns-2 gap-4 space-y-4">
          {entries.map(entry => (
            <div key={entry.id} className="break-inside-avoid bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: primaryColor }}
                >
                  {entry.pseudo[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-sans-clean font-semibold text-sm text-gray-800">{entry.pseudo}</p>
                  {entry.featured && <span className="text-xs text-yellow-500">⭐ Message mis en avant</span>}
                </div>
              </div>
              <p className="font-sans-clean text-sm text-gray-600 italic leading-relaxed">"{entry.message}"</p>
              {entry.photo_url && (
                <img src={entry.photo_url} alt="" className="mt-3 rounded-xl w-full object-cover max-h-48 border border-gray-100" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
