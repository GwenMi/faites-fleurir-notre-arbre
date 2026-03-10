import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Phone, Mail, Globe, FileCheck, AlertCircle, X, ChevronDown, ChevronUp, History } from "lucide-react";
import { toast } from "sonner";
import VendorPaymentHistory from "./VendorPaymentHistory";

const CATEGORIES = [
  { key: "traiteur", label: "Traiteur", emoji: "🍽️" },
  { key: "fleuriste", label: "Fleuriste", emoji: "💐" },
  { key: "photographe", label: "Photographe", emoji: "📸" },
  { key: "videaste", label: "Vidéaste", emoji: "🎬" },
  { key: "musique", label: "Musique / DJ", emoji: "🎵" },
  { key: "salle", label: "Salle / Lieu", emoji: "🏛️" },
  { key: "decoration", label: "Décoration", emoji: "✨" },
  { key: "coiffure_maquillage", label: "Coiffure & Maquillage", emoji: "💄" },
  { key: "transport", label: "Transport", emoji: "🚗" },
  { key: "faire_part", label: "Faire-part", emoji: "💌" },
  { key: "gateau", label: "Gâteau", emoji: "🎂" },
  { key: "autre", label: "Autre", emoji: "📋" },
];

const empty = (event_id) => ({
  event_id,
  category: "autre",
  name: "",
  contact_name: "",
  email: "",
  phone: "",
  website: "",
  contract_amount: "",
  deposit_paid: "",
  next_payment_amount: "",
  next_payment_date: "",
  contract_signed: false,
  notes: "",
});

