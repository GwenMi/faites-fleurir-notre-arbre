import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

const GUEST_PACKS = [
  { guests: 30, badge: null },
  { guests: 50, badge: null },
  { guests: 70, badge: "Le plus choisi" },
  { guests: 100, badge: null },
  { guests: 120, badge: null },
];

const KIT_OPTIONS = [
  { id: "compose", name: "Kit à composer", basePrice: 3.90 },
  { id: "pret", name: "Kit prêt à offrir", basePrice: 5.90 },
];

export default function GuestPacksSection({ onSelectPack }) {
  const [expandedPack, setExpandedPack] = useState(null);
  const [selections, setSelections] = useState({});

  const getPackKey = (guests) => `pack-${guests}`;

  const getPackSelection = (guests) => {
    const key = getPackKey(guests);
    return selections[key] || { kit: "compose" };
  };

  const calculatePrice = (guests, kitId) => {
    const kit = KIT_OPTIONS.find(k => k.id === kitId);
    if (!kit) return 0;
    return parseFloat((kit.basePrice * guests).toFixed(2));
  };

  const handleSelectKit = (guests, kitId) => {
    const key = getPackKey(guests);
    setSelections({ ...selections, [key]: { kit: kitId } });
  };

  const handleOrderPack = (guests) => {
    const selection = getPackSelection(guests);
    const kit = KIT_OPTIONS.find(k => k.id === selection.kit);
    const price = calculatePrice(guests, selection.kit);

    onSelectPack({
      type: "guest_pack",
      guests,
      kitName: kit.name,
      kitId: selection.kit,
      pricePerKit: kit.basePrice,
      totalPrice: price,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <p className="font-sans-clean text-xs tracking-[0.3em] uppercase text-rose-400 mb-3">Nos formules</p>
        <h2 className="font-serif-elegant text-3xl font-bold text-gray-800 mb-4">Packs invités</h2>
        <p className="font-sans-clean text-gray-500 max-w-md mx-auto">
          Choisissez directement le nombre de pots correspondant à votre nombre d'invités.
          Nous recommandons de prévoir quelques pots supplémentaires pour les invités imprévus ou les souvenirs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {GUEST_PACKS.map(({ guests, badge }) => {
          const selection = getPackSelection(guests);
          const price = calculatePrice(guests, selection.kit);
          const isExpanded = expandedPack === guests;

          return (
            <div
              key={guests}
              className="border border-gray-200 rounded-2xl p-6 bg-white hover:shadow-lg transition overflow-hidden relative"
            >
              {badge && (
                <span className="absolute top-4 right-4 bg-rose-400 text-white text-xs font-bold px-2.5 py-1 rounded-full font-sans-clean">
                  {badge} ✨
                </span>
              )}

              <h3 className="font-serif-elegant text-2xl font-bold text-gray-800 mb-1">
                {guests} invités
              </h3>
              <p className="text-sm text-gray-500 mb-6">Avec pots, graines & rubans</p>

              {!isExpanded ? (
                <>
                  <div className="mb-6 space-y-1">
                    <p className="text-xs text-gray-500">Kit sélectionné</p>
                    <p className="font-semibold text-gray-800 text-sm">
                      {KIT_OPTIONS.find(k => k.id === selection.kit)?.name}
                    </p>
                  </div>

                  <div className="mb-6">
                    <p className="text-xs text-gray-400 mb-1">Prix total</p>
                    <p className="font-serif-elegant text-4xl font-bold text-rose-500">
                      {price.toFixed(2)} €
                    </p>
                  </div>

                  <Button
                    onClick={() => setExpandedPack(guests)}
                    className="w-full h-10 rounded-full bg-rose-100 text-rose-500 hover:bg-rose-200 font-semibold text-sm transition"
                  >
                    Changer de kit
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  {/* Kit selection */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Choisir le kit</p>
                    <div className="space-y-2">
                      {KIT_OPTIONS.map(kit => (
                        <button
                          key={kit.id}
                          onClick={() => handleSelectKit(guests, kit.id)}
                          className={`w-full text-left px-4 py-2.5 rounded-lg border-2 transition text-sm font-medium ${
                            selection.kit === kit.id
                              ? "border-rose-400 bg-rose-50 text-rose-600"
                              : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          <div className="font-semibold">{kit.name}</div>
                          <div className="text-xs opacity-75">{kit.basePrice.toFixed(2)} € / pot</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price and buttons */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 mb-1">Prix total</p>
                      <p className="font-serif-elegant text-3xl font-bold text-rose-500">
                        {price.toFixed(2)} €
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setExpandedPack(null)}
                        className="flex-1 px-3 py-2 rounded-full border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
                      >
                        Annuler
                      </button>
                      <Button
                        onClick={() => {
                          handleOrderPack(guests);
                          setExpandedPack(null);
                        }}
                        className="flex-1 h-10 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold text-sm hover:opacity-90 transition"
                      >
                        <ShoppingBag className="w-4 h-4 mr-1" />
                        Commander
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}