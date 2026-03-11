import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  ChevronLeft, Plus, Loader2, RefreshCw, Package, FileText,
  Pencil, Trash2, X, Check, ChevronDown, ChevronUp, Upload, ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import AdminGuard from "@/components/admin/AdminGuard";

const ORDER_STATUS = {
  draft:     { label: "Brouillon",       className: "bg-gray-100 text-gray-600" },
  ordered:   { label: "Commandé",        className: "bg-blue-100 text-blue-700" },
  partial:   { label: "Partiel reçu",    className: "bg-amber-100 text-amber-700" },
  received:  { label: "Reçu",            className: "bg-green-100 text-green-700" },
  cancelled: { label: "Annulé",          className: "bg-red-100 text-red-700" },
};

const INVOICE_STATUS = {
  unpaid:   { label: "Non payée",   className: "bg-amber-100 text-amber-700" },
  paid:     { label: "Payée",       className: "bg-green-100 text-green-700" },
  overdue:  { label: "En retard",   className: "bg-red-100 text-red-700" },
  disputed: { label: "Litige",      className: "bg-purple-100 text-purple-700" },
};

const emptyOrder = {
  supplier_name: "", product_description: "", reference: "",
  quantity: 1, unit_price: "", total_price: "",
  order_date: new Date().toISOString().slice(0, 10),
  expected_delivery_date: "", received_date: "",
  status: "draft", notes: ""
};

const emptyInvoice = {
  supplier_order_id: "", invoice_number: "", supplier_name: "",
  amount_ht: "", tva_rate: 20, amount_ttc: "",
  invoice_date: new Date().toISOString().slice(0, 10),
  due_date: "", status: "unpaid", file_url: "", notes: ""
};

