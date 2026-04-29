import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import AdminGuard from "@/components/admin/AdminGuard";
import { ChevronLeft, Loader2, Package, RefreshCw, Truck, Send, CheckCircle2, X, FileText, Mail, Bell, Star, Download, Filter, Euro, CreditCard, AlertCircle, SquareCheck, Square } from "lucide-react";
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
  pending:           { label: "En attente",              className: "bg-amber-100 text-amber-700" },
  waiting_supplier:  { label: "En attente fournisseur",  className: "bg-orange-100 text-orange-700" },
  preparing:         { label: "En cours de préparation", className: "bg-yellow-100 text-yellow-700" },
  waiting_shipping:  { label: "En attente d'expédition", className: "bg-sky-100 text-sky-700" },
  confirmed:         { label: "Confirmée",               className: "bg-blue-100 text-blue-700" },
  shipping:          { label: "En cours d'expédition",   className: "bg-indigo-100 text-indigo-700" },
  shipped:           { label: "Expédiée",                className: "bg-purple-100 text-purple-700" },
  delivered:         { label: "Livrée",                  className: "bg-green-100 text-green-700" },
  cancelled:         { label: "Annulée",                 className: "bg-red-100 text-red-700" },
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
  const [sendingPaymentReminder, setSendingPaymentReminder] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ deposit_amount: "", payment_status: "unpaid", payment_notes: "" });
  const [savingPayment, setSavingPayment] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkQontoLoading, setBulkQontoLoading] = useState(false);

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

  const downloadInvoice = async (order) => {
    const doc = await generateInvoicePDF(order);
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

  const PAYMENT_STATUS_CONFIG = {
    unpaid:  { label: "Non réglée",   className: "bg-red-100 text-red-600" },
    partial: { label: "Acompte reçu", className: "bg-amber-100 text-amber-700" },
    paid:    { label: "Réglée",       className: "bg-green-100 text-green-700" },
  };

  const openPaymentForm = (order) => {
    setPaymentForm({
      deposit_amount: order.deposit_amount ?? "",
      payment_status: order.payment_status || "unpaid",
      payment_notes: order.payment_notes || "",
    });
    setPaymentOpen(order.id);
  };

  const savePayment = async (order) => {
    setSavingPayment(true);
    await base44.entities.Order.update(order.id, {
      deposit_amount: paymentForm.deposit_amount !== "" ? Number(paymentForm.deposit_amount) : 0,
      payment_status: paymentForm.payment_status,
      payment_notes: paymentForm.payment_notes,
    });
    toast.success("Encaissement mis à jour ✓");
    setSavingPayment(false);
    setPaymentOpen(null);
    await loadOrders();
  };

  const sendPaymentReminder = async (order) => {
    setSendingPaymentReminder(order.id);
    const total = order.total_price?.toFixed(2) ?? "—";
    const deposit = order.deposit_amount ?? 0;
    const balance = ((order.total_price ?? 0) - deposit).toFixed(2);
    await base44.integrations.Core.SendEmail({
      to: order.customer_email,
      subject: `💳 Rappel de paiement — Commande ${order.product_name} — Fleurs en fête`,
      body: `Bonjour ${order.customer_name},

Nous espérons que tout se passe bien pour la préparation de votre événement 🌸

Nous vous contactons pour un rappel concernant le règlement de votre commande :

🌸 Produit : ${order.product_name} × ${order.quantity}
💰 Total commande : ${total} €${deposit > 0 ? `\n✅ Acompte reçu : ${deposit.toFixed(2)} €\n⏳ Solde restant dû : ${balance} €` : `\n⏳ Montant total restant dû : ${total} €`}

Pour procéder au règlement ou si vous avez la moindre question, n'hésitez pas à nous contacter directement par email.

Merci pour votre confiance,
Gwenaëlle — Fleurs en fête 🌸
contact@fleursenfete.com`,
    });
    await base44.entities.Order.update(order.id, { payment_reminder_sent: true });
    toast.success(`Rappel de paiement envoyé à ${order.customer_email} 💳`);
    setSendingPaymentReminder(null);
    await loadOrders();
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredOrders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const bulkSyncQonto = async () => {
    if (selectedIds.size === 0) return;
    setBulkQontoLoading(true);
    let success = 0, errors = 0;
    for (const orderId of selectedIds) {
      try {
        const result = await base44.functions.invoke("createQontoInvoice", { orderId });
        if (result?.data?.success) success++;
        else errors++;
      } catch {
        errors++;
      }
    }
    await loadOrders();
    setSelectedIds(new Set());
    setBulkQontoLoading(false);
    if (errors === 0) toast.success(`${success} facture${success > 1 ? "s" : ""} synchronisée${success > 1 ? "s" : ""} sur Qonto ✓`);
    else toast.warning(`${success} succès · ${errors} erreur${errors > 1 ? "s" : ""}`);
  };

  const STATUSES = Object.keys(STATUS_CONFIG);

  const filteredOrders = orders.filter(order => {
    if (filterStatus !== "all" && order.status !== filterStatus) return false;
    if (filterDateFrom) {
      const from = new Date(filterDateFrom);
      from.setHours(0, 0, 0, 0);
      if (new Date(order.created_date) < from) return false;
    }
    if (filterDateTo) {
      const to = new Date(filterDateTo);
      to.setHours(23, 59, 59, 999);
      if (new Date(order.created_date) > to) return false;
    }
    return true;
  });

  const exportCSV = () => {
    const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const headers = [
      "Date commande", "Nom client", "Email client", "Produit", "Quantité",
      "Total TTC (€)", "Statut", "Type de pot", "Couleur ruban", "Type de graines",
      "Texte personnalisé", "Adresse de livraison", "Date événement",
      "Transporteur", "N° suivi"
    ];
    const rows = filteredOrders.map(o => {
      const opts = o.options_selected || {};
      return [
        new Date(o.created_date).toLocaleDateString("fr-FR"),
        o.customer_name,
        o.customer_email,
        o.product_name,
        o.quantity,
        (o.total_price ?? 0).toFixed(2),
        STATUS_CONFIG[o.status]?.label || o.status,
        opts.pot_type || "",
        opts.ribbon_color || "",
        opts.seed_type || "",
        opts.custom_text || "",
        (opts.delivery_address || "").replace(/\n/g, " | "),
        opts.event_date ? new Date(opts.event_date).toLocaleDateString("fr-FR") : "",
        o.tracking_carrier || "",
        o.tracking_number || "",
      ].map(escape).join(";");
    });
    const bom = "\uFEFF";
    const csv = bom + [headers.map(escape).join(";"), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `commandes-fleursenfete-${dateStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filteredOrders.length} commande(s) exportée(s) en CSV`);
  };

  return (
    <AdminGuard allowedRoles={["admin", "manager"]}>
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
          <div className="flex items-center gap-2">
            <a
              href={createPageUrl("Picking")}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold border border-amber-200 transition"
            >
              <Package className="w-3.5 h-3.5" /> Picking
            </a>
            <a
              href={createPageUrl("AdminShipping")}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200 transition"
            >
              <Truck className="w-3.5 h-3.5" /> Expédier
            </a>
            <button onClick={loadOrders} className="p-2 rounded-xl hover:bg-gray-50 transition text-gray-400">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={exportCSV}
              disabled={filteredOrders.length === 0}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" /> Exporter CSV
            </button>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-rose-200 text-gray-600"
          >
            <option value="all">Tous les statuts</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-400">Du</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={e => setFilterDateFrom(e.target.value)}
              className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-200 text-gray-600"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-400">Au</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={e => setFilterDateTo(e.target.value)}
              className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-200 text-gray-600"
            />
          </div>
          {(filterStatus !== "all" || filterDateFrom || filterDateTo) && (
            <button
              onClick={() => { setFilterStatus("all"); setFilterDateFrom(""); setFilterDateTo(""); }}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="bg-violet-600 text-white px-4 py-2.5 sticky top-[105px] z-10">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <span className="text-sm font-semibold">{selectedIds.size} commande{selectedIds.size > 1 ? "s" : ""} sélectionnée{selectedIds.size > 1 ? "s" : ""}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={bulkSyncQonto}
                disabled={bulkQontoLoading}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white text-violet-700 hover:bg-violet-50 font-semibold transition disabled:opacity-60"
              >
                {bulkQontoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                {bulkQontoLoading ? "Synchronisation..." : "Sync Qonto"}
              </button>
              <button onClick={() => setSelectedIds(new Set())} className="text-white/70 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

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
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 font-medium">
                {filteredOrders.length} commande{filteredOrders.length > 1 ? "s" : ""}
                {filteredOrders.length !== orders.length && <span className="text-gray-400"> (sur {orders.length})</span>}
              </p>
              <button onClick={toggleSelectAll} className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-800 font-medium">
                {selectedIds.size === filteredOrders.length && filteredOrders.length > 0
                  ? <><SquareCheck className="w-4 h-4" /> Tout désélectionner</>
                  : <><Square className="w-4 h-4" /> Tout sélectionner</>}
              </button>
            </div>
            {filteredOrders.map(order => {
              const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const opts = order.options_selected || {};
              return (
                <div key={order.id} className={`bg-white rounded-2xl border shadow-sm p-4 transition ${selectedIds.has(order.id) ? "border-violet-300 ring-1 ring-violet-200" : "border-gray-100"}`}>
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggleSelect(order.id)} className="mt-1 flex-shrink-0 text-violet-400 hover:text-violet-600">
                      {selectedIds.has(order.id) ? <SquareCheck className="w-4 h-4 text-violet-600" /> : <Square className="w-4 h-4" />}
                    </button>
                  <div className="flex items-start justify-between gap-3 flex-1">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                         <a href={`${createPageUrl("AdminOrdersDetail")}?id=${order.id}`} className="font-bold text-gray-800 hover:text-indigo-600 transition cursor-pointer">
                           {order.customer_name}
                         </a>
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
                      </div>{/* flex-1 min-w-0 */}
                      </div>{/* flex items-start justify-between */}
                      </div>{/* flex items-start gap-3 (checkbox + content) */}

                      {/* Payment tracking */}
                  <div className="mt-3 pt-3 border-t border-gray-50">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500 font-medium">Encaissement :</span>
                        {(() => {
                          const ps = order.payment_status || "unpaid";
                          const psCfg = { unpaid: "bg-red-100 text-red-600", partial: "bg-amber-100 text-amber-700", paid: "bg-green-100 text-green-700" };
                          const psLabel = { unpaid: "Non réglée", partial: "Acompte reçu", paid: "Réglée" };
                          return <Badge className={psCfg[ps] + " text-xs"}>{psLabel[ps]}</Badge>;
                        })()}
                        {(order.payment_status === "partial") && order.total_price != null && (
                          <span className="text-xs text-amber-600 font-semibold">
                            {(order.deposit_amount || 0).toFixed(2)} € reçus · solde {((order.total_price || 0) - (order.deposit_amount || 0)).toFixed(2)} €
                          </span>
                        )}
                        {order.payment_status === "paid" && (
                          <span className="text-xs text-green-600 font-semibold">✓ {order.total_price?.toFixed(2)} € encaissés</span>
                        )}
                        {order.payment_reminder_sent && (
                          <span className="text-xs bg-blue-50 text-blue-500 rounded-full px-2 py-0.5">Rappel envoyé</span>
                        )}
                      </div>
                      <button onClick={() => openPaymentForm(order)} className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold underline flex-shrink-0">
                        {paymentOpen === order.id ? "Fermer" : "Modifier"}
                      </button>
                    </div>

                    {paymentOpen === order.id && (
                      <div className="mt-3 bg-indigo-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-indigo-700 flex items-center gap-1">
                            <Euro className="w-3 h-3" /> Suivi encaissement
                          </p>
                          <button onClick={() => setPaymentOpen(null)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div>
                          <label className="text-xs text-indigo-600 mb-1 block">Statut de paiement</label>
                          <select
                            value={paymentForm.payment_status}
                            onChange={e => setPaymentForm(f => ({ ...f, payment_status: e.target.value }))}
                            className="w-full text-sm border border-indigo-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          >
                            <option value="unpaid">Non réglée</option>
                            <option value="partial">Acompte reçu</option>
                            <option value="paid">Réglée intégralement</option>
                          </select>
                        </div>
                        {paymentForm.payment_status === "partial" && (
                          <div>
                            <label className="text-xs text-indigo-600 mb-1 block">Montant de l'acompte reçu (€)</label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Ex : 50.00"
                              value={paymentForm.deposit_amount}
                              onChange={e => setPaymentForm(f => ({ ...f, deposit_amount: e.target.value }))}
                              className="rounded-xl border-indigo-200 focus:ring-indigo-300"
                            />
                            {paymentForm.deposit_amount && order.total_price && (
                              <p className="text-xs text-indigo-500 mt-1">
                                Solde restant : <strong>{(order.total_price - Number(paymentForm.deposit_amount)).toFixed(2)} €</strong>
                              </p>
                            )}
                          </div>
                        )}
                        <div>
                          <label className="text-xs text-indigo-600 mb-1 block">Notes (mode de paiement, date…)</label>
                          <Input
                            placeholder="Ex : Virement reçu le 05/03"
                            value={paymentForm.payment_notes}
                            onChange={e => setPaymentForm(f => ({ ...f, payment_notes: e.target.value }))}
                            className="rounded-xl border-indigo-200 focus:ring-indigo-300"
                          />
                        </div>
                        <Button
                          onClick={() => savePayment(order)}
                          disabled={savingPayment}
                          className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm h-10"
                        >
                          {savingPayment ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                          Enregistrer
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Status update */}
                  <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-3">
                    <p className="text-xs text-gray-400 flex-shrink-0">Statut :</p>
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={e => updateStatus(order, e.target.value)}
                      className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-rose-200 text-gray-600 disabled:opacity-50"
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                      ))}
                    </select>
                    {updatingId === order.id && <Loader2 className="w-4 h-4 animate-spin text-gray-400 flex-shrink-0" />}
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
                    {(order.status === "confirmed" || order.status === "shipped") && order.payment_status !== "paid" && (
                      <button
                        onClick={() => sendPaymentReminder(order)}
                        disabled={sendingPaymentReminder === order.id}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition font-medium disabled:opacity-50"
                      >
                        {sendingPaymentReminder === order.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <AlertCircle className="w-3.5 h-3.5" />}
                        Rappel paiement
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
    </AdminGuard>
  );
}