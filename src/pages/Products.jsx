import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = {
  kit_compose: "Kit à composer",
  kit_pret: "Kit prêt à offrir",
  pack_invite: "Pack invités",
  option_emballage: "Options emballage"
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const allProducts = await base44.entities.Product.list();
        setProducts(allProducts.filter(p => p.active));
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        .font-serif-shop { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-shop { font-family: 'Lato', system-ui, sans-serif; }
      `}</style>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-gray-100 bg-white">
        <a href={createPageUrl("Home")}>
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
            alt="Fleurs de fête"
            className="h-10"
          />
        </a>
        <a href={createPageUrl("Shop")} className="font-sans-shop text-sm font-semibold text-white bg-rose-400 hover:bg-rose-500 transition px-5 py-2.5 rounded-full">
          Commander
        </a>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="font-serif-shop text-4xl font-bold text-gray-800 mb-6">Nos produits</h1>
          
          {/* Filtrage */}
          <div className="flex items-center gap-3 mb-8 flex-wrap">
            <Filter className="w-4 h-4 text-gray-500" />
            <Button
              onClick={() => setSelectedCategory("all")}
              variant={selectedCategory === "all" ? "default" : "outline"}
              className="font-sans-shop text-sm"
            >
              Tous les produits
            </Button>
            {Object.entries(CATEGORIES).map(([key, label]) => (
              <Button
                key={key}
                onClick={() => setSelectedCategory(key)}
                variant={selectedCategory === key ? "default" : "outline"}
                className="font-sans-shop text-sm"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Grille de produits */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement des produits...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun produit dans cette catégorie</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition border border-gray-100">
                {product.image && (
                  <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-t-lg" />
                )}
                <div className="p-5">
                  <h3 className="font-serif-shop text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-sans-shop text-lg font-bold text-rose-400">
                      {product.price.toFixed(2)} €
                    </span>
                    <span className="text-xs bg-rose-50 text-rose-600 px-3 py-1 rounded-full">
                      {CATEGORIES[product.category]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}