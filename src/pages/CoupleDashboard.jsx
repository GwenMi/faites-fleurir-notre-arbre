import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Loader2, Users, CheckCircle, Heart, Camera, Gift, HelpCircle, LayoutGrid, CalendarDays, BellRing, PiggyBank, Paintbrush, ClipboardCheck, HandHeart, BarChart2, Smartphone, MailCheck, BookOpen, Handshake } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GuestListManager from "@/components/couple/GuestListManager";
import RSVPTracker from "@/components/couple/RSVPTracker";
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

const TABS = [
  { key: "stats", label: "Statistiques", icon: BarChart2 },
  { key: "guests", label: "Mes invités", icon: Users },
  { key: "rsvp", label: "Suivi RSVP", icon: CheckCircle },
  { key: "reminders", label: "Relances", icon: BellRing },
  { key: "campaigns", label: "Campagnes email", icon: MailCheck },
  { key: "guestbook", label: "Livre d'or", icon: BookOpen },
  { key: "programme", label: "Programme", icon: CalendarDays },
  { key: "seating", label: "Plan de table", icon: LayoutGrid },
  { key: "photos", label: "Photos", icon: Camera },
  { key: "vendors", label: "Prestataires", icon: Handshake },
  { key: "agenda", label: "Agenda RDV", icon: CalendarDays },
  { key: "budget", label: "Budget", icon: PiggyBank },
  { key: "wishlist", label: "Liste cadeaux", icon: Gift },
  { key: "faq", label: "FAQ", icon: HelpCircle },
  { key: "checklist", label: "Checklist", icon: ClipboardCheck },
  { key: "thankyou", label: "Remerciements", icon: HandHeart },
  { key: "theme", label: "Thème", icon: Paintbrush },
  { key: "preview", label: "Aperçu mobile", icon: Smartphone },
];

// Wrapper to adapt ScheduleManager (takes eventId) to the tab interface (receives event)
function ScheduleManagerWrapper({ event }) {
  return <ScheduleManager eventId={event.id} />;
}

export default function CoupleDashboard() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("guests");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const orders = await base44.entities.Order.filter({ customer_email: email.trim() }, "-created_date", 1);
      if (!orders || orders.length === 0) {
        setError("Aucune commande trouvée pour cet email.");
        setLoading(false);
        return;
      }
      const order = orders[0];
      if (!order.event_id) {
        setError("Votre site de mariage n'a pas encore été créé. Créez-le d'abord depuis votre confirmation de commande.");
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
            <span className="text-4xl block mb-3">💍</span>
            <h1 className="font-serif-elegant text-3xl font-bold text-gray-800 mb-2">Espace mariés</h1>
            <p className="font-sans-clean text-sm text-gray-500">Gérez vos invités et suivez les RSVP</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Votre email de commande"
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
            Utilisez l'email avec lequel vous avez passé commande
          </p>
        </div>
      </div>
    );
  }

  const tabMap = { stats: StatsPanel, guests: GuestListManager, rsvp: RSVPTracker, reminders: RSVPReminderPanel, programme: ScheduleManagerWrapper, seating: SeatingManager, photos: PhotoModerationPanel, vendors: VendorManager, budget: BudgetManager, wishlist: WishlistManager, faq: FAQManager, checklist: WeddingChecklistManager, thankyou: ThankYouManager, theme: ThemeEditor, preview: MobilePreview, campaigns: ScheduledEmailsManager, guestbook: GuestbookManager };
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
          <div className="flex gap-1 border-t border-gray-100">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-sans-clean font-semibold border-b-2 transition ${
                    activeTab === tab.key
                      ? "border-rose-400 text-rose-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ActiveTab event={event} />
      </div>
    </div>
  );
}