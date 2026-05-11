import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Users, CheckCircle, Heart, Camera, Gift, HelpCircle, LayoutGrid, CalendarDays, BellRing, PiggyBank, Paintbrush, ClipboardCheck, ClipboardList, HandHeart, BarChart2, Smartphone, MailCheck, BookOpen, Handshake, CalendarCheck, UtensilsCrossed, FolderOpen, Layers, CalendarRange, Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GuestListManager from "@/components/couple/GuestListManager";
import RSVPTracker from "@/components/couple/RSVPTracker";
import RSVPManager from "@/components/admin/rsvp/RSVPManager";
import PhotoModerationPanel from "@/components/couple/PhotoModerationPanel";
import WishlistManager from "@/components/couple/WishlistManager";
import FAQManager from "@/components/couple/FAQManager";
import SeatingManager from "@/components/admin/SeatingManager";
import ScheduleManager from "@/components/admin/ScheduleManager";
import RSVPReminderPanel from "@/components/couple/RSVPReminderPanel";
import BudgetManager from "@/components/admin/BudgetManager";
import ThemeEditor from "@/components/couple/ThemeEditor";
import WeddingChecklistManager from "@/components/couple/WeddingChecklistManager";
import ThankYouManager from "@/components/couple/ThankYouManager";
import StatsPanel from "@/components/couple/StatsPanel";
import MobilePreview from "@/components/couple/MobilePreview";
import ScheduledEmailsManager from "@/components/couple/ScheduledEmailsManager";
import GuestbookManager from "@/components/couple/GuestbookManager";
import VendorManager from "@/components/couple/VendorManager";
import AgendaManager from "@/components/couple/AgendaManager";
import MenuEditor from "@/components/couple/MenuEditor";
import TaskManager from "@/components/couple/TaskManager";
import VendorDocumentManager from "@/components/couple/VendorDocumentManager";
import SiteEditorManager from "@/components/couple/SiteEditorManager";
import CoupleCalendar from "@/components/couple/CoupleCalendar";
import ThankYouCardGenerator from "@/components/couple/ThankYouCardGenerator";
import GuestAccessManager from "@/components/couple/GuestAccessManager";
import PremiumFeaturePreview from "@/components/couple/PremiumFeaturePreview";
import TemplatePreviewModal from "@/components/admin/TemplatePreviewModal";

const TABS = [
  { key: "stats",          label: "Statistiques",    icon: BarChart2,        premium: false },
  { key: "guests",         label: "Mes invités",      icon: Users,            premium: false },
  { key: "access",         label: "Accès invités",    icon: Lock,             premium: false },
  { key: "rsvp",           label: "Suivi RSVP",       icon: CheckCircle,      premium: true  },
  { key: "rsvp_responses", label: "Réponses RSVP",    icon: Users,            premium: true  },
  { key: "reminders",      label: "Relances",          icon: BellRing,         premium: true  },
  { key: "campaigns",      label: "Campagnes email",   icon: MailCheck,        premium: true  },
  { key: "guestbook",      label: "Livre d'or",        icon: BookOpen,         premium: true  },
  { key: "programme",      label: "Programme",         icon: CalendarDays,     premium: true  },
  { key: "seating",        label: "Plan de table",     icon: LayoutGrid,       premium: true  },
  { key: "photos",         label: "Photos",            icon: Camera,           premium: true  },
  { key: "vendors",        label: "Prestataires",      icon: Handshake,        premium: true  },
  { key: "documents",      label: "Documents",         icon: FolderOpen,       premium: true  },
  { key: "agenda",         label: "Agenda RDV",        icon: CalendarCheck,    premium: true  },
  { key: "menu",           label: "Menu / Plats",      icon: UtensilsCrossed,  premium: true  },
  { key: "budget",         label: "Budget",            icon: PiggyBank,        premium: true  },
  { key: "wishlist",       label: "Liste cadeaux",     icon: Gift,             premium: true  },
  { key: "faq",            label: "FAQ",               icon: HelpCircle,       premium: true  },
  { key: "tasks",          label: "Tâches",            icon: ClipboardList,    premium: true  },
  { key: "checklist",      label: "Checklist",         icon: ClipboardCheck,   premium: true  },
  { key: "thankyou",       label: "Remerciements",     icon: HandHeart,        premium: true  },
  { key: "site_editor",    label: "Sections du site",  icon: Layers,           premium: true  },
  { key: "theme",          label: "Thème",             icon: Paintbrush,       premium: true  },
  { key: "preview",        label: "Aperçu mobile",     icon: Smartphone,       premium: false },
  { key: "calendar",       label: "Calendrier",        icon: CalendarRange,    premium: true  },
  { key: "thankyou_cards", label: "Cartes mercis",     icon: Mail,             premium: true  },
];

// Wrapper to adapt ScheduleManager (takes eventId) to the tab interface (receives event)
function ScheduleManagerWrapper({ event }) {
  return <ScheduleManager eventId={event.id} />;
}

