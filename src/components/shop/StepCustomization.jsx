import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { toast } from "sonner";

export default function StepCustomization({ selection, onUpdate, onNext, onBack }) {
  const [showLogoConfirm, setShowLogoConfirm] = useState(false);

  const handleNext = () => {
    // Validation basée sur le type d'événement
    if (isCompanyEvent) {
      if (!selection.customization?.companyName) {
        toast.error("Veuillez entrer le nom de l'entreprise");
        return;
      }
    } else if (isAccommodationEvent) {
      if (!selection.customization?.accommodationName) {
        toast.error("Veuillez entrer le nom de l'établissement");
        return;
      }
    } else {
      // Événements personnels
      if (!selection.customization?.names || !selection.customization?.date) {
        toast.error("Veuillez remplir les prénoms et la date");
        return;
      }
    }
    // Si pas de logo uploadé, demander confirmation
    const hasLogo = selection.customization?.companyLogo || selection.customization?.accommodationLogo || selection.customization?.personalLogo;
    if (!hasLogo) {
      setShowLogoConfirm(true);
      return;
    }
    onNext();
  };

  const updateCustomization = (updates) => {
    onUpdate({
      customization: {
        ...(selection.customization || {}),
        ...updates
      }
    });
  };

  const isPersonalEvent = ["mariage", "bapteme", "communion", "anniversaire"].includes(selection.eventType);
  // isCompanyEvent : via eventType (si renseigné) OU via kitType directement pour kits entreprise
  const isCompanyEvent = ["fete_entreprise", "entreprise_standard", "entreprise_premium"].includes(selection.eventType)
    || (selection.kitType || "").startsWith("entreprise");
  const isAccommodationEvent = selection.eventType === "maison_hote";

  const LogoUpload = ({ field, label }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">{label}</label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-rose-300 transition cursor-pointer relative">
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.svg,image/jpeg,image/png,image/svg+xml"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => updateCustomization({ [field]: reader.result });
              reader.readAsDataURL(file);
            }
          }}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        {selection.customization?.[field] ? (
          <div className="flex flex-col items-center gap-2">
            <img src={selection.customization[field]} alt="Logo" className="h-16 w-auto" />
            <p className="text-sm text-gray-600">Cliquez pour changer</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-5 h-5 text-gray-400" />
            <p className="text-gray-600 font-semibold text-sm">Télécharger votre logo ou visuel de personnalisation (facultatif)</p>
            <p className="text-xs text-gray-500">JPG, PNG ou SVG</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          {selection.kitVariant === "crackers" ? "Personnalisez vos étiquettes" : "Personnalisez vos pots"}
        </h2>
        <p className="text-sm text-gray-500">
          {isPersonalEvent && "Saisissez les prénoms et la date qui seront imprimés sur les étiquettes"}
          {isCompanyEvent && "Ajoutez votre logo et nom d'entreprise"}
          {isAccommodationEvent && "Ajoutez votre logo et nom d'établissement"}
          {!isPersonalEvent && !isCompanyEvent && !isAccommodationEvent && "Personnalisez votre commande"}
        </p>
      </div>

      {/* Affichage de la variante choisie */}
      {selection.kitVariant === "crackers" ? (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
          <span className="text-xl">🫙</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">Kit Apéro Crackers Italiens</p>
            <p className="text-xs text-gray-500">Nouveauté — mix prêt à cuisiner</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
          <span className="text-xl">🌻</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">Graines de tournesol</p>
            <p className="text-xs text-gray-500">Compact et joyeux — faciles à faire pousser</p>
          </div>
        </div>
      )}

      {/* Événements personnels */}
      {isPersonalEvent && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Prénoms</label>
            <Input
              type="text"
              placeholder="Ex: Sophie & Marc"
              value={selection.customization?.names || ""}
              onChange={(e) => updateCustomization({ names: e.target.value })}
              className="h-11 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Les prénoms qui apparaîtront sur les étiquettes</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Date de l'événement</label>
            <Input
              type="date"
              value={selection.customization?.date || ""}
              onChange={(e) => updateCustomization({ date: e.target.value })}
              className="h-11 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Format: JJ/MM/AAAA sur l'étiquette</p>
          </div>
          <LogoUpload field="personalLogo" label="Logo ou visuel de personnalisation (facultatif)" />

          {/* Option marque-place */}
          <div
            className={`rounded-2xl border-2 p-4 cursor-pointer transition ${selection.customization?.marquePlace ? "border-rose-300 bg-rose-50" : "border-gray-200 bg-white hover:border-rose-200"}`}
            onClick={() => updateCustomization({ marquePlace: !selection.customization?.marquePlace })}
          >
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition ${selection.customization?.marquePlace ? "bg-rose-400 border-rose-400" : "border-gray-300"}`}>
                {selection.customization?.marquePlace && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Je souhaite que les kits servent de marque-place</p>
                <p className="text-xs text-gray-500 mt-0.5">Le prénom de chaque invité sera imprimé sur l'étiquette — sans surcoût. Précisez vos souhaits en note après la commande ou contactez-nous.</p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Entreprise */}
      {isCompanyEvent && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Nom de l'entreprise</label>
            <Input
              type="text"
              placeholder="Ex: Acme Corporation"
              value={selection.customization?.companyName || ""}
              onChange={(e) => updateCustomization({ companyName: e.target.value })}
              className="h-11 rounded-lg"
            />
          </div>
          <LogoUpload field="companyLogo" label="Logo de l'entreprise (facultatif)" />
        </div>
      )}

      {/* Chambre d'hôtes */}
      {isAccommodationEvent && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Nom de l'établissement</label>
            <Input
              type="text"
              placeholder="Ex: Maison des Vignes"
              value={selection.customization?.accommodationName || ""}
              onChange={(e) => updateCustomization({ accommodationName: e.target.value })}
              className="h-11 rounded-lg"
            />
          </div>
          <LogoUpload field="accommodationLogo" label="Logo ou image de marque (facultatif)" />
        </div>
      )}

      {/* Autre */}
      {selection.eventType === "autre" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Vous pouvez personnaliser vos pots. Procédez au paiement pour discuter des détails avec notre équipe.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1 h-12 rounded-xl">
          <ChevronLeft className="w-4 h-4 mr-2" /> Retour
        </Button>
        <Button onClick={handleNext} className="flex-1 h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold">
          Continuer <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Confirmation sans logo */}
      {showLogoConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h4 className="text-lg font-bold text-gray-900 mb-2">Logo manquant</h4>
            <p className="text-sm text-gray-600 mb-5">Vous n'avez pas téléchargé de logo pour votre personnalisation. Êtes-vous sûr de vouloir continuer sans personnalisation ?</p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => { setShowLogoConfirm(false); onNext(); }} className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-xl">
                Oui, continuer sans logo
              </Button>
              <Button onClick={() => setShowLogoConfirm(false)} variant="outline" className="w-full rounded-xl">
                Non, ajouter un logo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}