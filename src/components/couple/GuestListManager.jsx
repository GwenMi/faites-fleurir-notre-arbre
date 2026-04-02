import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Mail, CheckCircle2, Clock, X, Loader2, Users, Upload, Download, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const RSVP_BADGE = {
  pending:   { label: "En attente", cls: "bg-gray-100 text-gray-600" },
  confirmed: { label: "Confirmé ✓", cls: "bg-green-100 text-green-700" },
  declined:  { label: "Décliné",    cls: "bg-red-100 text-red-600" },
  maybe:     { label: "Peut-être",  cls: "bg-amber-100 text-amber-700" },
};

// Normalise un header de colonne pour la détection
function normalizeHeader(h) {
  return String(h || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

// Mappe les colonnes du fichier vers nos champs
function mapRow(row, headers) {
  const get = (...keys) => {
    for (const k of keys) {
      const found = headers.find(h => normalizeHeader(h) === k);
      if (found && row[found] != null && String(row[found]).trim() !== "") return String(row[found]).trim();
    }
    return "";
  };
  const prenom = get("prenom", "firstname", "first name", "prénom");
  const nom = get("nom", "lastname", "last name", "name");
  const nomComplet = get("nom complet", "prénom nom", "full name", "invité", "invite", "invites");
  const guest_name = nomComplet || (prenom && nom ? `${prenom} ${nom}` : prenom || nom);
  const guest_email = get("email", "e-mail", "mail", "courriel");
  const phone = get("telephone", "tel", "mobile", "gsm", "phone");
  const table_note = get("table", "note", "notes", "remarque", "remarques", "regime", "régime", "menu");
  return { guest_name, guest_email, phone, table_note };
}

export default function GuestListManager({ event }) {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ guest_name: "", guest_email: "", phone: "", table_note: "" });
  const [saving, setSaving] = useState(false);
  const [sendingAll, setSendingAll] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [importPreview, setImportPreview] = useState(null); // { rows, errors }
  const [importing, setImporting] = useState(false);
  const [sendAfterImport, setSendAfterImport] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchGuests();
    const unsub = base44.entities.GuestInvitation.subscribe((ev) => {
      if (ev.type === "create") setGuests(g => [...g, ev.data]);
      else if (ev.type === "update") setGuests(g => g.map(x => x.id === ev.id ? ev.data : x));
      else if (ev.type === "delete") setGuests(g => g.filter(x => x.id !== ev.id));
    });
    return unsub;
  }, []);

  const fetchGuests = async () => {
    const result = await base44.entities.GuestInvitation.filter({ event_id: event.id }, "guest_name");
    setGuests(result || []);
    setLoading(false);
  };

  const addGuest = async (e) => {
    e.preventDefault();
    if (!form.guest_name.trim()) return;
    setSaving(true);
    await base44.entities.GuestInvitation.create({ ...form, event_id: event.id });
    setForm({ guest_name: "", guest_email: "", phone: "", table_note: "" });
    setShowForm(false);
    setSaving(false);
    toast.success("Invité ajouté");
  };

  const deleteGuest = async (id) => {
    await base44.entities.GuestInvitation.delete(id);
    toast.success("Invité supprimé");
  };

  const sendInvitation = async (guest) => {
    if (!guest.guest_email) { toast.error("Cet invité n'a pas d'email"); return; }
    setSendingId(guest.id);
    try {
      const eventDate = event.event_date
        ? new Date(event.event_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
        : "";
      const rsvpLink = event.public_url || "";
      await base44.integrations.Core.SendEmail({
        to: guest.guest_email,
        subject: `🌸 Invitation au mariage de ${event.couple_names}`,
        body: `<div style="font-family:Georgia,serif;max-width:520px;margin:auto;padding:32px;background:#fff9f5;border-radius:16px">
  <div style="text-align:center;margin-bottom:24px">
    <p style="font-size:36px;margin:0">🌸</p>
    <h1 style="font-size:28px;color:#1f2937;margin:12px 0 4px">${event.couple_names}</h1>
    <p style="color:#9ca3af;font-size:14px">${eventDate}</p>
  </div>
  <p style="color:#374151;font-size:15px;line-height:1.7">Bonjour ${guest.guest_name},</p>
  <p style="color:#374151;font-size:15px;line-height:1.7">Nous avons le bonheur de vous inviter à célébrer notre mariage. Votre présence nous ferait vraiment plaisir !</p>
  ${event.welcome_message ? `<p style="color:#6b7280;font-size:14px;font-style:italic;border-left:3px solid #fda4af;padding-left:12px;margin:20px 0">${event.welcome_message}</p>` : ""}
  <div style="text-align:center;margin:32px 0">
    <a href="${rsvpLink}" style="background:#f43f5e;color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:bold;font-size:15px">Confirmer ma présence →</a>
  </div>
  <p style="color:#9ca3af;font-size:12px;text-align:center">Votre pot de graines vous sera remis lors de la cérémonie 🌱</p>
</div>`,
      });
      await base44.entities.GuestInvitation.update(guest.id, {
        invitation_sent: true,
        invitation_sent_date: new Date().toISOString(),
      });
      toast.success(`Invitation envoyée à ${guest.guest_name}`);
    } catch (e) {
      toast.error("Erreur lors de l'envoi");
    }
    setSendingId(null);
  };

  const sendAllPending = async () => {
    const toSend = guests.filter(g => g.guest_email && !g.invitation_sent);
    if (toSend.length === 0) { toast.info("Toutes les invitations ont déjà été envoyées"); return; }
    setSendingAll(true);
    for (const g of toSend) await sendInvitation(g);
    setSendingAll(false);
    toast.success(`${toSend.length} invitation(s) envoyée(s)`);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(ws, { defval: "" });
        if (!raw.length) { toast.error("Fichier vide ou format non reconnu"); return; }
        const headers = Object.keys(raw[0]);
        const rows = raw.map(r => mapRow(r, headers)).filter(r => r.guest_name);
        const errors = raw.map(r => mapRow(r, headers)).filter(r => !r.guest_name);
        if (!rows.length) { toast.error("Aucun nom trouvé — vérifiez les colonnes (voir format attendu)"); return; }
        setImportPreview({ rows, skipped: errors.length });
        setSendAfterImport(false);
      } catch {
        toast.error("Impossible de lire ce fichier. Utilisez .xlsx ou .csv");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Prénom", "Nom", "Email", "Téléphone", "Table / Note"],
      ["Sophie", "Martin", "sophie.martin@email.com", "06 12 34 56 78", "Table 1"],
      ["Marc", "Dupont", "marc.dupont@email.com", "", "Végétarien"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invités");
    XLSX.writeFile(wb, "modele-liste-invites.xlsx");
  };

  const confirmImport = async () => {
    if (!importPreview?.rows?.length) return;
    setImporting(true);
    let created = 0;
    const existingEmails = new Set(guests.map(g => g.guest_email?.toLowerCase()).filter(Boolean));
    for (const row of importPreview.rows) {
      const isDuplicate = row.guest_email && existingEmails.has(row.guest_email.toLowerCase());
      if (isDuplicate) continue;
      const g = await base44.entities.GuestInvitation.create({ ...row, event_id: event.id });
      created++;
      if (sendAfterImport && row.guest_email) await sendInvitation(g);
    }
    toast.success(`${created} invité(s) importé(s)${sendAfterImport ? " et invité(s) par email" : ""}`);
    setImportPreview(null);
    setImporting(false);
  };

  const stats = {
    total: guests.length,
    sent: guests.filter(g => g.invitation_sent).length,
    confirmed: guests.filter(g => g.rsvp_status === "confirmed").length,
    pending: guests.filter(g => g.rsvp_status === "pending").length,
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-rose-400" /></div>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Invités total", value: stats.total, color: "text-gray-800" },
          { label: "Invitations envoyées", value: stats.sent, color: "text-indigo-600" },
          { label: "Confirmés", value: stats.confirmed, color: "text-green-600" },
          { label: "En attente", value: stats.pending, color: "text-amber-600" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
            <p className={`text-3xl font-bold font-serif-elegant ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 font-sans-clean mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setShowForm(v => !v)} className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl h-10">
          <Plus className="w-4 h-4 mr-2" /> Ajouter un invité
        </Button>
        <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="rounded-xl h-10 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
          <Upload className="w-4 h-4 mr-2" /> Importer Excel / CSV
        </Button>
        <Button onClick={downloadTemplate} variant="outline" className="rounded-xl h-10 text-gray-500">
          <Download className="w-4 h-4 mr-2" /> Modèle à télécharger
        </Button>
        {stats.total > 0 && (
          <Button onClick={sendAllPending} disabled={sendingAll} variant="outline" className="rounded-xl h-10">
            {sendingAll ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
            Envoyer les invitations non envoyées
          </Button>
        )}
      </div>

      {/* Input fichier caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Add form */}
      {showForm && (
        <form onSubmit={addGuest} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">Nouvel invité</h3>
            <button type="button" onClick={() => setShowForm(false)}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input placeholder="Prénom Nom *" value={form.guest_name} onChange={e => setForm(f => ({ ...f, guest_name: e.target.value }))} className="h-10 rounded-xl" required />
            <Input type="email" placeholder="Email" value={form.guest_email} onChange={e => setForm(f => ({ ...f, guest_email: e.target.value }))} className="h-10 rounded-xl" />
            <Input placeholder="Téléphone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="h-10 rounded-xl" />
            <Input placeholder="Note (table, régime...)" value={form.table_note} onChange={e => setForm(f => ({ ...f, table_note: e.target.value }))} className="h-10 rounded-xl" />
          </div>
          <Button type="submit" disabled={saving} className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-xl h-10">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Ajouter
          </Button>
        </form>
      )}

      {/* Guest list */}
      {guests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Aucun invité ajouté. Commencez par ajouter vos invités !</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {guests.map(guest => {
              const badge = RSVP_BADGE[guest.rsvp_status || "pending"];
              return (
                <div key={guest.id} className="px-5 py-4 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-sm flex-shrink-0">
                    {guest.guest_name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{guest.guest_name}</p>
                    {guest.guest_email && <p className="text-xs text-gray-400 truncate">{guest.guest_email}</p>}
                    {guest.table_note && <p className="text-xs text-gray-400 italic">{guest.table_note}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge.cls}`}>{badge.label}</span>
                    {guest.invitation_sent ? (
                      <span className="text-xs flex items-center gap-1 text-green-600"><CheckCircle2 className="w-3 h-3" /> Envoyée</span>
                    ) : guest.guest_email ? (
                      <button
                        onClick={() => sendInvitation(guest)}
                        disabled={sendingId === guest.id}
                        className="text-xs flex items-center gap-1 text-indigo-500 hover:text-indigo-700 border border-indigo-200 px-2 py-1 rounded-lg"
                      >
                        {sendingId === guest.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                        Inviter
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300 flex items-center gap-1"><Clock className="w-3 h-3" /> Pas d'email</span>
                    )}
                    <button onClick={() => deleteGuest(guest.id)} className="text-gray-300 hover:text-red-400 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Modal prévisualisation import */}
      {importPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Prévisualisation de l'import</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {importPreview.rows.length} invité(s) détecté(s)
                  {importPreview.skipped > 0 && ` · ${importPreview.skipped} ligne(s) ignorée(s) (sans nom)`}
                </p>
              </div>
              <button onClick={() => setImportPreview(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Format accepté */}
            <div className="px-6 pt-4 pb-2">
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-2 text-sm text-blue-700">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Colonnes reconnues : <strong>Prénom</strong>, <strong>Nom</strong>, <strong>Email</strong>, <strong>Téléphone</strong>, <strong>Table / Note</strong>. Les lignes sans nom sont ignorées.</span>
              </div>
            </div>

            {/* Table preview */}
            <div className="overflow-y-auto flex-1 px-6 py-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-100">
                    <th className="pb-2 font-semibold text-gray-600">Nom</th>
                    <th className="pb-2 font-semibold text-gray-600">Email</th>
                    <th className="pb-2 font-semibold text-gray-600">Tél</th>
                    <th className="pb-2 font-semibold text-gray-600">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {importPreview.rows.slice(0, 50).map((r, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2 text-gray-800">{r.guest_name}</td>
                      <td className="py-2 text-gray-500 text-xs">{r.guest_email || <span className="text-gray-300">—</span>}</td>
                      <td className="py-2 text-gray-500 text-xs">{r.phone || <span className="text-gray-300">—</span>}</td>
                      <td className="py-2 text-gray-500 text-xs">{r.table_note || <span className="text-gray-300">—</span>}</td>
                    </tr>
                  ))}
                  {importPreview.rows.length > 50 && (
                    <tr><td colSpan={4} className="py-2 text-xs text-gray-400 italic">… et {importPreview.rows.length - 50} autres</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Options + confirmation */}
            <div className="p-6 border-t border-gray-100 space-y-4">
              {importPreview.rows.some(r => r.guest_email) && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-indigo-800">
                    📧 Envoyer les invitations par email ?
                  </p>
                  <p className="text-xs text-indigo-600">
                    {importPreview.rows.filter(r => r.guest_email).length} invité(s) ont une adresse email. Voulez-vous leur envoyer une invitation maintenant ?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSendAfterImport(true)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition ${sendAfterImport ? "border-indigo-400 bg-indigo-500 text-white" : "border-indigo-200 bg-white text-indigo-600 hover:bg-indigo-50"}`}
                    >
                      Oui, envoyer maintenant
                    </button>
                    <button
                      type="button"
                      onClick={() => setSendAfterImport(false)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition ${!sendAfterImport ? "border-gray-400 bg-gray-100 text-gray-700" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
                    >
                      Non, plus tard
                    </button>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <Button onClick={() => setImportPreview(null)} variant="outline" className="flex-1 rounded-xl h-11">
                  Annuler
                </Button>
                <Button onClick={confirmImport} disabled={importing} className="flex-1 h-11 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold">
                  {importing ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Import en cours…</> : `Importer ${importPreview.rows.length} invité(s)`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}