import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, ClipboardList } from "lucide-react";
import { toast } from "sonner";

export default function RSVPSection({ event, primaryColor }) {
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState({ guest_name: "", email: "", attending: null, party_size: 1, answers: {}, notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!event?.id) return;
    base44.entities.RSVPQuestion.filter({ event_id: event.id })
      .then(res => setQuestions((res || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))));
  }, [event?.id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setAnswer = (qid, val) => setForm(f => ({ ...f, answers: { ...f.answers, [qid]: val } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.guest_name.trim() || form.attending === null) {
      toast.error("Merci de renseigner votre nom et votre présence.");
      return;
    }
    setSubmitting(true);
    await base44.entities.RSVPResponse.create({
      event_id: event.id,
      guest_name: form.guest_name.trim(),
      email: form.email.trim(),
      attending: form.attending,
      party_size: form.attending ? form.party_size : 0,
      answers: form.answers,
      notes: form.notes,
    });
    toast.success("Réponse envoyée ! Merci 🌸");
    setDone(true);
    setSubmitting(false);
  };

  return (
    <div className="px-4 py-12">
      <style>{`
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
      `}</style>

      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-px flex-1 max-w-16" style={{ background: `linear-gradient(to right, transparent, ${primaryColor}66)` }} />
          <ClipboardList className="w-5 h-5" style={{ color: primaryColor }} />
          <div className="h-px flex-1 max-w-16" style={{ background: `linear-gradient(to left, transparent, ${primaryColor}66)` }} />
        </div>
        <h2 className="font-serif-elegant text-3xl md:text-4xl font-bold text-gray-800">RSVP</h2>
        <p className="font-sans-clean text-sm text-gray-400 mt-1">Confirmez votre présence</p>
      </div>

      {done ? (
        <div className="text-center py-10">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3" style={{ color: primaryColor }} />
          <h3 className="font-serif-elegant text-2xl font-bold text-gray-800 mb-1">Merci pour votre réponse !</h3>
          <p className="font-sans-clean text-sm text-gray-500">Les mariés ont bien reçu votre confirmation.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
          <Input placeholder="Votre prénom & nom *" value={form.guest_name}
            onChange={e => set("guest_name", e.target.value)} className="rounded-xl h-11 font-sans-clean" required />
          <Input type="email" placeholder="Votre email (optionnel)" value={form.email}
            onChange={e => set("email", e.target.value)} className="rounded-xl h-11 font-sans-clean" />

          {/* Attending */}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => set("attending", true)}
              className={`py-3 rounded-2xl text-sm font-semibold border-2 transition font-sans-clean ${form.attending === true ? "border-green-400 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
              🎉 Je serai là !
            </button>
            <button type="button" onClick={() => set("attending", false)}
              className={`py-3 rounded-2xl text-sm font-semibold border-2 transition font-sans-clean ${form.attending === false ? "border-red-300 bg-red-50 text-red-600" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
              😢 Je ne peux pas
            </button>
          </div>

          {form.attending && (
            <div>
              <label className="font-sans-clean text-xs text-gray-500 font-semibold block mb-1">Nombre de personnes</label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => set("party_size", Math.max(1, form.party_size - 1))}
                  className="w-9 h-9 rounded-full border-2 border-gray-200 text-gray-600 font-bold hover:border-rose-300 transition">−</button>
                <span className="text-xl font-bold text-gray-800 w-8 text-center">{form.party_size}</span>
                <button type="button" onClick={() => set("party_size", form.party_size + 1)}
                  className="w-9 h-9 rounded-full border-2 border-gray-200 text-gray-600 font-bold hover:border-rose-300 transition">+</button>
              </div>
            </div>
          )}

          {/* Custom questions */}
          {questions.map(q => (
            <div key={q.id}>
              <label className="font-sans-clean text-xs text-gray-500 font-semibold block mb-1.5">
                {q.question}{q.required && <span style={{ color: primaryColor }}> *</span>}
              </label>
              {q.type === "text" && (
                <Input value={form.answers[q.id] || ""} onChange={e => setAnswer(q.id, e.target.value)}
                  className="rounded-xl h-11 font-sans-clean" required={q.required} />
              )}
              {q.type === "yes_no" && (
                <div className="flex gap-2">
                  {["Oui", "Non"].map(o => (
                    <button key={o} type="button" onClick={() => setAnswer(q.id, o)}
                      className={`flex-1 py-2 rounded-xl border-2 text-sm font-sans-clean transition ${form.answers[q.id] === o ? "border-rose-400 bg-rose-50 text-rose-600" : "border-gray-200 text-gray-500"}`}>
                      {o}
                    </button>
                  ))}
                </div>
              )}
              {q.type === "choice" && q.options?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {q.options.map(o => (
                    <button key={o} type="button" onClick={() => setAnswer(q.id, o)}
                      className={`px-3 py-1.5 rounded-full text-xs font-sans-clean border transition ${form.answers[q.id] === o ? "border-rose-400 bg-rose-50 text-rose-600" : "border-gray-200 text-gray-500"}`}>
                      {o}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <Button type="submit" disabled={submitting || form.attending === null}
            className="w-full h-12 rounded-2xl text-white font-semibold font-sans-clean hover:opacity-90 transition"
            style={{ background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}cc)` }}>
            {submitting ? "Envoi…" : "Confirmer ma réponse 🌸"}
          </Button>
        </form>
      )}
    </div>
  );
}