export default function SupplierOrders() {
  const [tab, setTab] = useState("orders"); // orders | invoices
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [orderForm, setOrderForm] = useState(emptyOrder);
  const [invoiceForm, setInvoiceForm] = useState(emptyInvoice);
  const [saving, setSaving] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    const [o, i] = await Promise.all([
      base44.entities.SupplierOrder.list("-order_date"),
      base44.entities.SupplierInvoice.list("-invoice_date"),
    ]);
    setOrders(o || []);
    setInvoices(i || []);
    setLoading(false);
  };

  /* ---- Orders CRUD ---- */
  const openOrderForm = (order = null) => {
    setEditingOrder(order);
    setOrderForm(order ? { ...order } : { ...emptyOrder });
    setShowForm(true);
  };

  const saveOrder = async () => {
    if (!orderForm.supplier_name || !orderForm.product_description) {
      toast.error("Fournisseur et description requis");
      return;
    }
    setSaving(true);
    const data = {
      ...orderForm,
      quantity: Number(orderForm.quantity) || 1,
      unit_price: orderForm.unit_price !== "" ? Number(orderForm.unit_price) : undefined,
      total_price: orderForm.total_price !== "" ? Number(orderForm.total_price) : undefined,
    };
    if (editingOrder) {
      await base44.entities.SupplierOrder.update(editingOrder.id, data);
    } else {
      await base44.entities.SupplierOrder.create(data);
    }
    toast.success("Commande enregistrée ✓");
    setSaving(false);
    setShowForm(false);
    loadAll();
  };

  const deleteOrder = async (id) => {
    if (!confirm("Supprimer cette commande fournisseur ?")) return;
    await base44.entities.SupplierOrder.delete(id);
    toast.success("Commande supprimée");
    loadAll();
  };

  /* ---- Invoices CRUD ---- */
  const openInvoiceForm = (invoice = null, orderId = null) => {
    setEditingInvoice(invoice);
    if (invoice) {
      setInvoiceForm({ ...invoice });
    } else {
      const order = orders.find(o => o.id === orderId);
      setInvoiceForm({
        ...emptyInvoice,
        supplier_order_id: orderId || "",
        supplier_name: order?.supplier_name || "",
      });
    }
    setShowInvoiceForm(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setInvoiceForm(f => ({ ...f, file_url }));
    setUploadingFile(false);
    toast.success("Fichier uploadé ✓");
  };

  const saveInvoice = async () => {
    if (!invoiceForm.invoice_number || !invoiceForm.supplier_name || !invoiceForm.amount_ttc) {
      toast.error("N° facture, fournisseur et montant TTC requis");
      return;
    }
    setSaving(true);
    const data = {
      ...invoiceForm,
      amount_ht: invoiceForm.amount_ht !== "" ? Number(invoiceForm.amount_ht) : undefined,
      tva_rate: Number(invoiceForm.tva_rate) || 20,
      amount_ttc: Number(invoiceForm.amount_ttc),
    };
    if (editingInvoice) {
      await base44.entities.SupplierInvoice.update(editingInvoice.id, data);
    } else {
      await base44.entities.SupplierInvoice.create(data);
    }
    toast.success("Facture enregistrée ✓");
    setSaving(false);
    setShowInvoiceForm(false);
    loadAll();
  };

  const deleteInvoice = async (id) => {
    if (!confirm("Supprimer cette facture ?")) return;
    await base44.entities.SupplierInvoice.delete(id);
    toast.success("Facture supprimée");
    loadAll();
  };

  /* ---- Derived data ---- */
  const filteredOrders = filterStatus === "all" ? orders : orders.filter(o => o.status === filterStatus);

  const totalUnpaid = invoices
    .filter(i => i.status === "unpaid" || i.status === "overdue")
    .reduce((acc, i) => acc + (i.amount_ttc || 0), 0);

  const totalPaid = invoices
    .filter(i => i.status === "paid")
    .reduce((acc, i) => acc + (i.amount_ttc || 0), 0);

  const overdueInvoices = invoices.filter(i => {
    if (i.status === "paid" || i.status === "disputed") return false;
    return i.due_date && new Date(i.due_date) < new Date();
  });

  /* ---- Render ---- */
  return (
    <AdminGuard allowedRoles={["admin", "manager"]}>
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <style>{`
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
      `}</style>

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href={createPageUrl("AdminDashboard")} className="p-2 rounded-xl hover:bg-gray-50 transition">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </a>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-400" />
              <h1 className="font-bold text-gray-800">Achats & Fournisseurs</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={loadAll} className="p-2 rounded-xl hover:bg-gray-50 transition text-gray-400">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => tab === "orders" ? openOrderForm() : openInvoiceForm()}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              {tab === "orders" ? "Commande" : "Facture"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto flex">
          {[["orders", "📦 Commandes"], ["invoices", "🧾 Factures"]].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition ${
                tab === key ? "border-indigo-500 text-indigo-700" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">

        {/* Summary cards */}
        {tab === "invoices" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">À payer</p>
              <p className="text-xl font-bold text-amber-600">{totalUnpaid.toFixed(2)} €</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">Payé (total)</p>
              <p className="text-xl font-bold text-green-600">{totalPaid.toFixed(2)} €</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm col-span-2 sm:col-span-1">
              <p className="text-xs text-gray-400 mb-1">En retard</p>
              <p className="text-xl font-bold text-red-600">{overdueInvoices.length}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-300 mx-auto" />
          </div>
        ) : tab === "orders" ? (

          /* ===== ORDERS TAB ===== */
          <div className="space-y-3">
            {/* Filter */}
            <div className="flex flex-wrap gap-2 items-center">
              <p className="text-sm text-gray-500 font-medium">{filteredOrders.length} commande(s)</p>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none text-gray-600 ml-auto"
              >
                <option value="all">Tous les statuts</option>
                {Object.entries(ORDER_STATUS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucune commande fournisseur</p>
              </div>
            )}

            {filteredOrders.map(order => {
              const sc = ORDER_STATUS[order.status] || ORDER_STATUS.draft;
              const linkedInvoices = invoices.filter(i => i.supplier_order_id === order.id);
              const expanded = expandedOrder === order.id;
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-bold text-gray-800">{order.supplier_name}</p>
                          <Badge className={sc.className + " text-xs"}>{sc.label}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{order.product_description}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                          {order.reference && <span>Réf : <span className="font-mono text-gray-700">{order.reference}</span></span>}
                          <span>Qté : <strong>{order.quantity}</strong></span>
                          {order.unit_price && <span>PU : <strong>{Number(order.unit_price).toFixed(2)} €</strong></span>}
                          {order.total_price && <span className="font-semibold text-indigo-600">Total : {Number(order.total_price).toFixed(2)} €</span>}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-2">
                          {order.order_date && <span>📅 Commandé le {new Date(order.order_date).toLocaleDateString("fr-FR")}</span>}
                          {order.expected_delivery_date && <span>📬 Livraison prévue : {new Date(order.expected_delivery_date).toLocaleDateString("fr-FR")}</span>}
                          {order.received_date && <span>✅ Reçu le {new Date(order.received_date).toLocaleDateString("fr-FR")}</span>}
                        </div>
                        {order.notes && <p className="text-xs text-gray-400 mt-1 italic">{order.notes}</p>}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => openOrderForm(order)} className="p-1.5 text-gray-400 hover:text-indigo-500 transition">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteOrder(order.id)} className="p-1.5 text-gray-400 hover:text-red-400 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Status buttons */}
                    <div className="mt-3 pt-3 border-t border-gray-50">
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(ORDER_STATUS).map(([k, v]) => (
                          <button
                            key={k}
                            onClick={() => base44.entities.SupplierOrder.update(order.id, { status: k }).then(loadAll)}
                            className={`text-xs px-3 py-1 rounded-full border transition ${
                              order.status === k
                                ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                                : "border-gray-200 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Linked invoices */}
                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                      <button
                        onClick={() => setExpandedOrder(expanded ? null : order.id)}
                        className="flex items-center gap-1.5 text-xs text-indigo-500 font-semibold"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        {linkedInvoices.length} facture(s)
                        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => openInvoiceForm(null, order.id)}
                        className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Ajouter une facture
                      </button>
                    </div>

                    {expanded && linkedInvoices.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {linkedInvoices.map(inv => {
                          const is = INVOICE_STATUS[inv.status] || INVOICE_STATUS.unpaid;
                          return (
                            <div key={inv.id} className="bg-indigo-50 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                              <div>
                                <p className="text-xs font-semibold text-indigo-700">{inv.invoice_number}</p>
                                <p className="text-xs text-indigo-500">{Number(inv.amount_ttc).toFixed(2)} € TTC · {new Date(inv.invoice_date).toLocaleDateString("fr-FR")}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={is.className + " text-xs"}>{is.label}</Badge>
                                {inv.file_url && (
                                  <a href={inv.file_url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-600">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
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
            })}
          </div>

        ) : (

          /* ===== INVOICES TAB ===== */
          <div className="space-y-3">
            <p className="text-sm text-gray-500 font-medium">{invoices.length} facture(s)</p>

            {invoices.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucune facture enregistrée</p>
              </div>
            )}

            {invoices.map(inv => {
              const is = INVOICE_STATUS[inv.status] || INVOICE_STATUS.unpaid;
              const isOverdue = inv.due_date && inv.status !== "paid" && new Date(inv.due_date) < new Date();
              return (
                <div key={inv.id} className={`bg-white rounded-2xl border shadow-sm p-4 ${isOverdue ? "border-red-200" : "border-gray-100"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold text-gray-800">{inv.invoice_number}</p>
                        <Badge className={is.className + " text-xs"}>{is.label}</Badge>
                        {isOverdue && <Badge className="bg-red-100 text-red-600 text-xs">⚠ En retard</Badge>}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{inv.supplier_name}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        {inv.amount_ht && <span>HT : {Number(inv.amount_ht).toFixed(2)} €</span>}
                        {inv.tva_rate && <span>TVA : {inv.tva_rate}%</span>}
                        <span className="font-semibold text-indigo-600">TTC : {Number(inv.amount_ttc).toFixed(2)} €</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-2">
                        <span>📄 Émise le {new Date(inv.invoice_date).toLocaleDateString("fr-FR")}</span>
                        {inv.due_date && <span>⏰ Échéance : {new Date(inv.due_date).toLocaleDateString("fr-FR")}</span>}
                      </div>
                      {inv.notes && <p className="text-xs text-gray-400 mt-1 italic">{inv.notes}</p>}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {inv.file_url && (
                        <a href={inv.file_url} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-indigo-500 transition">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button onClick={() => openInvoiceForm(inv)} className="p-1.5 text-gray-400 hover:text-indigo-500 transition">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteInvoice(inv.id)} className="p-1.5 text-gray-400 hover:text-red-400 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Status buttons */}
                  <div className="mt-3 pt-3 border-t border-gray-50">
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(INVOICE_STATUS).map(([k, v]) => (
                        <button
                          key={k}
                          onClick={() => base44.entities.SupplierInvoice.update(inv.id, { status: k }).then(loadAll)}
                          className={`text-xs px-3 py-1 rounded-full border transition ${
                            inv.status === k
                              ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                              : "border-gray-200 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== ORDER FORM MODAL ===== */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="font-bold text-gray-800">{editingOrder ? "Modifier la commande" : "Nouvelle commande fournisseur"}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-3">
              {[
                ["supplier_name", "Fournisseur *", "text", "Ex : Europlant"],
                ["product_description", "Description du produit *", "text", "Ex : Sachets graines lavande 5g"],
                ["reference", "Référence", "text", "Réf. fournisseur"],
              ].map(([field, label, type, ph]) => (
                <div key={field}>
                  <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                  <Input
                    type={type}
                    placeholder={ph}
                    value={orderForm[field]}
                    onChange={e => setOrderForm(f => ({ ...f, [field]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Quantité</label>
                  <Input type="number" min="1" value={orderForm.quantity}
                    onChange={e => setOrderForm(f => ({ ...f, quantity: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Prix unitaire (€)</label>
                  <Input type="number" step="0.01" placeholder="0.00" value={orderForm.unit_price}
                    onChange={e => setOrderForm(f => ({ ...f, unit_price: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Total (€)</label>
                  <Input type="number" step="0.01" placeholder="0.00" value={orderForm.total_price}
                    onChange={e => setOrderForm(f => ({ ...f, total_price: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Date commande</label>
                  <Input type="date" value={orderForm.order_date}
                    onChange={e => setOrderForm(f => ({ ...f, order_date: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Livraison prévue</label>
                  <Input type="date" value={orderForm.expected_delivery_date}
                    onChange={e => setOrderForm(f => ({ ...f, expected_delivery_date: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Date de réception</label>
                <Input type="date" value={orderForm.received_date}
                  onChange={e => setOrderForm(f => ({ ...f, received_date: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Statut</label>
                <select value={orderForm.status} onChange={e => setOrderForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200">
                  {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Notes</label>
                <textarea value={orderForm.notes} onChange={e => setOrderForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2} placeholder="Informations complémentaires..."
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200" />
              </div>
              <Button onClick={saveOrder} disabled={saving} className="w-full bg-indigo-500 hover:bg-indigo-600 rounded-xl h-11">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ===== INVOICE FORM MODAL ===== */}
      {showInvoiceForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="font-bold text-gray-800">{editingInvoice ? "Modifier la facture" : "Nouvelle facture fournisseur"}</h2>
              <button onClick={() => setShowInvoiceForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">N° de facture *</label>
                <Input placeholder="FAC-2026-001" value={invoiceForm.invoice_number}
                  onChange={e => setInvoiceForm(f => ({ ...f, invoice_number: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Fournisseur *</label>
                <Input placeholder="Nom du fournisseur" value={invoiceForm.supplier_name}
                  onChange={e => setInvoiceForm(f => ({ ...f, supplier_name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Rattacher à une commande</label>
                <select value={invoiceForm.supplier_order_id}
                  onChange={e => setInvoiceForm(f => ({ ...f, supplier_order_id: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200">
                  <option value="">— Aucune —</option>
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>{o.supplier_name} · {o.product_description}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Montant HT (€)</label>
                  <Input type="number" step="0.01" placeholder="0.00" value={invoiceForm.amount_ht}
                    onChange={e => setInvoiceForm(f => ({ ...f, amount_ht: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">TVA (%)</label>
                  <Input type="number" value={invoiceForm.tva_rate}
                    onChange={e => setInvoiceForm(f => ({ ...f, tva_rate: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">TTC (€) *</label>
                  <Input type="number" step="0.01" placeholder="0.00" value={invoiceForm.amount_ttc}
                    onChange={e => setInvoiceForm(f => ({ ...f, amount_ttc: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Date facture</label>
                  <Input type="date" value={invoiceForm.invoice_date}
                    onChange={e => setInvoiceForm(f => ({ ...f, invoice_date: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Date d'échéance</label>
                  <Input type="date" value={invoiceForm.due_date}
                    onChange={e => setInvoiceForm(f => ({ ...f, due_date: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Statut</label>
                <select value={invoiceForm.status} onChange={e => setInvoiceForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200">
                  {Object.entries(INVOICE_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Fichier facture (PDF ou image)</label>
                <div className="flex gap-2">
                  <label className={`flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-indigo-200 rounded-xl px-3 py-2.5 text-xs text-indigo-500 cursor-pointer hover:bg-indigo-50 transition ${uploadingFile ? "opacity-50 pointer-events-none" : ""}`}>
                    {uploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {invoiceForm.file_url ? "Remplacer le fichier" : "Uploader la facture"}
                    <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleFileUpload} />
                  </label>
                  {invoiceForm.file_url && (
                    <a href={invoiceForm.file_url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 px-3 py-2 border border-indigo-200 rounded-xl">
                      <ExternalLink className="w-3.5 h-3.5" /> Voir
                    </a>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Notes</label>
                <textarea value={invoiceForm.notes} onChange={e => setInvoiceForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2} placeholder="Informations complémentaires..."
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200" />
              </div>
              <Button onClick={saveInvoice} disabled={saving} className="w-full bg-indigo-500 hover:bg-indigo-600 rounded-xl h-11">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminGuard>
  );
}