import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, Circle, Loader2, ClipboardList, Bell, Clock } from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  {
    label: "12 mois avant",
    emoji: "📅",
    color: "#8b5cf6",
    bg: "bg-violet-50",
    border: "border-violet-100",
    tasks: [
      { key: "budget_global", label: "Définir le budget global" },
      { key: "liste_invites", label: "Établir la liste des invités" },
      { key: "date_lieu", label: "Choisir la date et réserver le lieu" },
      { key: "traiteur", label: "Sélectionner et réserver le traiteur" },
      { key: "photographe", label: "Réserver photographe / vidéaste" },
      { key: "musique", label: "Réserver DJ ou groupe de musique" },
      { key: "faire_part_design", label: "Commencer le design des faire-part" },
    ],
  },
  {
    label: "9 mois avant",
    emoji: "🌿",
    color: "#10b981",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    tasks: [
      { key: "faire_part_envoi", label: "Envoyer les faire-part" },
      { key: "robe_costume", label: "Choisir robe et costume" },
      { key: "fleuriste", label: "Rencontrer et réserver le fleuriste" },
      { key: "voyage_noces", label: "Réserver le voyage de noces" },
      { key: "liste_cadeaux", label: "Créer la liste de cadeaux / cagnotte" },
      { key: "coiffeur_maquillage", label: "Réserver coiffeur & maquilleur" },
    ],
  },
  {
    label: "6 mois avant",
    emoji: "🌸",
    color: "#f43f5e",
    bg: "bg-rose-50",
    border: "border-rose-100",
    tasks: [
      { key: "plan_table", label: "Ébaucher le plan de table" },
      { key: "ceremonie_civile", label: "Préparer la cérémonie civile (mairie)" },
      { key: "animations", label: "Planifier les animations" },
      { key: "menus", label: "Valider les menus avec le traiteur" },
      { key: "relances_rsvp", label: "Relancer les invités sans réponse" },
      { key: "alliances", label: "Choisir les alliances" },
    ],
  },
  {
    label: "3 mois avant",
    emoji: "🎉",
    color: "#f59e0b",
    bg: "bg-amber-50",
    border: "border-amber-100",
    tasks: [
      { key: "menu_final", label: "Confirmer les menus et régimes spéciaux" },
      { key: "programme_journee", label: "Finaliser le programme de la journée" },
      { key: "transport_invites", label: "Organiser les transports invités" },
      { key: "essayage_tenue", label: "Essayage final des tenues" },
      { key: "discours", label: "Préparer les discours et vœux" },
      { key: "cadeaux_invites", label: "Commander les cadeaux invités (pots graines)" },
    ],
  },
  {
    label: "1 mois avant",
    emoji: "⏳",
    color: "#06b6d4",
    bg: "bg-cyan-50",
    border: "border-cyan-100",
    tasks: [
      { key: "plan_table_final", label: "Finaliser le plan de table" },
      { key: "confirmation_prestataires", label: "Confirmer chaque prestataire" },
      { key: "liste_chansons", label: "Préparer la playlist" },
      { key: "valises", label: "Préparer les valises voyage de noces" },
      { key: "dossier_mairie", label: "Vérifier le dossier mairie" },
      { key: "briefing_temoins", label: "Briefer les témoins et garçons d'honneur" },
    ],
  },
  {
    label: "La semaine J",
    emoji: "💍",
    color: "#ec4899",
    bg: "bg-pink-50",
    border: "border-pink-100",
    tasks: [
      { key: "remise_enveloppes", label: "Préparer les enveloppes prestataires" },
      { key: "livraisons", label: "Confirmer les horaires de livraison" },
      { key: "soin_beaute", label: "Soins beauté (masque, manucure…)" },
      { key: "checkin_hotel", label: "Check-in hôtel / chambre nuit de noces" },
      { key: "fete_pre_mariage", label: "EVJF / EVG organisé" },
      { key: "repos", label: "Se reposer et profiter ! 🥂" },
    ],
  },
];

