import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function StepCustomization({ selection, onUpdate, onNext, onBack, seeds }) {
  const handleNext = () => {
    // Validation basée sur le type d'événement
    if (selection.eventType === "entreprise") {
      if (!selection.customization?.companyName) {
        toast.error("Veuillez entrer le nom de l'entreprise");
        return;
      }
    } else if (selection.eventType === "chambre_hotes") {
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
  const isCompanyEvent = selection.eventType === "entreprise";
  const isAccommodationEvent = selection.eventType === "chambre_hotes";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Personnalisez vos pots</h2>
        <p className="text-sm text-gray-500">
          {isPersonalEvent && "Saisissez les prénoms et la date qui seront imprimés sur les étiquettes"}
          {isCompanyEvent && "Ajoutez votre logo et nom d'entreprise"}
          {isAccommodationEvent && "Ajoutez votre logo et nom d'établissement"}
        </p>
      </div>

      {/* Choix de la graine */}
      {seeds && seeds.length > 1 && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Type de graine</label>
          <div className="grid grid-cols-2 gap-3">
            {seeds.map(seed => (
              <button
                key={seed.id}
                onClick={() => updateCustomization({ seedType: seed.id })}
                className={`p-4 rounded-lg border-2 transition text-center ${
                  selection.customization?.seedType === seed.id || (selection.seedType === seed.id)
                    ? 'border-rose-400 bg-rose-50'
                    : 'border-gray-200 bg-white hover:border-rose-200'
                }`}
              >
                <p className="text-sm font-semibold text-gray-800">{seed.label}</p>
                <p className="text-xs text-gray-500 mt-1">{seed.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}
      {seeds && seeds.length === 1 && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
          <span className="text-xl">{seeds[0].label.split(' ')[0]}</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">{seeds[0].label}</p>
            <p className="text-xs text-gray-500">{seeds[0].description}</p>
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

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Logo de l'entreprise</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-rose-300 transition cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      updateCustomization({ companyLogo: reader.result });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {selection.customization?.companyLogo ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={selection.customization.companyLogo} alt="Logo" className="h-16 w-auto" />
                  <p className="text-sm text-gray-600">Cliquez pour changer</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 font-semibold">📁 Télécharger le logo</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG ou SVG</p>
                </div>
              )}
            </div>
          </div>
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

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Logo ou image de marque</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-rose-300 transition cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      updateCustomization({ accommodationLogo: reader.result });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {selection.customization?.accommodationLogo ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={selection.customization.accommodationLogo} alt="Logo" className="h-16 w-auto" />
                  <p className="text-sm text-gray-600">Cliquez pour changer</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 font-semibold">📁 Télécharger votre logo</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG ou SVG</p>
                </div>
              )}
            </div>
          </div>
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
    </div>
  );
}