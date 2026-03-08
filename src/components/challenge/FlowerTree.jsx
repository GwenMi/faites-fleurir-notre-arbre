import { useState } from "react";
import { Sparkles, X, RefreshCw } from "lucide-react";
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
      <circle cx="145" cy="145" r="12" fill="#3a7048" opacity="0.3" />
      <circle cx="258" cy="155" r="10" fill="#3a7048" opacity="0.3" />
      <circle cx="200" cy="242" r="14" fill="#3a7048" opacity="0.3" />
      <circle cx="118" cy="202" r="9" fill="#3a7048" opacity="0.3" />
      <circle cx="280" cy="210" r="11" fill="#3a7048" opacity="0.3" />
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
      <path d="M135,282 Q130,255 128,228" stroke="#5D4037" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M265,282 Q270,255 272,228" stroke="#5D4037" strokeWidth="6" fill="none" strokeLinecap="round" />
      <ellipse cx="100" cy="228" rx="70" ry="60" fill="#F48FB1" />
      <ellipse cx="200" cy="235" rx="78" ry="62" fill="#F06292" />
      <ellipse cx="300" cy="228" rx="70" ry="60" fill="#F48FB1" />
      <ellipse cx="152" cy="268" rx="58" ry="48" fill="#FCE4EC" />
      <ellipse cx="248" cy="268" rx="58" ry="48" fill="#FCE4EC" />
      <ellipse cx="100" cy="218" rx="48" ry="40" fill="#FCE4EC" opacity="0.6" />
      <ellipse cx="300" cy="218" rx="48" ry="40" fill="#FCE4EC" opacity="0.6" />
      <ellipse cx="200" cy="220" rx="55" ry="45" fill="#F8BBD0" opacity="0.5" />
      <ellipse cx="130" cy="490" rx="12" ry="4" fill="#F8BBD0" opacity="0.4" />
      <ellipse cx="270" cy="488" rx="10" ry="4" fill="#F8BBD0" opacity="0.4" />
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
      <circle cx="152" cy="258" r="20" fill="#C8E6C9" />
      <circle cx="248" cy="258" r="30" fill="#A5D6A7" />
      <circle cx="248" cy="258" r="20" fill="#C8E6C9" />
      <circle cx="200" cy="292" r="25" fill="#C8E6C9" />
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
        <img src={post.image} alt={post.user_pseudo} className="w-full h-full object-cover" />
      </div>
    );
  });
}

export default function FlowerTree({ posts }) {
  const flowerPosts = posts.filter(p => p.type === "flower");
  const [showModal, setShowModal] = useState(false);
  const [selectedTree, setSelectedTree] = useState(TREES[0]);
  const [generatedTree, setGeneratedTree] = useState(null);

  if (flowerPosts.length === 0) return null;

  const handleConfirm = () => {
    setGeneratedTree(selectedTree);
    setShowModal(false);
  };

  return (
    <div className="mt-4">
      {!generatedTree ? (
        <button
          onClick={() => setShowModal(true)}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 text-rose-500 hover:bg-rose-100 transition font-semibold text-sm flex items-center justify-center gap-2"
          style={{ fontFamily: "Lato, system-ui, sans-serif" }}
        >
          <Sparkles className="w-4 h-4" /> Générer notre arbre fleuri ✨
        </button>
      ) : (
        <div>
          <div className="text-center mb-3">
            <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }} className="text-xl font-bold text-gray-800">
              🌳 Notre Arbre Fleuri
            </p>
            <p style={{ fontFamily: "Lato, system-ui, sans-serif" }} className="text-xs text-gray-400">
              {Math.min(flowerPosts.length, generatedTree.spots.length)} fleur{flowerPosts.length > 1 ? "s" : ""} sur l'arbre
            </p>
          </div>
          <div
            className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-50 shadow-inner"
            style={{ paddingBottom: "125%" }}
          >
            <TreeSVG treeId={generatedTree.id} />
            <FlowerSpots tree={generatedTree} posts={flowerPosts} size={44} />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="mt-3 w-full text-xs text-gray-400 hover:text-rose-500 transition flex items-center justify-center gap-1"
            style={{ fontFamily: "Lato, system-ui, sans-serif" }}
          >
            <RefreshCw className="w-3 h-3" /> Changer de silhouette
          </button>
        </div>
      )}

      {/* Modal chooser */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100">
              <div>
                <h3 style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }} className="font-bold text-gray-800 text-xl">
                  Choisir une silhouette
                </h3>
                <p style={{ fontFamily: "Lato, system-ui, sans-serif" }} className="text-xs text-gray-400 mt-0.5">
                  Vos fleurs seront placées sur les branches
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-full hover:bg-gray-100 transition">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="px-6 py-4 grid grid-cols-3 gap-3">
              {TREES.map(tree => (
                <button
                  key={tree.id}
                  onClick={() => setSelectedTree(tree)}
                  className={`rounded-2xl p-3 border-2 transition text-center ${
                    selectedTree?.id === tree.id
                      ? "border-rose-400 bg-rose-50"
                      : "border-gray-100 hover:border-rose-200"
                  }`}
                >
                  <div className="text-3xl mb-1">{tree.emoji}</div>
                  <p style={{ fontFamily: "Lato, system-ui, sans-serif" }} className="text-xs font-bold text-gray-700">{tree.label}</p>
                  <p style={{ fontFamily: "Lato, system-ui, sans-serif" }} className="text-xs text-gray-400 leading-tight mt-0.5">{tree.desc}</p>
                </button>
              ))}
            </div>

            {selectedTree && (
              <div className="px-6 pb-6">
                <div
                  className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-50"
                  style={{ paddingBottom: "125%" }}
                >
                  <TreeSVG treeId={selectedTree.id} />
                  <FlowerSpots tree={selectedTree} posts={flowerPosts} size={30} />
                </div>
                <Button
                  onClick={handleConfirm}
                  className="w-full mt-4 h-11 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold"
                >
                  <Sparkles className="w-4 h-4 mr-1" /> Générer cet arbre
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}