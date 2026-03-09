import { AlertCircle } from "lucide-react";

export default function ShopBanner() {
  return (
    <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white py-6 px-4">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Offre de lancement</h2>
          <p className="text-sm text-white/90">Les 20 premières commandes bénéficient de la livraison offerte</p>
        </div>
      </div>
    </div>
  );
}