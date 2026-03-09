import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ShopBanner from "@/components/shop/ShopBanner";
import ProductCard from "@/components/shop/ProductCard";
import CartSummary from "@/components/shop/CartSummary";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [eventDate, setEventDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [showLateWarning, setShowLateWarning] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const result = await base44.entities.Product.list();
      setProducts(result.filter(p => p.active));
    } catch (e) {
      console.error("Erreur:", e);
    }
    setLoading(false);
  };

  const addToCart = (product) => {
    setCart([...cart, { ...product, cartId: Date.now() }]);
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price, 0);
  };

  const calculateDiscount = () => {
    const packCount = cart.filter(p => p.category === "pack_invite").length;
    if (packCount >= 2) {
      return calculateSubtotal() * 0.1;
    }
    return 0;
  };

  const handleCheckout = () => {
    if (!eventDate) {
      toast.error("Veuillez sélectionner la date de votre événement");
      return;
    }

    const eventTime = new Date(eventDate).getTime();
    const orderTime = Date.now();
    const daysUntilEvent = Math.floor((eventTime - orderTime) / (1000 * 60 * 60 * 24));

    if (daysUntilEvent < 14) {
      setShowLateWarning(true);
      return;
    }

    proceedToPayment();
  };

  const proceedToPayment = async () => {
    try {
      const subtotal = calculateSubtotal();
      const discount = calculateDiscount();
      const total = subtotal - discount;

      const orderData = {
        event_date: eventDate,
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          price: item.price,
          category: item.category,
          quantity: item.quantity || 1
        })),
        subtotal,
        discount,
        total,
        status: "pending"
      };

      // Créer la commande (vous pourriez appeler une fonction backend pour Stripe)
      console.log("Commande:", orderData);
      toast.success("Redirection vers le paiement...");
    } catch (e) {
      toast.error("Erreur lors de la commande");
    }
  };

  const kits = products.filter(p => p.category === "kit_compose" || p.category === "kit_pret");
  const packs = products.filter(p => p.category === "pack_invite");
  const options = products.filter(p => p.category === "option_emballage");

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
      <p className="text-gray-500">Chargement...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <ShopBanner />

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        {/* Conditions de livraison */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex gap-4">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-2">Conditions de livraison</p>
            <p className="mb-2">Chaque commande est préparée avec soin. Afin de garantir la préparation et la livraison dans les délais, nous vous recommandons de passer commande jusqu'à 21 jours avant votre événement.</p>
            <p>Les commandes passées moins de 14 jours avant la date de l'événement peuvent être acceptées, mais la livraison dans les délais ne peut pas être garantie.</p>
          </div>
        </div>

        {/* Date événement */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Date de votre événement *</label>
          <Input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full md:w-64"
          />
        </div>

        {/* Kits */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Kits souvenirs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {kits.map(kit => (
              <ProductCard
                key={kit.id}
                product={kit}
                onAdd={() => addToCart(kit)}
              />
            ))}
          </div>
        </section>

        {/* Packs invités */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Packs invités</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {packs.map(pack => (
              <ProductCard
                key={pack.id}
                product={pack}
                onAdd={() => addToCart(pack)}
                compact
              />
            ))}
          </div>
          {calculateDiscount() > 0 && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-700">
                <strong>Réduction 10% appliquée</strong> pour 2 packs ou plus
              </p>
            </div>
          )}
        </section>

        {/* Options emballage */}
        {options.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Options emballage</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {options.map(option => (
                <ProductCard
                  key={option.id}
                  product={option}
                  onAdd={() => addToCart(option)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Panier et résumé */}
        <CartSummary
          cart={cart}
          onRemove={removeFromCart}
          subtotal={calculateSubtotal()}
          discount={calculateDiscount()}
          onCheckout={handleCheckout}
          hasItems={cart.length > 0}
        />

        {/* Alerte commande tardive */}
        {showLateWarning && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-md w-full space-y-4">
              <div className="flex gap-3 items-start">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-gray-900">Commande tardive</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Votre événement est prévu dans moins de 14 jours. La livraison dans les délais ne peut pas être garantie.
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Souhaitez-vous continuer ?
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowLateWarning(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={proceedToPayment}
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                >
                  Continuer
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}