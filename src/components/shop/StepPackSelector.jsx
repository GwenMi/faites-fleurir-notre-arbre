import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2, Info, X } from "lucide-react";
import { toast } from "sonner";

const PACK_SIZES = [30, 50, 70, 100, 120];
const SAC_CADEAU_PRICE = 0.40;

// ⚠️ Remplacer ces URLs par celles de Supabase après upload des photos
const CONTAINERS = [
  {
    id: "rond_clip",
    name: "Pot rond fermoir",
    desc: "Couvercle hermétique avec fermoir en métal",
    image: "https://i.postimg.cc/66mZn3DV/fermeture_metalique.png",
  },
  {
    id: "carre_liege",
    name: "Pot carré liège",
    desc: "Bouchon en liège naturel",
    image: "https://i.postimg.cc/2yMBDcQC/bouchon-lie-ge.png",
  },
];

export default function StepPackSelector({ selection, onUpdate, pricing, onNext, onBack }) {
  const packs = selection.packs || [];
  const totalPackCount = packs.reduce((sum, p) => sum + p.qty, 0);

  const handleNext = () => {
    if (packs.length === 0) { toast.error("Veuillez sélectionner au moins un pack"); return; }
    if (!selection.containerType) { toast.error("Veuillez choisir un contenant"); return; }
    onNext();
  };

  const addPack = (size) => {
    const existing = packs.find(p => p.size === size);
    if (existing) {
      onUpdate({ packs: packs.map(p => p.size === size ? { ...p, qty: p.qty + 1 } : p) });
    } else {
      onUpdate({ packs: [...packs, { size, qty: 1 }] });
    }
  };

  const updateQty = (size, delta) => {
    const newPacks = packs.map(p => p.size === size ? { ...p, qty: p.qty + delta } : p).filter(p => p.qty > 0);
    onUpdate({ packs: newPacks });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Choisissez vos packs</h2>
        <p className="text-sm text-gray-500">Vous pouvez combiner plusieurs tailles — Prix par pot : <strong>{pricing.pricePerPot.toFixed(2)}€</strong></p>
      </div>

      {/* Pack size buttons */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Ajouter un pack</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {PACK_SIZES.map(size => {
            const inCart = packs.find(p => p.size === size);
            const packPrice = pricing.pricePerPot * size;
            return (
              <button
                key={size}
                onClick={() => addPack(size)}
                className={`rounded-xl border-2 p-3 text-center transition-all ${
                  inCart ? "border-rose-400 bg-rose-50 shadow-sm" : "border-gray-200 bg-white hover:border-rose-200"
                }`}
              >
                <p className={`text-2xl font-bold ${inCart ? "text-rose-600" : "text-gray-800"}`}>{size}</p>
                <p className="text-xs text-gray-500 mb-1">invités</p>
                <p className="text-xs font-semibold text-gray-700">{packPrice.toFixed(2)}€</p>
                {inCart && <p className="text-xs text-rose-500 font-bold mt-1">× {inCart.qty} ✓</p>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panier en cours */}
      {packs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
          <p className="font-semibold text-gray-900 text-sm">Votre sélection</p>
          {packs.map(p => (
            <div key={p.size} className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-700 font-medium">Pack {p.size} invités</span>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQty(p.size, -1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-lg font-bold text-gray-600">−</button>
                <span className="w-6 text-center font-bold text-gray-900">{p.qty}</span>
                <button onClick={() => updateQty(p.size, 1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-lg font-bold text-gray-600">+</button>
                <button onClick={() => onUpdate({ packs: packs.filter(x => x.size !== p.size) })} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-400 ml-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {totalPackCount >= 2 && (
            <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 rounded-lg px-3 py-2 mt-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <strong>Réduction 10% appliquée</strong> — {totalPackCount} packs commandés
            </div>
          )}
        </div>
      )}

      {/* Sélection du contenant */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Choisissez votre contenant</p>
        <div className="grid grid-cols-2 gap-4">
          {CONTAINERS.map(c => {
            const selected = selection.containerType === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onUpdate({ containerType: c.id })}
                className={`rounded-2xl border-2 overflow-hidden text-left transition-all ${
                  selected ? "border-rose-400 shadow-md" : "border-gray-200 hover:border-rose-200"
                }`}
              >
                <div className="aspect-square bg-gray-50 relative">
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                  {selected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-rose-400 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div className={`p-3 ${selected ? "bg-rose-50" : "bg-white"}`}>
                  <p className="font-semibold text-sm text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sac cadeau */}
      {packs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">🎀</span>
              <div>
                <p className="font-semibold text-gray-900">Sac cadeau élégant</p>
                <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                  Petit sac cadeau avec poignée. Le pot est placé dans le sac pour créer un véritable souvenir prêt à offrir.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <span className="text-sm text-rose-600 font-semibold">+{(SAC_CADEAU_PRICE * pricing.totalPots).toFixed(2)}€</span>
              <button
                onClick={() => onUpdate({ sacCadeau: !selection.sacCadeau })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  selection.sacCadeau ? "bg-rose-400" : "bg-gray-200"
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  selection.sacCadeau ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Récapitulatif prix */}
      {packs.length > 0 && (
        <div className="bg-rose-50 rounded-2xl p-6 space-y-2">
          {packs.map(p => (
            <div key={p.size} className="flex justify-between text-sm text-gray-700">
              <span>Pack {p.size} × {p.qty} ({p.size * p.qty} pots × {pricing.pricePerPot.toFixed(2)}€)</span>
              <span>{(p.size * p.qty * pricing.pricePerPot).toFixed(2)}€</span>
            </div>
          ))}
          {selection.sacCadeau && (
            <div className="flex justify-between text-sm text-gray-700">
              <span>Sacs cadeaux ({pricing.totalPots} × {SAC_CADEAU_PRICE.toFixed(2)}€)</span>
              <span>{(SAC_CADEAU_PRICE * pricing.totalPots).toFixed(2)}€</span>
            </div>
          )}
          {pricing.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Réduction 10%</span>
              <span>−{pricing.discount.toFixed(2)}€</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t border-rose-200 pt-3 mt-1">
            <span>Total pots</span>
            <span className="text-rose-600">{pricing.total.toFixed(2)}€</span>
          </div>
        </div>
      )}

      {/* Délais */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 space-y-1">
          <p>Chaque commande est préparée avec soin.</p>
          <p>Nous vous recommandons de commander <strong>jusqu'à 21 jours avant votre événement</strong>.</p>
          <p className="text-blue-600">Les commandes passées moins de 14 jours avant peuvent être acceptées, mais la livraison dans les délais n'est pas garantie.</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1 h-12 rounded-xl">
          <ChevronLeft className="w-4 h-4 mr-2" /> Retour
        </Button>
        <Button onClick={handleNext} disabled={packs.length === 0 || !selection.containerType} className="flex-1 h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold">
          Continuer <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}