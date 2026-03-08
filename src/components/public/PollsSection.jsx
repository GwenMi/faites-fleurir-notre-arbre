import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function PollsSection({ polls, responses, onRefresh, tpl }) {
  const [answers, setAnswers] = useState({});
  const [names, setNames] = useState({});
  const [submitted, setSubmitted] = useState({});

  if (!polls || polls.length === 0) return null;

  const getResponses = (pollId) => responses.filter((r) => r.poll_id === pollId);

  const handleSubmit = async (poll) => {
    const name = names[poll.id];
    const answer = answers[poll.id];
    if (!name || !answer) {
      toast.error("Merci de renseigner votre prénom et votre réponse");
      return;
    }
    const existing = getResponses(poll.id).find((r) => r.guest_name === name);
    if (existing) {
      toast.error("Vous avez déjà répondu à ce sondage");
      return;
    }
    await base44.entities.PollResponse.create({
      poll_id: poll.id,
      guest_name: name,
      response: Array.isArray(answer) ? answer.join(", ") : answer,
    });
    setSubmitted((s) => ({ ...s, [poll.id]: true }));
    toast.success("✅ Réponse enregistrée, merci !");
    onRefresh && onRefresh();
  };

  const getOptionCount = (pollId, option) =>
    getResponses(pollId).filter((r) => r.response === option || r.response.includes(option)).length;

  const totalResponses = (pollId) => getResponses(pollId).length;

  return (
    <section className="px-4 py-8">
      <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: tpl.fontTitle, color: tpl.primary }}>
        🗳 Sondages
      </h2>
      <div className="space-y-5">
        {polls.filter((p) => p.is_active).map((poll) => {
          const isSubmitted = submitted[poll.id];
          const total = totalResponses(poll.id);

          return (
            <div key={poll.id} className={`bg-white ${tpl.cardStyle} p-5`}>
              <h3 className="font-bold text-gray-800 text-base mb-1">{poll.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{poll.question}</p>

              {isSubmitted ? (
                <div>
                  <p className="text-green-600 text-sm font-medium mb-3">✅ Merci pour votre réponse !</p>
                  {poll.type !== "text" && poll.options?.map((opt) => {
                    const count = getOptionCount(poll.id, opt);
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={opt} className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">{opt}</span>
                          <span className="text-gray-500">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: tpl.primary }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  <Input placeholder="Votre prénom" value={names[poll.id] || ""}
                    onChange={(e) => setNames((n) => ({ ...n, [poll.id]: e.target.value }))}
                    className="rounded-xl h-11 text-base" />

                  {(poll.type === "single_choice" || poll.type === "yes_no") && (
                    <div className="space-y-2">
                      {(poll.type === "yes_no" ? ["Oui", "Non"] : poll.options || []).map((opt) => (
                        <button key={opt}
                          onClick={() => setAnswers((a) => ({ ...a, [poll.id]: opt }))}
                          className={`w-full py-3 px-4 rounded-xl text-sm font-medium border-2 transition text-left ${answers[poll.id] === opt ? "text-white" : "bg-white text-gray-700 border-gray-200"}`}
                          style={answers[poll.id] === opt ? { background: tpl.primary, borderColor: tpl.primary } : {}}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {poll.type === "multiple_choice" && (
                    <div className="space-y-2">
                      {(poll.options || []).map((opt) => {
                        const sel = (answers[poll.id] || []).includes(opt);
                        return (
                          <button key={opt}
                            onClick={() => {
                              const cur = answers[poll.id] || [];
                              setAnswers((a) => ({
                                ...a,
                                [poll.id]: sel ? cur.filter((x) => x !== opt) : [...cur, opt],
                              }));
                            }}
                            className={`w-full py-3 px-4 rounded-xl text-sm font-medium border-2 transition text-left ${sel ? "text-white" : "bg-white text-gray-700 border-gray-200"}`}
                            style={sel ? { background: tpl.primary, borderColor: tpl.primary } : {}}>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {poll.type === "text" && (
                    <Input placeholder="Votre réponse..." value={answers[poll.id] || ""}
                      onChange={(e) => setAnswers((a) => ({ ...a, [poll.id]: e.target.value }))}
                      className="rounded-xl h-11 text-base" />
                  )}

                  <Button onClick={() => handleSubmit(poll)} className="w-full h-12 rounded-xl font-semibold"
                    style={{ background: tpl.primary, color: "white" }}>
                    Envoyer ma réponse
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}