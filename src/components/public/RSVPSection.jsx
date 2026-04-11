import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Loader2, Heart, X, Check, Baby, Leaf, UtensilsCrossed, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

function MealChoiceRow({ personLabel, starters, mains, desserts, value, onChange, primaryColor }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
      {personLabel && <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{personLabel}</p>}
      {starters?.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1.5">🥗 Entrée</p>
          <div className="flex flex-wrap gap-2">
            {starters.map(opt => (
              <button key={opt} onClick={() => onChange({ ...value, starter: value.starter === opt ? "" : opt })}
                className={`text-xs px-3 py-1.5 rounded-full border transition font-medium ${value.starter === opt ? "text-white border-transparent" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}
                style={value.starter === opt ? { background: primaryColor, borderColor: primaryColor } : {}}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
      {mains?.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1.5">🍽️ Plat principal</p>
          <div className="flex flex-wrap gap-2">
            {mains.map(opt => (
              <button key={opt} onClick={() => onChange({ ...value, main: value.main === opt ? "" : opt })}
                className={`text-xs px-3 py-1.5 rounded-full border transition font-medium ${value.main === opt ? "text-white border-transparent" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}
                style={value.main === opt ? { background: primaryColor, borderColor: primaryColor } : {}}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
      {desserts?.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1.5">🍰 Dessert</p>
          <div className="flex flex-wrap gap-2">
            {desserts.map(opt => (
              <button key={opt} onClick={() => onChange({ ...value, dessert: value.dessert === opt ? "" : opt })}
                className={`text-xs px-3 py-1.5 rounded-full border transition font-medium ${value.dessert === opt ? "text-white border-transparent" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}
                style={value.dessert === opt ? { background: primaryColor, borderColor: primaryColor } : {}}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RSVPSection({ event, primaryColor }) {
  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState("form"); // "form" | "success"
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    guest_name: "",
    email: "",
    attending: null,
    party_size: 1,
    answers: {},
    allergies: "",
    notes: "",
    dietary_choice: "",
    children_count: 0,
    children_menu: "",
    meal_choices: [],
  });

  useEffect(() => {
    base44.entities.RSVPQuestion.filter({ event_id: event.id }).then(q => {
      setQuestions((q || []).sort((a, b) => (a.order || 0) - (b.order || 0)));
    });
  }, [event.id]);

  // Sync meal_choices array length with party_size
  useEffect(() => {
    if (!event.menu_enabled) return;
    setForm(f => {
      const current = f.meal_choices || [];
      const newChoices = Array.from({ length: f.party_size }, (_, i) => current[i] || { starter: "", main: "", dessert: "", person_label: `Personne ${i + 1}` });
      return { ...f, meal_choices: newChoices };
    });
  }, [form.party_size, event.menu_enabled]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.guest_name.trim()) { toast.error("Votre nom est requis."); return; }
    if (form.attending === null) { toast.error("Merci d'indiquer votre présence."); return; }
    const required = questions.filter(q => q.required);
    for (const q of required) {
      if (!form.answers[q.id]?.trim()) { toast.error(`La question "${q.question}" est obligatoire.`); return; }
    }
    setSubmitting(true);

    const mealChoices = event.menu_enabled && form.attending
      ? form.meal_choices.map((mc, i) => ({
          person_label: form.party_size > 1 ? `Personne ${i + 1}` : "Invité",
          starter: mc.starter || "",
          main: mc.main || "",
          dessert: mc.dessert || "",
        }))
      : [];

    await base44.entities.RSVPResponse.create({
      event_id: event.id,
      guest_name: form.guest_name.trim(),
      email: form.email.trim(),
      attending: form.attending,
      party_size: form.attending ? form.party_size : 1,
      answers: form.answers,
      allergies: form.allergies.trim(),
      notes: form.notes.trim(),
      meal_choices: mealChoices,
      dietary_choice: form.dietary_choice || "",
      children_count: form.children_count || 0,
      children_menu: form.children_menu || "",
    });

    setSubmitting(false);
    setStep("success");
  };

  const pc = primaryColor || "#f43f5e";

  if (step === "success") {
    return (
      <div className="py-16 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: pc + "20" }}>
          <Heart className="w-8 h-8" style={{ color: pc }} />
        </div>
        <h3 className="font-serif-elegant text-3xl font-bold text-gray-800 mb-3">Merci !</h3>
        <p className="font-sans-clean text-gray-500 text-sm max-w-sm mx-auto">
          {form.attending
            ? "Votre réponse a été enregistrée. On a hâte de vous accueillir ! 🎉"
            : "Votre réponse a bien été prise en compte. Vous serez manqué(e) 💌"}
        </p>
      </div>
    );
  }

  const hasMenu = event.menu_enabled && (event.menu_starters?.length || event.menu_mains?.length || event.menu_desserts?.length);
  const hasDietary = event.menu_dietary_enabled && event.menu_dietary_options?.length > 0;
  const hasChildren = event.menu_children_enabled;

  return (
    <div className="py-12">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="h-px flex-1 max-w-16" style={{ background: `linear-gradient(to right, transparent, ${pc}66)` }} />
          <Heart className="w-5 h-5" style={{ color: pc }} />
          <div className="h-px flex-1 max-w-16" style={{ background: `linear-gradient(to left, transparent, ${pc}66)` }} />
        </div>
        <h2 className="font-serif-elegant text-4xl font-bold text-gray-800 mb-2">RSVP</h2>
        <p className="font-sans-clean text-gray-500 text-sm">Confirmez votre présence à {event.couple_names}</p>
      </div>

      <div className="space-y-4">
        {/* Nom & email */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Votre nom complet *</label>
            <Input value={form.guest_name} onChange={e => set("guest_name", e.target.value)} placeholder="Prénom Nom" className="rounded-xl font-sans-clean" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Votre adresse e-mail</label>
            <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="vous@email.com" className="rounded-xl font-sans-clean" />
          </div>
        </div>

        {/* Présence */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">Serez-vous présent(e) ? *</p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => set("attending", true)}
              className={`flex items-center justify-center gap-2 py-4 rounded-2xl border-2 font-semibold font-sans-clean text-sm transition ${form.attending === true ? "text-white border-transparent" : "bg-white border-gray-200 text-gray-600 hover:border-green-300"}`}
              style={form.attending === true ? { background: "#22c55e", borderColor: "#22c55e" } : {}}>
              <Check className="w-4 h-4" /> Oui, j'y serai !
            </button>
            <button onClick={() => set("attending", false)}
              className={`flex items-center justify-center gap-2 py-4 rounded-2xl border-2 font-semibold font-sans-clean text-sm transition ${form.attending === false ? "bg-gray-600 text-white border-gray-600" : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"}`}>
              <X className="w-4 h-4" /> Non, je ne pourrai pas
            </button>
          </div>
        </div>

        {/* Si présent */}
        {form.attending === true && (
          <>
            {/* Nombre de personnes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-700 mb-3">Combien de personnes (vous inclus) ?</p>
              <div className="flex items-center gap-4">
                <button onClick={() => form.party_size > 1 && set("party_size", form.party_size - 1)}
                  className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 transition font-bold">−</button>
                <span className="text-2xl font-bold text-gray-800 w-8 text-center">{form.party_size}</span>
                <button onClick={() => set("party_size", form.party_size + 1)}
                  className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 transition font-bold">+</button>
                <span className="text-sm text-gray-400 font-sans-clean">personne{form.party_size > 1 ? "s" : ""}</span>
              </div>
            </div>

            {/* Choix de menu */}
            {hasMenu && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-rose-400" />
                  <p className="text-sm font-semibold text-gray-700">Choix de menu</p>
                </div>
                {form.meal_choices.map((mc, i) => (
                  <MealChoiceRow
                    key={i}
                    personLabel={form.party_size > 1 ? `Personne ${i + 1}` : null}
                    starters={event.menu_starters}
                    mains={event.menu_mains}
                    desserts={event.menu_desserts}
                    value={mc}
                    onChange={newVal => {
                      const updated = [...form.meal_choices];
                      updated[i] = newVal;
                      set("meal_choices", updated);
                    }}
                    primaryColor={pc}
                  />
                ))}
              </div>
            )}

            {/* Régime alimentaire */}
            {hasDietary && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-green-500" />
                  <p className="text-sm font-semibold text-gray-700">Régime alimentaire</p>
                </div>
                <p className="text-xs text-gray-400 font-sans-clean">Avez-vous un régime alimentaire particulier ?</p>
                <div className="flex flex-wrap gap-2">
                  {event.menu_dietary_options.map(opt => (
                    <button key={opt} onClick={() => set("dietary_choice", form.dietary_choice === opt ? "" : opt)}
                      className={`text-sm px-4 py-2 rounded-full border transition font-sans-clean ${form.dietary_choice === opt ? "text-white border-transparent" : "bg-white border-gray-200 text-gray-600 hover:border-green-300"}`}
                      style={form.dietary_choice === opt ? { background: "#22c55e", borderColor: "#22c55e" } : {}}>
                      {form.dietary_choice === opt && <Check className="w-3.5 h-3.5 inline mr-1" />}
                      {opt}
                    </button>
                  ))}
                  <button onClick={() => set("dietary_choice", "")}
                    className={`text-sm px-4 py-2 rounded-full border transition font-sans-clean ${form.dietary_choice === "" ? "text-white border-transparent" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"}`}
                    style={form.dietary_choice === "" ? { background: "#6b7280", borderColor: "#6b7280" } : {}}>
                    Standard
                  </button>
                </div>
              </div>
            )}

            {/* Menu enfant */}
            {hasChildren && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Baby className="w-4 h-4 text-blue-400" />
                  <p className="text-sm font-semibold text-gray-700">Menu enfant</p>
                </div>
                <p className="text-xs text-gray-400 font-sans-clean">Combien d'enfants vous accompagnent ? (moins de 12 ans)</p>
                <div className="flex items-center gap-4">
                  <button onClick={() => form.children_count > 0 && set("children_count", form.children_count - 1)}
                    className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 transition font-bold">−</button>
                  <span className="text-2xl font-bold text-gray-800 w-8 text-center">{form.children_count}</span>
                  <button onClick={() => set("children_count", form.children_count + 1)}
                    className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 transition font-bold">+</button>
                  <span className="text-sm text-gray-400 font-sans-clean">enfant{form.children_count > 1 ? "s" : ""}</span>
                </div>

                {form.children_count > 0 && event.menu_children_options?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">Menu enfant souhaité</p>
                    <div className="flex flex-wrap gap-2">
                      {event.menu_children_options.map(opt => (
                        <button key={opt} onClick={() => set("children_menu", form.children_menu === opt ? "" : opt)}
                          className={`text-sm px-4 py-2 rounded-full border transition font-sans-clean ${form.children_menu === opt ? "text-white border-transparent" : "bg-white border-gray-200 text-gray-600 hover:border-blue-300"}`}
                          style={form.children_menu === opt ? { background: "#60a5fa", borderColor: "#60a5fa" } : {}}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Allergies */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Allergies ou intolérances alimentaires</label>
              <Input value={form.allergies} onChange={e => set("allergies", e.target.value)}
                placeholder="Ex : allergie aux noix, intolérance au lactose…" className="rounded-xl font-sans-clean" />
            </div>
          </>
        )}

        {/* Questions personnalisées */}
        {questions.length > 0 && form.attending !== null && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <p className="text-sm font-semibold text-gray-700">Questions des organisateurs</p>
            {questions.map(q => (
              <div key={q.id}>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  {q.question} {q.required && <span className="text-rose-400">*</span>}
                </label>
                {q.type === "text" && (
                  <Input value={form.answers[q.id] || ""} onChange={e => set("answers", { ...form.answers, [q.id]: e.target.value })}
                    placeholder="Votre réponse…" className="rounded-xl font-sans-clean" />
                )}
                {q.type === "yes_no" && (
                  <div className="flex gap-2">
                    {["Oui", "Non"].map(opt => (
                      <button key={opt} onClick={() => set("answers", { ...form.answers, [q.id]: opt })}
                        className={`px-4 py-2 rounded-xl border text-sm font-sans-clean transition ${form.answers[q.id] === opt ? "text-white border-transparent" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}
                        style={form.answers[q.id] === opt ? { background: pc, borderColor: pc } : {}}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
                {q.type === "choice" && (
                  <div className="flex flex-wrap gap-2">
                    {(q.options || []).map(opt => (
                      <button key={opt} onClick={() => set("answers", { ...form.answers, [q.id]: opt })}
                        className={`px-3 py-1.5 rounded-full border text-sm font-sans-clean transition ${form.answers[q.id] === opt ? "text-white border-transparent" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}
                        style={form.answers[q.id] === opt ? { background: pc, borderColor: pc } : {}}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Message libre */}
        {form.attending !== null && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Un message pour les organisateurs ? (optionnel)</label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
              rows={3} placeholder="Un mot, une chanson souhaitée…"
              className="w-full rounded-xl border border-input px-3 py-2 text-sm font-sans-clean resize-none focus:outline-none focus:ring-1 focus:ring-rose-300" />
          </div>
        )}

        {/* Submit */}
        {form.attending !== null && (
          <Button onClick={handleSubmit} disabled={submitting}
            className="w-full h-14 rounded-2xl text-white font-semibold text-base font-sans-clean shadow-md hover:opacity-90 transition"
            style={{ background: `linear-gradient(135deg, ${pc}, ${pc}cc)` }}>
            {submitting
              ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Envoi en cours…</>
              : <><Heart className="w-5 h-5 mr-2" /> Confirmer ma réponse</>}
          </Button>
        )}
      </div>
    </div>
  );
}