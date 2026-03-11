import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import AdminGuard from "@/components/admin/AdminGuard";
import {
  ChevronLeft, Loader2, FileText, Plus, Trash2, Send, Download, Eye,
  X, CheckCircle2, Clock, XCircle, Edit3, Search, Package
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { generateQuotePDF, getQuoteEmailBody, computeQuoteTotals } from "@/components/admin/quoteUtils";

const STATUS_CONFIG = {
  draft:    { label: "Brouillon",  className: "bg-gray-100 text-gray-600",   icon: Edit3 },
  sent:     { label: "Envoyé",     className: "bg-blue-100 text-blue-600",   icon: Send },
  accepted: { label: "Accepté",    className: "bg-green-100 text-green-700", icon: CheckCircle2 },
  refused:  { label: "Refusé",     className: "bg-red-100 text-red-600",     icon: XCircle },
  expired:  { label: "Expiré",     className: "bg-amber-100 text-amber-700", icon: Clock },
};

function QuoteForm({ quote, products, onSave, onCancel }) {
  const blankItem = () => ({ product_id: "", product_name: "", description: "", quantity: 1, unit_price_ht: 0, options: "" });
  const blankLine = () => ({ label: "", quantity: 1, unit_price_ht: 0 });

  const [form, setForm] = useState(quote ? { ...quote } : {
    customer_name: "", customer_email: "", customer_phone: "", customer_address: "",
    event_date: "", event_type: "",
    items: [blankItem()],
    custom_lines: [],
    tva_rate: 20, discount_percent: 0,
    notes: "", validity_days: 30, status: "draft",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const setItem = (idx, k, v) => setForm(f => {
    const items = [...(f.items || [])];
    items[idx] = { ...items[idx], [k]: v };
    return { ...f, items };
  });

  const setLine = (idx, k, v) => setForm(f => {
    const lines = [...(f.custom_lines || [])];
    lines[idx] = { ...lines[idx], [k]: v };
    return { ...f, custom_lines: lines };
  });

  const pickProduct = (idx, productId) => {
    const p = products.find(p => p.id === productId);
    if (p) setForm(f => {
      const items = [...(f.items || [])];
      items[idx] = { ...items[idx], product_id: p.id, product_name: p.name, description: p.description || "", unit_price_ht: parseFloat(((p.price || 0) / 1.2).toFixed(2)) };
      return { ...f, items };
    });
  };

  const handleSave = async () => {
    if (!form.customer_name.trim() || !form.customer_email.trim()) {
      toast.error("Nom et email client requis"); return;
    }
    setSaving(true);
    const quoteNumber = quote?.quote_number || `DEV-${Date.now().toString().slice(-8)}`;
    if (quote?.id) {
      await base44.entities.Quote.update(quote.id, { ...form, quote_number: quoteNumber });
    } else {
      await base44.entities.Quote.create({ ...form, quote_number: quoteNumber });
    }
    toast.success(quote ? "Devis mis à jour ✓" : "Devis créé ✓");
    setSaving(false);
    onSave();
  };

  const { totalHT, discountAmt, tvaAmt, totalTTC } = computeQuoteTotals(form);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={onCancel} className="p-2 rounded-xl hover:bg-gray-50 transition">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="font-bold text-gray-800">{quote ? "Modifier le devis" : "Nouveau devis"}</h1>
          </div>
          <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-purple-500 hover:bg-purple-600 text-white">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
            Enregistrer
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-5">
        {/* Client info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <h2 className="font-bold text-gray-700 text-sm mb-1">Informations client</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-400 mb-1 block">Nom *</label><Input value={form.customer_name} onChange={e => set("customer_name", e.target.value)} placeholder="Prénom Nom" className="rounded-xl" /></div>
            <div><label className="text-xs text-gray-400 mb-1 block">Email *</label><Input type="email" value={form.customer_email} onChange={e => set("customer_email", e.target.value)} placeholder="email@exemple.fr" className="rounded-xl" /></div>
            <div><label className="text-xs text-gray-400 mb-1 block">Téléphone</label><Input value={form.customer_phone} onChange={e => set("customer_phone", e.target.value)} placeholder="06 xx xx xx xx" className="rounded-xl" /></div>
            <div><label className="text-xs text-gray-400 mb-1 block">Type d'événement</label><Input value={form.event_type} onChange={e => set("event_type", e.target.value)} placeholder="Mariage, anniversaire…" className="rounded-xl" /></div>
            <div><label className="text-xs text-gray-400 mb-1 block">Date de l'événement</label><input type="date" value={form.event_date} onChange={e => set("event_date", e.target.value)} className="w-full text-sm border border-input rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring" /></div>
            <div><label className="text-xs text-gray-400 mb-1 block">Validité (jours)</label><Input type="number" value={form.validity_days} onChange={e => set("validity_days", Number(e.target.value))} className="rounded-xl" /></div>
          </div>
          <div><label className="text-xs text-gray-400 mb-1 block">Adresse de livraison</label><textarea rows={2} value={form.customer_address} onChange={e => set("customer_address", e.target.value)} placeholder="Adresse complète…" className="w-full text-sm border border-input rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring" /></div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <h2 className="font-bold text-gray-700 text-sm">Produits du catalogue</h2>
          {(form.items || []).map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-start p-3 rounded-xl bg-gray-50">
              <div className="col-span-12 md:col-span-5">
                <label className="text-xs text-gray-400 mb-1 block">Produit</label>
                <select
                  value={item.product_id || ""}
                  onChange={e => { if (e.target.value) pickProduct(idx, e.target.value); else setItem(idx, "product_id", ""); }}
                  className="w-full text-sm border border-input rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-ring mb-1"
                >
                  <option value="">— Sélectionner ou saisir —</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({((p.price || 0) / 1.2).toFixed(2)} € HT)</option>)}
                </select>
                <Input value={item.product_name} onChange={e => setItem(idx, "product_name", e.target.value)} placeholder="Nom libre" className="rounded-xl text-xs" />
              </div>
              <div className="col-span-4 md:col-span-2">
                <label className="text-xs text-gray-400 mb-1 block">Qté</label>
                <Input type="number" min="1" value={item.quantity} onChange={e => setItem(idx, "quantity", Number(e.target.value))} className="rounded-xl" />
              </div>
              <div className="col-span-5 md:col-span-2">
                <label className="text-xs text-gray-400 mb-1 block">P.U. HT (€)</label>
                <Input type="number" step="0.01" value={item.unit_price_ht} onChange={e => setItem(idx, "unit_price_ht", Number(e.target.value))} className="rounded-xl" />
              </div>
              <div className="col-span-10 md:col-span-2">
                <label className="text-xs text-gray-400 mb-1 block">Options</label>
                <Input value={item.options} onChange={e => setItem(idx, "options", e.target.value)} placeholder="Ruban, texte…" className="rounded-xl text-xs" />
              </div>
              <div className="col-span-2 md:col-span-1 flex items-end justify-end pb-0.5">
                <button onClick={() => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))} className="p-2 text-gray-300 hover:text-red-400 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="col-span-12 text-right">
                <span className="text-xs font-bold text-purple-600">{((item.unit_price_ht || 0) * (item.quantity || 1)).toFixed(2)} € HT</span>
              </div>
            </div>
          ))}
          <button onClick={() => setForm(f => ({ ...f, items: [...(f.items || []), blankItem()] }))}
            className="w-full flex items-center justify-center gap-2 text-xs text-purple-600 font-semibold py-2 rounded-xl border border-dashed border-purple-200 hover:bg-purple-50 transition">
            <Plus className="w-3.5 h-3.5" /> Ajouter un produit
          </button>
        </div>

        {/* Custom lines */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <h2 className="font-bold text-gray-700 text-sm">Prestations personnalisées</h2>
          {(form.custom_lines || []).map((line, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-end p-3 rounded-xl bg-rose-50">
              <div className="col-span-12 md:col-span-5">
                <label className="text-xs text-gray-400 mb-1 block">Libellé</label>
                <Input value={line.label} onChange={e => setLine(idx, "label", e.target.value)} placeholder="Livraison express, montage…" className="rounded-xl" />
              </div>
              <div className="col-span-4 md:col-span-2">
                <label className="text-xs text-gray-400 mb-1 block">Qté</label>
                <Input type="number" min="1" value={line.quantity} onChange={e => setLine(idx, "quantity", Number(e.target.value))} className="rounded-xl" />
              </div>
              <div className="col-span-5 md:col-span-3">
                <label className="text-xs text-gray-400 mb-1 block">P.U. HT (€)</label>
                <Input type="number" step="0.01" value={line.unit_price_ht} onChange={e => setLine(idx, "unit_price_ht", Number(e.target.value))} className="rounded-xl" />
              </div>
              <div className="col-span-10 md:col-span-1 text-right">
                <span className="text-xs font-bold text-rose-500">{((line.unit_price_ht || 0) * (line.quantity || 1)).toFixed(2)} €</span>
              </div>
              <div className="col-span-2 md:col-span-1 flex justify-end">
                <button onClick={() => setForm(f => ({ ...f, custom_lines: f.custom_lines.filter((_, i) => i !== idx) }))} className="p-2 text-gray-300 hover:text-red-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <button onClick={() => setForm(f => ({ ...f, custom_lines: [...(f.custom_lines || []), blankLine()] }))}
            className="w-full flex items-center justify-center gap-2 text-xs text-rose-500 font-semibold py-2 rounded-xl border border-dashed border-rose-200 hover:bg-rose-50 transition">
            <Plus className="w-3.5 h-3.5" /> Ajouter une ligne personnalisée
          </button>
        </div>

        {/* Totals & options */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-700 text-sm mb-3">Récapitulatif & options</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <div><label className="text-xs text-gray-400 mb-1 block">TVA (%)</label><Input type="number" value={form.tva_rate} onChange={e => set("tva_rate", Number(e.target.value))} className="rounded-xl" /></div>
            <div><label className="text-xs text-gray-400 mb-1 block">Remise (%)</label><Input type="number" value={form.discount_percent} onChange={e => set("discount_percent", Number(e.target.value))} className="rounded-xl" /></div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500"><span>Sous-total HT</span><span>{totalHT.toFixed(2)} €</span></div>
            {discountAmt > 0 && <div className="flex justify-between text-rose-500"><span>Remise ({form.discount_percent}%)</span><span>- {discountAmt.toFixed(2)} €</span></div>}
            <div className="flex justify-between text-gray-500"><span>TVA ({form.tva_rate}%)</span><span>{tvaAmt.toFixed(2)} €</span></div>
            <div className="flex justify-between font-bold text-purple-700 text-base pt-1 border-t border-purple-100">
              <span>Total TTC</span><span>{totalTTC.toFixed(2)} €</span>
            </div>
          </div>
          <div className="mt-3"><label className="text-xs text-gray-400 mb-1 block">Notes (conditions, remarques…)</label>
            <textarea rows={3} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Conditions de paiement, remarques particulières…" className="w-full text-sm border border-input rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // list | form
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(null);

  const loadData = async () => {
    const [q, p] = await Promise.all([
      base44.entities.Quote.list("-created_date"),
      base44.entities.Product.filter({ active: true }),
    ]);
    setQuotes(q || []);
    setProducts(p || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const deleteQuote = async (quote) => {
    if (!confirm(`Supprimer le devis ${quote.quote_number} ?`)) return;
    await base44.entities.Quote.delete(quote.id);
    toast.success("Devis supprimé");
    loadData();
  };

  const downloadPDF = (quote) => {
    const doc = generateQuotePDF(quote);
    doc.save(`Devis-${quote.quote_number}.pdf`);
  };

  const sendByEmail = async (quote) => {
    setSending(quote.id);
    await base44.integrations.Core.SendEmail({
      to: quote.customer_email,
      subject: `🌸 Votre devis Fleurs en fête — ${quote.quote_number}`,
      body: getQuoteEmailBody(quote),
    });
    await base44.entities.Quote.update(quote.id, { status: "sent", email_sent: true });
    toast.success(`Devis envoyé à ${quote.customer_email} 📧`);
    setSending(null);
    loadData();
  };

  const updateStatus = async (quote, status) => {
    await base44.entities.Quote.update(quote.id, { status });
    toast.success("Statut mis à jour");
    loadData();
  };

  if (view === "form") return (
    <QuoteForm
      quote={editing}
      products={products}
      onSave={() => { setView("list"); setEditing(null); loadData(); }}
      onCancel={() => { setView("list"); setEditing(null); }}
    />
  );

  const filtered = quotes.filter(q => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return q.customer_name?.toLowerCase().includes(s) || q.customer_email?.toLowerCase().includes(s) || q.quote_number?.toLowerCase().includes(s);
  });

  const totalSent = quotes.filter(q => q.status === "accepted").reduce((s, q) => s + (computeQuoteTotals(q).totalTTC), 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
      <Loader2 className="w-8 h-8 animate-spin text-rose-300" />
    </div>
  );

  return (
    <AdminGuard allowedRoles={["admin", "manager"]}>
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <a href={createPageUrl("AdminDashboard")} className="p-2 rounded-xl hover:bg-gray-50 transition">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </a>
            <FileText className="w-5 h-5 text-purple-400" />
            <h1 className="font-bold text-gray-800">Devis</h1>
          </div>
          <Button onClick={() => { setEditing(null); setView("form"); }} className="rounded-xl bg-purple-500 hover:bg-purple-600 text-white">
            <Plus className="w-4 h-4 mr-1" /> Nouveau devis
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {/* KPI */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-purple-50 text-purple-700">📄 {quotes.length} devis</span>
          <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-green-50 text-green-700">✅ {quotes.filter(q => q.status === "accepted").length} accepté{quotes.filter(q => q.status === "accepted").length > 1 ? "s" : ""}</span>
          <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700">💶 {totalSent.toFixed(2)} € CA accepté</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par client ou numéro…" className="pl-9 rounded-xl" />
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-600 mb-1">Aucun devis</h2>
            <p className="text-sm text-gray-400">Créez votre premier devis pour un client.</p>
            <Button onClick={() => setView("form")} className="mt-4 rounded-xl bg-purple-500 hover:bg-purple-600 text-white">
              <Plus className="w-4 h-4 mr-1" /> Créer un devis
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(quote => {
              const sc = STATUS_CONFIG[quote.status] || STATUS_CONFIG.draft;
              const { totalTTC } = computeQuoteTotals(quote);
              const StatusIcon = sc.icon;
              return (
                <div key={quote.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold text-gray-800">{quote.customer_name}</p>
                        <Badge className={sc.className + " text-xs flex items-center gap-1"}>
                          <StatusIcon className="w-3 h-3" /> {sc.label}
                        </Badge>
                        {quote.email_sent && <span className="text-xs bg-blue-50 text-blue-500 rounded-full px-2 py-0.5">Email envoyé</span>}
                      </div>
                      <p className="text-xs text-gray-400">{quote.customer_email}</p>
                      <p className="text-xs text-gray-400 font-mono">{quote.quote_number}</p>
                      {quote.event_date && <p className="text-xs text-gray-500 mt-1">📅 {new Date(quote.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-purple-600 text-lg">{totalTTC.toFixed(2)} €</p>
                      <p className="text-xs text-gray-400">TTC</p>
                    </div>
                  </div>

                  {/* Products summary */}
                  {(quote.items || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {quote.items.map((it, i) => (
                        <span key={i} className="text-xs bg-purple-50 text-purple-700 rounded-full px-2.5 py-1">
                          🌸 {it.product_name} × {it.quantity}
                        </span>
                      ))}
                      {(quote.custom_lines || []).map((l, i) => (
                        <span key={i} className="text-xs bg-rose-50 text-rose-600 rounded-full px-2.5 py-1">
                          ✏️ {l.label}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-50">
                    <button onClick={() => { setEditing(quote); setView("form"); }}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition font-medium">
                      <Edit3 className="w-3.5 h-3.5" /> Modifier
                    </button>
                    <button onClick={() => downloadPDF(quote)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-purple-200 text-purple-600 bg-purple-50 hover:bg-purple-100 transition font-medium">
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                    <button onClick={() => sendByEmail(quote)} disabled={sending === quote.id}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 transition font-medium disabled:opacity-50">
                      {sending === quote.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Envoyer par email
                    </button>
                    {quote.status === "sent" && (
                      <>
                        <button onClick={() => updateStatus(quote, "accepted")}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-green-200 text-green-600 bg-green-50 hover:bg-green-100 transition font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accepté
                        </button>
                        <button onClick={() => updateStatus(quote, "refused")}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-red-200 text-red-500 bg-red-50 hover:bg-red-100 transition font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Refusé
                        </button>
                      </>
                    )}
                    <button onClick={() => deleteQuote(quote)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-gray-100 text-gray-400 hover:text-red-400 hover:border-red-100 transition font-medium ml-auto">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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