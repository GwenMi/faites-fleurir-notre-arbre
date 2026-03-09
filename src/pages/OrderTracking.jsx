import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Search, Loader2, Package, Truck, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STATUS_MAP = {
  pending: { label: "En attente", icon: AlertCircle, color: "text-amber-500" },
  confirmed: { label: "Confirmée", icon: Package, color: "text-blue-500" },
  shipped: { label: "Expédiée", icon: Truck, color: "text-indigo-500" },
  delivered: { label: "Livrée", icon: CheckCircle, color: "text-green-500" },
  cancelled: { label: "Annulée", icon: AlertCircle, color: "text-red-500" },
};

export default function OrderTracking() {
  const [searchType, setSearchType] = useState("id_email");
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!orderId.trim() || !email.trim()) {
      setError("Veuillez entrer un numéro de commande et un email");
      return;
    }

    setLoading(true);
    try {
      // Chercher par ID de commande ET email pour sécurité
      const result = await base44.entities.Order.filter({
        id: orderId.trim(),
        customer_email: email.trim().toLowerCase()
      }, "-created_date", 1);

      if (result && result.length > 0) {
        setOrders(result);
      } else {
        setOrders([]);
        setError("Aucune commande trouvée avec ces coordonnées. Vérifiez votre numéro et email.");
      }
      setSearched(true);
    } catch (e) {
      setError("Erreur lors de la recherche. Veuillez réessayer.");
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
      `}</style>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 bg-white border-b border-gray-100">
        <a href={createPageUrl("Home")}>
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
            alt="Fleurs de fête"
            className="h-12"
          />
        </a>
        <a href={createPageUrl("Home")} className="font-sans-clean text-sm text-gray-600 hover:text-rose-500">
          ← Retour à l'accueil
        </a>
      </nav>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="font-serif-elegant text-4xl font-bold text-gray-800 mb-2">Suivi de commande</h1>
          <p className="font-sans-clean text-gray-600">Entrez vos coordonnées pour voir le statut de vos commandes</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSearch} className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 font-sans-clean">
              💡 Entrez le <strong>numéro de commande</strong> (visible dans vos emails) et votre <strong>email</strong> pour retrouver votre commande.
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 font-sans-clean">Numéro de commande *</label>
              <Input
                placeholder="Ex: 507a8b2c3d4e5f6g (dans l'URL ou l'email)"
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                className="rounded-xl h-11 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 font-sans-clean">Email de commande *</label>
              <Input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="rounded-xl h-11 text-sm"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800 font-sans-clean flex gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !orderId.trim() || !email.trim()}
              className="w-full h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Recherche en cours...</>
              ) : (
                <><Search className="w-4 h-4 mr-2" /> Retrouver ma commande</>
              )}
            </Button>
          </div>
        </form>

        {/* Résultats */}
        {searched && !loading && orders.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-2xl">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="font-sans-clean text-gray-600 mb-2">Aucune commande trouvée</p>
            <p className="font-sans-clean text-sm text-gray-400">Vérifiez votre numéro et email, puis réessayez</p>
          </div>
        )}

        {orders.length > 0 && (
          <div className="space-y-6">
            {orders.map(order => {
              const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending;
              const Icon = statusInfo.icon;
              
              // Timeline des étapes
              const timeline = [
                { status: "pending", label: "Commande reçue", done: true },
                { status: "confirmed", label: "Préparation", done: ["confirmed", "shipped", "delivered"].includes(order.status) },
                { status: "shipped", label: "Expédition", done: ["shipped", "delivered"].includes(order.status) },
                { status: "delivered", label: "Livraison", done: order.status === "delivered" }
              ];
              
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-rose-400 to-pink-500 text-white px-6 py-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-serif-elegant text-2xl font-bold">{order.product_name}</h3>
                        <p className="font-sans-clean text-sm opacity-90 mt-1">
                          Commande #{order.id.slice(-8).toUpperCase()} • {new Date(order.created_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-sans-clean text-sm font-bold bg-white ${statusInfo.color}`}>
                        <Icon className="w-5 h-5" />
                        {statusInfo.label}
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-6">
                    {/* Infos rapides */}
                    <div className="grid grid-cols-3 gap-4 mb-8 pb-8 border-b border-gray-100">
                      <div>
                        <p className="font-sans-clean text-xs text-gray-500 font-semibold uppercase">Quantité</p>
                        <p className="font-sans-clean font-bold text-lg text-gray-800 mt-1">{order.quantity} kit{order.quantity > 1 ? "s" : ""}</p>
                      </div>
                      <div>
                        <p className="font-sans-clean text-xs text-gray-500 font-semibold uppercase">Montant</p>
                        <p className="font-sans-clean font-bold text-lg text-rose-600 mt-1">{order.total_price?.toFixed(2) || "—"} €</p>
                      </div>
                      <div>
                        <p className="font-sans-clean text-xs text-gray-500 font-semibold uppercase">Paiement</p>
                        <div className="mt-1">
                          {order.payment_status === "paid" && <span className="text-xs font-bold text-green-600">✓ Payé</span>}
                          {order.payment_status === "partial" && <span className="text-xs font-bold text-blue-600">⚠ Acompte</span>}
                          {order.payment_status === "unpaid" && <span className="text-xs font-bold text-amber-600">⏳ En attente</span>}
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="mb-8">
                      <p className="font-sans-clean text-sm font-semibold text-gray-700 mb-4">📅 Étapes de votre commande</p>
                      <div className="space-y-3">
                        {timeline.map((step, idx) => (
                          <div key={step.status} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                                step.done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                              }`}>
                                {step.done ? "✓" : idx + 1}
                              </div>
                              {idx < timeline.length - 1 && <div className="w-0.5 h-8 bg-gray-200 mt-1"></div>}
                            </div>
                            <div className="pt-1">
                              <p className={`font-sans-clean font-semibold ${step.done ? "text-gray-800" : "text-gray-500"}`}>
                                {step.label}
                              </p>
                              <p className="font-sans-clean text-xs text-gray-400">
                                {step.status === "pending" && "Votre commande a été créée"}
                                {step.status === "confirmed" && "Nous préparons votre colis"}
                                {step.status === "shipped" && "Votre colis est en route"}
                                {step.status === "delivered" && "Votre colis est arrivé"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Paiement détail */}
                    {order.payment_status === "partial" && (
                      <div className="mb-8 pb-8 border-b border-gray-100 bg-blue-50 rounded-lg p-4">
                        <p className="font-sans-clean text-sm font-semibold text-blue-800 mb-3">💳 Détail paiement</p>
                        <div className="space-y-2 font-sans-clean text-sm text-blue-700">
                          <div className="flex justify-between">
                            <span>Acompte reçu:</span>
                            <strong className="text-green-600">+{(order.deposit_amount || 0).toFixed(2)} €</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Solde à payer:</span>
                            <strong className="text-amber-600">{((order.total_price || 0) - (order.deposit_amount || 0)).toFixed(2)} €</strong>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tracking */}
                    {order.tracking_number ? (
                      <div className="mb-6 pb-6 border-b border-gray-100">
                        <p className="font-sans-clean text-sm font-semibold text-gray-700 mb-3">📦 Suivi de votre colis</p>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <p className="font-sans-clean text-xs text-purple-600 font-semibold mb-2">Transporteur</p>
                          <p className="font-sans-clean font-bold text-gray-800 mb-3">{order.tracking_carrier?.toUpperCase() || "Transporteur"}</p>
                          <a
                            href={getTrackingUrl(order.tracking_carrier, order.tracking_number)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-sans-clean text-sm font-semibold transition"
                          >
                            Suivre votre colis → {order.tracking_number}
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-6 pb-6 border-b border-gray-100">
                        <p className="font-sans-clean text-sm font-semibold text-gray-700 mb-2">📦 Suivi de votre colis</p>
                        <p className="font-sans-clean text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                          ⏳ Votre numéro de suivi sera ajouté dès expédition. Vous recevrez un email avec le lien de tracking.
                        </p>
                      </div>
                    )}

                    {/* Espace événement */}
                    {order.options_selected?.site_public_url && (
                      <div className="mb-6">
                        <p className="font-sans-clean text-sm font-semibold text-gray-700 mb-3">🌸 Votre espace événement</p>
                        <a
                          href={order.options_selected.site_public_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-sans-clean text-sm font-semibold transition"
                        >
                          Accéder à l'espace événement →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 py-10 px-6 border-t border-gray-200 text-center bg-white">
        <p className="font-sans-clean text-xs text-gray-400">Besoin d'aide ? Contactez-nous à contact@fleursenfete.com</p>
      </footer>
    </div>
  );
}

function getTrackingUrl(carrier, trackingNumber) {
  const carriers = {
    colissimo: `https://www.colissimo.fr/en/track-a-parcel?parcelnumber=${trackingNumber}`,
    ups: `https://tracking.ups.com/?tracknum=${trackingNumber}`,
    dhl: `https://www.dhl.com/en/en/express/tracking.html?AWB=${trackingNumber}`,
    fedex: `https://tracking.fedex.com/tracking?tracknumbers=${trackingNumber}`,
    chronopost: `https://www.chronopost.fr/fr/suivi-colis?livraisonsSearch=${trackingNumber}`,
  };
  return carriers[carrier?.toLowerCase()] || "#";
}