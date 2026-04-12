import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function RSVPSection({ event }) {
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ guest_name: "", email: "", attending: null, party_size: 1, notes: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.guest_name || form.attending === null) {
      toast.error("Veuillez remplir les champs requis");
      return;
    }

    setLoading(true);
    try {
      await base44.entities.RSVPResponse.create({
        event_id: event.id,
        guest_name: form.guest_name,
        email: form.email,
        attending: form.attending,
        party_size: form.party_size,
        notes: form.notes,
      });
      toast.success("RSVP enregistré ! 🎉");
      setForm({ guest_name: "", email: "", attending: null, party_size: 1, notes: "" });
      setFormOpen(false);
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12">
      <h2 className="font-serif-elegant text-3xl font-bold mb-6 text-gray-900">📍 Confirmer votre présence</h2>

      {!formOpen ? (
        <Button onClick={() => setFormOpen(true)} size="lg" className="w-full rounded-xl h-12 mb-6 font-semibold">
          ✍️ Répondre au RSVP
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-gray-50 rounded-xl mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Votre nom *</label>
            <Input
              value={form.guest_name}
              onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
              placeholder="Prénom Nom"
              className="h-11 rounded-lg"
            />
          </div>
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
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Confirmation *</label>
            <div className="flex gap-4">
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
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Remarques</label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Allergies, régimes spéciaux, etc..."
              rows={3}
              className="rounded-lg"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormOpen(false)}
              className="flex-1 rounded-lg h-11"
            >
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