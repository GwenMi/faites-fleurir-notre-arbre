import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import SupplierManager from './SupplierManager';
import SupplierPriceChart from './SupplierPriceChart';
import { Loader2 } from 'lucide-react';

const SUB_TABS = [
  { key: 'manage', label: '📋 Gestion' },
  { key: 'charts', label: '📈 Courbes de prix' },
  { key: 'couts', label: '🧾 Coûts produits' },
];

const PRODUCT_COSTS = [
  {
    id: "terrarium",
    name: "Terrarium Souvenir",
    emoji: "🫙",
    price_sale: 10,
    cost_total: 1.47,
    color: "border-teal-200 bg-teal-50",
    suppliers: [
      { component: "Pot verre 80ml + bouchon liège", supplier: "Dragées Anahita", url: "https://drageesanahita.com", price: "9,90€/lot de 12", unit_price: 0.87 },
      { component: "Cristaux hydrogel", supplier: "billeshydrogel.fr", url: "https://billeshydrogel.fr", price: "~0,10€/unité", unit_price: 0.10 },
      { component: "Fleurs séchées", supplier: "Le Jardin de Sophie", url: "https://lejardindesophie.fr", price: "~0,30€/unité", unit_price: 0.30 },
      { component: "Gravier décoratif", supplier: "Jardinerie locale", url: null, price: "~0,05€/unité", unit_price: 0.05 },
      { component: "Mini coquillages", supplier: "alexnat.com", url: "https://alexnat.com", price: "~0,10€/unité", unit_price: 0.10 },
      { component: "Étiquette kraft", supplier: "Impression interne", url: null, price: "~0,05€/unité", unit_price: 0.05 },
    ],
  },
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

      {subTab === 'couts' && (
        <div className="space-y-6 pt-2">
          {PRODUCT_COSTS.map(product => (
            <div key={product.id} className={`rounded-2xl border-2 ${product.color} p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{product.emoji}</span>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{product.name}</h3>
                  <div className="flex gap-4 text-sm mt-0.5">
                    <span className="text-gray-500">Coût de revient : <strong className="text-gray-800">{product.cost_total.toFixed(2)} €</strong></span>
                    <span className="text-gray-500">Prix de vente : <strong className="text-green-700">{product.price_sale.toFixed(2)} €</strong></span>
                    <span className="text-gray-500">Marge nette : <strong className="text-green-700">~{(product.price_sale - product.cost_total).toFixed(2)} €</strong></span>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
                      <th className="text-left py-2 pr-4">Composant</th>
                      <th className="text-left py-2 pr-4">Fournisseur</th>
                      <th className="text-left py-2 pr-4">Tarif</th>
                      <th className="text-right py-2">Coût/unité</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {product.suppliers.map(s => (
                      <tr key={s.component} className="hover:bg-white/60 transition">
                        <td className="py-2.5 pr-4 font-medium text-gray-700">{s.component}</td>
                        <td className="py-2.5 pr-4 text-gray-600">
                          {s.url ? (
                            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">{s.supplier}</a>
                          ) : s.supplier}
                        </td>
                        <td className="py-2.5 pr-4 text-gray-500">{s.price}</td>
                        <td className="py-2.5 text-right font-semibold text-gray-800">{s.unit_price.toFixed(2)} €</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-gray-300 font-bold">
                      <td colSpan={3} className="py-2.5 text-gray-700">Total coût de revient</td>
                      <td className="py-2.5 text-right text-gray-800">{product.cost_total.toFixed(2)} €</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
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