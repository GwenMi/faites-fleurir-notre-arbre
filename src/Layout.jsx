import RgpdBanner from "@/components/RgpdBanner";
import FloatingChat from "@/components/FloatingChat";
import MobileHeader from "@/components/MobileHeader";

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Inter', system-ui, sans-serif; overscroll-behavior: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        button, a, [role="button"] { -webkit-tap-highlight-color: transparent; user-select: none; }
        svg { user-select: none; }
      `}</style>
      <div>
        <MobileHeader />
        {children}
      </div>
      <RgpdBanner />
      <FloatingChat />
    </div>
  );
}