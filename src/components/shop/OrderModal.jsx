import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Minus, Plus, Loader2, CheckCircle, AlertTriangle } from "lucide-react";

const RIBBON_COLORS = ["Blanc", "Ivoire", "Rose poudré", "Bordeaux", "Vert sauge", "Bleu ardoise", "Doré", "Noir"];
const SEED_TYPES = ["Lavande", "Tournesol", "Marguerite", "Coquelicot", "Bleuet", "Forget-me-not"];

export default function OrderModal({ product, onClose }) {
  const [quantity, setQuantity] = useState(10);
  const [ribbon, setRibbon] = useState(RIBBON_COLORS[0]);
  const [seeds, setSeeds] = useState(SEED_TYPES[0]);
  const [potType, setPotType] = useState("Verre");
  const [customText, setCustomText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isPremium = product.name.toLowerCase().includes("premium");
  const hasCompose = product.name.toLowerCase().includes("composer");
  const total = (product.price * quantity).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    await base44.entities.Order.create({
      customer_name: name.trim(),
      customer_email: email.trim(),
      product_id: product.id,
      product_name: product.name,
      quantity,
      options_selected: {
        ...(hasCompose && { pot_type: potType }),
        ribbon_color: ribbon,
        seed_type: seeds,
        ...(isPremium && customText && { custom_text: customText }),
      },
      total_price: parseFloat(total),
      status: "pending",
    });
    setLoading(false);
    setSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-4 sm:pb-0">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="font-serif-elegant text-xl font-bold text-gray-800">{product.name}</h2>
            <p className="text-rose-500 font-semibold text-sm">{product.price.toFixed(2)} € / unité</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {success ? (
          <div className="px-6 py-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="font-serif-elegant text-2xl font-bold text-gray-800 mb-2">Commande reçue !</h3>
            <p className="text-gray-500 text-sm">Nous vous contacterons à <span className="font-semibold">{email}</span> pour confirmer et organiser la livraison.</p>
            <button onClick={onClose} className="mt-6 px-8 py-3 rounded-full bg-rose-400 text-white font-semibold text-sm hover:bg-rose-500 transition">
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Quantity */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Quantité</label>
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-rose-300 transition">
                  <Minus className="w-4 h-4 text-gray-500" />
                </button>
                <span className="text-2xl font-bold text-gray-800 w-12 text-center">{quantity}</span>
                <button type="button" onClick={() => setQuantity(q => q + 1)}
                  className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-rose-300 transition">
                  <Plus className="w-4 h-4 text-gray-500" />
                </button>
                <span className="text-sm text-gray-400 ml-2">= <span className="font-bold text-rose-500">{total} €</span></span>
              </div>
            </div>

            {/* Pot type (compose only) */}
            {hasCompose && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Type de pot</label>
                <div className="flex gap-2">
                  {["Verre", "Plastique"].map(p => (
                    <button key={p} type="button" onClick={() => setPotType(p)}
                      className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition ${potType === p ? "border-rose-400 bg-rose-50 text-rose-600" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                      {p === "Verre" ? "🫙 Verre" : "🧴 Plastique"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ribbon color */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Couleur du ruban</label>
              <div className="flex flex-wrap gap-2">
                {RIBBON_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setRibbon(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${ribbon === c ? "border-rose-400 bg-rose-50 text-rose-600" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Seed type */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Type de graines</label>
              <div className="flex flex-wrap gap-2">
                {SEED_TYPES.map(s => (
                  <button key={s} type="button" onClick={() => setSeeds(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${seeds === s ? "border-rose-400 bg-rose-50 text-rose-600" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom text (premium only) */}
            {isPremium && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                  Texte personnalisé <span className="text-gray-300 font-normal normal-case">(ex: Sophie & Thomas · 14 juin 2026)</span>
                </label>
                <Input
                  placeholder="Vos prénoms & date"
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
            )}

            {/* Contact */}
            <div className="pt-2 border-t border-gray-100 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Vos coordonnées</p>
              <Input placeholder="Votre prénom & nom *" value={name} onChange={e => setName(e.target.value)} required className="rounded-xl h-11" />
              <Input type="email" placeholder="Votre email *" value={email} onChange={e => setEmail(e.target.value)} required className="rounded-xl h-11" />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading || !name.trim() || !email.trim()}
              className="w-full h-12 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold text-sm hover:opacity-90 transition shadow-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Commander {quantity} kit{quantity > 1 ? "s" : ""} — {total} €
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}