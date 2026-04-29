import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function RSVPSection({ event }) {
  const [formOpen, setFormOpen] = useState(false);
  const [customQuestions, setCustomQuestions] = useState([]);
  const [form, setForm] = useState({
    guest_name: "",
    email: "",
    attending: null,
    party_size: 1,
    starter_choice: "",
    main_choice: "",
    dessert_choice: "",
    dietary_option: "",
    children_menu: false,
    notes: "",
    custom_answers: {},
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    base44.entities.RSVPQuestion.filter({ event_id: event.id }, "order")
      .then(data => setCustomQuestions(data || []))
      .catch(() => {});
  }, [event.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.guest_name || form.attending === null) {
      toast.error("Veuillez remplir les champs requis");
      return;
    }
    setLoading(true);
    await base44.entities.RSVPResponse.create({
      event_id: event.id,
      guest_name: form.guest_name,
      email: form.email,
      attending: form.attending,
      party_size: form.party_size,
      starter_choice: form.starter_choice || undefined,
      main_choice: form.main_choice || undefined,
      dessert_choice: form.dessert_choice || undefined,
      dietary_option: form.dietary_option || undefined,
      children_menu: form.children_menu || false,
      notes: form.notes || undefined,
      custom_answers: Object.keys(form.custom_answers).length ? form.custom_answers : undefined,
    });
    toast.success("RSVP enregistré ! 🎉");
    setDone(true);
    setFormOpen(false);
    setLoading(false);
  };

  const hasMenu = event.menu_enabled && form.attending === true && (
    (event.menu_starters?.length > 0) ||
    (event.menu_mains?.length > 0) ||
    (event.menu_desserts?.length > 0)
  );

  if (done) {
    return (
      <section className="py-12">
        <div className="text-center bg-green-50 border border-green-200 rounded-2xl p-8 max-w-sm mx-auto">
          <span className="text-4xl mb-3 block">🎉</span>
          <p className="font-semibold text-green-700 text-lg font-sans-clean">Merci, {form.guest_name} !</p>
          <p className="text-green-600 text-sm mt-1 font-sans-clean">Votre RSVP a bien été enregistré.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <h2 className="font-serif-elegant text-3xl font-bold mb-6 text-gray-900">📍 Confirmer votre présence</h2>

      {!formOpen ? (
        <Button onClick={() => setFormOpen(true)} size="lg" className="w-full rounded-xl h-12 mb-6 font-semibold">
          ✍️ Répondre au RSVP
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-gray-50 rounded-xl mb-6">
          {/* Nom */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Votre nom *</label>
            <Input
              value={form.guest_name}
              onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
              placeholder="Prénom Nom"
              className="h-11 rounded-lg"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="votre@email.com"
              className="h-11 rounded-lg"
            />
          </div>

          {/* Présence */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Confirmation *</label>
            <div className="flex gap-4 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={form.attending === true}
                  onCheckedChange={() => setForm({ ...form, attending: true })}
                />
                <span className="text-gray-700">Oui, je serai présent(e) 🎉</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={form.attending === false}
                  onCheckedChange={() => setForm({ ...form, attending: false })}
                />
                <span className="text-gray-700">Non, je ne peux pas 😢</span>
              </label>
            </div>
          </div>

          {/* Nombre de personnes */}
          {form.attending === true && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de personnes</label>
              <Input
                type="number"
                min="1"
                value={form.party_size}
                onChange={(e) => setForm({ ...form, party_size: parseInt(e.target.value) || 1 })}
                className="h-11 rounded-lg"
              />
            </div>
          )}

          {/* Choix de menu */}
          {hasMenu && (
            <>
              {event.menu_starters?.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Entrée</label>
                  <select
                    value={form.starter_choice}
                    onChange={e => setForm({ ...form, starter_choice: e.target.value })}
                    className="w-full h-11 rounded-lg border border-input bg-transparent px-3 text-sm"
                  >
                    <option value="">-- Choisir une entrée --</option>
                    {event.menu_starters.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
              {event.menu_mains?.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Plat</label>
                  <select
                    value={form.main_choice}
                    onChange={e => setForm({ ...form, main_choice: e.target.value })}
                    className="w-full h-11 rounded-lg border border-input bg-transparent px-3 text-sm"
                  >
                    <option value="">-- Choisir un plat --</option>
                    {event.menu_mains.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              )}
              {event.menu_desserts?.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Dessert</label>
                  <select
                    value={form.dessert_choice}
                    onChange={e => setForm({ ...form, dessert_choice: e.target.value })}
                    className="w-full h-11 rounded-lg border border-input bg-transparent px-3 text-sm"
                  >
                    <option value="">-- Choisir un dessert --</option>
                    {event.menu_desserts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              )}
            </>
          )}

          {/* Régime alimentaire */}
          {event.menu_dietary_enabled && form.attending === true && event.menu_dietary_options?.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Régime alimentaire</label>
              <select
                value={form.dietary_option}
                onChange={e => setForm({ ...form, dietary_option: e.target.value })}
                className="w-full h-11 rounded-lg border border-input bg-transparent px-3 text-sm"
              >
                <option value="">-- Aucun régime particulier --</option>
                {event.menu_dietary_options.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}

          {/* Menu enfant */}
          {event.menu_children_enabled && form.attending === true && (
            <div>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                <Checkbox
                  checked={form.children_menu}
                  onCheckedChange={v => setForm({ ...form, children_menu: v === true })}
                />
                Menu enfant souhaité
              </label>
            </div>
          )}

          {/* Questions personnalisées */}
          {customQuestions.map(q => (
            <div key={q.id}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{q.question}{q.required ? " *" : ""}</label>
              {q.type === "text" || !q.type ? (
                <Input
                  value={form.custom_answers[q.id] || ""}
                  onChange={e => setForm({ ...form, custom_answers: { ...form.custom_answers, [q.id]: e.target.value } })}
                  placeholder={q.placeholder || ""}
                  className="h-11 rounded-lg"
                />
              ) : q.type === "choice" && q.options?.length > 0 ? (
                <select
                  value={form.custom_answers[q.id] || ""}
                  onChange={e => setForm({ ...form, custom_answers: { ...form.custom_answers, [q.id]: e.target.value } })}
                  className="w-full h-11 rounded-lg border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">-- Choisir --</option>
                  {q.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : null}
            </div>
          ))}

          {/* Remarques */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Remarques</label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Allergies, informations complémentaires..."
              rows={3}
              className="rounded-lg"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)} className="flex-1 rounded-lg h-11">
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 rounded-lg h-11">
              {loading ? "Envoi..." : "Confirmer"}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}