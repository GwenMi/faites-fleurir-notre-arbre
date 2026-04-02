import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ChevronDown, Send, CheckCircle2, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const FAQ_SECTIONS = [
  {
    title: "La commande",
    emoji: "📦",
    items: [
      {
        q: "Comment passer commande ?",
        a: "Cliquez sur « Commander » depuis la page d'accueil. Le tunnel vous guide en quelques étapes : choisissez votre type d'événement, le kit, la taille de votre pack, personnalisez vos étiquettes, renseignez votre adresse et payez en ligne. C'est tout !"
      },
      {
        q: "Quelles tailles de packs sont disponibles ?",
        a: "Nous proposons des packs de 30, 50, 70, 100 et 120 invités. Vous pouvez aussi combiner plusieurs tailles dans la même commande (ex : Pack 30 + Pack 50)."
      },
      {
        q: "Puis-je personnaliser les étiquettes ?",
        a: "Oui ! Lors de la commande vous indiquez les prénoms (ou le nom de l'entreprise) et la date de votre événement. Ces informations sont imprimées sur chaque étiquette."
      },
      {
        q: "Y a-t-il une réduction pour plusieurs packs ?",
        a: "Oui, une réduction de 10% est automatiquement appliquée dès que vous commandez au moins 2 packs au total."
      },
      {
        q: "Peut-on modifier ou annuler une commande ?",
        a: "Contactez-nous le plus tôt possible à contact@fleursdefete.fr ou au 06 30 77 80 36. Tant que la commande n'est pas partie en production, nous faisons notre maximum pour l'ajuster. Passé ce stade, les modifications ne sont plus possibles."
      },
    ]
  },
  {
    title: "Livraison",
    emoji: "🚚",
    items: [
      {
        q: "Quels sont les délais de livraison ?",
        a: "Nous recommandons de commander au minimum 21 jours avant votre événement pour être serein. Les commandes passées moins de 14 jours avant la date peuvent être acceptées mais la livraison dans les délais ne peut pas être garantie."
      },
      {
        q: "Livrez-vous partout en France ?",
        a: "Oui, nous livrons partout en France métropolitaine via Sendcloud (Colissimo, Chronopost, DPD selon le poids et la destination). Les DOM-TOM sont possibles, contactez-nous."
      },
      {
        q: "Comment suivre ma livraison ?",
        a: "Dès l'expédition, vous recevez un email avec votre numéro de suivi et un lien direct vers le site du transporteur. Vous pouvez aussi retrouver ces informations dans votre espace client."
      },
      {
        q: "La livraison est-elle gratuite ?",
        a: "Les 20 premières commandes bénéficient de la livraison offerte dans le cadre de notre offre de lancement. Ensuite, les frais de livraison sont calculés en temps réel selon le poids de la commande et le transporteur choisi."
      },
    ]
  },
  {
    title: "Le contenant & le kit",
    emoji: "🌱",
    items: [
      {
        q: "Quels contenants sont proposés ?",
        a: "Deux modèles au choix : un pot rond avec fermoir à clip en métal, et un pot carré avec bouchon en liège naturel. Vous sélectionnez votre préférence lors de la commande en cliquant sur la photo."
      },
      {
        q: "Quelle est la différence entre le kit à composer et le kit prêt à offrir ?",
        a: "Le kit à composer vous est livré en pièces détachées : vous assemblez vous-même les pots, idéal pour personnaliser la mise en place. Le kit prêt à offrir est entièrement assemblé et prêt à déposer sur les tables le jour J."
      },
      {
        q: "Quelles graines sont disponibles ?",
        a: "Tournesol nain, Mignonnette (parfumée), Coquelicot rouge et Bleuet. Vous choisissez lors de la commande."
      },
      {
        q: "Le sac cadeau est-il inclus ?",
        a: "Non, le sac cadeau est une option en supplément (0,40€/invité). Vous pouvez l'activer lors de la commande dans l'étape « Pack invités »."
      },
    ]
  },
  {
    title: "Le site événement",
    emoji: "💍",
    items: [
      {
        q: "À quoi sert le site événement ?",
        a: "C'est une page web personnalisée à votre URL (ex : fleursenfete.fr/sophie-et-marc) que vous partagez à vos invités. Il peut contenir votre histoire, le programme, les RSVP, la galerie photos, le plan de table et bien plus selon votre formule."
      },
      {
        q: "Quelle est la différence entre la formule gratuite et la formule complète ?",
        a: "La formule gratuite inclut la présentation de votre événement et le défi des fleurs (QR code + galerie). La formule complète (39,99€ paiement unique) débloque tout : RSVP, suivi invités, plan de table, galerie photos modérée, budget, liste cadeaux, FAQ, campagnes email et bien plus."
      },
      {
        q: "Puis-je passer à la formule complète après avoir commencé avec la gratuite ?",
        a: "Oui, à tout moment depuis votre espace mariés. Cliquez sur n'importe quelle fonctionnalité verrouillée et un formulaire de paiement s'ouvrira directement."
      },
      {
        q: "Comment les invités accèdent-ils au site ?",
        a: "Vous leur partagez le lien. Certaines sections sont publiques, d'autres nécessitent que l'invité crée un compte. Chaque demande de compte est soumise à votre validation depuis votre espace mariés, onglet « Accès invités »."
      },
      {
        q: "Combien de temps le site reste-t-il en ligne ?",
        a: "Le site reste actif aussi longtemps que votre compte est actif. Contactez-nous si vous souhaitez l'archiver ou le supprimer."
      },
    ]
  },
  {
    title: "Paiement",
    emoji: "💳",
    items: [
      {
        q: "Quels moyens de paiement acceptez-vous ?",
        a: "Paiement par carte bancaire (Visa, Mastercard, American Express) via Stripe, la référence en matière de paiement sécurisé en ligne."
      },
      {
        q: "Puis-je payer en plusieurs fois ?",
        a: "Oui, un paiement en acompte (50%) est proposé lors de la commande. Le solde est réglé à la livraison."
      },
      {
        q: "Mes données bancaires sont-elles sécurisées ?",
        a: "Absolument. Nous utilisons Stripe qui est certifié PCI-DSS niveau 1 (le plus élevé). Nous ne stockons jamais vos données bancaires."
      },
      {
        q: "Je ne reçois pas ma facture, que faire ?",
        a: "Vérifiez vos spams. Sinon, connectez-vous à votre espace client ou contactez-nous avec votre numéro de commande — nous vous la renvoyons immédiatement."
      },
    ]
  },
];

