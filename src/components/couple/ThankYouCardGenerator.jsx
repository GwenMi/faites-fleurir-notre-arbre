import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, Send, Printer, X, Download, Image, Check } from "lucide-react";
import { toast } from "sonner";

const CARD_TEMPLATES = [
  { key: "classique", label: "Classique", bg: "from-rose-50 to-pink-50", border: "border-rose-200", text: "text-rose-700", accent: "#f43f5e" },
  { key: "elegant",   label: "Élégant",   bg: "from-indigo-50 to-purple-50", border: "border-indigo-200", text: "text-indigo-700", accent: "#6366f1" },
  { key: "champetre", label: "Champêtre", bg: "from-green-50 to-emerald-50", border: "border-green-200", text: "text-green-700", accent: "#65a30d" },
  { key: "dore",      label: "Doré",      bg: "from-amber-50 to-yellow-50", border: "border-amber-200", text: "text-amber-700", accent: "#d97706" },
];

function CardPreview({ gift, message, photo, template, coupleNames }) {
  const t = CARD_TEMPLATES.find(c => c.key === template) || CARD_TEMPLATES[0];
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${t.bg} border-2 ${t.border} overflow-hidden shadow-lg`} style={{ maxWidth: 420 }}>
      {photo && (
        <div className="relative h-40 overflow-hidden">
          <img src={photo.image} alt="Fleur" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
          <p className="absolute bottom-2 left-3 text-white text-xs font-semibold opacity-80">📸 {photo.guest_name}</p>
        </div>
      )}
      <div className="p-5">
        <p className="text-xs tracking-widest uppercase mb-2 font-semibold" style={{ color: t.accent }}>
          Merci infiniment 🌸
        </p>
        <h3 className="text-xl font-bold text-gray-800 mb-1" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
          Cher·e {gift.guest_name.split(" ")[0]}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mt-3">{message}</p>
        <div className="mt-4 pt-3 border-t" style={{ borderColor: t.accent + "33" }}>
          <p className="text-xs font-semibold" style={{ color: t.accent }}>Avec tout notre amour,</p>
          <p className="text-sm font-bold text-gray-700 mt-0.5">{coupleNames}</p>
        </div>
      </div>
    </div>
  );
}

function ThankYouModal({ gift, event, guestPhotos, onClose }) {
  const [message, setMessage] = useState("");
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [template, setTemplate] = useState("classique");
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    // Default message
    const firstName = gift.guest_name.split(" ")[0];
    setMessage(`Cher·e ${firstName},\n\nNous tenons à vous remercier chaleureusement pour votre ${gift.category === "cagnotte" ? `contribution de ${gift.amount}€ à notre cagnotte` : `magnifique cadeau : ${gift.gift_description}`}.\n\nVotre présence à nos côtés lors de cette journée exceptionnelle restera gravée dans nos cœurs pour toujours.\n\nMerci du fond du cœur,\n${event.couple_names}`);
  }, [gift, event]);

  const generateAI = async () => {
    setGenerating(true);
    const photoContext = selectedPhoto ? ` La photo de leur fleur en pleine floraison est magnifique.` : "";
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Rédige un message de remerciement de mariage en français, chaleureux et poétique, de la part de "${event.couple_names}" pour "${gift.guest_name}" qui leur a offert "${gift.gift_description}".${photoContext} 4-5 phrases, sans formule de politesse finale (sera ajoutée automatiquement).`,
    });
    setMessage(result);
    setGenerating(false);
  };

  const handleSendEmail = async () => {
    if (!gift.guest_email) { toast.error("Pas d'email pour cet invité"); return; }
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: gift.guest_email,
      subject: `💌 Merci infiniment — ${event.couple_names}`,
      body: `Cher·e ${gift.guest_name.split(" ")[0]},\n\n${message}\n\n${event.couple_names} 🌸`,
    });
    await base44.entities.ThankYouGift.update(gift.id, {
      thank_you_sent: true,
      thank_you_sent_date: new Date().toISOString(),
    });
    setSent(true);
    setSending(false);
    toast.success(`Email envoyé à ${gift.guest_email} ✓`);
  };

  const handlePrint = () => {
    window.print();
  };

  const guestPhotoForThisPerson = guestPhotos.filter(p =>
    p.guest_name?.toLowerCase().includes(gift.guest_name.split(" ")[0].toLowerCase()) ||
    gift.guest_name?.toLowerCase().includes(p.guest_name?.split(" ")[0]?.toLowerCase() || "")
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b">
          <div>
            <h3 className="font-bold text-gray-800">Carte de remerciement</h3>
            <p className="text-xs text-gray-400 mt-0.5">Pour {gift.guest_name} — {gift.gift_description}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="w-4 h-4 text-gray-400" /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Template picker */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Modèle de carte</p>
            <div className="flex flex-wrap gap-2">
              {CARD_TEMPLATES.map(t => (
                <button key={t.key} onClick={() => setTemplate(t.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${template === t.key ? "border-rose-400 bg-rose-50 text-rose-600" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Photo from guests */}
          {guestPhotos.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                <Image className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                Ajouter une photo partagée par les invités
              </p>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setSelectedPhoto(null)}
                  className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-gray-400 text-xs transition ${!selectedPhoto ? "border-rose-400 bg-rose-50" : "border-gray-200 hover:border-gray-300"}`}>
                  Aucune
                </button>
                {guestPhotos.slice(0, 8).map(p => (
                  <button key={p.id} onClick={() => setSelectedPhoto(p === selectedPhoto ? null : p)}
                    className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition ${selectedPhoto?.id === p.id ? "border-rose-400 ring-2 ring-rose-200" : "border-gray-200 hover:border-gray-300"}`}>
                    <img src={p.image} alt={p.guest_name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Message</p>
              <Button size="sm" onClick={generateAI} disabled={generating}
                className="bg-violet-500 hover:bg-violet-600 text-white text-xs gap-1 rounded-lg h-7 px-3">
                {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                Générer avec l'IA
              </Button>
            </div>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={7}
              className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-rose-200" />
          </div>

          {/* Preview */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Aperçu</p>
            <div className="print-area">
              <CardPreview gift={gift} message={message} photo={selectedPhoto} template={template} coupleNames={event.couple_names} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2 border-t">
            <Button onClick={handleSendEmail} disabled={sending || sent || !gift.guest_email}
              className="gap-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white">
              {sent ? <Check className="w-4 h-4" /> : sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sent ? "Email envoyé ✓" : !gift.guest_email ? "Pas d'email" : `Envoyer à ${gift.guest_email}`}
            </Button>
            <Button variant="outline" onClick={handlePrint} className="gap-2 rounded-xl">
              <Printer className="w-4 h-4" /> Imprimer / PDF
            </Button>
          </div>
        </div>
      </div>

      <style>{`@media print { body > *:not(.print-area) { display: none; } .print-area { display: block !important; } }`}</style>
    </div>
  );
}

export default function ThankYouCardGenerator({ event }) {
  const [gifts, setGifts] = useState([]);
  const [guestPhotos, setGuestPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGift, setSelectedGift] = useState(null);

  useEffect(() => { loadData(); }, [event?.id]);

  const loadData = async () => {
    setLoading(true);
    const [g, p] = await Promise.all([
      base44.entities.ThankYouGift.filter({ event_id: event.id }, "-created_date"),
      base44.entities.Photo.filter({ event_id: event.id, approved: true }, "-created_date", 50),
    ]);
    setGifts(g || []);
    setGuestPhotos(p || []);
    setLoading(false);
  };

  const pending = gifts.filter(g => !g.thank_you_sent);
  const done = gifts.filter(g => g.thank_you_sent);

  if (loading) return <div className="py-10 text-center text-gray-400 text-sm"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold text-gray-800">💌 Cartes de remerciements</h3>
        <p className="text-xs text-gray-400 mt-0.5">Générez des cartes personnalisées avec les photos partagées par vos invités</p>
      </div>

      {guestPhotos.length > 0 && (
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-xs text-purple-700 flex items-start gap-2">
          <Image className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span><strong>{guestPhotos.length} photo{guestPhotos.length > 1 ? "s" : ""}</strong> de vos invités disponibles pour personnaliser les cartes !</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total cadeaux", value: gifts.length, color: "text-gray-700" },
          { label: "À remercier", value: pending.length, color: "text-amber-600" },
          { label: "Envoyés", value: done.length, color: "text-emerald-600" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-3 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {gifts.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">
          <p>Aucun cadeau enregistré.</p>
          <p className="text-xs mt-1">Ajoutez des cadeaux dans l'onglet "Remerciements".</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div>
              <p className="text-xs font-bold text-amber-600 mb-2 uppercase tracking-wide">À remercier ({pending.length})</p>
              <div className="space-y-2">
                {pending.map(gift => (
                  <div key={gift.id} className="flex items-center gap-3 bg-white border border-amber-100 rounded-2xl p-3 hover:border-amber-200 transition">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-lg flex-shrink-0">
                      {gift.category === "cagnotte" ? "💰" : gift.category === "cadeau" ? "🎁" : "✨"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{gift.guest_name}</p>
                      <p className="text-xs text-gray-400 truncate">{gift.gift_description}{gift.amount ? ` · ${gift.amount}€` : ""}</p>
                    </div>
                    <Button size="sm" onClick={() => setSelectedGift(gift)}
                      className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs gap-1 flex-shrink-0">
                      <Sparkles className="w-3 h-3" /> Créer
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {done.length > 0 && (
            <div>
              <p className="text-xs font-bold text-emerald-600 mb-2 uppercase tracking-wide">Déjà remerciés ({done.length})</p>
              <div className="space-y-2">
                {done.map(gift => (
                  <div key={gift.id} className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-3 opacity-70">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700">{gift.guest_name}</p>
                      <p className="text-xs text-gray-400 truncate">{gift.gift_description}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedGift(gift)} className="text-gray-400 text-xs">
                      Renvoyer
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {selectedGift && (
        <ThankYouModal
          gift={selectedGift}
          event={event}
          guestPhotos={guestPhotos}
          onClose={() => { setSelectedGift(null); loadData(); }}
        />
      )}
    </div>
  );
}