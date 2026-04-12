import { Lock, Sparkles, CheckCircle } from "lucide-react";
import UpgradeModal from "@/components/UpgradeModal";
import { useState } from "react";

const FEATURE_DETAILS = {
  rsvp: {
    emoji: "💌",
    title: "Suivi RSVP",
    desc: "Suivez en temps réel les confirmations de présence de vos invités.",
    bullets: ["Confirmations en un clic", "Compteur de présences", "Export CSV"],
    mockup: "rsvp",
  },
  rsvp_responses: {
    emoji: "📋",
    title: "Réponses RSVP détaillées",
    desc: "Consultez toutes les réponses de vos invités avec leurs informations.",
    bullets: ["Nom, email, nb de personnes", "Notes et régimes alimentaires", "Historique des réponses"],
    mockup: "list",
  },
  reminders: {
    emoji: "🔔",
    title: "Relances automatiques",
    desc: "Envoyez des rappels automatiques aux invités qui n'ont pas répondu.",
    bullets: ["Emails personnalisés", "Planification automatique", "Suivi des envois"],
    mockup: "reminders",
  },
  campaigns: {
    emoji: "📧",
    title: "Campagnes email",
    desc: "Créez et envoyez des emails à tous vos invités en quelques clics.",
    bullets: ["Templates d'emails", "Envoi groupé", "Statistiques d'ouverture"],
    mockup: "list",
  },
  guestbook: {
    emoji: "📖",
    title: "Livre d'or",
    desc: "Vos invités laissent des messages sur votre site. Vous les validez.",
    bullets: ["Messages avec photos", "Modération avant publication", "Messages mis en avant"],
    mockup: "guestbook",
  },
  programme: {
    emoji: "🗓️",
    title: "Programme de la journée",
    desc: "Créez la timeline de votre journée, visible par vos invités.",
    bullets: ["Étapes de la journée", "Horaires et lieux", "Affichage élégant"],
    mockup: "timeline",
  },
  seating: {
    emoji: "🪑",
    title: "Plan de table",
    desc: "Organisez le placement de vos invités de façon interactive.",
    bullets: ["Glisser-déposer", "Export PDF du plan", "Vue par table"],
    mockup: "grid",
  },
  photos: {
    emoji: "📷",
    title: "Galerie photos",
    desc: "Moderez les photos partagées par vos invités en temps réel.",
    bullets: ["Galerie collaborative", "Approbation avant publication", "Téléchargement groupé"],
    mockup: "grid",
  },
  vendors: {
    emoji: "🤝",
    title: "Prestataires",
    desc: "Centralisez les coordonnées et les contrats de vos prestataires.",
    bullets: ["Fiches prestataires", "Suivi des paiements", "Documents associés"],
    mockup: "list",
  },
  documents: {
    emoji: "📁",
    title: "Documents",
    desc: "Stockez tous vos contrats et documents importants au même endroit.",
    bullets: ["Contrats & factures", "Devis", "Accès depuis n'importe où"],
    mockup: "list",
  },
  agenda: {
    emoji: "📅",
    title: "Agenda rendez-vous",
    desc: "Planifiez et suivez tous vos rendez-vous prestataires.",
    bullets: ["Vue calendrier", "Rappels", "Notes par RDV"],
    mockup: "timeline",
  },
  menu: {
    emoji: "🍽️",
    title: "Menu & plats",
    desc: "Définissez les menus et récoltez les choix de plats de vos invités.",
    bullets: ["Menu entrée/plat/dessert", "Choix par invité", "Récapitulatif cuisine"],
    mockup: "list",
  },
  budget: {
    emoji: "💰",
    title: "Budget",
    desc: "Suivez toutes vos dépenses et votre budget en temps réel.",
    bullets: ["Catégories de dépenses", "Budget vs réel", "Graphique visuel"],
    mockup: "budget",
  },
  wishlist: {
    emoji: "🎁",
    title: "Liste de cadeaux",
    desc: "Partagez vos envies, les invités réservent leur cadeau en ligne.",
    bullets: ["Cadeaux avec liens", "Réservation sans double emploi", "Visible sur le site"],
    mockup: "list",
  },
  faq: {
    emoji: "❓",
    title: "FAQ personnalisable",
    desc: "Répondez aux questions fréquentes de vos invités sur votre site.",
    bullets: ["Questions/réponses illimitées", "Accordéons élégants", "Visible par vos invités"],
    mockup: "list",
  },
  tasks: {
    emoji: "✅",
    title: "Tâches",
    desc: "Gérez toutes vos tâches préparatoires avec un suivi de progression.",
    bullets: ["Tâches par catégorie", "Assignation", "Pourcentage d'avancement"],
    mockup: "list",
  },
  checklist: {
    emoji: "📝",
    title: "Checklist mariage",
    desc: "La checklist complète des préparatifs, mois par mois.",
    bullets: ["200+ éléments", "Organisée par période", "Personnalisable"],
    mockup: "list",
  },
  thankyou: {
    emoji: "💌",
    title: "Remerciements",
    desc: "Envoyez des messages de remerciements personnalisés à vos invités.",
    bullets: ["Modèles de messages", "Envoi par email", "Suivi des envois"],
    mockup: "list",
  },
  site_editor: {
    emoji: "🎨",
    title: "Sections du site",
    desc: "Activez, désactivez et réordonnez les sections de votre site.",
    bullets: ["Ordre drag & drop", "Activation par section", "Aperçu en temps réel"],
    mockup: "editor",
  },
  theme: {
    emoji: "🎨",
    title: "Thème & couleurs",
    desc: "Personnalisez totalement l'apparence de votre site événement.",
    bullets: ["Couleurs primaires & secondaires", "Choix des polices", "5 templates"],
    mockup: "grid",
  },
  calendar: {
    emoji: "📆",
    title: "Calendrier",
    desc: "Visualisez tous vos événements et rendez-vous dans un calendrier.",
    bullets: ["Vue mensuelle", "Synchronisation agenda", "Rappels"],
    mockup: "timeline",
  },
  thankyou_cards: {
    emoji: "🃏",
    title: "Cartes mercis",
    desc: "Générez de belles cartes de remerciements à imprimer ou envoyer.",
    bullets: ["Templates élégants", "Personnalisation", "Export PDF"],
    mockup: "grid",
  },
};

