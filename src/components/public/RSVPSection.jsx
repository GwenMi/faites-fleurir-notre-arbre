import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Users, ChevronDown, ChevronUp, Send } from "lucide-react";

export default function RSVPSection({ event, primaryColor }) {
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState({ guest_name: "", email: "", attending: true, party_size: 1, answers: {}, notes: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const pc = primaryColor || "#c084fc";

  useEffect(() => {
    base44.entities.RSVPQuestion.filter({ event_id: event.id }).then(q => {
      setQuestions((q || []).sort((a, b) => (a.order || 0) - (b.order || 0)));
    });
  }, [event.id]);

  const handleSubmit = async () => {
    if (!form.guest_name.trim()) { toast.error("Veuillez entrer votre prénom et nom"); return; }
    setLoading(true);
    await base44.entities.RSVPResponse.create({
      event_id: event.id,
      guest_name: form.guest_name,
      email: form.email || undefined,
      attending: form.attending,
      party_size: form.party_size,
      answers: form.answers,
      notes: form.notes || undefined,
    });

    // Email notification to the couple
    if (event.created_by) {
      const status = form.attending ? `✅ Présent(e) — ${form.party_size} personne(s)` : "❌ Absent(e)";
      await base44.integrations.Core.SendEmail({
        to: event.created_by,
        subject: `Nouvelle réponse RSVP — ${event.couple_names}`,
        body: `Bonjour,\n\n${form.guest_name} vient de répondre à votre invitation pour "${event.couple_names}".\n\nStatut : ${status}\n${form.email ? `Email : ${form.email}\n` : ""}${form.notes ? `Message : ${form.notes}\n` : ""}\nConnectez-vous à votre tableau de bord pour voir toutes les réponses.\n\nFleurs de fête 🌸`,
      }).catch(() => {});
    }

    setSubmitted(true);
    setLoading(false);
    toast.success("Votre réponse a bien été enregistrée !");
  };

  if (submitted) return (
    <div className="my-10 text-center">
      <div className="inline-flex flex-col items-center gap-3 bg-white border rounded-2xl shadow-sm p-8 max-w-sm w-full"
        style={{ borderColor: pc + "44" }}>
        <CheckCircle2 className="w-12 h-12" style={{ color: pc }} />
        <h3 className="text-xl font-bold text-gray-800">Merci !</h3>
        <p className="text-gray-500 text-sm">Votre réponse a bien été enregistrée.</p>
      </div>
    </div>
  );

  return (
    <div className="my-10">
      <div className="text-center mb-6">
        <p className="text-xs tracking-[0.3em] uppercase mb-2 font-light" style={{ color: pc }}>Réponse</p>
        <h2 className="text-3xl font-bold text-gray-800" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
          Confirmer votre présence
        </h2>
        <div className="w-16 h-px mx-auto mt-3" style={{ background: `linear-gradient(90deg, transparent, ${pc}, transparent)` }} />
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
        {/* Attending toggle */}
        <div className="flex gap-3">
          <button onClick={() => setForm(f => ({ ...f, attending: true }))}
            className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition flex items-center justify-center gap-2 ${form.attending ? "border-green-400 bg-green-50 text-green-700" : "border-gray-100 text-gray-400"}`}>
            <CheckCircle2 className="w-4 h-4" /> Je serai présent(e)
          </button>
          <button onClick={() => setForm(f => ({ ...f, attending: false }))}
            className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition flex items-center justify-center gap-2 ${!form.attending ? "border-red-300 bg-red-50 text-red-500" : "border-gray-100 text-gray-400"}`}>
            <XCircle className="w-4 h-4" /> Je serai absent(e)
          </button>
        </div>

        <Input placeholder="Prénom et nom *" value={form.guest_name} onChange={e => setForm(f => ({ ...f, guest_name: e.target.value }))} className="rounded-xl" />
        <Input placeholder="Email (optionnel)" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="rounded-xl" />

        {form.attending && (
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
            <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-600 flex-1">Nombre de personnes</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setForm(f => ({ ...f, party_size: Math.max(1, f.party_size - 1) }))}
                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100">−</button>
              <span className="w-6 text-center font-bold text-gray-700">{form.party_size}</span>
              <button onClick={() => setForm(f => ({ ...f, party_size: f.party_size + 1 }))}
                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100">+</button>
            </div>
          </div>
        )}

        {/* Custom questions */}
        {questions.length > 0 && (
          <div>
            <button onClick={() => setExpanded(x => !x)} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition w-full">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Questions supplémentaires ({questions.length})
            </button>
            {expanded && (
              <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
                {questions.map(q => (
                  <div key={q.id}>
                    <p className="text-xs font-semibold text-gray-600 mb-1">{q.question}{q.required && <span className="text-red-400 ml-1">*</span>}</p>
                    {q.type === "text" && (
                      <Input placeholder="Votre réponse..." className="rounded-xl text-sm" value={form.answers[q.id] || ""}
                        onChange={e => setForm(f => ({ ...f, answers: { ...f.answers, [q.id]: e.target.value } }))} />
                    )}
                    {q.type === "yes_no" && (
                      <div className="flex gap-2">
                        {["Oui", "Non"].map(opt => (
                          <button key={opt} onClick={() => setForm(f => ({ ...f, answers: { ...f.answers, [q.id]: opt } }))}
                            className={`px-4 py-1.5 rounded-xl text-sm border-2 transition ${form.answers[q.id] === opt ? "border-purple-400 bg-purple-50 text-purple-700 font-semibold" : "border-gray-100 text-gray-500"}`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                    {q.type === "choice" && q.options?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {q.options.map(opt => (
                          <button key={opt} onClick={() => setForm(f => ({ ...f, answers: { ...f.answers, [q.id]: opt } }))}
                            className={`px-3 py-1.5 rounded-xl text-sm border-2 transition ${form.answers[q.id] === opt ? "font-semibold" : "border-gray-100 text-gray-500"}`}
                            style={form.answers[q.id] === opt ? { borderColor: pc, background: pc + "18", color: pc } : {}}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <textarea placeholder="Un message pour les mariés ? (optionnel)" rows={2} value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          className="w-full rounded-xl border border-input px-3 py-2 text-sm resize-none" />

        <Button onClick={handleSubmit} disabled={loading || !form.guest_name.trim()}
          className="w-full h-11 rounded-xl font-semibold text-white"
          style={{ background: pc }}>
          <Send className="w-4 h-4 mr-2" />
          {loading ? "Envoi en cours..." : "Confirmer ma réponse"}
        </Button>
      </div>
    </div>
  );
}