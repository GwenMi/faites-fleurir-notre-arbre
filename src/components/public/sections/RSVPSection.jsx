import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Heart, CheckCircle2 } from "lucide-react";

export default function RSVPSection({ event }) {
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    guest_name: "",
    email: "",
    attending: null,
    party_size: 1,
    notes: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.guest_name || !formData.email || formData.attending === null) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    try {
      await base44.entities.RSVPResponse.create({
        event_id: event.id,
        guest_name: formData.guest_name,
        email: formData.email,
        attending: formData.attending,
        party_size: parseInt(formData.party_size),
        notes: formData.notes,
      });
      toast.success("RSVP enregistré ! Merci 🎉");
      setFormData({ guest_name: "", email: "", attending: null, party_size: 1, notes: "" });
      setFormOpen(false);
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2 className="font-serif-elegant text-3xl font-bold mb-6 text-gray-900">💬 RSVP</h2>
      <p className="text-gray-600 mb-6">
        Confirmez votre présence pour que nous puissions mieux vous accueillir.
      </p>

      {!formOpen ? (
        <Button onClick={() => setFormOpen(true)} size="lg" className="w-full rounded-xl h-12 font-semibold">
          <Heart className="w-4 h-4 mr-2" /> Répondre à l'invitation
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-gray-50 rounded-xl">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Votre nom *</label>
            <Input
              value={formData.guest_name}
              onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
              placeholder="Emma Martin"
              className="h-11 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
              className="h-11 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Présence *</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, attending: true })}
                className={`flex-1 py-2 px-3 rounded-lg border-2 font-semibold transition ${
                  formData.attending === true
                    ? "border-green-400 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-green-200"
                }`}
              >
                ✓ Je viens
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, attending: false })}
                className={`flex-1 py-2 px-3 rounded-lg border-2 font-semibold transition ${
                  formData.attending === false
                    ? "border-red-400 bg-red-50 text-red-700"
                    : "border-gray-200 hover:border-red-200"
                }`}
              >
                ✕ Je ne peux pas
              </button>
            </div>
          </div>
          {formData.attending && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de personnes</label>
              <Input
                type="number"
                min="1"
                value={formData.party_size}
                onChange={(e) => setFormData({ ...formData, party_size: e.target.value })}
                className="h-11 rounded-lg"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Allergies, régimes particuliers..."
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
              {loading ? "Enregistrement..." : "Envoyer"}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}