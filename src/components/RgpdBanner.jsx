import { useState, useEffect } from "react";
import { createPageUrl } from "@/utils";
import { X, Cookie } from "lucide-react";

export default function RgpdBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("fdf_cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("fdf_cookie_consent", "accepted");
    setVisible(false);
  };

  const refuse = () => {
    localStorage.setItem("fdf_cookie_consent", "refused");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-4">
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Cookie className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5 sm:mt-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 mb-0.5">Cookies & confidentialité 🌸</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Nous utilisons uniquement des cookies nécessaires au fonctionnement du site (session, préférences). Aucun cookie publicitaire.{" "}
            <a href={createPageUrl("MentionsLegales")} className="text-rose-400 underline hover:text-rose-500">En savoir plus</a>.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={refuse}
            className="text-xs text-gray-400 hover:text-gray-600 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition font-medium">
            Refuser
          </button>
          <button onClick={accept}
            className="text-xs text-white px-4 py-2 rounded-xl bg-rose-400 hover:bg-rose-500 transition font-semibold">
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}