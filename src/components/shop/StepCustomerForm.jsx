import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, AlertCircle, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function StepCustomerForm({ customerInfo, onChange, onNext, onBack }) {
  const [showLateWarning, setShowLateWarning] = useState(false);

  const set = (k, v) => onChange(info => ({ ...info, [k]: v }));

  const daysUntilEvent = () => {
    if (!customerInfo.eventDate) return null;
    return Math.floor((new Date(customerInfo.eventDate) - new Date()) / (1000 * 60 * 60 * 24));
  };

  const handleNext = () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.eventDate || !customerInfo.address) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    if (customerInfo.isCompany && (!customerInfo.companyName || !customerInfo.vatNumber)) {
      toast.error("Veuillez renseigner la raison sociale et le n° de TVA intracommunautaire");
      return;
    }
    const days = daysUntilEvent();
    if (days !== null && days < 14) {
      setShowLateWarning(true);
      return;
    }
    onNext();
  };

  const days = daysUntilEvent();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Vos informations</h2>
        <p className="text-sm text-gray-500">Nécessaires pour préparer et expédier votre commande</p>
      </div>

      {/* Particulier / Entreprise */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => set("isCompany", false)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition ${
            !customerInfo.isCompany
              ? "border-rose-400 bg-rose-50 text-rose-600"
              : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
          }`}
        >
          <span>👤</span> Particulier
        </button>
        <button
          type="button"
          onClick={() => set("isCompany", true)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition ${
            customerInfo.isCompany
              ? "border-rose-400 bg-rose-50 text-rose-600"
              : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
          }`}
        >
          <Building2 className="w-4 h-4" /> Entreprise
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        {customerInfo.isCompany && (
          <>
            <div className="pb-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-rose-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Informations entreprise
              </p>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Raison sociale *</Label>
                  <Input value={customerInfo.companyName || ""} onChange={e => set("companyName", e.target.value)} placeholder="Ma Société SAS" className="h-11 rounded-xl" />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">N° TVA intracommunautaire *</Label>
                  <Input value={customerInfo.vatNumber || ""} onChange={e => set("vatNumber", e.target.value)} placeholder="FR 12 345678901" className="h-11 rounded-xl" />
                  <p className="text-xs text-gray-400 mt-1">Obligatoire pour la facturation (art. 289-I CGI)</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">SIRET</Label>
                  <Input value={customerInfo.siret || ""} onChange={e => set("siret", e.target.value)} placeholder="123 456 789 00012" className="h-11 rounded-xl" />
                </div>
              </div>
            </div>
          </>
        )}
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">{customerInfo.isCompany ? "Nom du contact *" : "Nom complet *"}</Label>
          <Input value={customerInfo.name} onChange={e => set("name", e.target.value)} placeholder={customerInfo.isCompany ? "Prénom Nom" : "Emma & Lucas Dupont"} className="h-11 rounded-xl" />
        </div>
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email *</Label>
          <Input type="email" value={customerInfo.email} onChange={e => set("email", e.target.value)} placeholder="email@exemple.com" className="h-11 rounded-xl" />
        </div>
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Téléphone</Label>
          <Input type="tel" value={customerInfo.phone} onChange={e => set("phone", e.target.value)} placeholder="06 12 34 56 78" className="h-11 rounded-xl" />
        </div>
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">
            Date de votre événement * <span className="font-normal text-gray-400">(pour la planification)</span>
          </Label>
          <Input type="date" value={customerInfo.eventDate} onChange={e => set("eventDate", e.target.value)} className="h-11 rounded-xl w-full sm:w-64" />
          {days !== null && days >= 0 && days < 14 && (
            <p className="text-amber-600 text-sm mt-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> Commande tardive — livraison à confirmer
            </p>
          )}
        </div>
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Adresse de livraison *</Label>
          <Textarea value={customerInfo.address} onChange={e => set("address", e.target.value)} placeholder={"12 rue des Roses\n75001 Paris"} className="rounded-xl" rows={3} />
        </div>
      </div>

      {/* Late order warning */}
      {showLateWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex gap-3 items-start">
              <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-gray-900">Commande tardive</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Votre événement est dans <strong>{days} jour{days > 1 ? "s" : ""}</strong> — moins de 14 jours. La livraison dans les délais ne peut pas être garantie.
                </p>
                <p className="text-sm text-gray-600 mt-1">Souhaitez-vous tout de même continuer ?</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setShowLateWarning(false)} variant="outline" className="flex-1 rounded-xl">Annuler</Button>
              <Button onClick={() => { setShowLateWarning(false); onNext(); }} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl">
                Continuer quand même
              </Button>
            </div>
          </div>
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