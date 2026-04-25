import { useState } from "react";
import { Sparkles, X, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const TREES = [
  {
    id: "chene",
    label: "Chêne",
    emoji: "🌳",
    desc: "Majestueux et feuillu",
    spots: [
      { x: 200, y: 95 }, { x: 115, y: 142 }, { x: 285, y: 138 },
      { x: 82, y: 205 }, { x: 318, y: 202 }, { x: 138, y: 262 },
      { x: 262, y: 258 }, { x: 200, y: 278 },
    ],
  },
  {
    id: "cerisier",
    label: "Cerisier",
    emoji: "🌸",
    desc: "Romantique et poétique",
    spots: [
      { x: 68, y: 215 }, { x: 122, y: 175 }, { x: 178, y: 210 },
      { x: 222, y: 210 }, { x: 278, y: 175 }, { x: 332, y: 215 },
      { x: 148, y: 272 }, { x: 252, y: 272 },
    ],
  },
  {
    id: "elegant",
    label: "Élégant",
    emoji: "✨",
    desc: "Épuré et minimaliste",
    spots: [
      { x: 200, y: 78 }, { x: 148, y: 128 }, { x: 252, y: 128 },
      { x: 112, y: 192 }, { x: 288, y: 192 }, { x: 152, y: 258 },
      { x: 248, y: 258 }, { x: 200, y: 292 },
    ],
  },
  {
    id: "olivier",
    label: "Olivier",
    emoji: "🫒",
    desc: "Méditerranéen & rustique",
    spots: [
      { x: 200, y: 95 }, { x: 135, y: 145 }, { x: 268, y: 138 },
      { x: 95, y: 210 }, { x: 305, y: 205 }, { x: 155, y: 268 },
      { x: 248, y: 265 }, { x: 200, y: 300 },
    ],
  },
];

// Photos de fleurs de démo (Unsplash)
const DEMO_POSTS = [
  { user_pseudo: "Marie", image: "https://images.unsplash.com/photo-1490750967868-88df5691cc84?w=120&h=120&fit=crop" },
  { user_pseudo: "Lucas", image: "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=120&h=120&fit=crop" },
  { user_pseudo: "Camille", image: "https://images.unsplash.com/photo-1444021465936-c6ca81d39b84?w=120&h=120&fit=crop" },
  { user_pseudo: "Thomas", image: "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=120&h=120&fit=crop" },
  { user_pseudo: "Léa", image: "https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?w=120&h=120&fit=crop" },
  { user_pseudo: "Pierre", image: "https://images.unsplash.com/photo-1487530811015-780f2f9c4028?w=120&h=120&fit=crop" },
  { user_pseudo: "Sophie", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=120&h=120&fit=crop" },
  { user_pseudo: "Antoine", image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=120&h=120&fit=crop" },
];

function TreeSVG({ treeId }) {
  const base = { position: "absolute", inset: 0, width: "100%", height: "100%" };

  if (treeId === "chene") return (
    <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" style={base}>
      <ellipse cx="200" cy="493" rx="75" ry="8" fill="rgba(0,0,0,0.08)" />
      <path d="M186,490 L188,335 Q193,305 200,292 Q207,305 212,335 L214,490 Z" fill="#795548" />
      <path d="M188,468 Q165,474 148,488" stroke="#795548" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M212,468 Q235,474 252,488" stroke="#795548" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M191,392 Q152,352 110,305" stroke="#795548" strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M209,368 Q252,330 290,285" stroke="#795548" strokeWidth="12" fill="none" strokeLinecap="round" />
      <ellipse cx="200" cy="185" rx="138" ry="122" fill="#5a9e6f" />
      <ellipse cx="158" cy="162" rx="90" ry="80" fill="#3e7d52" opacity="0.55" />
      <ellipse cx="245" cy="170" rx="95" ry="82" fill="#6daf7d" opacity="0.5" />
      <ellipse cx="200" cy="125" rx="75" ry="65" fill="#80c08e" opacity="0.45" />
    </svg>
  );

  if (treeId === "cerisier") return (
    <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" style={base}>
      <ellipse cx="200" cy="493" rx="60" ry="7" fill="rgba(0,0,0,0.07)" />
      <path d="M196,490 L197,318 Q199,298 200,285 Q201,298 203,318 L204,490 Z" fill="#5D4037" />
      <path d="M200,338 Q155,298 108,258" stroke="#5D4037" strokeWidth="13" fill="none" strokeLinecap="round" />
      <path d="M200,338 Q245,298 292,258" stroke="#5D4037" strokeWidth="13" fill="none" strokeLinecap="round" />
      <path d="M138,285 Q100,260 68,238" stroke="#5D4037" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M262,285 Q300,260 332,238" stroke="#5D4037" strokeWidth="8" fill="none" strokeLinecap="round" />
      <ellipse cx="100" cy="228" rx="70" ry="60" fill="#F48FB1" />
      <ellipse cx="200" cy="235" rx="78" ry="62" fill="#F06292" />
      <ellipse cx="300" cy="228" rx="70" ry="60" fill="#F48FB1" />
      <ellipse cx="152" cy="268" rx="58" ry="48" fill="#FCE4EC" />
      <ellipse cx="248" cy="268" rx="58" ry="48" fill="#FCE4EC" />
      <ellipse cx="200" cy="220" rx="55" ry="45" fill="#F8BBD0" opacity="0.5" />
    </svg>
  );

  if (treeId === "elegant") return (
    <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" style={base}>
      <ellipse cx="200" cy="493" rx="55" ry="7" fill="rgba(0,0,0,0.07)" />
      <path d="M194,490 L196,265 Q198,248 200,238 Q202,248 204,265 L206,490 Z" fill="#6D4C41" />
      <path d="M200,322 Q178,295 152,265" stroke="#6D4C41" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M200,322 Q222,295 248,265" stroke="#6D4C41" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M200,280 Q168,245 132,205" stroke="#6D4C41" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M200,280 Q232,245 268,205" stroke="#6D4C41" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M200,252 Q170,212 145,168" stroke="#6D4C41" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M200,252 Q230,212 255,168" stroke="#6D4C41" strokeWidth="6" fill="none" strokeLinecap="round" />
      <circle cx="200" cy="78" r="55" fill="#4CAF50" />
      <circle cx="200" cy="78" r="38" fill="#66BB6A" />
      <circle cx="148" cy="128" r="42" fill="#388E3C" />
      <circle cx="148" cy="128" r="28" fill="#66BB6A" />
      <circle cx="252" cy="128" r="42" fill="#388E3C" />
      <circle cx="252" cy="128" r="28" fill="#66BB6A" />
      <circle cx="112" cy="192" r="36" fill="#66BB6A" />
      <circle cx="112" cy="192" r="24" fill="#A5D6A7" />
      <circle cx="288" cy="192" r="36" fill="#66BB6A" />
      <circle cx="288" cy="192" r="24" fill="#A5D6A7" />
      <circle cx="152" cy="258" r="30" fill="#A5D6A7" />
      <circle cx="248" cy="258" r="30" fill="#A5D6A7" />
      <circle cx="200" cy="292" r="25" fill="#C8E6C9" />
    </svg>
  );

  if (treeId === "olivier") return (
    <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" style={base}>
      <ellipse cx="200" cy="493" rx="65" ry="8" fill="rgba(0,0,0,0.07)" />
      <path d="M192,490 Q188,440 182,395 Q176,350 180,320 Q185,295 200,278 Q215,295 218,322 Q222,352 216,398 Q210,442 208,490 Z" fill="#8D6E63" />
      <path d="M184,360 Q162,345 148,330" stroke="#795548" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M216,345 Q238,328 255,312" stroke="#795548" strokeWidth="10" fill="none" strokeLinecap="round" />
      <ellipse cx="200" cy="188" rx="128" ry="110" fill="#7a9e5e" />
      <ellipse cx="155" cy="158" rx="88" ry="78" fill="#5a7a40" opacity="0.7" />
      <ellipse cx="252" cy="165" rx="85" ry="75" fill="#8aae60" opacity="0.65" />
      <ellipse cx="118" cy="215" rx="72" ry="62" fill="#6b9448" opacity="0.6" />
      <ellipse cx="285" cy="220" rx="68" ry="60" fill="#7aac55" opacity="0.6" />
      <ellipse cx="200" cy="118" rx="65" ry="58" fill="#9ec46e" opacity="0.55" />
    </svg>
  );

  return null;
}

function FlowerSpots({ tree, posts, size }) {
  return tree.spots.map((spot, idx) => {
    if (idx >= posts.length) return null;
    const post = posts[idx];
    return (
      <div
        key={idx}
        style={{
          position: "absolute",
          left: `${(spot.x / 400) * 100}%`,
          top: `${(spot.y / 500) * 100}%`,
          transform: "translate(-50%, -50%)",
          width: size,
          height: size,
          zIndex: 10,
        }}
        className="rounded-full overflow-hidden border-2 border-white shadow-lg"
        title={post.user_pseudo}
      >
        <img src={post.image} alt={post.user_pseudo} className="w-full h-full object-cover" crossOrigin="anonymous" />
      </div>
    );
  });
}

export default function FlowerTreePreview() {
  const [selectedTree, setSelectedTree] = useState(TREES[0]);
  const [guestCount, setGuestCount] = useState(8);

  const visiblePosts = DEMO_POSTS.slice(0, guestCount);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-emerald-50 p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs tracking-widest uppercase text-rose-400 mb-2" style={{ fontFamily: "Lato, sans-serif" }}>Prévisualisation</p>
          <h1 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
            🌳 L'Arbre Fleuri
          </h1>
          <p className="text-sm text-gray-400" style={{ fontFamily: "Lato, sans-serif" }}>
            Les photos de fleurs de vos invités viennent se placer sur les branches
          </p>
        </div>

        {/* Tree selector */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {TREES.map(tree => (
            <button
              key={tree.id}
              onClick={() => setSelectedTree(tree)}
              className={`rounded-2xl p-3 border-2 transition text-center ${
                selectedTree.id === tree.id
                  ? "border-rose-400 bg-rose-50 shadow-sm"
                  : "border-gray-100 bg-white hover:border-rose-200"
              }`}
            >
              <div className="text-2xl mb-1">{tree.emoji}</div>
              <p className="text-xs font-bold text-gray-700" style={{ fontFamily: "Lato, sans-serif" }}>{tree.label}</p>
              <p className="text-xs text-gray-400 leading-tight mt-0.5 hidden sm:block" style={{ fontFamily: "Lato, sans-serif" }}>{tree.desc}</p>
            </button>
          ))}
        </div>

        {/* Guest count slider */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700" style={{ fontFamily: "Lato, sans-serif" }}>
              Nombre d'invités ayant posté
            </p>
            <span className="text-sm font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full">{guestCount} fleurs</span>
          </div>
          <input
            type="range"
            min={1}
            max={8}
            value={guestCount}
            onChange={e => setGuestCount(Number(e.target.value))}
            className="w-full accent-rose-400"
          />
          <div className="flex justify-between text-xs text-gray-300 mt-1" style={{ fontFamily: "Lato, sans-serif" }}>
            <span>1</span><span>8</span>
          </div>
        </div>

        {/* Tree preview */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 mb-4">
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-6 py-4 border-b border-pink-100">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedTree.emoji}</span>
              <div>
                <p className="font-bold text-gray-800 text-sm" style={{ fontFamily: "Lato, sans-serif" }}>{selectedTree.label} — {selectedTree.desc}</p>
                <p className="text-xs text-gray-400" style={{ fontFamily: "Lato, sans-serif" }}>
                  {Math.min(guestCount, selectedTree.spots.length)} photo{guestCount > 1 ? "s" : ""} placée{guestCount > 1 ? "s" : ""} sur les branches
                </p>
              </div>
            </div>
          </div>
          <div
            className="relative w-full bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-50"
            style={{ paddingBottom: "100%" }}
          >
            <TreeSVG treeId={selectedTree.id} />
            <FlowerSpots tree={selectedTree} posts={visiblePosts} size={52} />
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3" style={{ fontFamily: "Lato, sans-serif" }}>
            Invités sur cet arbre
          </p>
          <div className="flex flex-wrap gap-2">
            {visiblePosts.map((p, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-rose-50 rounded-full px-3 py-1">
                <img src={p.image} className="w-5 h-5 rounded-full object-cover" alt={p.user_pseudo} />
                <span className="text-xs text-gray-700" style={{ fontFamily: "Lato, sans-serif" }}>{p.user_pseudo}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="text-center text-xs text-gray-400 space-y-1" style={{ fontFamily: "Lato, sans-serif" }}>
          <p>Les photos ci-dessus sont des exemples de démonstration.</p>
          <p>Dans l'app réelle, les vraies photos de fleurs de vos invités apparaissent à la place.</p>
          <p className="mt-3 text-rose-400 font-semibold">Ce visuel est disponible en téléchargement PDF à la fin du défi (J+45)</p>
        </div>

      </div>
    </div>
  );
}