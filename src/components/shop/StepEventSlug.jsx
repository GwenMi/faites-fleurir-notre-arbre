import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Check, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function StepEventSlug({ selection, onUpdate, onNext, onBack }) {
  const [slug, setSlug] = useState("");
  const [slugSuggestion, setSlugSuggestion] = useState("");
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState(null);

  const isPersonalEvent = ["mariage", "bapteme", "communion", "anniversaire"].includes(selection.eventType);

  // Générer une suggestion automatique basée sur le nom
  const generateSuggestion = async () => {
    if (!selection.customization?.names) {
      toast.error("Veuillez d'abord remplir les prénoms");
      return;
    }

    const baseSlug = selection.customization.names
      .toLowerCase()
      .replace(/&/g, "et")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    let suggestion = baseSlug;
    let counter = 1;

    // Vérifier l'unicité
    while (await isSlugTaken(suggestion)) {
      suggestion = `${baseSlug}-${counter}`;
      counter++;
    }

    setSlugSuggestion(suggestion);
    setSlug(suggestion);
    setSlugAvailable(true);
  };

  const isSlugTaken = async (testSlug) => {
    try {
      const events = await base44.entities.Event.filter({ slug: testSlug });
      return events.length > 0;
    } catch (e) {
      return false;
    }
  };

  const checkSlug = async (value) => {
    if (!value.trim()) {
      setSlugAvailable(null);
      return;
    }

    setCheckingSlug(true);
    const available = !(await isSlugTaken(value));
    setSlugAvailable(available);
    setCheckingSlug(false);
  };

  const handleSlugChange = (value) => {
    // Format: lowercase, no special chars, hyphen for spaces
    const formatted = value
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 50);

    setSlug(formatted);
    checkSlug(formatted);
  };

  const handleNext = () => {
    if (!slug.trim()) {
      toast.error("Veuillez choisir un permalien");
      return;
    }
    if (!slugAvailable) {
      toast.error("Ce permalien n'est pas disponible");
      return;
    }
    onUpdate({ slug });
    onNext();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Votre site personnel</h2>
        <p className="text-sm text-gray-500">
          Créez votre page d'événement avec un lien personnalisé
        </p>
      </div>

      {isPersonalEvent && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Permalien</label>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-500">fleursdefete.fr/</span>
              <Input
                type="text"
                placeholder="sophie-et-marc"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="h-11 rounded-lg flex-1"
              />
              {checkingSlug && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
              {!checkingSlug && slugAvailable === true && <Check className="w-5 h-5 text-green-500" />}
              {!checkingSlug && slugAvailable === false && <AlertCircle className="w-5 h-5 text-red-500" />}
            </div>
            <p className="text-xs text-gray-500">
              {slugAvailable === null && "Entrez votre permalien personnalisé"}
              {slugAvailable === true && "✓ Disponible"}
              {slugAvailable === false && "Déjà pris, essayez un autre"}
            </p>
          </div>

          <button
            onClick={generateSuggestion}
            className="text-sm text-rose-500 hover:text-rose-600 font-semibold"
          >
            💡 Générer automatiquement
          </button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Votre site sera accessible à: <strong>fleursdefete.fr/{slug || "votre-slug"}</strong>
            </p>
          </div>
        </div>
      )}

      {!isPersonalEvent && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Les événements professionnels n'ont pas de site public. Passez à l'étape suivante.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1 h-12 rounded-xl">
          <ChevronLeft className="w-4 h-4 mr-2" /> Retour
        </Button>
        <Button
          onClick={handleNext}
          disabled={isPersonalEvent && (!slug || slugAvailable !== true)}
          className="flex-1 h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold disabled:bg-gray-300"
        >
          Continuer <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}