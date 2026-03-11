import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Trash2, FileText, CheckCircle2, AlertCircle, Plus, ExternalLink, CalendarDays } from "lucide-react";
import { toast } from "sonner";

const DOC_TYPES = [
  { value: "contrat", label: "📋 Contrat", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "devis", label: "💶 Devis", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "plan", label: "🗺️ Plan", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "facture", label: "🧾 Facture", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "autre", label: "📎 Autre", color: "bg-gray-100 text-gray-700 border-gray-200" },
];

const getDocType = (v) => DOC_TYPES.find(d => d.value === v) || DOC_TYPES[4];
const fmt = (n) => `${(n || 0).toLocaleString("fr-FR")} €`;

function UploadForm({ vendors, eventId, onSaved, onCancel }) {
  const [form, setForm] = useState({ title: "", type: "contrat", vendor_id: "", notes: "", signed: false });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !file) { toast.error("Titre et fichier requis"); return; }
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const vendor = vendors.find(v => v.id === form.vendor_id);
    await base44.entities.VendorDocument.create({
      event_id: eventId,
      vendor_id: form.vendor_id || undefined,
      vendor_name: vendor?.name || "",
      type: form.type,
      title: form.title,
      file_url,
      file_name: file.name,
      notes: form.notes,
      signed: form.signed,
    });
    toast.success("Document enregistré ✓");
    setUploading(false);
    onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-indigo-50 rounded-2xl border border-indigo-100 p-4 space-y-3">
      <p className="text-sm font-bold text-indigo-700">📎 Ajouter un document</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Titre *</p>
          <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Ex: Contrat traiteur" className="rounded-xl bg-white" />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Type</p>
          <select value={form.type} onChange={e => set("type", e.target.value)}
            className="w-full rounded-xl border border-input px-3 py-2 text-sm bg-white">
            {DOC_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Prestataire (optionnel)</p>
          <select value={form.vendor_id} onChange={e => set("vendor_id", e.target.value)}
            className="w-full rounded-xl border border-input px-3 py-2 text-sm bg-white">
            <option value="">— Aucun —</option>
            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Fichier * (PDF, image…)</p>
          <Input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            onChange={e => setFile(e.target.files[0])}
            className="rounded-xl bg-white text-sm" />
        </div>
      </div>
      <Input value={form.notes || ""} onChange={e => set("notes", e.target.value)}
        placeholder="Notes (optionnel)" className="rounded-xl bg-white" />
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input type="checkbox" checked={form.signed} onChange={e => set("signed", e.target.checked)} className="rounded" />
        Contrat signé
      </label>
      <div className="flex gap-2">
        <Button type="submit" disabled={uploading || !form.title || !file} className="rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white">
          {uploading ? "Envoi..." : <><Upload className="w-4 h-4 mr-1" /> Enregistrer</>}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl">Annuler</Button>
      </div>
    </form>
  );
}

