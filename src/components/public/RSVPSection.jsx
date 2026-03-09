import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Heart, Loader2 } from "lucide-react";

export default function RSVPSection({ event, primaryColor }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ guest_name: "", email: "", attending: null, party_size: 1, notes: "", answers: {} });

  useEffect(() => {
    base44.entities.RSVPQuestion.filter({ event_id: event.id }).then(q => {
      setQuestions((q || []).sort((a, b) => (a.order || 0) - (b.order || 0)));
      setLoading(false);
    });
  }, [event.id]);

  const handleSubmit = async () => {
    if (!form.guest_name.trim() || form.attending === null) return;
    setSubmitting(true);
    // Check for duplicate
    const existing = await base44.entities.RSVPResponse.filter({ event_id: event.id, guest_name: form.guest_name.trim() });
    if (existing && existing.length > 0) {
      // Update existing
      await base44.entities.RSVPResponse.update(existing[0].id, {
        email: form.email, attending: form.attending,
        party_size: Number(form.party_size), notes: form.notes, answers: form.answers
      });
    } else {
      await base44.entities.RSVPResponse.create({
        event_id: event.id, guest_name: form.guest_name.trim(),
        email: form.email, attending: form.attending,
        party_size: Number(form.party_size), notes: form.notes, answers: form.answers
      });
      // Auto-add to seating guest list if attending (check duplicate first)
      if (form.attending) {
        const existingGuest = await base44.entities.SeatingGuest.filter({ event_id: event.id, name: form.guest_name.trim() });
        if (!existingGuest || existingGuest.length === 0) {
          await base44.entities.SeatingGuest.create({
            event_id: event.id, name: form.guest_name.trim(), email: form.email,
            attending: true, source: "rsvp"
          });
        }
      }
    }
    setSubmitted(true);
    setSubmitting(false);
  };

  if (loading) return null;

  const pc = primaryColor || "#c084fc";

  if (submitted) return (
    <div className="my-10 text-center">
      <div className="inline-flex flex-col items-center gap-3 bg-white rounded-3xl shadow-sm border border-gray-100 px-10 py-8">
        {form.attending
          ? <><CheckCircle2 className="w-12 h-12 text-green-400" /><p className="text-lg font-bold text-gray-800">Merci, {form.guest_name} !</p><p className="text-gray-500 text-sm">Votre présence est confirmée 🎉</p></>
          : <><XCircle className="w-12 h-12 text-rose-300" /><p className="text-lg font-bold text-gray-800">Réponse enregistrée</p><p className="text-gray-500 text-sm">Vous manquerez à la fête 🌸</p></>
        }
      </div>
    </div>
  );

  return (
    <div className="my-10">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2" style={{ color: pc }}>
          <Heart className="w-5 h-5" />
          <h2 className="text-xl font-bold" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Confirmer votre présence</h2>
          <Heart className="w-5 h-5" />
        </div>
        <p className="text-gray-400 text-sm">Merci de répondre avant le jour J</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
        {/* Attending choice */}
        <div className="flex gap-3">
          <button onClick={() => setForm(f => ({ ...f, attending: true }))}
            className={`flex-1 py-3 rounded-2xl border-2 font-medium text-sm transition-all ${form.attending === true ? "border-green-400 bg-green-50 text-green-700" : "border-gray-100 bg-gray-50 text-gray-500 hover:border-green-200"}`}>
            ✅ Oui, je serai là !
          </button>
          <button onClick={() => setForm(f => ({ ...f, attending: false }))}
            className={`flex-1 py-3 rounded-2xl border-2 font-medium text-sm transition-all ${form.attending === false ? "border-red-300 bg-red-50 text-red-600" : "border-gray-100 bg-gray-50 text-gray-500 hover:border-red-200"}`}>
            ❌ Je ne pourrai pas venir
          </button>
        </div>

        {/* Name + email */}
        <Input placeholder="Votre prénom et nom *" value={form.guest_name} onChange={e => setForm(f => ({ ...f, guest_name: e.target.value }))} className="rounded-xl" />
        <Input placeholder="Email (optionnel)" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="rounded-xl" />

        {/* Party size */}
        {form.attending && (
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-sm text-gray-600 flex-1">Nombre de personnes (vous inclus)</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setForm(f => ({ ...f, party_size: Math.max(1, (f.party_size || 1) - 1) }))}
                className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 flex items-center justify-center font-bold">−</button>
              <span className="w-6 text-center font-bold text-gray-800">{form.party_size || 1}</span>
              <button onClick={() => setForm(f => ({ ...f, party_size: (f.party_size || 1) + 1 }))}
                className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 flex items-center justify-center font-bold">+</button>
            </div>
          </div>
        )}

        {/* Custom questions */}
        {questions.map(q => (
          <div key={q.id}>
            <label className="text-sm text-gray-600 mb-1.5 block">{q.question}{q.required && <span className="text-rose-400 ml-1">*</span>}</label>
            {q.type === "text" && (
              <Input placeholder="Votre réponse…" value={(form.answers || {})[q.id] || ""}
                onChange={e => setForm(f => ({ ...f, answers: { ...(f.answers || {}), [q.id]: e.target.value } }))} className="rounded-xl" />
            )}
            {q.type === "yes_no" && (
              <div className="flex gap-2">
                {["Oui", "Non"].map(opt => (
                  <button key={opt} onClick={() => setForm(f => ({ ...f, answers: { ...(f.answers || {}), [q.id]: opt } }))}
                    className={`flex-1 py-2 rounded-xl border text-sm transition ${(form.answers || {})[q.id] === opt ? "border-purple-400 bg-purple-50 text-purple-700 font-semibold" : "border-gray-100 bg-gray-50 text-gray-500"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
            {q.type === "choice" && (
              <div className="flex flex-wrap gap-2">
                {(q.options || []).map(opt => (
                  <button key={opt} onClick={() => setForm(f => ({ ...f, answers: { ...(f.answers || {}), [q.id]: opt } }))}
                    className={`px-3 py-1.5 rounded-xl border text-xs transition ${(form.answers || {})[q.id] === opt ? "border-purple-400 bg-purple-50 text-purple-700 font-semibold" : "border-gray-100 bg-gray-50 text-gray-500"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Notes */}
        <div>
          <label className="text-sm text-gray-600 mb-1.5 block">Message pour les organisateurs (optionnel)</label>
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
            className="w-full rounded-xl border border-input px-3 py-2 text-sm bg-white resize-none" placeholder="Un mot doux, une question…" />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting || !form.guest_name.trim() || form.attending === null}
          className="w-full h-11 rounded-2xl font-semibold text-white"
          style={{ background: `linear-gradient(135deg, ${pc}, ${pc}cc)` }}
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Envoyer ma réponse 💌"}
        </Button>
      </div>
    </div>
  );
}