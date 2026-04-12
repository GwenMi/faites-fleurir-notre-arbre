import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, AlertCircle, Building2, LogIn } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

export default function StepCustomerForm({ customerInfo, onChange, selection, onNext, onBack }) {
  const [showLateWarning, setShowLateWarning] = useState(false);
  const [validationError, setValidationError] = useState("");
  const { isAuthenticated, user } = useAuth();

  // Pré-remplir depuis le compte connecté + date d'événement depuis la sélection
  useEffect(() => {
    const parts = (user?.full_name || "").split(" ");
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";
    // Date de l'événement depuis la personnalisation (selection.customization.date)
    const eventDateFromSelection = selection?.customization?.date || "";
    onChange(info => ({
      ...info,
      email: info.email || user?.email || "",
      firstName: info.firstName || firstName,
      lastName: info.lastName || lastName,
      name: info.name || user?.full_name || "",
      eventDate: info.eventDate || eventDateFromSelection,
    }));
  }, [user, selection]);

  const set = (k, v) => onChange(info => ({ ...info, [k]: v }));

  const daysUntilEvent = () => {
    if (!customerInfo.eventDate) return null;
    return Math.floor((new Date(customerInfo.eventDate) - new Date()) / (1000 * 60 * 60 * 24));
  };

  const handleNext = () => {
    setValidationError("");
    const missing = [];
    if (!customerInfo.firstName) missing.push("prénom");
    if (!customerInfo.lastName) missing.push("nom");
    if (!customerInfo.email) missing.push("email");
    if (!customerInfo.street) missing.push("rue");
    if (!customerInfo.zipCode) missing.push("code postal");
    if (!customerInfo.city) missing.push("ville");
    if (!customerInfo.country) missing.push("pays");
    if (missing.length > 0) {
      setValidationError(`Champs manquants : ${missing.join(", ")}`);
      return;
    }
    if (customerInfo.isCompany && (!customerInfo.companyName || !customerInfo.vatNumber)) {
      setValidationError("Veuillez renseigner la raison sociale et le n° de TVA");
      return;
    }

    // Sync name synchronously before advancing
    const fullName = `${customerInfo.firstName} ${customerInfo.lastName}`.trim();
    const days = daysUntilEvent();
    if (days !== null && days < 14) {
      setShowLateWarning(true);
      return;
    }
    onChange(info => ({ ...info, name: fullName }));
    onNext();
  };

  const days = daysUntilEvent();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Vos informations</h2>
        <p className="text-sm text-gray-500">Renseignez vos coordonnées pour la livraison et le suivi de commande</p>
      </div>

      {/* Auth block */}
      {!isAuthenticated ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 space-y-3">
          <p className="text-sm font-semibold text-gray-800">📋 Connectez-vous pour finaliser votre commande</p>
          <p className="text-xs text-gray-500 leading-relaxed">Votre compte vous permettra de suivre votre commande, accéder à votre site événement et recevoir vos QR codes.</p>
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <Button
              onClick={() => base44.auth.redirectToLogin(window.location.href)}
              className="flex-1 h-11 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold"
            >
              <LogIn className="w-4 h-4 mr-2" /> Se connecter / Créer un compte
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800 flex items-center gap-2">
          ✅ <span>Connecté en tant que <strong>{user?.email}</strong> — vos informations sont pré-remplies</span>
        </div>
      )}

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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Prénom *</Label>
            <Input value={customerInfo.firstName || ""} onChange={e => set("firstName", e.target.value)} placeholder="Emma" className="h-11 rounded-xl" />
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Nom *</Label>
            <Input value={customerInfo.lastName || ""} onChange={e => set("lastName", e.target.value)} placeholder="Dupont" className="h-11 rounded-xl" />
          </div>
        </div>
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email *</Label>
          <Input type="email" value={customerInfo.email} onChange={e => set("email", e.target.value)} placeholder="email@exemple.com" className="h-11 rounded-xl" />
        </div>
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Téléphone</Label>
          <Input type="tel" value={customerInfo.phone} onChange={e => set("phone", e.target.value)} placeholder="06 12 34 56 78" className="h-11 rounded-xl" />
        </div>
        {/* Date d'événement : pré-remplie depuis la personnalisation, affichée en lecture seule si disponible */}
        {customerInfo.eventDate ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 flex items-center gap-2">
            📅 <span>Date de l'événement : <strong>{new Date(customerInfo.eventDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</strong></span>
          </div>
        ) : (
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
        )}
        
        {/* Adresse séparée en champs */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Rue / Adresse *</Label>
            <Input value={customerInfo.street || ""} onChange={e => set("street", e.target.value)} placeholder="12 rue des Roses" className="h-11 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Code postal *</Label>
              <Input value={customerInfo.zipCode || ""} onChange={e => set("zipCode", e.target.value)} placeholder="75001" className="h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Ville *</Label>
              <Input value={customerInfo.city || ""} onChange={e => set("city", e.target.value)} placeholder="Paris" className="h-11 rounded-xl" />
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Pays *</Label>
            <Input value={customerInfo.country || "France"} onChange={e => set("country", e.target.value)} placeholder="France" className="h-11 rounded-xl" />
          </div>
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

      {validationError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {validationError}
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