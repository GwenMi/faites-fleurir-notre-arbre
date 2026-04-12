import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function GuestbookSection({ event }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({ pseudo: "", email: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pseudo || !formData.message) {
      toast.error("Veuillez remplir pseudo et message");
      return;
    }

    setLoading(true);
    try {
      await base44.entities.GuestbookEntry.create({
        event_id: event.id,
        pseudo: formData.pseudo,
        email: formData.email,
        message: formData.message,
        approved: true,
      });
      toast.success("Message ajouté ! 📖");
      setFormData({ pseudo: "", email: "", message: "" });
      setFormOpen(false);
    } catch {
      toast.error("Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2 className="font-serif-elegant text-3xl font-bold mb-6 text-gray-900">📖 Livre d'or</h2>

      {!formOpen ? (
        <Button onClick={() => setFormOpen(true)} size="lg" className="w-full rounded-xl h-12 mb-6 font-semibold">
          ✍️ Laisser un message
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-gray-50 rounded-xl mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Pseudo *</label>
            <Input
              value={formData.pseudo}
              onChange={(e) => setFormData({ ...formData, pseudo: e.target.value })}
              placeholder="Votre nom"
              className="h-11 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="optionnel"
              className="h-11 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Message *</label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Vos pensées, vœux..."
              rows={4}
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
              {loading ? "Envoi..." : "Ajouter"}
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {entries.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Pas de messages pour le moment...</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg border border-rose-100">
              <p className="font-semibold text-gray-800">{entry.pseudo}</p>
              <p className="text-gray-600 mt-2">{entry.message}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}