export default function VendorManager({ event }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty(event.id));
  const [editId, setEditId] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [saving, setSaving] = useState(false);
  const [paymentHistoryVendor, setPaymentHistoryVendor] = useState(null);

  useEffect(() => {
    load();
  }, [event.id]);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Vendor.filter({ event_id: event.id });
    setVendors(data || []);
    setLoading(false);
  };

  const handleEdit = (v) => {
    setForm({ ...v, contract_amount: v.contract_amount ?? "", deposit_paid: v.deposit_paid ?? "", next_payment_amount: v.next_payment_amount ?? "" });
    setEditId(v.id);
    setShowForm(true);
    setExpanded(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce prestataire ?")) return;
    await base44.entities.Vendor.delete(id);
    setVendors(vendors.filter(v => v.id !== id));
    toast.success("Prestataire supprimé");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      contract_amount: parseFloat(form.contract_amount) || 0,
      deposit_paid: parseFloat(form.deposit_paid) || 0,
      next_payment_amount: parseFloat(form.next_payment_amount) || 0,
    };
    if (editId) {
      await base44.entities.Vendor.update(editId, payload);
      toast.success("Prestataire mis à jour");
    } else {
      await base44.entities.Vendor.create(payload);
      toast.success("Prestataire ajouté");
    }
    await load();
    setForm(empty(event.id));
    setEditId(null);
    setShowForm(false);
    setSaving(false);
  };

  const handlePaymentTotalChange = (vendorId, newTotal) => {
    setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, deposit_paid: newTotal } : v));
  };

  const totalContract = vendors.reduce((s, v) => s + (v.contract_amount || 0), 0);
  const totalPaid = vendors.reduce((s, v) => s + (v.deposit_paid || 0), 0);
  const totalRemaining = totalContract - totalPaid;

  const upcoming = vendors
    .filter(v => v.next_payment_date && new Date(v.next_payment_date) >= new Date())
    .sort((a, b) => new Date(a.next_payment_date) - new Date(b.next_payment_date));

  const getCat = (key) => CATEGORIES.find(c => c.key === key) || CATEGORIES[CATEGORIES.length - 1];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total contrats", value: totalContract.toLocaleString("fr-FR") + " €", color: "text-gray-800" },
          { label: "Déjà versé", value: totalPaid.toLocaleString("fr-FR") + " €", color: "text-green-600" },
          { label: "Reste à payer", value: totalRemaining.toLocaleString("fr-FR") + " €", color: "text-orange-500" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming payments */}
      {upcoming.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-amber-700">Prochaines échéances</span>
          </div>
          <div className="space-y-2">
            {upcoming.slice(0, 3).map(v => (
              <div key={v.id} className="flex items-center justify-between text-sm">
                <span className="text-amber-800">{getCat(v.category).emoji} {v.name}</span>
                <span className="text-amber-700 font-semibold">
                  {v.next_payment_amount ? `${Number(v.next_payment_amount).toLocaleString("fr-FR")} €` : "?"} — {new Date(v.next_payment_date).toLocaleDateString("fr-FR")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add button */}
      <div className="flex justify-between items-center">
        <h2 className="font-serif-elegant text-2xl font-bold text-gray-800">Mes prestataires</h2>
        <Button
          onClick={() => { setForm(empty(event.id)); setEditId(null); setShowForm(!showForm); }}
          className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl gap-2"
        >
          <Plus className="w-4 h-4" /> Ajouter
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">{editId ? "Modifier" : "Nouveau prestataire"}</h3>
            <button type="button" onClick={() => setShowForm(false)}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Catégorie *</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              >
                {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Nom du prestataire *</label>
              <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex : Fleurs d'Élise" className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Contact</label>
              <Input value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} placeholder="Nom du contact" className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Téléphone</label>
              <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="06 …" className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Email</label>
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="contact@…" className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Site web</label>
              <Input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://…" className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Montant contrat (€)</label>
              <Input type="number" min="0" value={form.contract_amount} onChange={e => setForm({ ...form, contract_amount: e.target.value })} placeholder="0" className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Acompte versé (€)</label>
              <Input type="number" min="0" value={form.deposit_paid} onChange={e => setForm({ ...form, deposit_paid: e.target.value })} placeholder="0" className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Prochaine échéance (€)</label>
              <Input type="number" min="0" value={form.next_payment_amount} onChange={e => setForm({ ...form, next_payment_amount: e.target.value })} placeholder="0" className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Date de l'échéance</label>
              <Input type="date" value={form.next_payment_date} onChange={e => setForm({ ...form, next_payment_date: e.target.value })} className="rounded-xl" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={2}
              placeholder="Détails, conditions, remarques…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="contract_signed" checked={form.contract_signed} onChange={e => setForm({ ...form, contract_signed: e.target.checked })} className="rounded" />
            <label htmlFor="contract_signed" className="text-sm text-gray-600">Contrat signé</label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving} className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl">
              {saving ? "Enregistrement…" : editId ? "Mettre à jour" : "Ajouter"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Annuler</Button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement…</div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🤝</p>
          <p className="text-sm">Aucun prestataire encore. Commencez par en ajouter un !</p>
        </div>
      ) : (
        <div className="space-y-3">
          {vendors.map(v => {
            const cat = getCat(v.category);
            const remaining = (v.contract_amount || 0) - (v.deposit_paid || 0);
            const isOpen = expanded === v.id;
            const paidPct = v.contract_amount ? Math.round((v.deposit_paid / v.contract_amount) * 100) : 0;
            return (
              <div key={v.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : v.id)}
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-xl flex-shrink-0">
                    {cat.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 truncate">{v.name}</span>
                      {v.contract_signed && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1"><FileCheck className="w-3 h-3" /> Signé</span>}
                    </div>
                    <p className="text-xs text-gray-400">{cat.label}{v.contact_name ? ` — ${v.contact_name}` : ""}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-gray-800">{(v.contract_amount || 0).toLocaleString("fr-FR")} €</p>
                    <p className="text-xs text-gray-400">{remaining > 0 ? `Reste ${remaining.toLocaleString("fr-FR")} €` : "✓ Soldé"}</p>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </div>

                {isOpen && (
                  <div className="border-t border-gray-50 px-4 pb-4 pt-3 space-y-3">
                    {/* Progress bar */}
                    {v.contract_amount > 0 && (
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Versé : {(v.deposit_paid || 0).toLocaleString("fr-FR")} €</span>
                          <span>{paidPct}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-green-400 h-2 rounded-full transition-all" style={{ width: `${Math.min(paidPct, 100)}%` }} />
                        </div>
                      </div>
                    )}

                    {/* Contact info */}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      {v.phone && <a href={`tel:${v.phone}`} className="flex items-center gap-1 hover:text-rose-500"><Phone className="w-3 h-3" />{v.phone}</a>}
                      {v.email && <a href={`mailto:${v.email}`} className="flex items-center gap-1 hover:text-rose-500"><Mail className="w-3 h-3" />{v.email}</a>}
                      {v.website && <a href={v.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-rose-500"><Globe className="w-3 h-3" />Site web</a>}
                    </div>

                    {/* Next payment */}
                    {v.next_payment_date && (
                      <div className="bg-amber-50 rounded-xl px-3 py-2 text-xs text-amber-700">
                        📅 Prochaine échéance : <strong>{v.next_payment_amount ? `${Number(v.next_payment_amount).toLocaleString("fr-FR")} €` : "?"}</strong> le {new Date(v.next_payment_date).toLocaleDateString("fr-FR")}
                      </div>
                    )}

                    {v.notes && <p className="text-xs text-gray-500 italic">{v.notes}</p>}

                    <div className="flex gap-2 pt-1 flex-wrap">
                      <Button size="sm" variant="outline" onClick={() => setPaymentHistoryVendor(v)} className="rounded-lg gap-1 text-xs text-rose-500 hover:text-rose-600 hover:border-rose-200">
                        <History className="w-3 h-3" /> Paiements
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(v)} className="rounded-lg gap-1 text-xs">
                        <Pencil className="w-3 h-3" /> Modifier
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(v.id)} className="rounded-lg gap-1 text-xs text-red-500 hover:text-red-600 hover:border-red-200">
                        <Trash2 className="w-3 h-3" /> Supprimer
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>

    {paymentHistoryVendor && (
      <VendorPaymentHistory
        vendor={paymentHistoryVendor}
        contractAmount={paymentHistoryVendor.contract_amount}
        onTotalChange={handlePaymentTotalChange}
        onClose={() => setPaymentHistoryVendor(null)}
      />
    )}
  );
}