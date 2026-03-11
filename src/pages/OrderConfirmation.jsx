import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { CheckCircle, Download, Eye, Package, Calendar, MapPin, ArrowRight, Copy, Check as CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateInvoicePDF } from "@/components/admin/invoiceUtils";

const STATUS_MAP = {
  pending: "En attente",
  confirmed: "Confirmée",
  shipped: "Expédiée",
  delivered: "Livrée",
};

export default function OrderConfirmation() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order_id");

    if (orderId) {
      fetchOrder(orderId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchOrder = async (orderId) => {
    try {
      const result = await base44.entities.Order.filter({ id: orderId }, "-created_date", 1);
      if (result && result.length > 0) {
        setOrder(result[0]);
      }
    } catch (e) {
      console.error("Erreur chargement commande:", e);
    }
    setLoading(false);
  };

  const handleDownloadInvoice = async (order) => {
    const doc = await generateInvoicePDF(order);
    doc.save(`Facture-${(order.id || "").slice(-8).toUpperCase()}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre commande...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center px-4">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
          .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
          .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
        `}</style>
        <div className="text-center max-w-md">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="font-sans-clean text-gray-600 mb-6">Commande non trouvée</p>
          <a href={createPageUrl("Home")} className="inline-block px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-sans-clean font-semibold transition">
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  const isFullPayment = order.payment_status === "paid";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
      `}</style>

      {/* Header */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/20 bg-white">
        <a href={createPageUrl("Home")}>
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
            alt="Fleurs de fête"
            className="h-12"
          />
        </a>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="font-serif-elegant text-4xl font-bold text-gray-800 mb-3">
            {isFullPayment ? "✓ Paiement confirmé !" : "✓ Acompte reçu !"}
          </h1>
          <p className="font-sans-clean text-lg text-gray-600 mb-2">
            Merci {order.customer_name} 💚
          </p>
          <p className="font-sans-clean text-gray-500">
            Votre commande a bien été reçue et confirmée
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-100">
            <div>
              <h2 className="font-serif-elegant text-2xl font-bold text-gray-800">{order.product_name}</h2>
              <p className="font-sans-clean text-sm text-gray-500 mt-1">
                Commande du {new Date(order.created_date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="font-serif-elegant text-3xl font-bold text-rose-600">{order.total_price?.toFixed(2)}€</p>
              <p className="font-sans-clean text-xs text-gray-500">{order.quantity} kit{order.quantity > 1 ? "s" : ""}</p>
            </div>
          </div>

          {/* Payment Status */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-sans-clean text-xs font-semibold text-gray-500 uppercase mb-2">Commande</p>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-gray-700 bg-gray-100">
                {STATUS_MAP[order.status] || order.status}
              </span>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="font-sans-clean text-xs font-semibold text-green-600 uppercase mb-2">Paiement</p>
              {isFullPayment ? (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-green-700 bg-green-100">
                  ✓ Réglé intégralement
                </span>
              ) : (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-blue-700 bg-blue-100">
                  Acompte {(order.deposit_amount?.toFixed(2))}€
                </span>
              )}
            </div>
          </div>

          {/* Event & Delivery Info */}
          {order.options_selected?.event_date && (
            <div className="flex items-start gap-3 text-sm mb-4 p-4 bg-indigo-50 rounded-xl">
              <Calendar className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-sans-clean text-xs text-indigo-600 font-semibold">Événement prévu</p>
                <p className="font-sans-clean text-indigo-900 font-medium">
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
            <div className="flex items-start gap-3 text-sm p-4 bg-purple-50 rounded-xl">
              <MapPin className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-sans-clean text-xs text-purple-600 font-semibold mb-1">Adresse de livraison</p>
                <p className="font-sans-clean text-purple-900 text-sm whitespace-pre-line">
                  {order.options_selected.delivery_address}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Payment Details */}
        {!isFullPayment && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
            <h3 className="font-serif-elegant text-lg font-bold text-amber-900 mb-3">📋 Prochaines étapes</h3>
            <ul className="space-y-2 font-sans-clean text-sm text-amber-900">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-0.5">1.</span>
                <span>Acompte de <strong>{(order.deposit_amount?.toFixed(2))}€</strong> reçu ✓</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-0.5">2.</span>
                <span>Solde de <strong>{(order.total_price - order.deposit_amount).toFixed(2)}€</strong> à régler à la livraison</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-0.5">3.</span>
                <span>Nous vous enverrons le numéro de suivi par email</span>
              </li>
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Button
            onClick={() => handleDownloadInvoice(order)}
            className="rounded-xl h-11 bg-rose-500 hover:bg-rose-600 text-white font-sans-clean font-semibold"
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger facture PDF
          </Button>
          {order.options_selected?.site_public_url ? (
            <a
              href={order.options_selected.site_public_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl h-11 bg-indigo-500 hover:bg-indigo-600 text-white font-sans-clean font-semibold transition"
            >
              <Eye className="w-4 h-4" />
              Voir votre espace événement
            </a>
          ) : isFullPayment ? (
            <a
              href={createPageUrl("CreateMyEvent") + `?order_id=${order.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl h-11 bg-purple-500 hover:bg-purple-600 text-white font-sans-clean font-semibold transition"
            >
              🌸 Créer mon site de mariage
            </a>
          ) : null}
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-2xl p-6 mb-8">
          <h3 className="font-serif-elegant text-lg font-bold text-gray-800 mb-4">🌸 Prochaines étapes</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-rose-100 text-rose-600 font-semibold text-sm">1</div>
              </div>
              <div>
                <p className="font-sans-clean font-semibold text-gray-800">Confirmation</p>
                <p className="font-sans-clean text-sm text-gray-600">Nous préparons votre commande</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 font-semibold text-sm">2</div>
              </div>
              <div>
                <p className="font-sans-clean font-semibold text-gray-800">Expédition</p>
                <p className="font-sans-clean text-sm text-gray-600">Vous recevrez le numéro de suivi par email</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-600 font-semibold text-sm">3</div>
              </div>
              <div>
                <p className="font-sans-clean font-semibold text-gray-800">Réception</p>
                <p className="font-sans-clean text-sm text-gray-600">Votre colis arrive prêt à être offert 🎁</p>
              </div>
            </div>
          </div>
        </div>

        {/* Parrainage */}
        <ReferralBlock />

        {/* CTA */}
        <div className="text-center">
          <p className="font-sans-clean text-gray-600 mb-4">Suivre votre commande :</p>
          <a
            href={createPageUrl("ClientDashboard")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-sans-clean font-semibold transition"
          >
            Accéder à mon espace client <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}