/* Simple visual mockups */
function Mockup({ type }) {
  const row = <div className="flex gap-2 mb-2"><div className="h-3 rounded bg-gray-200" style={{ width: "40%" }} /><div className="h-3 rounded bg-gray-100" style={{ width: "30%" }} /></div>;
  const card = <div className="h-10 rounded-lg bg-gray-100 mb-2" />;

  if (type === "grid") return (
    <div className="grid grid-cols-3 gap-2">
      {[...Array(6)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-gray-100" />)}
    </div>
  );
  if (type === "timeline") return (
    <div className="space-y-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-3 items-center">
          <div className="w-3 h-3 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="h-3 rounded bg-gray-100 flex-1" />
        </div>
      ))}
    </div>
  );
  if (type === "budget") return (
    <div>
      <div className="h-4 rounded-full bg-gray-200 mb-3 overflow-hidden"><div className="h-full rounded-full bg-rose-100" style={{ width: "65%" }} /></div>
      {[...Array(3)].map((_, i) => <div key={i}>{row}</div>)}
    </div>
  );
  if (type === "editor") return (
    <div className="space-y-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-2 p-2 rounded bg-gray-50 border border-gray-100">
          <div className="w-3 h-3 rounded-full bg-gray-200" />
          <div className="h-2 rounded bg-gray-200 flex-1" />
          <div className="w-6 h-3 rounded-full bg-gray-200" />
        </div>
      ))}
    </div>
  );
  // default: list / rsvp / guestbook
  return <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i}>{card}</div>)}</div>;
}

export default function PremiumFeaturePreview({ tabKey, event, customerEmail, onUpgraded }) {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const f = FEATURE_DETAILS[tabKey] || {
    emoji: "✨",
    title: "Fonctionnalité Premium",
    desc: "Cette fonctionnalité est disponible avec le plan Premium.",
    bullets: ["Accès complet", "Mise à jour en temps réel", "Support prioritaire"],
    mockup: "list",
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center py-10 px-4">
        <div className="w-full max-w-lg">
          {/* Card avec blur overlay et preview */}
          <div className="relative rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-white mb-6">
            {/* Preview mockup flouté */}
            <div className="p-6 select-none pointer-events-none" style={{ filter: "blur(3px)", opacity: 0.4 }}>
              <div className="h-6 w-32 rounded bg-gray-200 mb-4" />
              <Mockup type={f.mockup} />
            </div>
            {/* Lock overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ background: "linear-gradient(to bottom, rgba(255,255,255,.1) 0%, rgba(255,255,255,.85) 40%)" }}>
              <div className="bg-white rounded-2xl shadow-lg px-8 py-6 text-center border border-gray-100">
                <div className="text-4xl mb-3">{f.emoji}</div>
                <p className="font-semibold text-gray-800 text-base mb-1">{f.title}</p>
                <p className="text-sm text-gray-500 max-w-xs">{f.desc}</p>
              </div>
            </div>
          </div>

          {/* Ce que vous obtenez */}
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 mb-6 border border-rose-100">
            <p className="text-xs font-semibold text-rose-500 uppercase tracking-wide mb-3">Ce que vous débloquez</p>
            <ul className="space-y-2">
              {f.bullets.map(b => (
                <li key={b} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <button
            onClick={() => setUpgradeOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-white text-sm transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #f43f5e, #ec4899)" }}
          >
            <Sparkles className="w-4 h-4" />
            Débloquer avec Premium — 39,99€
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">Paiement unique · Accès à vie · Toutes les fonctionnalités</p>
        </div>
      </div>

      {upgradeOpen && (
        <UpgradeModal
          event={event}
          customerEmail={customerEmail}
          onClose={() => setUpgradeOpen(false)}
          onUpgraded={() => { setUpgradeOpen(false); onUpgraded(); }}
        />
      )}
    </>
  );
}
