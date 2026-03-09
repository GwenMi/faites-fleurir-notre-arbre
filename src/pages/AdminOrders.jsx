import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ChevronLeft, Loader2, Package, RefreshCw, Truck, Send, CheckCircle2, X, FileText, Mail, Bell, Star, Download, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { generateInvoicePDF, getInvoiceEmailBody, getReminderEmailBody } from "@/components/admin/invoiceUtils";

const CARRIERS = [
  { label: "La Poste / Colissimo", url: "https://www.laposte.fr/outils/suivre-vos-envois?code=" },
  { label: "Chronopost", url: "https://www.chronopost.fr/tracking-no-cms/suivi-page?listeNumerosLT=" },
  { label: "DHL", url: "https://www.dhl.com/fr-fr/home/tracking.html?tracking-id=" },
  { label: "UPS", url: "https://www.ups.com/track?loc=fr_FR&tracknum=" },
  { label: "DPD", url: "https://www.dpd.fr/trace/" },
  { label: "Mondial Relay", url: "https://www.mondialrelay.fr/suivi-de-colis/?numeroExpedition=" },
];

const STATUS_CONFIG = {
  pending:   { label: "En attente",  className: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Confirmée",   className: "bg-blue-100 text-blue-700" },
  shipped:   { label: "Expédiée",    className: "bg-purple-100 text-purple-700" },
  delivered: { label: "Livrée",      className: "bg-green-100 text-green-700" },
  cancelled: { label: "Annulée",     className: "bg-red-100 text-red-700" },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [trackingOpen, setTrackingOpen] = useState(null); // order.id
  const [trackingForm, setTrackingForm] = useState({ number: "", carrier: CARRIERS[0].label });
  const [sendingTracking, setSendingTracking] = useState(false);
  const [sendingInvoice, setSendingInvoice] = useState(null);
  const [sendingReminder, setSendingReminder] = useState(null);
  const [sendingReviewLink, setSendingReviewLink] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    setLoading(true);
    const data = await base44.entities.Order.list("-created_date");
    setOrders(data || []);
    setLoading(false);
  };

  const updateStatus = async (order, newStatus) => {
    setUpdatingId(order.id);
    await base44.entities.Order.update(order.id, { status: newStatus });
    await loadOrders();
    setUpdatingId(null);
  };

  const openTracking = (order) => {
    setTrackingForm({
      number: order.tracking_number || "",
      carrier: order.tracking_carrier || CARRIERS[0].label,
    });
    setTrackingOpen(order.id);
  };

  const handleSendTracking = async (order) => {
    if (!trackingForm.number.trim()) {
      toast.error("Veuillez saisir un numéro de suivi");
      return;
    }
    setSendingTracking(true);
    const carrier = CARRIERS.find(c => c.label === trackingForm.carrier) || CARRIERS[0];
    const trackingUrl = carrier.url + trackingForm.number.trim();

    // Save tracking info
    await base44.entities.Order.update(order.id, {
      tracking_number: trackingForm.number.trim(),
      tracking_carrier: trackingForm.carrier,
      tracking_email_sent: true,
      status: order.status === "pending" || order.status === "confirmed" ? "shipped" : order.status,
    });

    // Send email to customer
    await base44.integrations.Core.SendEmail({
      to: order.customer_email,
      subject: `📦 Votre commande est en route — ${order.product_name}`,
      body: `Bonjour ${order.customer_name},\n\nVotre commande "${order.product_name}" a été expédiée ! 🌸\n\nNuméro de suivi : ${trackingForm.number.trim()}\nTransporteur : ${trackingForm.carrier}\n\nSuivez votre colis en cliquant sur le lien ci-dessous :\n${trackingUrl}\n\nMerci pour votre confiance,\nL'équipe Fleurs de fête`,
    });

    toast.success("Email de suivi envoyé au client !");
    setSendingTracking(false);
    setTrackingOpen(null);
    await loadOrders();
  };

  const downloadInvoice = (order) => {
    const doc = generateInvoicePDF(order);
    const invoiceNumber = `FEF-${(order.id || "").slice(-8).toUpperCase()}`;
    doc.save(`Facture-${invoiceNumber}.pdf`);
  };

  const sendInvoiceByEmail = async (order) => {
    setSendingInvoice(order.id);
    const invoiceNumber = `FEF-${(order.id || "").slice(-8).toUpperCase()}`;
    await base44.integrations.Core.SendEmail({
      to: order.customer_email,
      subject: `🌸 Votre facture Fleurs en fête — ${invoiceNumber}`,
      body: getInvoiceEmailBody(order),
    });
    toast.success(`Facture envoyée à ${order.customer_email}`);
    setSendingInvoice(null);
  };

  const sendReminder = async (order) => {
    setSendingReminder(order.id);
    await base44.integrations.Core.SendEmail({
      to: order.customer_email,
      subject: `🌱 Vos pousses d'amour vous attendent… — Fleurs en fête`,
      body: getReminderEmailBody(order),
    });
    toast.success(`Relance envoyée à ${order.customer_email} 🌸`);
    setSendingReminder(null);
  };

  const sendReviewRequest = async (order) => {
    setSendingReviewLink(order.id);
    const reviewUrl = `${window.location.origin}${createPageUrl("ReviewOrder")}?order_id=${order.id}`;
    await base44.integrations.Core.SendEmail({
      to: order.customer_email,
      subject: `🌸 Votre avis compte beaucoup pour nous — Fleurs en fête`,
      body: `Bonjour ${order.customer_name},

Nous espérons que votre commande "${order.product_name}" a fleuri dans les cœurs de vos invités 🌷

Votre avis nous aiderait énormément à améliorer nos kits et à inspirer d'autres familles qui préparent leur grand jour.

👉 Laisser mon avis en 30 secondes :
${reviewUrl}

Un grand merci pour votre confiance et vos belles fêtes,
Gwenaëlle — Fleurs en fête 🌸
contact@fleursenfete.com`,
    });
    toast.success(`Demande d'avis envoyée à ${order.customer_email} ⭐`);
    setSendingReviewLink(null);
  };

  const STATUSES = Object.keys(STATUS_CONFIG);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <style>{`
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
      `}</style>

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href={createPageUrl("AdminDashboard")} className="p-2 rounded-xl hover:bg-gray-50 transition">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </a>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-rose-400" />
              <h1 className="font-bold text-gray-800">Commandes boutique</h1>
            </div>
          </div>
          <button onClick={loadOrders} className="p-2 rounded-xl hover:bg-gray-50 transition text-gray-400">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4">
        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-rose-300 mx-auto" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-600 mb-1">Aucune commande</h2>
            <p className="text-sm text-gray-400">Les commandes passées depuis la boutique apparaîtront ici.</p>
            <a href={createPageUrl("Boutique")} className="inline-block mt-4 px-6 py-2.5 rounded-full bg-rose-400 text-white text-sm font-semibold hover:bg-rose-500 transition">
              Voir la boutique
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 font-medium">{orders.length} commande{orders.length > 1 ? "s" : ""}</p>
            {orders.map(order => {
              const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const opts = order.options_selected || {};
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold text-gray-800">{order.customer_name}</p>
                        <Badge className={statusCfg.className + " text-xs"}>{statusCfg.label}</Badge>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{order.customer_email}</p>

                      {opts.delivery_address && (
                        <div className="flex items-start gap-1.5 mb-2">
                          <span className="text-sm">📦</span>
                          <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">{opts.delivery_address}</p>
                        </div>
                      )}
                      {opts.event_date && (
                        <p className="text-xs text-gray-500 mb-2">
                          📅 Événement le {new Date(opts.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      )}

                      <div className="bg-rose-50 rounded-xl px-3 py-2 mb-3 inline-block">
                        <p className="text-sm font-semibold text-rose-700">
                          🌸 {order.product_name} × {order.quantity}
                        </p>
                        <p className="text-xs font-bold text-rose-500 mt-0.5">{order.total_price?.toFixed(2)} €</p>
                      </div>

                      {Object.keys(opts).length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {opts.pot_type && <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-1">🫙 {opts.pot_type}</span>}
                          {opts.ribbon_color && <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-1">🎀 {opts.ribbon_color}</span>}
                          {opts.seed_type && <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-1">🌱 {opts.seed_type}</span>}
                          {opts.custom_text && <span className="text-xs bg-purple-50 text-purple-600 rounded-full px-2.5 py-1">✏️ {opts.custom_text}</span>}
                        </div>
                      )}

                      <p className="text-xs text-gray-300 mt-2">
                        {new Date(order.created_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>

                  {/* Status update */}
                  <div className="mt-3 pt-3 border-t border-gray-50">
                    <p className="text-xs text-gray-400 mb-2">Changer le statut :</p>
                    <div className="flex flex-wrap gap-1.5">
                      {STATUSES.map(s => (
                        <button
                          key={s}
                          disabled={order.status === s || updatingId === order.id}
                          onClick={() => updateStatus(order, s)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition font-medium ${
                            order.status === s
                              ? "border-rose-300 bg-rose-50 text-rose-600 cursor-default"
                              : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {STATUS_CONFIG[s].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Invoice & Reminder actions */}
                  <div className="mt-3 pt-3 border-t border-gray-50 flex flex-wrap gap-2">
                    <button
                      onClick={() => downloadInvoice(order)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 transition font-medium"
                    >
                      <FileText className="w-3.5 h-3.5" /> Télécharger la facture
                    </button>
                    <button
                      onClick={() => sendInvoiceByEmail(order)}
                      disabled={sendingInvoice === order.id}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-purple-200 text-purple-600 bg-purple-50 hover:bg-purple-100 transition font-medium disabled:opacity-50"
                    >
                      {sendingInvoice === order.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Mail className="w-3.5 h-3.5" />}
                      Envoyer la facture
                    </button>
                    {(order.status === "pending" || order.status === "confirmed") && (
                      <button
                        onClick={() => sendReminder(order)}
                        disabled={sendingReminder === order.id}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100 transition font-medium disabled:opacity-50"
                      >
                        {sendingReminder === order.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Bell className="w-3.5 h-3.5" />}
                        Relancer le client
                      </button>
                    )}
                    {order.status === "delivered" && (
                      <button
                        onClick={() => sendReviewRequest(order)}
                        disabled={sendingReviewLink === order.id}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-yellow-200 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 transition font-medium disabled:opacity-50"
                      >
                        {sendingReviewLink === order.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Star className="w-3.5 h-3.5" />}
                        Demander un avis
                      </button>
                    )}
                  </div>

                  {/* Tracking section */}
                  <div className="mt-3 pt-3 border-t border-gray-50">
                    {order.tracking_number ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <div>
                            <p className="text-xs font-semibold text-gray-700">{order.tracking_carrier}</p>
                            <p className="text-xs text-gray-400 font-mono">{order.tracking_number}</p>
                          </div>
                          {order.tracking_email_sent && (
                            <span className="text-xs bg-green-50 text-green-600 rounded-full px-2 py-0.5">Email envoyé</span>
                          )}
                        </div>
                        <button onClick={() => openTracking(order)}
                          className="text-xs text-purple-500 hover:text-purple-700 underline">
                          Modifier
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => openTracking(order)}
                        className="flex items-center gap-2 text-xs text-purple-600 hover:text-purple-800 font-semibold transition">
                        <Truck className="w-4 h-4" /> Ajouter un numéro de suivi
                      </button>
                    )}

                    {/* Tracking form */}
                    {trackingOpen === order.id && (
                      <div className="mt-3 bg-purple-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-purple-700 flex items-center gap-1">
                            <Truck className="w-3 h-3" /> Suivi transporteur
                          </p>
                          <button onClick={() => setTrackingOpen(null)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <select
                          value={trackingForm.carrier}
                          onChange={e => setTrackingForm(f => ({ ...f, carrier: e.target.value }))}
                          className="w-full text-sm border border-purple-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                        >
                          {CARRIERS.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
                        </select>
                        <Input
                          placeholder="Numéro de suivi"
                          value={trackingForm.number}
                          onChange={e => setTrackingForm(f => ({ ...f, number: e.target.value }))}
                          className="rounded-xl border-purple-200 focus:ring-purple-300"
                        />
                        <Button
                          onClick={() => handleSendTracking(order)}
                          disabled={sendingTracking}
                          className="w-full rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-sm h-10"
                        >
                          {sendingTracking
                            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Envoi...</>
                            : <><Send className="w-4 h-4 mr-2" /> Enregistrer & envoyer l'email au client</>}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}