const TOTAL = STEPS.reduce((s, step) => s + step.tasks.length, 0);

// Returns the month offset in months before the wedding for each step
const STEP_MONTHS_BEFORE = [12, 9, 6, 3, 1, 0];

function getStepStatus(monthsBefore, eventDate) {
  if (!eventDate) return "upcoming";
  const now = new Date();
  const wedding = new Date(eventDate);
  const msInMonth = 1000 * 60 * 60 * 24 * 30.5;
  const monthsLeft = (wedding - now) / msInMonth;
  if (monthsBefore > monthsLeft + 0.5) return "current"; // this phase is now active
  if (monthsBefore > monthsLeft - 1) return "upcoming";
  return "past"; // shouldn't lock but show as overdue
}

export default function WeddingChecklistManager({ event }) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [sendingReminder, setSendingReminder] = useState(false);

  useEffect(() => { loadChecklist(); }, [event?.id]);

  const loadChecklist = async () => {
    setLoading(true);
    const data = await base44.entities.WeddingChecklist.filter({ event_id: event.id });
    if (data && data.length > 0) {
      setRecord(data[0]);
    } else {
      const created = await base44.entities.WeddingChecklist.create({ event_id: event.id, completed_tasks: [] });
      setRecord(created);
    }
    setLoading(false);
  };

  const toggle = async (taskKey) => {
    if (!record || toggling) return;
    setToggling(taskKey);
    const current = record.completed_tasks || [];
    const updated = current.includes(taskKey)
      ? current.filter(k => k !== taskKey)
      : [...current, taskKey];
    const saved = await base44.entities.WeddingChecklist.update(record.id, { completed_tasks: updated });
    setRecord(saved);
    setToggling(null);
    if (!current.includes(taskKey)) toast.success("Tâche validée ✓");
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
    </div>
  );

  const done = record?.completed_tasks?.length || 0;
  const percent = Math.round((done / TOTAL) * 100);

  return (
    <div className="space-y-6">
      {/* Header progress */}
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-rose-400" />
            <h3 className="font-semibold text-gray-800 text-sm">Avancement global</h3>
          </div>
          <span className="text-2xl font-bold text-rose-500">{percent}%</span>
        </div>
        <div className="w-full bg-rose-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full transition-all duration-500"
            style={{ width: `${percent}%`, background: "linear-gradient(90deg, #f43f5e, #fb7185)" }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">{done} tâche{done !== 1 ? "s" : ""} sur {TOTAL} complétée{done !== 1 ? "s" : ""}</p>
      </div>

      {/* Steps */}
      {STEPS.map(step => {
        const stepDone = step.tasks.filter(t => record?.completed_tasks?.includes(t.key)).length;
        const allDone = stepDone === step.tasks.length;
        return (
          <div key={step.label} className={`rounded-2xl border ${step.border} ${step.bg} overflow-hidden`}>
            {/* Step header */}
            <div className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{step.emoji}</span>
                <h4 className="font-semibold text-sm text-gray-700">{step.label}</h4>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white border"
                style={{ color: step.color, borderColor: step.color + "44" }}>
                {stepDone}/{step.tasks.length}
                {allDone && " 🎉"}
              </span>
            </div>

            {/* Tasks */}
            <div className="bg-white divide-y divide-gray-50">
              {step.tasks.map(task => {
                const checked = record?.completed_tasks?.includes(task.key);
                const isToggling = toggling === task.key;
                return (
                  <button
                    key={task.key}
                    onClick={() => toggle(task.key)}
                    disabled={!!toggling}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition text-left"
                  >
                    {isToggling
                      ? <Loader2 className="w-5 h-5 animate-spin text-gray-300 flex-shrink-0" />
                      : checked
                        ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 transition" style={{ color: step.color }} />
                        : <Circle className="w-5 h-5 text-gray-200 flex-shrink-0" />
                    }
                    <span className={`text-sm transition ${checked ? "line-through text-gray-400" : "text-gray-700"}`}>
                      {task.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}