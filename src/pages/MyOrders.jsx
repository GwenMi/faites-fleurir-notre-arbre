import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Package, CheckCircle, Truck, Clock, AlertCircle, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_CONFIG = {
  pending: { 
    icon: Clock, 
    label: "En attente de confirmation", 
    color: "bg-yellow-100 text-yellow-800",
    description: "Votre commande a été créée et est en cours de traitement."
  },
  confirmed: { 
    icon: Package, 
    label: "Confirmée", 
    color: "bg-blue-100 text-blue-800",
    description: "Votre commande a été confirmée et préparée."
  },
  shipped: { 
    icon: Truck, 
    label: "Expédiée", 
    color: "bg-purple-100 text-purple-800",
    description: "Votre commande est en transit vers vous."
  },
  delivered: { 
    icon: CheckCircle, 
    label: "Livrée", 
    color: "bg-green-100 text-green-800",
    description: "Votre commande a été livrée avec succès."
  },
  cancelled: { 
    icon: AlertCircle, 
    label: "Annulée", 
    color: "bg-red-100 text-red-800",
    description: "Votre commande a été annulée."
  }
};

const PAYMENT_STATUS_CONFIG = {
  unpaid: { label: "Non payée", color: "text-red-600" },
  partial: { label: "Partiellement payée", color: "text-orange-600" },
  paid: { label: "Payée", color: "text-green-600" }
};

export default function MyOrders() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) {
          base44.auth.redirectToLogin(createPageUrl("MyOrders"));
          return;
        }
        
        setUser(currentUser);
        
        // Charger les commandes de l'utilisateur
        const userOrders = await base44.entities.Order.filter({
          customer_email: currentUser.email
        }, '-created_date', 100);
        setOrders(userOrders);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    // Abonnement aux mises à jour en temps réel
    const unsubscribe = base44.entities.Order.subscribe((event) => {
      setOrders(prev => {
        if (event.type === 'create') {
          return [event.data, ...prev];
        } else if (event.type === 'update') {
          return prev.map(o => o.id === event.id ? event.data : o);
        } else if (event.type === 'delete') {
          return prev.filter(o => o.id !== event.id);
        }
        return prev;
      });
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-50 to-white">
        <p className="text-gray-500">Chargement de vos commandes...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-50 to-white">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Vous devez être connecté pour voir vos commandes.</p>
          <Button 
            onClick={() => base44.auth.redirectToLogin(createPageUrl("MyOrders"))} 
            className="bg-rose-400 hover:bg-rose-500"
          >
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

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
        <a href={createPageUrl("AccountSettings")} className="font-sans-shop text-sm font-semibold text-white bg-rose-400 hover:bg-rose-500 transition px-5 py-2.5 rounded-full">
          Profil
        </a>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* En-tête */}
        <div className="mb-10">
          <a href={createPageUrl("Home")} className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-sans-shop text-sm">Retour</span>
          </a>
          <h1 className="font-serif-shop text-4xl font-bold text-gray-800">Mes Commandes</h1>
          <p className="font-sans-shop text-gray-500 mt-2">Consultez l'historique et le statut de vos achats</p>
        </div>

        {/* Affichage détaillé d'une commande sélectionnée */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
                <div>
                  <h2 className="font-serif-shop text-2xl font-bold text-gray-800">Commande #{selectedOrder.id?.slice(0, 8)}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(selectedOrder.created_date).toLocaleDateString('fr-FR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Statut */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Statut</h3>
                  <div className="flex items-center gap-3">
                    {(() => {
                      const config = STATUS_CONFIG[selectedOrder.status];
                      const Icon = config.icon;
                      return (
                        <>
                          <Badge className={config.color}>
                            <Icon className="w-4 h-4 mr-2 inline" />
                            {config.label}
                          </Badge>
                          <p className="font-sans-shop text-sm text-gray-600">{config.description}</p>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Détails du produit */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Produit commandé</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-sans-shop font-semibold text-gray-800">{selectedOrder.product_name}</p>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                      <span className="text-sm text-gray-600">Quantité : {selectedOrder.quantity}</span>
                      <span className="font-semibold text-rose-600">{selectedOrder.total_price.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>

                {/* Paiement */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Paiement</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Montant :</span>
                      <span className="font-semibold text-gray-800">{selectedOrder.total_price.toFixed(2)} €</span>
                    </div>
                    {selectedOrder.deposit_amount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Acompte payé :</span>
                        <span className="font-semibold text-gray-800">{selectedOrder.deposit_amount.toFixed(2)} €</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-600">Statut du paiement :</span>
                      <span className={`font-semibold ${PAYMENT_STATUS_CONFIG[selectedOrder.payment_status]?.color}`}>
                        {PAYMENT_STATUS_CONFIG[selectedOrder.payment_status]?.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Livraison */}
                {selectedOrder.tracking_number && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Suivi de livraison</h3>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-2">Numéro de suivi :</p>
                      <p className="font-mono font-semibold text-gray-800">{selectedOrder.tracking_number}</p>
                      {selectedOrder.tracking_carrier && (
                        <p className="text-sm text-gray-600 mt-2">
                          Transporteur : <span className="font-semibold">{selectedOrder.tracking_carrier}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedOrder.payment_notes && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Notes</h3>
                    <p className="text-sm text-gray-600">{selectedOrder.payment_notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Liste des commandes */}
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-100">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="font-sans-shop text-gray-600 text-lg mb-2">Vous n'avez pas encore de commandes</p>
            <p className="font-sans-shop text-sm text-gray-500 mb-6">Commencez par découvrir nos produits</p>
            <a href={createPageUrl("Shop")} className="inline-block bg-rose-400 hover:bg-rose-500 text-white font-semibold px-6 py-2 rounded-full transition">
              Commencer une commande
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const config = STATUS_CONFIG[order.status];
              const Icon = config.icon;
              return (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition text-left"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-serif-shop text-lg font-bold text-gray-800">
                          Commande #{order.id?.slice(0, 8)}
                        </h3>
                        <Badge className={config.color}>
                          <Icon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <p className="font-sans-shop text-sm text-gray-500 mt-1">
                        {new Date(order.created_date).toLocaleDateString('fr-FR', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="font-sans-shop text-xs text-gray-500 uppercase tracking-wide">Produit</p>
                      <p className="font-sans-shop font-semibold text-gray-800 line-clamp-1">{order.product_name}</p>
                    </div>
                    <div>
                      <p className="font-sans-shop text-xs text-gray-500 uppercase tracking-wide">Quantité</p>
                      <p className="font-sans-shop font-semibold text-gray-800">{order.quantity}</p>
                    </div>
                    <div>
                      <p className="font-sans-shop text-xs text-gray-500 uppercase tracking-wide">Total</p>
                      <p className="font-sans-shop font-bold text-rose-600">{order.total_price.toFixed(2)} €</p>
                    </div>
                    <div>
                      <p className="font-sans-shop text-xs text-gray-500 uppercase tracking-wide">Paiement</p>
                      <p className={`font-sans-shop font-semibold text-sm ${PAYMENT_STATUS_CONFIG[order.payment_status]?.color}`}>
                        {PAYMENT_STATUS_CONFIG[order.payment_status]?.label}
                      </p>
                    </div>
                  </div>

                  {order.tracking_number && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="font-sans-shop text-xs text-gray-500 uppercase tracking-wide mb-1">Suivi</p>
                      <p className="font-mono text-sm text-gray-800">{order.tracking_number}</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}