import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { CheckCircle, Download, Eye, Package, Calendar, MapPin, ArrowRight, Copy, Check as CheckIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateInvoicePDF } from "@/components/admin/invoiceUtils";
import StripePaymentForm from "@/components/shop/StripePaymentForm";

const SHOP_URL = "https://fleursdefete.fr" + createPageUrl("Shop");
const SHARE_TEXT = "J'ai commandé mes cadeaux d'invités ici, c'est top ! Des petits pots de fleurs à planter 🌸 Utilise ce lien pour -10% :";

function ReferralBlock() {
  const [copied, setCopied] = useState(false);
  const url = SHOP_URL + "?ref=parrain&promo=PARRAIN10";
  const encodedText = encodeURIComponent(SHARE_TEXT + " " + url);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-6 mb-8">
      <h3 className="font-serif-elegant text-xl font-bold text-gray-800 mb-1">🌸 Vous connaissez quelqu'un qui se marie ?</h3>
      <p className="font-sans-clean text-sm text-gray-500 mb-5">
        Partagez Fleurs de fête — vos proches profitent de <strong>-10%</strong> sur leur première commande.
      </p>
      <div className="flex flex-wrap gap-3">
        {/* WhatsApp */}
        <a
          href={`https://wa.me/?text=${encodedText}`}
          target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold font-sans-clean text-white transition"
          style={{ background: "#25D366" }}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WhatsApp
        </a>
        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
          target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold font-sans-clean text-white transition"
          style={{ background: "#1877F2" }}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          Facebook
        </a>
        {/* Instagram story (ouvre l'appli) */}
        <a
          href={`https://www.instagram.com/?url=${encodeURIComponent(url)}`}
          target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold font-sans-clean text-white transition"
          style={{ background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          Instagram
        </a>
        {/* Copier le lien */}
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold font-sans-clean bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
        >
          {copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copié !" : "Copier le lien"}
        </button>
      </div>
    </div>
  );
}

const STATUS_MAP = {
  pending: "En attente",
  confirmed: "Confirmée",
  shipped: "Expédiée",
  delivered: "Livrée",
};

export default function OrderConfirmation() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [siteChoice, setSiteChoice] = useState(null); // null | "premium_pay" | "dismissed"

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
  const eventType = order.options_selected?.eventType;
  const isPersonalEventType = ["mariage", "anniversaire", "bapteme", "communion"].includes(eventType);

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

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Button
            onClick={() => handleDownloadInvoice(order)}
            className="rounded-xl h-11 bg-rose-500 hover:bg-rose-600 text-white font-sans-clean font-semibold"
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger facture PDF
          </Button>
          {order.options_selected?.site_public_url && (
            <a
              href={order.options_selected.site_public_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl h-11 bg-indigo-500 hover:bg-indigo-600 text-white font-sans-clean font-semibold transition"
            >
              <Eye className="w-4 h-4" />
              Voir votre espace événement
            </a>
          )}
        </div>

        {/* Création du site événement */}
        {isPersonalEventType && !order.options_selected?.site_public_url && siteChoice !== "dismissed" && (
          <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-6 mb-8">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-serif-elegant text-xl font-bold text-gray-800">
                🌸 Créer votre site événement
              </h3>
              <button onClick={() => setSiteChoice("dismissed")} className="text-gray-300 hover:text-gray-500 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="font-sans-clean text-sm text-gray-500 mb-5">
              Partagez votre histoire, gérez vos invités et dévoilez les détails de votre grand jour. Choisissez la formule qui vous convient.
            </p>

            {siteChoice !== "premium_pay" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Gratuit */}
                <a
                  href={createPageUrl("CreateMyEvent") + `?order_id=${order.id}&plan=basic`}
                  className="flex flex-col gap-1 p-4 rounded-2xl border-2 border-gray-200 hover:border-rose-200 bg-white transition text-left"
                >
                  <p className="font-sans-clean font-bold text-gray-800 text-sm">Site gratuit</p>
                  <p className="font-sans-clean text-xs text-gray-500">Présentation + QR code photos des fleurs</p>
                  <p className="font-sans-clean font-bold text-green-600 text-sm mt-2">Gratuit</p>
                </a>
                {/* Complet */}
                <button
                  onClick={() => setSiteChoice("premium_pay")}
                  className="flex flex-col gap-1 p-4 rounded-2xl border-2 border-rose-200 bg-rose-50 hover:border-rose-400 transition text-left relative"
                >
                  <span className="absolute top-2 right-2 text-xs bg-rose-400 text-white px-2 py-0.5 rounded-full font-semibold">Recommandé</span>
                  <p className="font-sans-clean font-bold text-gray-800 text-sm">Site complet</p>
                  <p className="font-sans-clean text-xs text-gray-500">RSVP, photos, plan de table, budget…</p>
                  <p className="font-sans-clean font-bold text-rose-600 text-sm mt-2">39,99€ <span className="font-normal text-gray-400">paiement unique</span></p>
                </button>
              </div>
            ) : (
              <div>
                <button
                  onClick={() => setSiteChoice(null)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-4 transition"
                >
                  ← Retour au choix
                </button>
                <StripePaymentForm
                  customerInfo={{ name: order.customer_name, email: order.customer_email }}
                  total={39.99}
                  onSuccess={() => {
                    window.location.href = createPageUrl("CreateMyEvent") + `?order_id=${order.id}&plan=premium`;
                  }}
                  onBack={() => setSiteChoice(null)}
                />
              </div>
            )}
          </div>
        )}

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
        <div className="bg-white rounded-2xl border border-indigo-100 p-6 text-center space-y-3">
          <p className="font-serif-elegant text-lg font-bold text-gray-800">Créez votre espace organisateur</p>
          <p className="font-sans-clean text-sm text-gray-500">
            Accédez à votre tableau de bord, gérez vos commandes et suivez les accès invités.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
            <button
              onClick={() => base44.auth.redirectToLogin(createPageUrl("ClientDashboard"))}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-sans-clean font-semibold transition"
            >
              Créer / Se connecter <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href={createPageUrl("ClientDashboard")}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-sans-clean font-semibold hover:bg-gray-50 transition"
            >
              Accéder à mon espace
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}