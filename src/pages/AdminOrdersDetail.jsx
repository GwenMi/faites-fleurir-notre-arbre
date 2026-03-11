import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ChevronLeft, Loader2, Mail, FileText, Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { generateInvoicePDF } from "@/components/admin/invoiceUtils";
import AdminGuard from "@/components/admin/AdminGuard";

const STATUS_CONFIG = {
  pending:   { label: "En attente",  color: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Confirmée",   color: "bg-blue-100 text-blue-700" },
  shipped:   { label: "Expédiée",    color: "bg-purple-100 text-purple-700" },
  delivered: { label: "Livrée",      color: "bg-green-100 text-green-700" },
  cancelled: { label: "Annulée",     color: "bg-red-100 text-red-700" },
};

const PAYMENT_CONFIG = {
  unpaid:  { label: "Non réglée",   color: "bg-red-100 text-red-700" },
  partial: { label: "Acompte reçu", color: "bg-amber-100 text-amber-700" },
  paid:    { label: "Réglée",       color: "bg-green-100 text-green-700" },
};

export default function AdminOrdersDetail() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("id");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState([]);
  const [editStatus, setEditStatus] = useState(null);
  const [editPayment, setEditPayment] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    const result = await base44.entities.Order.filter({ id: orderId }, "-created_date", 1);
    if (result?.length) {
      setOrder(result[0]);
      buildTimeline(result[0]);
    }
    setLoading(false);
  };

  const buildTimeline = (order) => {
    const events = [];
    events.push({
      type: "create", label: "Commande créée", date: order.created_date, icon: "📦",
      details: `${order.customer_name} — ${order.product_name} x ${order.quantity}`
    });
    if (order.payment_status === "paid") {
      events.push({ type: "payment_full", label: "Paiement intégral reçu", date: order.created_date, icon: "💳", details: `${order.total_price?.toFixed(2)} € via Stripe`, status: "done" });
    } else if (order.payment_status === "partial") {
      events.push({ type: "payment_partial", label: "Acompte reçu", date: order.created_date, icon: "💵", details: `${order.deposit_amount?.toFixed(2)} €`, status: "done" });
    }
    if (order.invoice_email_sent && order.invoice_sent_date) {
      events.push({ type: "invoice_sent", label: "Facture envoyée", date: order.invoice_sent_date, icon: "📧", details: `Envoyée à ${order.customer_email}`, status: "done" });
    }
    if (order.tracking_number) {
      events.push({ type: "shipped", label: "Colis expédié", date: order.created_date, icon: "📦", details: `${order.tracking_carrier} - ${order.tracking_number}`, status: order.status === "shipped" || order.status === "delivered" ? "done" : "pending" });
    }
    if (order.status === "delivered") {
      events.push({ type: "delivered", label: "Colis livré", date: order.created_date, icon: "✅", details: "Livraison confirmée", status: "done" });
    }
    setTimeline(events.sort((a, b) => new Date(a.date) - new Date(b.date)));
  };

  const updateStatus = async (newStatus) => {
    setSaving(true);
    await base44.entities.Order.update(order.id, { status: newStatus });
    const updated = await base44.entities.Order.filter({ id: order.id }, "-created_date", 1);
    if (updated?.length) { setOrder(updated[0]); buildTimeline(updated[0]); }
    toast.success("Statut mis à jour ✓");
    setSaving(false);
    setEditStatus(null);
  };

  const updatePayment = async () => {
    setSaving(true);
    await base44.entities.Order.update(order.id, editPayment);
    if ((editPayment.payment_status === "paid" || editPayment.payment_status === "partial") && order.payment_status !== editPayment.payment_status) {
      await sendInvoiceEmail(order, editPayment.payment_status, editPayment.deposit_amount);
    }
    const updated = await base44.entities.Order.filter({ id: order.id }, "-created_date", 1);
    if (updated?.length) { setOrder(updated[0]); buildTimeline(updated[0]); }
    toast.success("Encaissement mis à jour ✓");
    setSaving(false);
    setEditPayment(null);
  };

  const downloadInvoice = async () => {
    const doc = await generateInvoicePDF(order);
    doc.save(`Facture-${(order.id || "").slice(-8).toUpperCase()}.pdf`);
  };

  const sendInvoiceEmail = async (orderData, paymentStatus, depositAmount) => {
    const amount = paymentStatus === "paid"
      ? orderData.total_price.toFixed(2)
      : `${(depositAmount || 0).toFixed(2)} € (solde: ${(orderData.total_price - (depositAmount || 0)).toFixed(2)} €)`;

    await base44.integrations.Core.SendEmail({
      to: orderData.customer_email,
      subject: `Votre facture - Commande #${orderData.id.slice(-8).toUpperCase()}`,
      body: `Bonjour ${orderData.customer_name},\n\nVoici votre facture:\n\nCommande: #${orderData.id.slice(-8).toUpperCase()}\nProduit: ${orderData.product_name}\nQuantité: ${orderData.quantity}\nMontant total: ${orderData.total_price.toFixed(2)} €\nStatut paiement: ${paymentStatus === "paid" ? "Payé" : "Acompte reçu"}\nMontant reçu: ${amount}\n\nMerci de votre confiance!\n\nFleurs en fête`
    });

    await base44.entities.Order.update(orderData.id, { invoice_email_sent: true, invoice_sent_date: new Date().toISOString() });
    const updated = await base44.entities.Order.filter({ id: orderData.id }, "-created_date", 1);
    if (updated?.length) { setOrder(updated[0]); buildTimeline(updated[0]); }
    toast.success("Facture envoyée ✓");
  };

  const statusCfg = order ? (STATUS_CONFIG[order.status] || STATUS_CONFIG.pending) : STATUS_CONFIG.pending;
  const paymentCfg = order ? (PAYMENT_CONFIG[order.payment_status] || PAYMENT_CONFIG.unpaid) : PAYMENT_CONFIG.unpaid;

  return (
    <AdminGuard allowedRoles={["admin", "manager"]}>
      {loading ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : !order ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500">Commande non trouvée</p>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <a href={createPageUrl("AdminOrders")} className="p-2 rounded-lg hover:bg-gray-100">
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </a>
                <div>
                  <h1 className="text-lg font-bold text-gray-800">{order.customer_name}</h1>
                  <p className="text-xs text-gray-500">{order.customer_email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
                <Badge className={paymentCfg.color}>{paymentCfg.label}</Badge>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-500 font-semibold mb-1">PRODUIT</p>
                <p className="font-bold text-gray-800">{order.product_name}</p>
                <p className="text-sm text-gray-500 mt-2">Quantité: {order.quantity}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-500 font-semibold mb-1">TOTAL</p>
                <p className="text-2xl font-bold text-rose-600">{order.total_price?.toFixed(2)}€</p>
                <p className="text-xs text-gray-500 mt-2">Créée le {new Date(order.created_date).toLocaleDateString("fr-FR")}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-500 font-semibold mb-1">ÉVÉNEMENT</p>
                <p className="font-bold text-gray-800">
                  {order.options_selected?.event_date
                    ? new Date(order.options_selected.event_date).toLocaleDateString("fr-FR", { month: "long", day: "numeric", year: "numeric" })
                    : "—"}
                </p>
                {order.options_selected?.site_public_url && (
                  <a href={order.options_selected.site_public_url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline mt-2">
                    Voir l'espace →
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Statut Commande</h2>
                    {!editStatus && <button onClick={() => setEditStatus(true)} className="text-indigo-600 hover:text-indigo-700"><Edit2 className="w-4 h-4" /></button>}
                  </div>
                  {editStatus ? (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                        <button key={key} onClick={() => updateStatus(key)} disabled={saving}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${order.status === key ? cfg.color : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                          {cfg.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${statusCfg.color.split(" ")[0]}`}></div>
                      <p className="font-semibold text-gray-800">{statusCfg.label}</p>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Encaissement</h2>
                    {!editPayment && <button onClick={() => setEditPayment({ payment_status: order.payment_status, deposit_amount: order.deposit_amount || 0 })} className="text-indigo-600 hover:text-indigo-700"><Edit2 className="w-4 h-4" /></button>}
                  </div>
                  {editPayment ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">Statut</label>
                        <select value={editPayment.payment_status} onChange={e => setEditPayment({ ...editPayment, payment_status: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                          <option value="unpaid">Non réglée</option>
                          <option value="partial">Acompte reçu</option>
                          <option value="paid">Réglée</option>
                        </select>
                      </div>
                      {editPayment.payment_status === "partial" && (
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-2">Montant acompte (€)</label>
                          <Input type="number" step="0.01" value={editPayment.deposit_amount} onChange={e => setEditPayment({ ...editPayment, deposit_amount: parseFloat(e.target.value) })} />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button onClick={updatePayment} disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                          Enregistrer
                        </Button>
                        <Button onClick={() => setEditPayment(null)} variant="outline" className="flex-1">Annuler</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${paymentCfg.color}`}>{paymentCfg.label}</div>
                      {order.payment_status === "partial" && (
                        <p className="text-sm text-gray-600 mt-2">
                          Acompte: <strong>{(order.deposit_amount || 0).toFixed(2)}€</strong> | Solde: <strong>{(order.total_price - (order.deposit_amount || 0)).toFixed(2)}€</strong>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h2 className="text-lg font-bold text-gray-800 mb-6">Historique</h2>
                  <div className="space-y-6">
                    {timeline.map((event, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${event.status === "done" ? "bg-green-100" : "bg-gray-100"}`}>
                            {event.icon}
                          </div>
                          {i < timeline.length - 1 && <div className="w-0.5 h-12 bg-gray-200 mt-2" />}
                        </div>
                        <div className="pt-1">
                          <p className="font-semibold text-gray-800">{event.label}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(event.date).toLocaleDateString("fr-FR")}</p>
                          <p className="text-sm text-gray-600 mt-1">{event.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-800">Documents</h3>
                    {order.invoice_email_sent && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Envoyée</span>}
                  </div>
                  <div className="space-y-2">
                    <Button onClick={downloadInvoice} variant="outline" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" /> Télécharger facture
                    </Button>
                    {(order.payment_status === "paid" || order.payment_status === "partial") && (
                      <Button onClick={() => sendInvoiceEmail(order, order.payment_status, order.deposit_amount)} variant="outline" className="w-full justify-start">
                        <Mail className="w-4 h-4 mr-2" /> Renvoyer facture
                      </Button>
                    )}
                  </div>
                </div>

                {order.options_selected?.delivery_address && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-3">Adresse</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{order.options_selected.delivery_address}</p>
                  </div>
                )}

                {Object.keys(order.options_selected || {}).length > 0 && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-3">Options</h3>
                    <div className="space-y-2 text-sm">
                      {order.options_selected?.pot_type && <p>Pot: {order.options_selected.pot_type}</p>}
                      {order.options_selected?.ribbon_color && <p>Ruban: {order.options_selected.ribbon_color}</p>}
                      {order.options_selected?.seed_type && <p>Graines: {order.options_selected.seed_type}</p>}
                      {order.options_selected?.custom_text && <p>{order.options_selected.custom_text}</p>}
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-3">Contact</h3>
                  <p className="text-sm text-gray-600 mb-3">{order.customer_email}</p>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="w-4 h-4 mr-2" /> Envoyer email
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminGuard>
  );
}