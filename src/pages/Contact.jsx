import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, CheckCircle2, Mail, Phone } from "lucide-react";
import { createPageUrl } from "@/utils";

const SUBJECTS = [
  "Ma commande",
  "Livraison et suivi de colis",
  "Retour et remboursement",
  "Mon événement (page web)",
  "Problème technique",
  "Partenariat ou presse",
  "Autre",
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) { setError("Votre adresse e-mail est requise pour que nous puissions vous répondre."); return; }
    if (!form.subject) { setError("Merci de sélectionner un objet."); return; }
    if (!form.message.trim()) { setError("Merci de saisir un message."); return; }
    setError("");
    setSending(true);

    // Send to the owner
    await base44.integrations.Core.SendEmail({
      to: "contact@fleursdefete.fr",
      from_name: form.name || form.email,
      subject: `[Contact] ${form.subject}`,
      body: `Nouveau message via le formulaire de contact Fleurs en fête.\n\nNom : ${form.name || "(non renseigné)"}\nEmail : ${form.email}\nObjet : ${form.subject}\n\nMessage :\n${form.message}`,
    });

    // Auto-reply to sender
    await base44.integrations.Core.SendEmail({
      to: form.email,
      from_name: "Fleurs en fête",
      subject: "Nous avons bien reçu votre message 🌸",
      body: `Bonjour ${form.name || ""},\n\nMerci de nous avoir contactés ! Nous avons bien reçu votre message concernant : "${form.subject}".\n\nNous vous répondrons dans les meilleurs délais.\n\nÀ très bientôt,\nGwenaëlle — Fleurs en fête\ncontact@fleursdefete.fr\n06 30 77 80 36`,
    });

    setSending(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
        .gold-line { background: linear-gradient(90deg, transparent, #c9a96e, transparent); height: 1px; }
      `}</style>

      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-gray-100">
        <a href={createPageUrl("Home")}>
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
            alt="Fleurs en fête" className="h-10" />
        </a>
        <a href={createPageUrl("Home")} className="font-sans-clean text-sm text-gray-400 hover:text-rose-400 transition">← Retour à l'accueil</a>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-16">
        <p className="font-sans-clean text-xs tracking-[0.3em] uppercase text-rose-400 mb-3 text-center">On est là pour vous</p>
        <h1 className="font-serif-elegant text-5xl font-bold text-gray-800 mb-4 text-center">Nous contacter</h1>
        <div className="gold-line max-w-[80px] mx-auto mb-8" />

        {/* Contact info */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10 justify-center">
          <a href="mailto:contact@fleursdefete.fr"
            className="flex items-center gap-2.5 px-5 py-3 rounded-2xl border border-rose-100 bg-rose-50 text-rose-500 font-sans-clean text-sm font-semibold hover:bg-rose-100 transition">
            <Mail className="w-4 h-4" /> contact@fleursdefete.fr
          </a>
          <a href="tel:+33630778036"
            className="flex items-center gap-2.5 px-5 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-gray-600 font-sans-clean text-sm font-semibold hover:bg-gray-100 transition">
            <Phone className="w-4 h-4" /> 06 30 77 80 36
          </a>
        </div>

        {sent ? (
          <div className="text-center py-16">
            <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto mb-4" />
            <h2 className="font-serif-elegant text-3xl font-bold text-gray-800 mb-2">Message envoyé !</h2>
            <p className="font-sans-clean text-gray-500 text-sm mb-6">Merci ! Nous vous répondrons dans les meilleurs délais. Un email de confirmation vous a été envoyé.</p>
            <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
              className="font-sans-clean text-sm text-rose-400 hover:underline">Envoyer un autre message</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-sans-clean text-xs font-semibold text-gray-500 mb-1 block">Votre nom (optionnel)</label>
              <Input value={form.name} onChange={e => set("name", e.target.value)}
                placeholder="Prénom Nom" className="rounded-2xl font-sans-clean" />
            </div>

            <div>
              <label className="font-sans-clean text-xs font-semibold text-gray-500 mb-1 block">
                Votre adresse e-mail <span className="text-rose-400">*</span>
              </label>
              <Input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                placeholder="vous@email.com" className="rounded-2xl font-sans-clean" required />
              <p className="text-xs text-gray-400 mt-1 font-sans-clean">Indispensable pour que nous puissions vous répondre.</p>
            </div>

            <div>
              <label className="font-sans-clean text-xs font-semibold text-gray-500 mb-1 block">
                Objet de votre demande <span className="text-rose-400">*</span>
              </label>
              <select value={form.subject} onChange={e => set("subject", e.target.value)}
                className="w-full rounded-2xl border border-input px-3 py-2.5 text-sm font-sans-clean bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-rose-300">
                <option value="">-- Sélectionnez un objet --</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="font-sans-clean text-xs font-semibold text-gray-500 mb-1 block">
                Votre message <span className="text-rose-400">*</span>
              </label>
              <textarea value={form.message} onChange={e => set("message", e.target.value)} rows={5}
                placeholder="Décrivez votre demande en détail..."
                className="w-full rounded-2xl border border-input px-3 py-2.5 text-sm font-sans-clean resize-none focus:outline-none focus:ring-1 focus:ring-rose-300" />
            </div>

            {error && (
              <p className="text-sm text-red-500 font-sans-clean bg-red-50 rounded-xl px-4 py-2">{error}</p>
            )}

            <p className="text-xs text-gray-400 font-sans-clean">
              Vos données sont utilisées uniquement pour vous répondre, conformément à notre{" "}
              <a href={createPageUrl("MentionsLegales")} className="text-rose-400 underline">politique de confidentialité</a>.
            </p>

            <Button type="submit" disabled={sending}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 hover:opacity-90 text-white font-sans-clean font-semibold shadow-sm transition">
              {sending ? "Envoi en cours…" : <><Send className="w-4 h-4 mr-2" /> Envoyer mon message</>}
            </Button>
          </form>
        )}
      </div>

      <footer className="text-center py-8 px-4 border-t border-gray-100">
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400 font-sans-clean">
          <a href={createPageUrl("CGV")} className="hover:text-rose-400">CGV</a>
          <span>·</span>
          <a href={createPageUrl("CGU")} className="hover:text-rose-400">CGU</a>
          <span>·</span>
          <a href={createPageUrl("MentionsLegales")} className="hover:text-rose-400">Mentions légales & RGPD</a>
          <span>·</span>
          <a href={createPageUrl("Contact")} className="hover:text-rose-400">Contact</a>
        </div>
      </footer>
    </div>
  );
}