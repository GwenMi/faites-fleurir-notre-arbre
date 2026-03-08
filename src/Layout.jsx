export default function Layout({ children, currentPageName }) {
  const isPublicPage = currentPageName === "EventPublic";
  const isHomePage = currentPageName === "Home";

  return (
    <div className="min-h-screen">
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Inter', system-ui, sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
      {children}
    </div>
  );
}