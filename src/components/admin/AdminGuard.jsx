/**
 * AdminGuard — wraps admin-only content.
 * Shows a loading state, then an access-denied page if not authorized.
 *
 * Usage:
 *   <AdminGuard allowedRoles={["admin"]}> ... </AdminGuard>
 *   <AdminGuard allowedRoles={["admin","manager"]}> ... </AdminGuard>
 */
import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Loader2, ShieldOff } from "lucide-react";

const DEFAULT_ROLES = ["admin"];

export default function AdminGuard({ children, allowedRoles = DEFAULT_ROLES }) {
  const [status, setStatus] = useState("loading"); // loading | allowed | denied
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        if (u && allowedRoles.includes(u.role)) {
          setUser(u);
          setStatus("allowed");
        } else if (u) {
          setStatus("denied");
        } else {
          base44.auth.redirectToLogin(window.location.href);
        }
      })
      .catch(() => {
        base44.auth.redirectToLogin(window.location.href);
      });
  }, []);

  if (status === "loading") return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="w-8 h-8 animate-spin text-rose-300" />
    </div>
  );

  if (status === "denied") return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldOff className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Accès refusé</h2>
        <p className="text-sm text-gray-500 mb-6">
          Vous n'avez pas les autorisations nécessaires pour accéder à cette section.<br />
          Cette zone est réservée aux <strong>{allowedRoles.join(", ")}</strong>.
        </p>
        <a href={createPageUrl("Home")} className="text-sm text-rose-600 hover:underline">
          ← Retour à l'accueil
        </a>
      </div>
    </div>
  );

  return children;
}