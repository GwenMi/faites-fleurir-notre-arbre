import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Loader2, Mail, Phone, MapPin } from "lucide-react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("Merci de remplir tous les champs obligatoires.");
      return;
    }
    setSending(true);
    setError("");

    try {
      await base44.integrations.Core.SendEmail({
        to: "gwen@fleursdefete.fr",
        subject: `📬 Nouveau message de ${form.name} — ${form.subject || "Contact site"}`,
        body: `Nouveau message reçu depuis le formulaire de contact :\n\n👤 Nom : ${form.name}\n📧 Email : ${form.email}${form.phone ? `\n📞 Téléphone : ${form.phone}` : ""}\n📌 Sujet : ${form.subject || "Non précisé"}\n\n💬 Message :\n${form.message}\n\n---\nEnvoyé depuis fleursdefete.fr`,
      });

      // Confirmation email to the customer
      try {
        await base44.integrations.Core.SendEmail({
          to: form.email,
          from_name: "Gwenaëlle — Fleurs de Fête",
          subject: "✅ Votre message a bien été reçu — Fleurs de Fête",
          body: `Bonjour ${form.name},\n\nMerci pour votre message ! Je vous répondrai dans les plus brefs délais, généralement sous 24 à 48h.\n\nVotre message :\n"${form.message}"\n\nÀ très bientôt,\nGwenaëlle 🌸\nFleurs de Fête\ncontact@fleursdefete.fr`,
        });
      } catch {}

      setSent(true);
    } catch (err) {
      setError("Une erreur est survenue lors de l'envoi. Veuillez réessayer ou nous contacter directement par email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
      `}</style>

      {/* Header */}
      <div className="bg-white border-b border-rose-100 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl">🌸</span>
            <span className="font-serif text-xl font-semibold text-rose-700">Fleurs de Fête</span>
          </a>
          <a href="/" className="text-sm text-gray-500 hover:text-rose-600 transition">← Retour à l'accueil</a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl font-bold text-gray-800 mb-3">Contactez-nous</h1>
          <p className="text-gray-500 font-sans-clean text-lg max-w-xl mx-auto">
            Une question sur votre commande, un projet sur-mesure ? Écrivez-nous, nous vous répondons sous 24–48h.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-sm">
              <h2 className="font-serif text-lg font-semibold text-gray-800 mb-4">Nos coordonnées</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-sans-clean">Email</p>
                    <a href="mailto:contact@fleursdefete.fr" className="text-sm text-gray-700 hover:text-rose-600 transition font-sans-clean">
                      contact@fleursdefete.fr
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Phone className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-sans-clean">Téléphone</p>
                    <a href="tel:+33630778036" className="text-sm text-gray-700 hover:text-rose-600 transition font-sans-clean">
                      06 30 77 80 36
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-sans-clean">Adresse</p>
                    <p className="text-sm text-gray-700 font-sans-clean">2 Place Jean V, Bureau 3<br />44000 Nantes</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-rose-50 rounded-2xl border border-rose-100 p-5">
              <p className="text-sm text-rose-700 font-sans-clean leading-relaxed">
                🌸 <strong>Délai de réponse :</strong> sous 24 à 48h en jours ouvrés.<br /><br />
                Pour les commandes urgentes, n'hésitez pas à nous appeler directement.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-8">
              {sent ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-gray-800 mb-2">Message envoyé !</h2>
                  <p className="text-gray-500 font-sans-clean mb-6">
                    Merci {form.name} ! Nous vous répondrons dans les 24–48h.<br />
                    Un email de confirmation vous a été envoyé.
                  </p>
                  <Button
                    onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                    variant="outline"
                    className="rounded-full border-rose-200 text-rose-600 hover:bg-rose-50"
                  >
                    Envoyer un autre message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 font-sans-clean">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nom complet *</label>
                      <Input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Marie Dupont"
                        className="rounded-xl text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Email *</label>
                      <Input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="marie@exemple.fr"
                        className="rounded-xl text-gray-900"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Téléphone <span className="text-gray-400 font-normal">(facultatif)</span></label>
                      <Input
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="06 12 34 56 78"
                        className="rounded-xl text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Sujet <span className="text-gray-400 font-normal">(facultatif)</span></label>
                      <Input
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        placeholder="Question commande, devis…"
                        className="rounded-xl text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Message *</label>
                    <Textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Décrivez votre projet ou votre question..."
                      className="rounded-xl h-36 resize-none text-gray-900"
                      required
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={sending}
                    className="w-full h-12 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-semibold text-base transition"
                  >
                    {sending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Envoi en cours...</>
                    ) : (
                      <><Mail className="w-4 h-4 mr-2" /> Envoyer mon message</>
                    )}
                  </Button>

                  <p className="text-xs text-center text-gray-400">
                    * Champs obligatoires. Vos données ne sont utilisées que pour vous répondre.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}