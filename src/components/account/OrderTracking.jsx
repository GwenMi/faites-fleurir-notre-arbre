import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Package, CheckCircle, Truck, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG = {
  pending: { icon: Clock, label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { icon: Package, label: "Confirmée", color: "bg-blue-100 text-blue-800" },
  shipped: { icon: Truck, label: "Expédiée", color: "bg-purple-100 text-purple-800" },
  delivered: { icon: CheckCircle, label: "Livrée", color: "bg-green-100 text-green-800" },
  cancelled: { icon: Package, label: "Annulée", color: "bg-red-100 text-red-800" }
};

export default function OrderTracking({ userEmail }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const userOrders = await base44.entities.Order.filter({
          customer_email: userEmail
        }, '-created_date', 50);
        setOrders(userOrders);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();

    // Abonnement aux mises à jour en temps réel
    const unsubscribe = base44.entities.Order.subscribe((event) => {
      if (event.data?.customer_email === userEmail) {
        if (event.type === 'create') {
          setOrders(prev => [event.data, ...prev]);
        } else if (event.type === 'update') {
          setOrders(prev => prev.map(o => o.id === event.id ? event.data : o));
        } else if (event.type === 'delete') {
          setOrders(prev => prev.filter(o => o.id !== event.id));
        }
      }
    });

    return unsubscribe;
  }, [userEmail]);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Chargement des commandes...</div>;
  }

  const pendingOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'cancelled');

  return (
    <div className="space-y-8">
      {/* Commandes en cours */}
      {pendingOrders.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">Commandes en cours</h3>
          <div className="space-y-3">
            {pendingOrders.map(order => {
              const config = STATUS_CONFIG[order.status];
              const Icon = config.icon;
              return (
                <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-800">Commande #{order.id?.slice(0, 8)}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <Badge className={config.color}>
                      <Icon className="w-3 h-3 mr-1 inline" />
                      {config.label}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <p><strong>{order.product_name}</strong> × {order.quantity}</p>
                    <p className="text-rose-600 font-semibold">{order.total_price.toFixed(2)} €</p>
                  </div>

                  {order.tracking_number && (
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <p className="text-gray-700">
                        <strong>Suivi :</strong> {order.tracking_number}
                        {order.tracking_carrier && ` (${order.tracking_carrier})`}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Commandes passées */}
      {completedOrders.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">Historique des commandes</h3>
          <div className="space-y-3">
            {completedOrders.map(order => {
              const config = STATUS_CONFIG[order.status];
              const Icon = config.icon;
              return (
                <div key={order.id} className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-700">Commande #{order.id?.slice(0, 8)}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <Badge className={config.color}>
                      <Icon className="w-3 h-3 mr-1 inline" />
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {order.product_name} × {order.quantity} — {order.total_price.toFixed(2)} €
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {orders.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">Aucune commande pour le moment</p>
        </div>
      )}
    </div>
  );
}