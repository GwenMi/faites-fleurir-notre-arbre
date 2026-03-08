import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Loader2, ShoppingBag, Truck } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import OrderModal from "@/components/shop/OrderModal";

const DEFAULT_PRODUCTS = [
  {
    id: "__kit-composer",
    name: "Kit à composer",
    price: 2.50,
    description: "Kit envoyé séparément permettant de préparer soi-même les pots souvenirs. Choisissez le type de pot, la couleur du ruban et les graines.",
    options: ["type de pot", "couleur du ruban", "type de graines"],
    active: true,
  },
  {
    id: "__kit-classique",
    name: "Kit classique prêt à offrir",
    price: 4.50,
    description: "Pot en verre avec graines, ruban et QR code prêt à distribuer aux invités. Rapide et élégant.",
    options: ["couleur du ruban", "type de graines"],
    active: true,
  },
  {
    id: "__kit-premium",
    name: "Kit premium personnalisé",
    price: 6.90,
    description: "Version personnalisée avec étiquette aux prénoms et à la date de l'événement. Le cadeau souvenir parfait.",
    options: ["couleur du ruban", "type de graines", "texte personnalisé"],
    active: true,
  },
];

export default function Boutique() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const dbProducts = await base44.entities.Product.filter({ active: true });
    if (dbProducts && dbProducts.length > 0) {
      setProducts(dbProducts);
    } else {
      setProducts(DEFAULT_PRODUCTS);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
        .gold-line { background: linear-gradient(90deg, transparent, #c9a96e, transparent); height: 1px; }
      `}</style>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-gray-100">
        <a href={createPageUrl("Home")}>
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
            alt="Fleurs de fête"
            className="h-12"
          />
        </a>
        <div className="flex items-center gap-3">
          <a href={createPageUrl("Boutique")}
            className="font-sans-clean text-sm font-semibold text-rose-500 border-b-2 border-rose-300 pb-0.5">
            Boutique
          </a>
          <a href={createPageUrl("AdminDashboard")}
            className="font-sans-clean text-sm font-semibold text-white bg-rose-400 hover:bg-rose-500 transition px-5 py-2.5 rounded-full shadow-sm">
            Mon espace
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 px-6 md:px-12 py-16 text-center">
        <ShoppingBag className="w-10 h-10 text-rose-300 mx-auto mb-4" />
        <p className="font-sans-clean text-xs tracking-[0.3em] uppercase text-rose-400 mb-3">Boutique</p>
        <h1 className="font-serif-elegant text-4xl md:text-6xl font-bold text-gray-800 mb-4">
          Nos kits <span className="text-rose-400">fleurs</span>
        </h1>
        <div className="gold-line max-w-xs mx-auto mb-5" />
        <p className="font-sans-clean text-gray-500 text-base max-w-md mx-auto leading-relaxed font-light">
          Des kits soigneusement préparés pour offrir à chaque invité un souvenir qui fleurit.
          Commandez directement en ligne.
        </p>
      </div>

      {/* Products */}
      <div className="max-w-4xl mx-auto px-6 py-14">
        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-rose-300 mx-auto" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOrder={setSelectedProduct}
                />
              ))}
            </div>

            {/* Info band */}
            <div className="mt-12 bg-gradient-to-r from-rose-50 to-pink-50 rounded-3xl p-8 text-center border border-rose-100">
              <p className="font-serif-elegant text-2xl font-bold text-gray-800 mb-3">🚚 Livraison incluse</p>
              <p className="font-sans-clean text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                Chaque commande est préparée avec soin et expédiée dans les 5 jours ouvrés.
                Nous vous contactons par email pour confirmer les détails.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-10 px-4 border-t border-gray-100">
        <p className="font-sans-clean text-xs text-gray-400 tracking-widest">
          Fleurs de fête · Des souvenirs qui fleurissent 🌸
        </p>
      </footer>

      {/* Order modal */}
      {selectedProduct && (
        <OrderModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}