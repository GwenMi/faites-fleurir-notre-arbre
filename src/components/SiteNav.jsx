import { useState } from "react";
import { createPageUrl } from "@/utils";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Mariage 💍", href: "Mariage", color: "text-rose-500 hover:text-rose-600" },
  { label: "Entreprise 🏢", href: "KitFocusOrganisation", color: "text-emerald-600 hover:text-emerald-700" },
  { label: "Maisons d'hôtes 🏡", href: "KitNaturel", color: "text-amber-600 hover:text-amber-700" },
  { label: "Boutique 🌸", href: "Shop", color: "text-gray-600 hover:text-rose-500" },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 md:px-12 py-4">
        {/* Logo */}
        <a href={createPageUrl("Home")}>
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
            alt="Fleurs de fête"
            className="h-12 md:h-16"
          />
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-4">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={createPageUrl(link.href)}
              className={`text-sm font-semibold transition px-3 py-2 rounded-xl hover:bg-gray-50 ${link.color}`}
              style={{ fontFamily: "'Lato', system-ui, sans-serif" }}
            >
              {link.label}
            </a>
          ))}
          <a
            href={createPageUrl("ClientDashboard")}
            className="text-sm font-semibold text-white bg-rose-400 hover:bg-rose-500 transition px-5 py-2.5 rounded-full shadow-sm"
            style={{ fontFamily: "'Lato', system-ui, sans-serif" }}
          >
            Mon espace
          </a>
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition"
          onClick={() => setOpen(o => !o)}
          aria-label="Menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-1">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={createPageUrl(link.href)}
              onClick={() => setOpen(false)}
              className={`py-3 border-b border-gray-50 text-sm font-semibold transition ${link.color}`}
              style={{ fontFamily: "'Lato', system-ui, sans-serif" }}
            >
              {link.label}
            </a>
          ))}
          <a
            href={createPageUrl("ClientDashboard")}
            onClick={() => setOpen(false)}
            className="mt-2 text-center text-sm font-bold text-white bg-rose-400 hover:bg-rose-500 transition py-3 rounded-full shadow-sm"
            style={{ fontFamily: "'Lato', system-ui, sans-serif" }}
          >
            Mon espace
          </a>
        </div>
      )}
    </nav>
  );
}