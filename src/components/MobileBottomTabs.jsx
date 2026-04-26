import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, User } from "lucide-react";

const tabs = [
  { label: "Accueil", icon: Home, path: "/" },
  { label: "Boutique", icon: ShoppingBag, path: "/Shop" },
  { label: "Mon compte", icon: User, path: "/ClientDashboard" },
];

export default function MobileBottomTabs() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 flex md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {tabs.map(({ label, icon: Icon, path }) => {
        const active = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
              active ? "text-rose-500" : "text-gray-400"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}