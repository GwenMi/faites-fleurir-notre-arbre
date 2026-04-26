import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { LogOut, User, Package, BarChart2, Save, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import OrderTracking from "@/components/account/OrderTracking";
import ActivityDashboard from "@/components/account/ActivityDashboard";

export default function AccountSettings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("profile");
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setForm({
          phone: currentUser.phone || "",
          street: currentUser.street || "",
          zip_code: currentUser.zip_code || "",
          city: currentUser.city || "",
          country: currentUser.country || "France",
        });
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout(createPageUrl("Home"));
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== "SUPPRIMER") return;
    setDeleting(true);
    await base44.integrations.Core.SendEmail({
      to: "contact@fleursdefete.fr",
      subject: `🗑️ Demande de suppression de compte — ${user.email}`,
      body: `L'utilisateur ${user.full_name} (${user.email}) a demandé la suppression de son compte le ${new Date().toLocaleDateString('fr-FR')}.\n\nVeuillez procéder à la suppression de ses données.`,
    });
    await base44.auth.logout(createPageUrl("Home"));
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe(form);
    setUser(u => ({ ...u, ...form }));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Vous devez être connecté</p>
          <Button onClick={() => base44.auth.redirectToLogin()} className="bg-rose-400 hover:bg-rose-500">
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        .font-serif-shop { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-shop { font-family: 'Lato', system-ui, sans-serif; }
      `}</style>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-gray-100 bg-white">
        <a href={createPageUrl("Home")}>
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
            alt="Fleurs de fête"
            className="h-10"
          />
        </a>
        <a href={createPageUrl("Shop")} className="font-sans-shop text-sm font-semibold text-white bg-rose-400 hover:bg-rose-500 transition px-5 py-2.5 rounded-full">
          Commander
        </a>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Onglets */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setTab("profile")}
            className={`font-sans-shop py-3 px-4 border-b-2 transition ${
              tab === "profile"
                ? "border-rose-400 text-rose-600 font-semibold"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Mon profil
          </button>
          <button
            onClick={() => setTab("orders")}
            className={`font-sans-shop py-3 px-4 border-b-2 transition ${
              tab === "orders"
                ? "border-rose-400 text-rose-600 font-semibold"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Mes commandes
          </button>
          <button
            onClick={() => setTab("activity")}
            className={`font-sans-shop py-3 px-4 border-b-2 transition ${
              tab === "activity"
                ? "border-rose-400 text-rose-600 font-semibold"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <BarChart2 className="w-4 h-4 inline mr-2" />
            Mon activité
          </button>
        </div>

        {/* Contenu */}
        {tab === "profile" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            <h2 className="font-serif-shop text-2xl font-bold text-gray-800 mb-6">Informations personnelles</h2>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-sans-shop text-sm text-gray-500">Nom complet</Label>
                  <p className="font-sans-shop text-base text-gray-800 mt-1">{user.full_name || "Non défini"}</p>
                </div>
                <div>
                  <Label className="font-sans-shop text-sm text-gray-500">Email</Label>
                  <p className="font-sans-shop text-base text-gray-800 mt-1">{user.email}</p>
                </div>
              </div>

              <div>
                <Label className="font-sans-shop text-sm font-semibold text-gray-700 block mb-1">Téléphone</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="06 12 34 56 78" className="h-10 rounded-xl" />
              </div>
              <div>
                <Label className="font-sans-shop text-sm font-semibold text-gray-700 block mb-1">Rue / Adresse</Label>
                <Input value={form.street} onChange={e => setForm(f => ({...f, street: e.target.value}))} placeholder="12 rue des Roses" className="h-10 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="font-sans-shop text-sm font-semibold text-gray-700 block mb-1">Code postal</Label>
                  <Input value={form.zip_code} onChange={e => setForm(f => ({...f, zip_code: e.target.value}))} placeholder="75001" className="h-10 rounded-xl" />
                </div>
                <div>
                  <Label className="font-sans-shop text-sm font-semibold text-gray-700 block mb-1">Ville</Label>
                  <Input value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))} placeholder="Paris" className="h-10 rounded-xl" />
                </div>
              </div>
              <div>
                <Label className="font-sans-shop text-sm font-semibold text-gray-700 block mb-1">Pays</Label>
                <Input value={form.country} onChange={e => setForm(f => ({...f, country: e.target.value}))} placeholder="France" className="h-10 rounded-xl" />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 mb-3"
            >
              <Save className="w-4 h-4" />
              {saved ? "✅ Enregistré !" : saving ? "Enregistrement..." : "Enregistrer mes informations"}
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </button>

            {/* Zone danger */}
            <div className="mt-8 pt-6 border-t border-red-100">
              <h3 className="font-sans-shop text-sm font-semibold text-red-700 mb-2">Zone dangereuse</h3>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full bg-white border border-red-300 hover:bg-red-50 text-red-600 font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer mon compte
              </button>
            </div>
          </div>
        )}

        {/* Modal confirmation suppression */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="font-sans-shop text-lg font-bold text-gray-800">Supprimer mon compte</h3>
              </div>
              <p className="font-sans-shop text-sm text-gray-600">
                Cette action est <strong>irréversible</strong>. Vos données et commandes seront supprimées. Pour confirmer, tapez <strong>SUPPRIMER</strong> ci-dessous.
              </p>
              <Input
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                placeholder="SUPPRIMER"
                className="rounded-xl border-red-200 focus:border-red-400"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold font-sans-shop hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== "SUPPRIMER" || deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold font-sans-shop hover:bg-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {deleting ? "Envoi..." : "Confirmer"}
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "orders" && (
          <OrderTracking userEmail={user.email} />
        )}

        {tab === "activity" && (
          <ActivityDashboard userEmail={user.email} />
        )}
      </div>
    </div>
  );
}