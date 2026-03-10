import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, X, History } from "lucide-react";
import { toast } from "sonner";

export default function VendorPaymentHistory({ vendor, contractAmount, onTotalChange, onClose }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ label: "", amount: "", payment_date: new Date().toISOString().slice(0, 10), notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, [vendor.id]);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.VendorPayment.filter({ vendor_id: vendor.id }, "-payment_date");
    setPayments(data || []);
    setLoading(false);
  };

  const totalPaid = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const remaining = (contractAmount || 0) - totalPaid;
  const paidPct = contractAmount ? Math.min(Math.round((totalPaid / contractAmount) * 100), 100) : 0;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.payment_date) return;
    setSaving(true);
    await base44.entities.VendorPayment.create({
      vendor_id: vendor.id,
      amount: parseFloat(form.amount),
      payment_date: form.payment_date,
      label: form.label || "Acompte",
      notes: form.notes,
    });
    // Update deposit_paid on vendor
    const newTotal = totalPaid + parseFloat(form.amount);
    await base44.entities.Vendor.update(vendor.id, { deposit_paid: newTotal });
    onTotalChange(vendor.id, newTotal);
    setForm({ label: "", amount: "", payment_date: new Date().toISOString().slice(0, 10), notes: "" });
    toast.success("Paiement ajouté");
    await load();
    setSaving(false);
  };

  const handleDelete = async (payment) => {
    if (!confirm("Supprimer ce paiement ?")) return;
    await base44.entities.VendorPayment.delete(payment.id);
    const newTotal = totalPaid - (payment.amount || 0);
    await base44.entities.Vendor.update(vendor.id, { deposit_paid: Math.max(newTotal, 0) });
    onTotalChange(vendor.id, Math.max(newTotal, 0));
    toast.success("Paiement supprimé");
    await load();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-rose-400" />
            <div>
              <h2 className="font-semibold text-gray-800">{vendor.name}</h2>
              <p className="text-xs text-gray-400">Historique des paiements</p>
            </div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        {/* Summary */}
        <div className="px-5 pt-4 pb-3 border-b border-gray-50">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Versé : <strong className="text-green-600">{totalPaid.toLocaleString("fr-FR")} €</strong></span>
            {contractAmount > 0 && (
              <span className="text-gray-500">
                Reste : <strong className={remaining > 0 ? "text-orange-500" : "text-green-600"}>
                  {remaining > 0 ? `${remaining.toLocaleString("fr-FR")} €` : "✓ Soldé"}
                </strong>
              </span>
            )}
          </div>
          {contractAmount > 0 && (
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div className="bg-green-400 h-2.5 rounded-full transition-all" style={{ width: `${paidPct}%` }} />
            </div>
          )}
        </div>

        {/* Payment list */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
          {loading ? (
            <p className="text-center text-gray-400 py-6 text-sm">Chargement…</p>
          ) : payments.length === 0 ? (
            <p className="text-center text-gray-400 py-6 text-sm">Aucun paiement enregistré</p>
          ) : (
            payments.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.label || "Acompte"}</p>
                  <p className="text-xs text-gray-400">{new Date(p.payment_date).toLocaleDateString("fr-FR")}{p.notes ? ` — ${p.notes}` : ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-green-600">{Number(p.amount).toLocaleString("fr-FR")} €</span>
                  <button onClick={() => handleDelete(p)} className="text-gray-300 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add form */}
        <form onSubmit={handleAdd} className="border-t border-gray-100 p-5 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ajouter un paiement</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Libellé</label>
              <Input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="Acompte 1, Solde…" className="rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Montant (€) *</label>
              <Input required type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" className="rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Date *</label>
              <Input required type="date" value={form.payment_date} onChange={e => setForm({ ...form, payment_date: e.target.value })} className="rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Note</label>
              <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optionnel" className="rounded-xl text-sm" />
            </div>
          </div>
          <Button type="submit" disabled={saving} className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-xl gap-2">
            <Plus className="w-4 h-4" /> {saving ? "Enregistrement…" : "Ajouter ce paiement"}
          </Button>
        </form>
      </div>
    </div>
  );
}