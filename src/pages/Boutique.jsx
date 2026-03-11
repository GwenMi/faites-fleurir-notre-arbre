import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Loader2, ShoppingBag, Truck, ShoppingCart } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import OrderModal from "@/components/shop/OrderModal";
import ProductReviews from "@/components/shop/ProductReviews";
import GuestPacksSection from "@/components/shop/GuestPacksSection";
import CartDrawer from "@/components/shop/CartDrawer";
import CartCheckoutModal from "@/components/shop/CartCheckoutModal";

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

];

export default function Boutique() {
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPack, setSelectedPack] = useState(null);

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
    const dbReviews = await base44.entities.Review.filter({ approved: true });
    setReviews(dbReviews || []);
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
                <div key={product.id} className="flex flex-col">
                  <ProductCard
                    product={product}
                    onOrder={setSelectedProduct}
                    reviews={reviews}
                  />
                  <div className="px-1">
                    <ProductReviews productId={product.id} />
                  </div>
                </div>
              ))}
            </div>

            {/* Guest Packs Section */}
            <GuestPacksSection onSelectPack={setSelectedPack} />

            {/* Livraison section */}
            <div className="mt-12 bg-white rounded-3xl border-2 border-rose-100 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-rose-400" />
                </div>
                <h2 className="font-serif-elegant text-2xl font-bold text-gray-800">Livraison</h2>
              </div>
              <div className="font-sans-clean text-sm text-gray-600 leading-relaxed space-y-3">
                <p>Chaque commande est préparée avec soin avant expédition.</p>
                <p>
                  Afin de garantir la préparation et la livraison dans les délais, nous vous recommandons de passer commande
                  <span className="font-semibold text-gray-800"> jusqu'à 21 jours avant votre événement</span>.
                </p>
                <p className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-amber-800">
                  <span className="mt-0.5">⚠️</span>
                  <span>Les commandes passées <span className="font-semibold">moins de 14 jours</span> avant la date de l'événement peuvent être acceptées, mais la livraison dans les délais ne peut pas être garantie.</span>
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-gray-100 text-center">
        <p className="font-sans-clean text-xs text-gray-400 mb-4">Fleurs en fête · Des souvenirs qui fleurissent 🌸</p>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-gray-400 font-sans-clean mb-4">
          <a href={createPageUrl("Contact")} className="hover:text-rose-400 transition">Contact</a>
          <span className="text-gray-200">·</span>
          <a href={createPageUrl("CGV")} className="hover:text-rose-400 transition">CGV</a>
          <span className="text-gray-200">·</span>
          <a href={createPageUrl("CGU")} className="hover:text-rose-400 transition">CGU</a>
          <span className="text-gray-200">·</span>
          <a href={createPageUrl("MentionsLegales")} className="hover:text-rose-400 transition">Mentions légales & RGPD</a>
        </div>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-gray-400 font-sans-clean">
          <a href={createPageUrl("ClientDashboard")} className="hover:text-rose-400 transition">Mon compte</a>
          <span className="text-gray-200">·</span>
          <a href={createPageUrl("OrderTracking")} className="hover:text-rose-400 transition">Suivi commande</a>
        </div>
      </footer>

      {/* Order modal */}
      {selectedProduct && (
        <OrderModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
      {selectedPack && (
        <OrderModal guestPack={selectedPack} onClose={() => setSelectedPack(null)} />
      )}
    </div>
  );
}