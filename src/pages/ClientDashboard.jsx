import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Loader2, Download, Eye, Package, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateInvoicePDF } from "@/components/admin/invoiceUtils";

const STATUS_MAP = {
  pending: "En attente",
  confirmed: "Confirmée",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export default function ClientDashboard() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    const result = await base44.entities.Order.filter({ customer_email: email.trim() }, "-created_date", 100);
    setOrders(result || []);
    setAuthenticated(true);
    setLoading(false);
  };

  const handleDownloadInvoice = async (order) => {
    const doc = await generateInvoicePDF(order);
    doc.save(`Facture-${(order.id || "").slice(-8).toUpperCase()}.pdf`);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center px-4">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
          .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
          .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
        `}</style>
        
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
              alt="Fleurs de fête"
              className="h-10 mx-auto mb-4"
            />
            <h1 className="font-serif-elegant text-3xl font-bold text-gray-800 mb-2">Mon compte</h1>
            <p className="font-sans-clean text-sm text-gray-600">Accédez à vos commandes</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="rounded-xl h-11"
              required
            />
            <Button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full rounded-xl h-11 bg-rose-500 hover:bg-rose-600 text-white font-sans-clean font-semibold"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Accéder à mon compte
            </Button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4 font-sans-clean">
            Aucune connexion requise — entrez simplement votre email de commande
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
      `}</style>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-gray-100">
        <a href={createPageUrl("Home")}>
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
            alt="Fleurs de fête"
            className="h-12"
          />
        </a>
        <button
          onClick={() => setAuthenticated(false)}
          className="font-sans-clean text-sm text-gray-600 hover:text-rose-500 transition"
        >
          Déconnexion
        </button>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="font-serif-elegant text-4xl font-bold text-gray-800 mb-2">Mes commandes</h1>
          <p className="font-sans-clean text-gray-600">{email}</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="font-sans-clean text-gray-600">Aucune commande trouvée</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition">
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif-elegant text-lg font-bold text-gray-800">{order.product_name}</h3>
                    <p className="font-sans-clean text-sm text-gray-500">
                      {new Date(order.created_date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif-elegant text-2xl font-bold text-rose-600">{order.total_price?.toFixed(2)}€</p>
                    <p className="font-sans-clean text-xs text-gray-500">{order.quantity} article{order.quantity > 1 ? "s" : ""}</p>
                  </div>
                </div>

                <div className="px-6 py-4 space-y-4">
                  {/* Statuts */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-sans-clean text-xs font-semibold text-gray-500 uppercase mb-1">Commande</p>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-gray-700 bg-gray-100">
                        {STATUS_MAP[order.status] || order.status}
                      </span>
                    </div>
                    <div>
                      <p className="font-sans-clean text-xs font-semibold text-gray-500 uppercase mb-1">Paiement</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        order.payment_status === "paid" ? "bg-green-100 text-green-700" :
                        order.payment_status === "partial" ? "bg-blue-100 text-blue-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {order.payment_status === "paid" ? "Payé" : order.payment_status === "partial" ? "Acompte reçu" : "En attente"}
                      </span>
                    </div>
                  </div>

                  {/* Infos */}
                  {order.options_selected?.event_date && (
                    <div className="flex items-start gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-sans-clean text-xs text-gray-500 font-semibold">Date d'événement</p>
                        <p className="font-sans-clean text-gray-700">
                          {new Date(order.options_selected.event_date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.options_selected?.delivery_address && (
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-sans-clean text-xs text-gray-500 font-semibold">Livraison</p>
                        <p className="font-sans-clean text-gray-700 whitespace-pre-line">
                          {order.options_selected.delivery_address}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tracking */}
                  {order.tracking_number && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="font-sans-clean text-xs font-semibold text-gray-500 uppercase mb-2">Suivi colis</p>
                      <a
                        href={getTrackingUrl(order.tracking_carrier, order.tracking_number)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-rose-500 hover:text-rose-600"
                      >
                        <Eye className="w-4 h-4" />
                        Suivre mon colis
                      </a>
                    </div>
                  )}

                  {/* Espace événement */}
                  {order.options_selected?.site_public_url && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="font-sans-clean text-xs font-semibold text-gray-500 uppercase mb-2">Espace événement</p>
                      <a
                        href={order.options_selected.site_public_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-sans-clean text-sm font-semibold transition"
                      >
                        Accéder à l'espace →
                      </a>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2 border-t border-gray-100">
                    <Button
                      onClick={() => handleDownloadInvoice(order)}
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Facture PDF
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 py-10 px-6 border-t border-gray-100 text-center">
        <a href={createPageUrl("CoupleDashboard")} className="font-sans-clean text-sm text-rose-500 hover:text-rose-600 font-semibold block mb-4">
          💍 Accéder à l'espace mariés (invités & RSVP) →
        </a>
        <p className="font-sans-clean text-xs text-gray-400 mb-2">Besoin d'aide ?</p>
        <a href={createPageUrl("Contact")} className="font-sans-clean text-sm text-rose-500 hover:text-rose-600">
          Contactez-nous →
        </a>
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