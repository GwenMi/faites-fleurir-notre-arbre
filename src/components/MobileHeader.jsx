import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const ROOT_PATHS = ["/", "/Shop", "/ClientDashboard"];

export default function MobileHeader({ title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isRoot = ROOT_PATHS.includes(location.pathname);

  if (isRoot) return null;

  return (
    <div
      className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-100 sticky top-0 z-40"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 8px)" }}
    >
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-rose-500 font-medium text-sm"
      >
        <ChevronLeft className="w-5 h-5" />
        Retour
      </button>
      {title && (
        <span className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-gray-800 truncate max-w-[60%]">
          {title}
        </span>
      )}
    </div>
  );
}