function DocumentCard({ doc, onDelete }) {
  const typeConfig = getDocType(doc.type);
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 transition">
      <FileText className="w-5 h-5 text-gray-300 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-800 truncate">{doc.title}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeConfig.color}`}>{typeConfig.label}</span>
          {doc.signed && <span className="text-xs px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200">✓ Signé</span>}
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
          {doc.vendor_name && <span>📌 {doc.vendor_name}</span>}
          {doc.file_name && <span className="truncate max-w-[120px]">{doc.file_name}</span>}
          {doc.notes && <span className="italic truncate">{doc.notes}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <a href={doc.file_url} target="_blank" rel="noreferrer"
          className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-500 transition">
          <ExternalLink className="w-4 h-4" />
        </a>
        <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function PaymentDueDates({ vendors }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcoming = vendors
    .filter(v => v.next_payment_date && v.next_payment_amount > 0)
    .map(v => {
      const due = new Date(v.next_payment_date);
      const diff = Math.round((due - today) / (1000 * 60 * 60 * 24));
      return { ...v, diff };
    })
    .sort((a, b) => a.diff - b.diff);

  if (!upcoming.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden">
      <div className="bg-amber-50 px-4 py-3 border-b border-amber-100 flex items-center gap-2">
        <CalendarDays className="w-4 h-4 text-amber-500" />
        <h4 className="text-sm font-bold text-amber-700">Prochaines échéances de paiement</h4>
      </div>
      <div className="divide-y divide-gray-50">
        {upcoming.map(v => {
          const isUrgent = v.diff <= 7;
          const isPast = v.diff < 0;
          return (
            <div key={v.id} className={`flex items-center justify-between px-4 py-3 ${isPast ? "bg-red-50" : isUrgent ? "bg-amber-50/50" : ""}`}>
              <div className="flex items-center gap-3">
                {isPast
                  ? <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  : isUrgent
                    ? <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    : <CheckCircle2 className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                <div>
                  <p className="text-sm font-semibold text-gray-800">{v.name}</p>
                  <p className="text-xs text-gray-400">{v.label || "Paiement"}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-800">{fmt(v.next_payment_amount)}</p>
                <p className={`text-xs font-medium ${isPast ? "text-red-500" : isUrgent ? "text-amber-500" : "text-gray-400"}`}>
                  {isPast
                    ? `En retard de ${Math.abs(v.diff)}j`
                    : v.diff === 0 ? "Aujourd'hui"
                    : `Dans ${v.diff}j — ${new Date(v.next_payment_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function VendorDocumentManager({ event }) {
  const [docs, setDocs] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState("all");

  useEffect(() => { loadData(); }, [event?.id]);

  const loadData = async () => {
    setLoading(true);
    const [d, v] = await Promise.all([
      base44.entities.VendorDocument.filter({ event_id: event.id }, "-created_date", 100),
      base44.entities.Vendor.filter({ event_id: event.id }, "name", 100),
    ]);
    setDocs(d || []);
    setVendors(v || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.VendorDocument.delete(id);
    toast.success("Document supprimé");
    loadData();
  };

  const filtered = filterType === "all" ? docs : docs.filter(d => d.type === filterType);

  if (loading) return <div className="py-10 text-center text-gray-400 text-sm">Chargement...</div>;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-800">📁 Documents prestataires</h3>
          <p className="text-xs text-gray-400">{docs.length} document{docs.length !== 1 ? "s" : ""} stocké{docs.length !== 1 ? "s" : ""}</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(v => !v)} className="rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white">
          <Plus className="w-4 h-4 mr-1" /> Ajouter
        </Button>
      </div>

      {/* Payment due dates */}
      <PaymentDueDates vendors={vendors} />

      {/* Upload form */}
      {showForm && (
        <UploadForm
          vendors={vendors}
          eventId={event.id}
          onSaved={() => { loadData(); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Type filters */}
      {docs.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          <button onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-full transition ${filterType === "all" ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
            Tous ({docs.length})
          </button>
          {DOC_TYPES.map(d => {
            const count = docs.filter(doc => doc.type === d.value).length;
            if (!count) return null;
            return (
              <button key={d.value} onClick={() => setFilterType(d.value)}
                className={`px-3 py-1.5 rounded-full transition ${filterType === d.value ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                {d.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Documents list */}
      {docs.length === 0 && !showForm ? (
        <div className="text-center py-12 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">Aucun document pour l'instant</p>
          <p className="text-xs mt-1 text-gray-300">Stockez vos contrats, devis et plans ici en toute sécurité</p>
          <button onClick={() => setShowForm(true)} className="text-xs text-indigo-500 hover:underline mt-2">
            Ajouter le premier document →
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Group by vendor */}
          {vendors
            .filter(v => filtered.some(d => d.vendor_id === v.id))
            .map(vendor => (
              <div key={vendor.id}>
                <p className="text-xs font-bold text-gray-500 mb-1.5 pl-1">📌 {vendor.name}</p>
                {filtered.filter(d => d.vendor_id === vendor.id).map(doc => (
                  <DocumentCard key={doc.id} doc={doc} onDelete={() => handleDelete(doc.id)} />
                ))}
              </div>
            ))
          }
          {/* Documents without vendor */}
          {filtered.filter(d => !d.vendor_id || !vendors.find(v => v.id === d.vendor_id)).length > 0 && (
            <div>
              {filtered.filter(d => !d.vendor_id || !vendors.find(v => v.id === d.vendor_id)).length > 0 &&
                vendors.filter(v => filtered.some(d => d.vendor_id === v.id)).length > 0 &&
                <p className="text-xs font-bold text-gray-500 mb-1.5 pl-1">📎 Sans prestataire</p>
              }
              {filtered.filter(d => !d.vendor_id || !vendors.find(v => v.id === d.vendor_id)).map(doc => (
                <DocumentCard key={doc.id} doc={doc} onDelete={() => handleDelete(doc.id)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}