function Accordion({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left"
      >
        <p style={{ fontFamily: "'Lato', sans-serif" }} className="text-sm font-semibold text-gray-800 pr-2">{item.q}</p>
        <ChevronDown className={`w-4 h-4 text-rose-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <p style={{ fontFamily: "'Lato', sans-serif" }} className="text-sm text-gray-600 leading-relaxed pb-4">
          {item.a}
        </p>
      )}
    </div>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) { setError("Votre email est requis."); return; }
    if (!form.message.trim()) { setError("Merci de saisir un message."); return; }
    setError("");
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: "contact@fleursdefete.fr",
      from_name: form.name || form.email,
      subject: `[FAQ Contact] ${form.subject || "Question"}`,
      body: `Nom : ${form.name || "—"}\nEmail : ${form.email}\nObjet : ${form.subject || "—"}\n\n${form.message}`,
    });
    await base44.integrations.Core.SendEmail({
      to: form.email,
      from_name: "Fleurs en fête",
      subject: "Nous avons bien reçu votre message 🌸",
      body: `Bonjour ${form.name || ""},\n\nMerci de nous avoir contactés ! Nous vous répondrons dans les meilleurs délais.\n\nÀ bientôt,\nGwenaëlle — Fleurs en fête\ncontact@fleursdefete.fr`,
    });
    setSending(false);
    setSent(true);
  };

  if (sent) return (
    <div className="text-center py-10">
      <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-2xl font-bold text-gray-800 mb-2">Message envoyé !</h3>
      <p style={{ fontFamily: "'Lato', sans-serif" }} className="text-sm text-gray-500">Nous vous répondrons dans les meilleurs délais.</p>
      <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
        className="mt-4 text-sm text-rose-400 hover:underline" style={{ fontFamily: "'Lato', sans-serif" }}>
        Envoyer un autre message
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label style={{ fontFamily: "'Lato', sans-serif" }} className="text-xs font-semibold text-gray-500 mb-1 block">Votre nom (optionnel)</label>
          <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Prénom Nom" className="rounded-xl h-10" />
        </div>
        <div>
          <label style={{ fontFamily: "'Lato', sans-serif" }} className="text-xs font-semibold text-gray-500 mb-1 block">Email *</label>
          <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="vous@email.com" className="rounded-xl h-10" required />
        </div>
      </div>
      <div>
        <label style={{ fontFamily: "'Lato', sans-serif" }} className="text-xs font-semibold text-gray-500 mb-1 block">Objet</label>
        <Input value={form.subject} onChange={e => set("subject", e.target.value)} placeholder="Ex: Question sur ma commande" className="rounded-xl h-10" />
      </div>
      <div>
        <label style={{ fontFamily: "'Lato', sans-serif" }} className="text-xs font-semibold text-gray-500 mb-1 block">Votre message *</label>
        <textarea value={form.message} onChange={e => set("message", e.target.value)} rows={4}
          placeholder="Décrivez votre question ou problème…"
          className="w-full rounded-xl border border-input px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-rose-300" required />
      </div>
      {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>}
      <Button type="submit" disabled={sending}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold hover:opacity-90 transition">
        {sending ? "Envoi…" : <><Send className="w-4 h-4 mr-2" /> Envoyer mon message</>}
      </Button>
    </form>
  );
}

export default function FAQ() {
  const [openSection, setOpenSection] = useState(null);

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
        .gold-line { background: linear-gradient(90deg, transparent, #c9a96e, transparent); height: 1px; }
      `}</style>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-gray-100">
        <a href={createPageUrl("Home")}>
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
            alt="Fleurs en fête" className="h-10" />
        </a>
        <a href={createPageUrl("Home")} className="font-sans-clean text-sm text-gray-400 hover:text-rose-400 transition">← Retour à l'accueil</a>
      </nav>

      {/* Hero */}
      <div className="text-center px-6 py-16 bg-gradient-to-b from-rose-50 to-white">
        <p className="font-sans-clean text-xs tracking-[0.3em] uppercase text-rose-400 mb-3">Aide & support</p>
        <h1 className="font-serif-elegant text-5xl font-bold text-gray-800 mb-3">Questions fréquentes</h1>
        <div className="gold-line max-w-[80px] mx-auto mb-5" />
        <p className="font-sans-clean text-gray-500 text-sm max-w-md mx-auto">
          Retrouvez les réponses aux questions les plus courantes. Vous ne trouvez pas ce que vous cherchez ?{" "}
          <a href="#contact" className="text-rose-400 underline">Contactez-nous</a>.
        </p>
      </div>

      {/* FAQ accordéon par section */}
      <div className="max-w-3xl mx-auto px-6 pb-16">
        <div className="space-y-4">
          {FAQ_SECTIONS.map((section, i) => {
            const isOpen = openSection === i;
            return (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenSection(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{section.emoji}</span>
                    <h2 className="font-serif-elegant text-xl font-bold text-gray-800">{section.title}</h2>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-rose-300 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-2">
                    {section.items.map((item, j) => (
                      <Accordion key={j} item={item} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact form */}
      <div id="contact" className="bg-rose-50 border-t border-rose-100">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <p className="font-sans-clean text-xs tracking-[0.3em] uppercase text-rose-400 mb-2">On est là pour vous</p>
            <h2 className="font-serif-elegant text-4xl font-bold text-gray-800 mb-4">Vous n'avez pas trouvé ?</h2>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <a href="mailto:contact@fleursdefete.fr"
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl border border-rose-200 bg-white text-rose-500 font-sans-clean text-sm font-semibold hover:bg-rose-50 transition">
                <Mail className="w-4 h-4" /> contact@fleursdefete.fr
              </a>
              <a href="tel:+33630778036"
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl border border-gray-200 bg-white text-gray-600 font-sans-clean text-sm font-semibold hover:bg-gray-50 transition">
                <Phone className="w-4 h-4" /> 06 30 77 80 36
              </a>
            </div>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-8">
            <ContactForm />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 px-4 border-t border-gray-100">
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400 font-sans-clean">
          <a href={createPageUrl("CGV")} className="hover:text-rose-400">CGV</a>
          <span>·</span>
          <a href={createPageUrl("CGU")} className="hover:text-rose-400">CGU</a>
          <span>·</span>
          <a href={createPageUrl("MentionsLegales")} className="hover:text-rose-400">Mentions légales</a>
          <span>·</span>
          <a href={createPageUrl("Contact")} className="hover:text-rose-400">Contact</a>
        </div>
      </footer>
    </div>
  );
}
