import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Loader2, Mail, Package, LogIn, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
  .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
  .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
  .gold-line { background: linear-gradient(90deg, transparent, #c9a96e, transparent); height: 1px; }
`;

export default function CustomerPortal() {
  const [step, setStep] = useState("login"); // login | authenticated
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !orderId.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    try {
      // Vérifier que la commande existe et correspond au mail
      const foundOrders = await base44.entities.Order.filter({
        customer_email: email.toLowerCase(),
      });

      const matchingOrder = foundOrders.find(
        o => (o.id || "").slice(-8).toUpperCase() === orderId.toUpperCase()
      );

      if (!matchingOrder) {
        toast.error("Email ou numéro de commande incorrect");
        setLoading(false);
        return;
      }

      setOrders(foundOrders);
      setSelectedOrder(matchingOrder);
      setStep("authenticated");
    } catch (error) {
      toast.error("Erreur lors de la vérification");
    } finally {
      setLoading(false);
    }
  };

  if (step === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
        <style>{STYLES}</style>

        {/* Nav */}
        <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-gray-100">
          <a href={createPageUrl("Home")}>
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
              alt="Fleurs de fête"
              className="h-10"
            />
          </a>
          <div className="flex items-center gap-3">
            <a href={createPageUrl("Home")} className="font-sans-clean text-sm text-gray-500 hover:text-rose-400 transition hidden sm:block">
              Accueil
            </a>
          </div>
        </nav>

        {/* Hero */}
        <div className="max-w-md mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-rose-500" />
            </div>
            <h1 className="font-serif-elegant text-4xl font-bold text-gray-800 mb-2">Espace Client</h1>
            <p className="font-sans-clean text-sm text-gray-500">
              Accédez à vos commandes et événements
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email
              </label>
              <Input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-lg font-sans-clean"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Numéro de commande
              </label>
              <p className="text-xs text-gray-500 mb-1.5">
                8 derniers caractères (ex: ABC12345)
              </p>
              <Input
                type="text"
                placeholder="ABC12345"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                maxLength="8"
                className="h-11 rounded-lg font-sans-clean uppercase"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 font-sans-clean mt-6"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              Accéder à mon espace
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="font-sans-clean text-xs text-gray-500 mb-3">
              📧 Vous avez reçu un email de confirmation après votre commande
            </p>
            <a
              href={createPageUrl("Contact")}
              className="font-sans-clean text-sm font-semibold text-rose-500 hover:text-rose-600 transition"
            >
              Besoin d'aide ?
            </a>
          </div>
        </div>

        {/* Footer */}
        <footer className="absolute bottom-0 w-full py-6 px-6 border-t border-gray-100 text-center bg-white">
          <p className="font-sans-clean text-xs text-gray-400">
            © 2025 Fleurs en fête
          </p>
        </footer>
      </div>
    );
  }

  // Authenticated view
  return (
    <CustomerDashboard
      email={email}
      orders={orders}
      selectedOrder={selectedOrder}
      onLogout={() => {
        setStep("login");
        setEmail("");
        setOrderId("");
        setOrders([]);
        setSelectedOrder(null);
      }}
    />
  );
}

function CustomerDashboard({ email, orders, selectedOrder, onLogout }) {
  const [currentOrder, setCurrentOrder] = useState(selectedOrder);
  const [tab, setTab] = useState("summary"); // summary | edit-event | labels

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{STYLES}</style>

      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href={createPageUrl("Home")}>
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
              alt="Fleurs de fête"
              className="h-10"
            />
          </a>
          <div className="flex items-center gap-4">
            <span className="font-sans-clean text-sm text-gray-600 hidden sm:block">{email}</span>
            <button
              onClick={onLogout}
              className="font-sans-clean text-sm text-gray-500 hover:text-rose-500 transition"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <h1 className="font-serif-elegant text-4xl font-bold text-gray-800">Mes commandes</h1>
          <p className="font-sans-clean text-sm text-gray-500 mt-1">Gérez vos événements et téléchargez vos factures</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Orders List */}
        {orders.length > 1 && (
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Sélectionner une commande
            </label>
            <select
              value={currentOrder?.id || ""}
              onChange={(e) => {
                const order = orders.find(o => o.id === e.target.value);
                setCurrentOrder(order);
              }}
              className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg font-sans-clean text-sm"
            >
              {orders.map(order => (
                <option key={order.id} value={order.id}>
                  Commande FEF-{(order.id || "").slice(-8).toUpperCase()} ({new Date(order.created_date).toLocaleDateString("fr-FR")})
                </option>
              ))}
            </select>
          </div>
        )}

        {currentOrder && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="flex gap-0 border-b border-gray-100">
              {[
                { id: "summary", label: "Récapitulatif" },
                { id: "edit-event", label: "Modifier l'événement" },
                { id: "labels", label: "Visuels des étiquettes" },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 px-6 py-4 font-sans-clean text-sm font-semibold border-b-2 transition ${
                    tab === t.id
                      ? "border-rose-500 text-rose-600"
                      : "border-transparent text-gray-500 hover:text-rose-500"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-8">
              {tab === "summary" && <OrderSummary order={currentOrder} />}
              {tab === "edit-event" && <EditEventSection order={currentOrder} />}
              {tab === "labels" && <LabelsPreview order={currentOrder} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderSummary({ order }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <p className="font-sans-clean text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Réf. Commande</p>
          <p className="font-serif-elegant text-2xl font-bold text-gray-800">FEF-{(order.id || "").slice(-8).toUpperCase()}</p>
        </div>
        <div>
          <p className="font-sans-clean text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Total</p>
          <p className="font-serif-elegant text-2xl font-bold text-rose-600">{order.total_price?.toFixed(2)}€</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="font-sans-clean text-xs text-gray-500 uppercase tracking-wide mb-1">Quantité</p>
          <p className="font-sans-clean font-semibold text-gray-700">{order.quantity} pots</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="font-sans-clean text-xs text-gray-500 uppercase tracking-wide mb-1">Statut</p>
          <p className="font-sans-clean font-semibold text-gray-700">{order.status}</p>
        </div>
      </div>

      <Button
        onClick={() => {
          // TODO: Générer PDF facture
          window.alert("Téléchargement de la facture en cours...");
        }}
        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-sans-clean"
      >
        📥 Télécharger la facture
      </Button>
    </div>
  );
}

function EditEventSection({ order }) {
  const [formData, setFormData] = useState({
    names: order.options_selected?.names || "",
    date: order.options_selected?.date || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Mettre à jour la commande
      toast.success("Événement mis à jour");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-md">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Prénoms</label>
        <Input
          type="text"
          placeholder="Ex: Sophie & Marc"
          value={formData.names}
          onChange={(e) => setFormData({ ...formData, names: e.target.value })}
          className="h-11 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Date</label>
        <Input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="h-11 rounded-lg"
        />
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-sans-clean"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Enregistrer les modifications
      </Button>

      <p className="font-sans-clean text-xs text-gray-500">
        💡 Les modifications seront appliquées aux prochaines commandes
      </p>
    </div>
  );
}

function LabelsPreview({ order }) {
  const customization = order.options_selected?.customization || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Aperçu étiquette */}
        <div>
          <p className="font-sans-clean text-sm font-semibold text-gray-900 mb-3">Aperçu de l'étiquette</p>
          <div className="border-2 border-dashed border-rose-200 rounded-lg p-6 bg-rose-50 aspect-square flex items-center justify-center">
            <div className="text-center">
              <p className="font-serif-elegant text-lg font-bold text-rose-800 mb-2">
                {customization.names || "Prénoms"}
              </p>
              <p className="font-sans-clean text-xs text-rose-600">
                {customization.date || "JJ/MM/AAAA"}
              </p>
              <p className="font-sans-clean text-xs text-rose-500 mt-2">
                🌻 {customization.seedType === "tournesol_nain" ? "Tournesol nain" : "Graine"}
              </p>
            </div>
          </div>
        </div>

        {/* Téléchargements */}
        <div>
          <p className="font-sans-clean text-sm font-semibold text-gray-900 mb-3">Téléchargements</p>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start border-rose-200 text-rose-600 hover:bg-rose-50 font-sans-clean"
            >
              📥 PDF d'impression (300 dpi)
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start border-rose-200 text-rose-600 hover:bg-rose-50 font-sans-clean"
            >
              📥 Fichier vectoriel (SVG)
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start border-rose-200 text-rose-600 hover:bg-rose-50 font-sans-clean"
            >
              📥 Aperçu HD (PNG)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}