export default function CoupleDashboard() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("guests");
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);

  // Auto-login si connecté et event_id en URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("event_id");
    if (!eventId) { setLoading(false); return; }
    base44.auth.me().then(async (me) => {
      if (!me) { setLoading(false); return; }
      const events = await base44.entities.Event.filter({ id: eventId, created_by: me.email });
      if (events && events.length > 0) {
        setEvent(events[0]);
        setAuthenticated(true);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      // Try to find event by created_by (standalone users) first
      const eventsByEmail = await base44.entities.Event.filter({ created_by: email.trim() }, "-created_date", 1);
      if (eventsByEmail && eventsByEmail.length > 0) {
        setEvent(eventsByEmail[0]);
        setAuthenticated(true);
        setLoading(false);
        return;
      }
      // Fallback: find via order (users who ordered kits)
      const orders = await base44.entities.Order.filter({ customer_email: email.trim() }, "-created_date", 1);
      if (!orders || orders.length === 0) {
        setError("Aucun site trouvé pour cet email. Vérifiez l'adresse utilisée lors de votre inscription ou commande.");
        setLoading(false);
        return;
      }
      const order = orders[0];
      if (!order.event_id) {
        setError("Votre site n'a pas encore été créé. Créez-le depuis votre confirmation de commande.");
        setLoading(false);
        return;
      }
      const events = await base44.entities.Event.filter({ id: order.event_id });
      if (!events || events.length === 0) {
        setError("Événement introuvable.");
        setLoading(false);
        return;
      }
      setEvent(events[0]);
      setAuthenticated(true);
    } catch (e) {
      setError("Une erreur est survenue. Réessayez.");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <Loader2 className="w-10 h-10 text-rose-400 animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center px-4">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
          .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
          .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
        `}</style>
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <span className="text-4xl block mb-3">🌸</span>
            <h1 className="font-serif-elegant text-3xl font-bold text-gray-800 mb-2">Mon espace événement</h1>
            <p className="font-sans-clean text-sm text-gray-500">Gérez votre site, vos invités et vos photos</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Votre email (compte ou commande)"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="rounded-xl h-11"
              required
            />
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <Button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full rounded-xl h-11 bg-rose-500 hover:bg-rose-600 text-white font-sans-clean font-semibold"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Accéder à mon espace
            </Button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-4 font-sans-clean">
            Utilisez l'email de votre compte ou de votre commande
          </p>
        </div>
      </div>
    );
  }

  const isPremium = event.plan === "premium";
  const tabMap = { stats: StatsPanel, guests: GuestListManager, access: GuestAccessManager, rsvp: RSVPTracker, rsvp_responses: RSVPManager, reminders: RSVPReminderPanel, programme: ScheduleManagerWrapper, seating: SeatingManager, photos: PhotoModerationPanel, vendors: VendorManager, documents: VendorDocumentManager, agenda: AgendaManager, menu: MenuEditor, budget: BudgetManager, wishlist: WishlistManager, faq: FAQManager, tasks: TaskManager, checklist: WeddingChecklistManager, thankyou: ThankYouManager, site_editor: SiteEditorManager, theme: ThemeEditor, preview: MobilePreview, campaigns: ScheduledEmailsManager, guestbook: GuestbookManager, calendar: CoupleCalendar, thankyou_cards: ThankYouCardGenerator };
  const ActiveTab = tabMap[activeTab] || GuestListManager;

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
      `}</style>

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-rose-400" />
            <div>
              <h1 className="font-serif-elegant text-xl font-bold text-gray-800">{event.couple_names}</h1>
              <p className="font-sans-clean text-xs text-gray-400">
                {event.event_date && new Date(event.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTemplatePreview(true)}
              className="font-sans-clean text-xs text-purple-600 hover:text-purple-700 border border-purple-200 bg-purple-50 px-3 py-1.5 rounded-full transition hidden sm:flex items-center gap-1"
            >
              <Smartphone className="w-3.5 h-3.5" /> Prévisualiser
            </button>
            {event.public_url && (
              <a href={event.public_url} target="_blank" rel="noreferrer"
                className="font-sans-clean text-xs text-rose-500 hover:text-rose-600 border border-rose-200 px-3 py-1.5 rounded-full transition hidden sm:block">
                Voir mon site →
              </a>
            )}
            <button onClick={() => setAuthenticated(false)} className="font-sans-clean text-xs text-gray-400 hover:text-gray-600">
              Déconnexion
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1 border-t border-gray-100 overflow-x-auto no-scrollbar">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const locked = tab.premium && !isPremium;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  title={locked ? "Fonctionnalité Premium — cliquez pour débloquer" : undefined}
                  className={`flex-shrink-0 flex items-center gap-2 px-5 py-3.5 text-sm font-sans-clean font-semibold border-b-2 transition ${
                    activeTab === tab.key
                      ? "border-rose-400 text-rose-600"
                      : locked
                      ? "border-transparent text-gray-300 hover:text-rose-300 cursor-pointer"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {locked && <Lock className="w-3 h-3 text-gray-300" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Template Preview Modal */}
      {showTemplatePreview && (
        <TemplatePreviewModal
          isOpen={showTemplatePreview}
          templateKey={event.template || "classique"}
          event={event}
          onOpenChange={(open) => setShowTemplatePreview(open)}
        />
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {(() => {
          const currentTab = TABS.find(t => t.key === activeTab);
          const isLocked = currentTab?.premium && !isPremium;
          if (isLocked) {
            return (
              <PremiumFeaturePreview
                tabKey={activeTab}
                event={event}
                customerEmail={email}
                onUpgraded={() => setEvent(e => ({ ...e, plan: "premium" }))}
              />
            );
          }
          return <ActiveTab event={event} />;
        })()}
      </div>
    </div>
  );
}