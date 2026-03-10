import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Check, X, Users } from "lucide-react";

export default function RSVPSection({ event, primaryColor }) {
  const [step, setStep] = useState("form"); // form | success | declined
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    guest_name: "",
    email: "",
    attending: null,
    party_size: 1,
    answers: {},
    notes: "",
    allergies: "",
    meal_choices: [],
  });

  useEffect(() => {
    base44.entities.RSVPQuestion.filter({ event_id: event.id }).then(q => {
      setQuestions((q || []).sort((a, b) => (a.order || 0) - (b.order || 0)));
    });
  }, [event.id]);

  // Sync meal_choices array size with party_size
  useEffect(() => {
    if (!event.menu_enabled) return;
    setForm(f => {
      const current = f.meal_choices || [];
      const size = f.party_size || 1;
      if (current.length === size) return f;
      const updated = Array.from({ length: size }, (_, i) => current[i] || { person_label: `Personne ${i + 1}`, starter: "", main: "", dessert: "" });
      return { ...f, meal_choices: updated };
    });
  }, [form.party_size, event.menu_enabled]);

  const updateMealChoice = (personIdx, course, value) => {
    setForm(f => {
      const updated = [...(f.meal_choices || [])];
      updated[personIdx] = { ...updated[personIdx], [course]: value };
      return { ...f, meal_choices: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.guest_name.trim() || form.attending === null) return;
    setLoading(true);

    const payload = {
      event_id: event.id,
      guest_name: form.guest_name.trim(),
      email: form.email.trim(),
      attending: form.attending,
      party_size: form.party_size,
      answers: form.answers,
      notes: form.notes,
      allergies: form.allergies,
      meal_choices: event.menu_enabled ? form.meal_choices : [],
    };

    await base44.entities.RSVPResponse.create(payload);

    // Update GuestInvitation rsvp_status if linked
    const guests = await base44.entities.GuestInvitation.filter({ event_id: event.id });
    const match = guests.find(g => g.guest_email && g.guest_email.toLowerCase() === (form.email || "").toLowerCase());
    if (match) {
      await base44.entities.GuestInvitation.update(match.id, {
        rsvp_status: form.attending ? "confirmed" : "declined",
        party_size: form.party_size,
        dietary_notes: form.allergies || form.notes,
      });
    }

    setStep(form.attending ? "success" : "declined");
    setLoading(false);
  };

  const pc = primaryColor || "#f43f5e";
  const menuEnabled = event.menu_enabled;
  const starters = event.menu_starters || [];
  const mains = event.menu_mains || [];
  const desserts = event.menu_desserts || [];
  const hasMenuOptions = starters.length > 0 || mains.length > 0 || desserts.length > 0;

  if (step === "success") return (
    <div className="py-12 text-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: pc + "22" }}>
        <Check className="w-7 h-7" style={{ color: pc }} />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">Merci pour votre réponse !</h3>
      <p className="text-gray-500 text-sm">Votre présence a été confirmée. À très bientôt ! 🎉</p>
    </div>
  );

  if (step === "declined") return (
    <div className="py-12 text-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-gray-100">
        <X className="w-7 h-7 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">Nous sommes désolés</h3>
      <p className="text-gray-500 text-sm">Votre absence a bien été enregistrée. Vous serez avec nous en pensées.</p>
    </div>
  );

  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <p className="text-xs tracking-[0.25em] uppercase mb-2 font-semibold" style={{ color: pc }}>RSVP</p>
        <h2 className="text-3xl font-bold text-gray-800" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
          Confirmez votre présence
        </h2>
        <div className="w-16 h-px mx-auto mt-4" style={{ background: pc + "88" }} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-lg mx-auto">
        {/* Name */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Nom complet *</label>
          <input
            required
            value={form.guest_name}
            onChange={e => setForm(f => ({ ...f, guest_name: e.target.value }))}
            placeholder="Prénom Nom"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-300"
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="votre@email.fr"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-300"
          />
        </div>

        {/* Attending */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Serez-vous présent(e) ? *</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: true, label: "✓ Oui, avec plaisir !", color: "green" },
              { value: false, label: "✗ Je ne pourrai pas", color: "red" },
            ].map(opt => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => setForm(f => ({ ...f, attending: opt.value }))}
                className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition ${
                  form.attending === opt.value
                    ? opt.color === "green" ? "border-green-400 bg-green-50 text-green-700" : "border-red-300 bg-red-50 text-red-600"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {form.attending === true && (
          <>
            {/* Party size */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Nombre de personnes
              </label>
              <select
                value={form.party_size}
                onChange={e => setForm(f => ({ ...f, party_size: parseInt(e.target.value) }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                  <option key={n} value={n}>{n} personne{n > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>

            {/* Meal choices */}
            {menuEnabled && hasMenuOptions && (
              <div className="space-y-4 bg-rose-50 rounded-2xl p-4 border border-rose-100">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">🍽️ Choix des plats</p>
                {(form.meal_choices || []).map((person, pi) => (
                  <div key={pi} className={`space-y-2 ${form.party_size > 1 ? "bg-white rounded-xl p-3 border border-rose-100" : ""}`}>
                    {form.party_size > 1 && (
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-gray-500">{person.person_label || `Personne ${pi + 1}`}</p>
                        <input
                          value={person.person_label || ""}
                          onChange={e => updateMealChoice(pi, "person_label", e.target.value)}
                          placeholder={`Prénom personne ${pi + 1}`}
                          className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs"
                        />
                      </div>
                    )}
                    {starters.length > 0 && (
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">🥗 Entrée</label>
                        <select value={person.starter || ""} onChange={e => updateMealChoice(pi, "starter", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white">
                          <option value="">— Choisir —</option>
                          {starters.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    )}
                    {mains.length > 0 && (
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">🍽️ Plat principal</label>
                        <select value={person.main || ""} onChange={e => updateMealChoice(pi, "main", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white">
                          <option value="">— Choisir —</option>
                          {mains.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    )}
                    {desserts.length > 0 && (
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">🍰 Dessert</label>
                        <select value={person.dessert || ""} onChange={e => updateMealChoice(pi, "dessert", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white">
                          <option value="">— Choisir —</option>
                          {desserts.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Allergies */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                Allergies / intolérances alimentaires
              </label>
              <input
                value={form.allergies}
                onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))}
                placeholder="Ex : sans gluten, allergie aux noix…"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-300"
              />
            </div>

            {/* Custom questions */}
            {questions.filter(q => q.type !== "yes_no" || true).map(q => (
              <div key={q.id}>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  {q.question}{q.required ? " *" : ""}
                </label>
                {q.type === "text" && (
                  <input
                    value={(form.answers || {})[q.id] || ""}
                    onChange={e => setForm(f => ({ ...f, answers: { ...f.answers, [q.id]: e.target.value } }))}
                    required={q.required}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-300"
                  />
                )}
                {q.type === "choice" && (
                  <div className="flex flex-wrap gap-2">
                    {(q.options || []).map(opt => (
                      <button key={opt} type="button"
                        onClick={() => setForm(f => ({ ...f, answers: { ...f.answers, [q.id]: opt } }))}
                        className={`px-3 py-1.5 rounded-full border text-sm transition ${
                          (form.answers || {})[q.id] === opt
                            ? "border-rose-400 text-white"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                        style={(form.answers || {})[q.id] === opt ? { background: pc, borderColor: pc } : {}}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
                {q.type === "yes_no" && (
                  <div className="flex gap-3">
                    {["Oui", "Non"].map(opt => (
                      <button key={opt} type="button"
                        onClick={() => setForm(f => ({ ...f, answers: { ...f.answers, [q.id]: opt } }))}
                        className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition ${
                          (form.answers || {})[q.id] === opt ? "text-white" : "border-gray-200 text-gray-500"
                        }`}
                        style={(form.answers || {})[q.id] === opt ? { background: pc, borderColor: pc } : {}}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* Notes */}
        {form.attending !== null && (
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Message (optionnel)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder="Un mot pour les mariés…"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-rose-300"
            />
          </div>
        )}

        {form.attending !== null && (
          <button
            type="submit"
            disabled={loading || !form.guest_name.trim()}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm transition opacity-100 disabled:opacity-60"
            style={{ background: pc }}
          >
            {loading ? "Envoi…" : "Envoyer ma réponse"}
          </button>
        )}
      </form>
    </section>
  );
}