import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, ExternalLink, Check, Loader2, X, Heart } from "lucide-react";
import { toast } from "sonner";

function OfferModal({ item, onClose, onConfirm }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!name.trim()) { toast.error("Indiquez votre prénom"); return; }
    setLoading(true);
    await onConfirm(name.trim());
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif-elegant text-xl font-bold text-gray-800">Offrir ce cadeau</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="bg-rose-50 rounded-xl p-3 mb-4 flex gap-3 items-center">
          {item.image_url && <img src={item.image_url} alt={item.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
          <div>
            <p className="font-semibold text-gray-800 font-sans-clean text-sm">{item.title}</p>
            {item.price != null && <p className="text-rose-600 font-bold font-sans-clean text-sm">{item.price}€</p>}
          </div>
        </div>
        <p className="text-sm text-gray-500 font-sans-clean mb-3">Votre prénom (pour éviter les doublons)</p>
        <Input
          placeholder="Votre prénom"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleConfirm()}
          className="h-10 rounded-xl mb-4"
          autoFocus
        />
        <Button onClick={handleConfirm} disabled={loading || !name.trim()}
          className="w-full h-11 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-sans-clean font-semibold">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Heart className="w-4 h-4 mr-2" />}
          Confirmer ce cadeau
        </Button>
        <p className="text-xs text-center text-gray-400 mt-3 font-sans-clean">Ce cadeau sera marqué comme offert et retiré de la liste disponible.</p>
      </div>
    </div>
  );
}

function CagnotteContribModal({ item, onClose, onConfirm }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!name.trim()) { toast.error("Indiquez votre prénom"); return; }
    setLoading(true);
    await onConfirm(name.trim(), parseFloat(amount) || 0);
    setLoading(false);
  };

  const progress = item.target_amount ? Math.min(100, ((item.collected_amount || 0) / item.target_amount) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif-elegant text-xl font-bold text-gray-800">Participer à la cagnotte</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="bg-rose-50 rounded-xl p-3 mb-4">
          <p className="font-semibold text-gray-800 font-sans-clean text-sm mb-2">{item.title}</p>
          {item.target_amount && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 font-sans-clean mb-1">
                <span>{item.collected_amount || 0}€ collectés</span>
                <span>Objectif : {item.target_amount}€</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500 font-sans-clean mb-3">Votre prénom</p>
        <Input placeholder="Votre prénom" value={name} onChange={e => setName(e.target.value)} className="h-10 rounded-xl mb-3" autoFocus />
        <p className="text-sm text-gray-500 font-sans-clean mb-3">Montant que vous souhaitez contribuer (optionnel)</p>
        <Input type="number" placeholder="Montant en €" value={amount} onChange={e => setAmount(e.target.value)} className="h-10 rounded-xl mb-4" />
        <Button onClick={handleConfirm} disabled={loading || !name.trim()}
          className="w-full h-11 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-sans-clean font-semibold">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Heart className="w-4 h-4 mr-2" />}
          Confirmer ma participation
        </Button>
      </div>
    </div>
  );
}

