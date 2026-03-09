import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ShoppingBag, Sparkles, Gift, TrendingUp, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "../components/shop/ProductCard";
import OrderModal from "../components/shop/OrderModal";

const PRODUCTS = [
  {
    id: "compose",
    name: "Kit à Composer",
    basePrice: 2.50,
    description: "Le kit envoyé séparément pour permettre aux mariés de préparer eux-mêmes les pots.",
    includes: ["Pot", "Pastille de semis", "Graines", "Ruban", "Étiquette personnalisée", "QR code événement"],
    icon: "🎨",
  },
  {
    id: "ready",
    name: "Kit Prêt à Offrir",
    basePrice: 4.50,
    description: "Les pots sont déjà assemblés et prêts à être posés sur la table des invités.",
    includes: ["Pot assemblé", "Ruban", "Étiquette personnalisée", "QR code événement"],
    icon: "🎁",
  },
];

const PACKS = [
  { guests: 30, label: "Pack 30 invités" },
  { guests: 50, label: "Pack 50 invités" },
  { guests: 70, label: "Pack 70 invités" },
  { guests: 100, label: "Pack 100 invités" },
  { guests: 120, label: "Pack 120 invités" },
];

export default function Boutique() {
  const [orders, setOrders] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const data = await base44.entities.Order.list("-created_date", 50);
    setOrders(data || []);
  };

  const freeShippingRemaining = Math.max(0, 20 - orders.length);
  const showLaunchOffer = freeShippingRemaining > 0;

  const openProduct = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-purple-50">
      <style>{`
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
      `}</style>

      {/* Launch offer banner */}
      {showLaunchOffer && (
        <div className="bg-gradient-to-r from-rose-400 to-pink-500 text-white px-4 py-3 text-center sticky top-0 z-20 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            <p className="font-semibold text-sm">
              🎉 Offre de lancement — Livraison offerte sur les {freeShippingRemaining} premières commandes !
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-12 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-3">
            <ShoppingBag className="w-7 h-7 text-rose-400" />
            <h1 className="font-serif-elegant text-3xl font-bold text-gray-800">Notre Boutique</h1>
          </div>
          <p className="text-gray-500 text-sm">Kits "Fleurs en fête" pour votre événement • Livraison en France métropolitaine</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">
        {/* Products */}
        <section data-scroll-to>
          <div className="mb-8">
            <h2 className="font-serif-elegant text-2xl font-bold text-gray-800 mb-2">Choisissez votre kit</h2>
            <p className="text-gray-500 text-sm">Chaque kit inclut un QR code pour accéder à votre espace événement personnalisé</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {PRODUCTS.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={() => openProduct(product)}
              />
            ))}
          </div>
        </section>

        {/* Pot choice highlight */}
        <section className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border border-purple-100">
          <div className="flex items-start gap-4">
            <div className="text-4xl flex-shrink-0">🫙</div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-800 mb-2">Choisissez votre pot</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <span className="font-semibold text-gray-800">Pot plastique</span> — Inclus dans le prix
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Pot verre 🏆</span> — +0,20 € par pot
                  <span className="ml-2 inline-block bg-amber-200 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">Option élégante</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Packs */}
        <section>
          <div className="mb-8">
            <h2 className="font-serif-elegant text-2xl font-bold text-gray-800 mb-2">Acheter par packs</h2>
            <p className="text-gray-500 text-sm">Configurez facilement la quantité dont vous avez besoin</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {PACKS.map(pack => {
              const compose = PRODUCTS[0].basePrice * pack.guests;
              const ready = PRODUCTS[1].basePrice * pack.guests;
              return (
                <div key={pack.guests} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-rose-300 hover:shadow-lg transition flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-lg text-gray-800">{pack.guests} 👥</h4>
                    <Gift className="w-5 h-5 text-rose-400" />
                  </div>
                  <div className="space-y-3 text-sm text-gray-600 mb-4 flex-1">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Kit à Composer</span>
                      <span className="font-bold text-gray-800">{compose.toFixed(2)} €</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Kit Prêt à Offrir</span>
                      <span className="font-bold text-gray-800">{ready.toFixed(2)} €</span>
                    </div>
                  </div>
                  <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">
                    💡 Prévoir quelques pots supplémentaires pour les invités imprévus
                  </p>
                  <button
                    onClick={() => {
                      setSelectedProduct(PRODUCTS[0]);
                      // Hack: modifier quantity via state dans le modal
                      setShowModal(true);
                    }}
                    className="w-full py-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-sm font-semibold transition"
                  >
                    Configurer ce pack
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pack promotion */}
        <section className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-200">
          <div className="flex items-start gap-4">
            <TrendingUp className="w-7 h-7 text-emerald-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg text-emerald-900 mb-2">Promotion packs</h3>
              <p className="text-emerald-800 text-sm">
                Achetez au moins 2 packs et obtenez une réduction automatique de <span className="font-bold text-lg">10 %</span> sur votre commande ! 🎉
              </p>
            </div>
          </div>
        </section>

        {/* Delivery conditions */}
        <section className="bg-white rounded-3xl p-8 border border-gray-100">
          <div className="flex items-start gap-4 mb-6">
            <div className="text-3xl">📦</div>
            <div className="flex-1">
              <h3 className="font-bold text-xl text-gray-800 mb-3">Conditions de livraison</h3>
              <div className="space-y-3 text-gray-600 text-sm leading-relaxed">
                <p>
                  Chaque commande est préparée avec soin avant expédition.
                </p>
                <p>
                  Afin de garantir la préparation et la livraison dans les délais, nous vous recommandons de passer commande <span className="font-semibold text-gray-800">jusqu'à 21 jours avant votre événement</span>.
                </p>
                <p>
                  Les commandes passées <span className="font-semibold text-gray-800">moins de 14 jours avant</span> la date de l'événement peuvent être acceptées, mais <span className="font-semibold">la livraison dans les délais ne peut pas être garantie</span>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-8">
          <Button
            onClick={() => {
              const element = document.querySelector('[data-scroll-to]');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold hover:opacity-90 transition shadow-lg text-base h-auto"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Commencer mon achat
          </Button>
        </section>

        {/* Footer */}
        <div className="border-t border-gray-100 pt-8 pb-12 text-center text-sm text-gray-500 space-y-2">
          <p>Des questions sur nos kits ? <a href="/app/contact" className="text-rose-400 hover:text-rose-500 underline">Contactez-nous</a></p>
          <p>Consultez nos <a href="/app/cgv" className="text-rose-400 hover:text-rose-500 underline">conditions générales de vente</a> et notre <a href="/app/mentionslegales" className="text-rose-400 hover:text-rose-500 underline">politique de confidentialité</a></p>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedProduct && (
        <OrderModal
          product={selectedProduct}
          onClose={() => {
            setShowModal(false);
            loadOrders();
          }}
        />
      )}
    </div>
  );
}