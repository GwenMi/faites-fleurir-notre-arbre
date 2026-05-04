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
import ReviewsList from "@/components/review/ReviewsList";
import ReviewForm from "@/components/review/ReviewForm";

const DEFAULT_PRODUCTS = [
  {
    id: "__kit-composer",
    name: "Kit à composer",
    price: 3.90,
    unit: "/ invité",
    description: "Kit envoyé séparément permettant de préparer soi-même les pots souvenirs. Choisissez la couleur du ruban et les graines.",
    options: ["couleur du ruban", "type de graines"],
    active: true,
  },
  {
    id: "__kit-classique",
    name: "Kit prêt à offrir",
    price: 5.90,
    unit: "/ invité",
    description: "Pot en verre avec graines, ruban et QR code prêt à distribuer aux invités. Tout est assemblé.",
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

  // Panier
  const [cart, setCart] = useState([]); // [{ id: uid, product, quantity }]
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: `${product.id}-${Date.now()}`, product, quantity: 1 }];
    });
  };

  const updateQty = (itemId, delta) => {
    setCart(prev => prev
      .map(i => i.id === itemId ? { ...i, quantity: i.quantity + delta } : i)
      .filter(i => i.quantity > 0)
    );
  };

  const removeItem = (itemId) => setCart(prev => prev.filter(i => i.id !== itemId));

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

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
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-gray-100 sticky top-0 bg-white z-30 shadow-sm">
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
          <a href={createPageUrl("KitFocusOrganisation")}
            className="font-sans-clean text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition hidden sm:block">
            Cadeaux entreprise
          </a>
          {/* Bouton panier */}
          <button
            onClick={() => setShowCart(true)}
            className="relative flex items-center gap-2 font-sans-clean text-sm font-semibold text-gray-700 border border-gray-200 hover:border-rose-300 hover:text-rose-500 transition px-4 py-2 rounded-full"
          >
            <ShoppingCart className="w-4 h-4" />
            Panier
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-400 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <a href={createPageUrl("ClientDashboard")}
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
        <a href={createPageUrl("Shop")}
          className="inline-flex items-center gap-2 mt-6 px-7 py-3.5 rounded-full font-sans-clean font-bold text-white bg-gradient-to-r from-rose-400 to-pink-500 hover:opacity-90 transition text-sm shadow-md">
          🌸 Composer mon kit personnalisé
        </a>
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
                    onAdd={() => { addToCart(product); setShowCart(true); }}
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

            {/* Reviews Section */}
            <div className="mt-12">
              <h2 className="font-serif-elegant text-3xl font-bold text-gray-800 mb-2">
                Avis vérifiés
              </h2>
              <p className="font-sans-clean text-sm text-gray-500 mb-6">
                Les clients partagent leur expérience après avoir reçu et planté leurs pots
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <ReviewsList limit={10} />
                </div>
                <div className="bg-white rounded-3xl border-2 border-rose-100 shadow-sm p-6 h-fit">
                  <h3 className="font-serif-elegant text-xl font-bold text-gray-800 mb-1">Partager votre avis</h3>
                  <p className="font-sans-clean text-xs text-gray-500 mb-4">
                    Vous avez reçu un kit ? Dites-nous ce que vous en pensez !
                  </p>
                  <ReviewForm productId={products[0]?.id} productName="Kit Fleurs" />
                </div>
              </div>
            </div>

            {/* Livraison section */}
            <div className="mt-12 bg-white rounded-3xl border-2 border-rose-100 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-rose-400" />
                </div>
                <h2 className="font-serif-elegant text-2xl font-bold text-gray-800">Livraison</h2>
              </div>
              <div className="font-sans-clean text-sm text-gray-600 leading-relaxed space-y-3">
                <p>Vos commandes sont préparées avec soin et expédiées dès qu'elles sont prêtes.</p>
                <p>
                  Pour être certain de recevoir vos produits à temps, nous vous recommandons de passer commande
                  <span className="font-semibold text-gray-800"> au minimum 15 jours avant votre événement</span>.
                </p>
                <p className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-amber-800">
                  <span className="mt-0.5">⚠️</span>
                  <span>Pour les commandes passées <span className="font-semibold">moins de 15 jours</span> avant l'événement, nous ferons notre maximum, mais nous ne pouvons garantir une livraison dans les temps.</span>
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

      {/* Cart drawer */}
      {showCart && (
        <CartDrawer
          cart={cart}
          onUpdateQty={updateQty}
          onRemove={removeItem}
          onClose={() => setShowCart(false)}
          onCheckout={() => { setShowCart(false); setShowCheckout(true); }}
        />
      )}

      {/* Checkout modal */}
      {showCheckout && (
        <CartCheckoutModal
          cart={cart}
          onClose={() => setShowCheckout(false)}
          onOrderComplete={() => setCart([])}
        />
      )}
    </div>
  );
}