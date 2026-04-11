import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { LogOut, User, Package, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrderTracking from "@/components/account/OrderTracking";
import ActivityDashboard from "@/components/account/ActivityDashboard";

export default function AccountSettings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("profile");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout(createPageUrl("Home"));
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
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="font-sans-shop text-sm text-gray-600">Nom complet</label>
                <p className="font-sans-shop text-lg text-gray-800">{user.full_name || "Non défini"}</p>
              </div>
              <div>
                <label className="font-sans-shop text-sm text-gray-600">Email</label>
                <p className="font-sans-shop text-lg text-gray-800">{user.email}</p>
              </div>
              <div>
                <label className="font-sans-shop text-sm text-gray-600">Rôle</label>
                <p className="font-sans-shop text-lg text-gray-800 capitalize">{user.role || "Utilisateur"}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </button>
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