export default function WishlistSection({ event, primaryColor }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { item, type: "gift" | "cagnotte" }

  const color = primaryColor || "#f43f5e";

  useEffect(() => {
    loadItems();
    const unsub = base44.entities.WishlistItem.subscribe((ev) => {
      if (ev.type === "update") setItems(i => i.map(x => x.id === ev.id ? ev.data : x));
      else if (ev.type === "create" && ev.data?.event_id === event.id) setItems(i => [...i, ev.data]);
      else if (ev.type === "delete") setItems(i => i.filter(x => x.id !== ev.id));
    });
    return unsub;
  }, []);

  const loadItems = async () => {
    const result = await base44.entities.WishlistItem.filter({ event_id: event.id }, "order");
    setItems(result || []);
    setLoading(false);
  };

  const handleOfferGift = async (name) => {
    await base44.entities.WishlistItem.update(modal.item.id, { offered: true, offered_by: name });
    toast.success("Cadeau réservé ! Merci pour votre générosité 💝");
    setModal(null);
  };

  const handleContribCagnotte = async (name, amount) => {
    const current = modal.item.collected_amount || 0;
    await base44.entities.WishlistItem.update(modal.item.id, {
      collected_amount: current + amount,
      offered: amount > 0 && (current + amount) >= (modal.item.target_amount || 0),
      offered_by: amount > 0 ? name : modal.item.offered_by,
    });
    toast.success("Merci pour votre participation ! 💝");
    setModal(null);
  };

  const gifts = items.filter(i => i.category === "gift");
  const cagnottes = items.filter(i => i.category === "cagnotte");

  if (loading || items.length === 0) return null;

  return (
    <div className="px-4 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-px flex-1 max-w-16" style={{ background: `linear-gradient(to right, transparent, ${color}66)` }} />
          <Gift className="w-5 h-5" style={{ color }} />
          <div className="h-px flex-1 max-w-16" style={{ background: `linear-gradient(to left, transparent, ${color}66)` }} />
        </div>
        <h2 className="font-serif-elegant text-3xl font-bold text-gray-800 mb-2">Liste de mariage</h2>
        <p className="font-sans-clean text-gray-500 text-sm max-w-sm mx-auto">
          Contribuez à notre bonheur en choisissant un cadeau ou en participant à une cagnotte.
        </p>
      </div>

      {/* Cagnottes */}
      {cagnottes.length > 0 && (
        <div className="mb-8">
          <h3 className="font-serif-elegant text-xl font-bold text-gray-700 mb-4 text-center">💝 Cagnottes</h3>
          <div className="space-y-4">
            {cagnottes.map(item => {
              const progress = item.target_amount ? Math.min(100, ((item.collected_amount || 0) / item.target_amount) * 100) : 0;
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <div className="flex gap-4 items-start">
                    {item.image_url && <img src={item.image_url} alt={item.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 font-sans-clean">{item.title}</p>
                      {item.description && <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>}
                      {item.target_amount && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-500 font-sans-clean mb-1">
                            <span className="font-semibold text-rose-600">{item.collected_amount || 0}€ collectés</span>
                            <span>objectif {item.target_amount}€</span>
                          </div>
                          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: color }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button onClick={() => setModal({ item, type: "cagnotte" })}
                    className="w-full mt-4 h-10 rounded-xl text-white font-sans-clean font-semibold hover:opacity-90"
                    style={{ background: color }}>
                    <Heart className="w-4 h-4 mr-2" /> Participer à la cagnotte
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Gifts */}
      {gifts.length > 0 && (
        <div>
          <h3 className="font-serif-elegant text-xl font-bold text-gray-700 mb-4 text-center">🎁 Idées cadeaux</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gifts.map(item => (
              <div key={item.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition ${item.offered ? "opacity-60 border-green-200" : "border-gray-200 hover:shadow-md"}`}>
                {item.image_url && (
                  <img src={item.image_url} alt={item.title} className="w-full h-36 object-cover" />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-semibold text-gray-800 font-sans-clean text-sm">{item.title}</p>
                    {item.price != null && (
                      <span className="font-bold text-rose-600 font-serif-elegant text-lg flex-shrink-0">{item.price}€</span>
                    )}
                  </div>
                  {item.description && <p className="text-xs text-gray-400 mb-2">{item.description}</p>}
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:underline mb-3">
                      <ExternalLink className="w-3 h-3" /> Voir le produit
                    </a>
                  )}
                  {item.offered ? (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-sans-clean font-semibold">
                      <Check className="w-4 h-4" /> Déjà offert par {item.offered_by || "un invité"}
                    </div>
                  ) : (
                    <Button onClick={() => setModal({ item, type: "gift" })} size="sm"
                      className="w-full h-9 rounded-xl text-white font-sans-clean font-semibold hover:opacity-90"
                      style={{ background: color }}>
                      <Gift className="w-3.5 h-3.5 mr-2" /> Je l'offre !
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {modal?.type === "gift" && (
        <OfferModal item={modal.item} onClose={() => setModal(null)} onConfirm={handleOfferGift} />
      )}
      {modal?.type === "cagnotte" && (
        <CagnotteContribModal item={modal.item} onClose={() => setModal(null)} onConfirm={handleContribCagnotte} />
      )}
    </div>
  );
}