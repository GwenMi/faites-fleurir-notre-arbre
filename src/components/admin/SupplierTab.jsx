import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import SupplierManager from './SupplierManager';
import SupplierPriceChart from './SupplierPriceChart';
import { Loader2 } from 'lucide-react';

const SUB_TABS = [
  { key: 'manage', label: '📋 Gestion' },
  { key: 'charts', label: '📈 Courbes de prix' },
];

export default function SupplierTab() {
  const [subTab, setSubTab] = useState('manage');
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [suppliersData, ordersData] = await Promise.all([
        base44.entities.Vendor.filter({ event_id: 'admin-global' }, '-created_date'),
        base44.entities.SupplierOrder.filter({}, '-created_date', 200),
      ]);
      setSuppliers(suppliersData || []);
      setOrders(ordersData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestion des Fournisseurs</h2>
          <p className="text-gray-500 text-sm mt-1">Gérez vos fournisseurs et suivez les commandes associées</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {SUB_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setSubTab(tab.key)}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition ${
              subTab === tab.key
                ? 'border-rose-400 text-rose-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {subTab === 'manage' && (
        <SupplierManager eventId="admin-global" />
      )}

      {subTab === 'charts' && (
        loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
          </div>
        ) : (
          <SupplierPriceChart suppliers={suppliers} orders={orders} />
        )
      )}
    </div>
  );
}