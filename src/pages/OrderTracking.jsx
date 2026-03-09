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
            <div className="flex gap-3">
              {["email", "nom"].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSearchType(type)}
                  className={`flex-1 py-2 rounded-xl font-sans-clean font-medium text-sm transition ${
                    searchType === type
                      ? "bg-rose-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {type === "email" ? "Rechercher par email" : "Rechercher par nom"}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Input
                placeholder={searchType === "email" ? "votre@email.com" : "Votre nom"}
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                className="rounded-xl h-11 text-sm"
              />
              <Button
                type="submit"
                disabled={loading || !searchValue.trim()}
                className="px-6 rounded-xl bg-rose-500 hover:bg-rose-600 text-white"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </form>

        {/* Résultats */}
        {searched && !loading && orders.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="font-sans-clean text-gray-600 mb-2">Aucune commande trouvée</p>
            <p className="font-sans-clean text-sm text-gray-400">Vérifiez vos coordonnées et réessayez</p>
          </div>
        )}

        {orders.length > 0 && (
          <div className="space-y-4">
            {orders.map(order => {
              const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending;
              const Icon = statusInfo.icon;
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-serif-elegant text-lg font-bold text-gray-800">{order.product_name}</h3>
                      <p className="font-sans-clean text-xs text-gray-500">
                        Commande du {new Date(order.created_date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full font-sans-clean text-sm font-medium ${statusInfo.color}`}>
                      <Icon className="w-4 h-4" />
                      {statusInfo.label}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
                    <div>
                      <p className="font-sans-clean text-xs text-gray-500 font-semibold">Quantité</p>
                      <p className="font-sans-clean font-bold text-gray-800">{order.quantity} kit{order.quantity > 1 ? "s" : ""}</p>
                    </div>
                    <div>
                      <p className="font-sans-clean text-xs text-gray-500 font-semibold">Montant</p>
                      <p className="font-sans-clean font-bold text-rose-600">{order.total_price?.toFixed(2) || "—"} €</p>
                    </div>
                  </div>

                  {/* Paiement */}
                  <div className="mt-4">
                    <p className="font-sans-clean text-xs font-semibold text-gray-500 uppercase mb-2">Paiement</p>
                    <div className="flex items-center gap-2 font-sans-clean text-sm">
                      {order.payment_status === "paid" && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          Payé en intégralité
                        </div>
                      )}
                      {order.payment_status === "partial" && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                          <Package className="w-4 h-4" />
                          Acompte reçu - Solde à la livraison
                        </div>
                      )}
                      {order.payment_status === "unpaid" && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700">
                          <AlertCircle className="w-4 h-4" />
                          Paiement en attente
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tracking */}
                  {order.tracking_number && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="font-sans-clean text-xs font-semibold text-gray-500 uppercase mb-2">Suivi colis</p>
                      <a
                        href={`${getTrackingUrl(order.tracking_carrier, order.tracking_number)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-rose-500 hover:text-rose-600 underline"
                      >
                        {order.tracking_carrier?.toUpperCase() || "Transporteur"} - {order.tracking_number}
                      </a>
                    </div>
                  )}

                  {/* Espace événement */}
                  {order.options_selected?.site_public_url && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="font-sans-clean text-xs font-semibold text-gray-500 uppercase mb-2">Espace événement</p>
                      <a
                        href={order.options_selected.site_public_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-indigo-500 hover:text-indigo-600 underline break-all"
                      >
                        Accéder à votre espace événement →
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
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