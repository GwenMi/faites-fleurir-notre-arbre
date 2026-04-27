import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const SUPPLIER_COLORS = [
  '#f43f5e', '#6366f1', '#10b981', '#f59e0b', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4',
];

export default function SupplierPriceChart({ orders, suppliers }) {
  // Assigner une couleur fixe à chaque fournisseur
  const supplierColors = useMemo(() => {
    const map = {};
    suppliers.forEach((s, i) => {
      map[s.name] = SUPPLIER_COLORS[i % SUPPLIER_COLORS.length];
    });
    return map;
  }, [suppliers]);

  // Collecter toutes les dates uniques triées
  const allDates = useMemo(() => {
    const dates = new Set(
      orders
        .filter(o => o.order_date && o.unit_price)
        .map(o => o.order_date)
    );
    return [...dates].sort();
  }, [orders]);

  // Construire les données : une entrée par date, avec prix de chaque fournisseur + total
  const chartData = useMemo(() => {
    return allDates.map(date => {
      const dayOrders = orders.filter(o => o.order_date === date && o.unit_price);
      const entry = {
        date: new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      };
      let total = 0;
      let totalCount = 0;
      suppliers.forEach(s => {
        const supplierDayOrders = dayOrders.filter(o => o.supplier_name === s.name);
        if (supplierDayOrders.length > 0) {
          const avg = supplierDayOrders.reduce((sum, o) => sum + o.unit_price, 0) / supplierDayOrders.length;
          entry[s.name] = parseFloat(avg.toFixed(2));
          total += avg;
          totalCount++;
        }
      });
      if (totalCount > 0) {
        entry['__total__'] = parseFloat((total / totalCount).toFixed(2));
      }
      return entry;
    });
  }, [allDates, orders, suppliers]);

  // Courbe par fournisseur individuel
  const supplierChartData = useMemo(() => {
    return suppliers.map(s => {
      const supplierOrders = orders
        .filter(o => o.supplier_name === s.name && o.unit_price && o.order_date)
        .sort((a, b) => new Date(a.order_date) - new Date(b.order_date))
        .map(o => ({
          date: new Date(o.order_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
          prix: parseFloat(o.unit_price.toFixed(2)),
          produit: o.product_description?.substring(0, 25),
        }));
      return { supplier: s, data: supplierOrders };
    }).filter(s => s.data.length >= 1);
  }, [orders, suppliers]);

  if (allDates.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Aucune donnée de prix disponible.<br />Ajoutez des commandes avec un prix unitaire et une date.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Légende des couleurs */}
      <div className="flex flex-wrap gap-3">
        {suppliers.map(s => (
          <span key={s.id} className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full px-3 py-1">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: supplierColors[s.name] }} />
            {s.name}
          </span>
        ))}
        <span className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full px-3 py-1">
          <span className="w-3 h-3 rounded-full flex-shrink-0 bg-gray-700" />
          Total (moyenne)
        </span>
      </div>

      {/* Courbe globale (tous fournisseurs) */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h4 className="font-bold text-gray-800 mb-4">📊 Vue globale — tous fournisseurs</h4>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" style={{ fontSize: '11px' }} stroke="#9ca3af" />
            <YAxis style={{ fontSize: '11px' }} stroke="#9ca3af" unit="€" />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
              formatter={(value, name) => [`${value}€`, name === '__total__' ? 'Moyenne totale' : name]}
            />
            <Legend
              formatter={(value) => value === '__total__' ? 'Moyenne totale' : value}
              wrapperStyle={{ fontSize: '12px' }}
            />
            {suppliers.map(s => (
              <Line
                key={s.name}
                type="monotone"
                dataKey={s.name}
                stroke={supplierColors[s.name]}
                strokeWidth={2}
                dot={{ r: 3, fill: supplierColors[s.name] }}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
            ))}
            <Line
              type="monotone"
              dataKey="__total__"
              stroke="#374151"
              strokeWidth={2.5}
              strokeDasharray="6 3"
              dot={{ r: 3, fill: '#374151' }}
              activeDot={{ r: 5 }}
              name="__total__"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Courbes individuelles par fournisseur */}
      {supplierChartData.length > 0 && (
        <div>
          <h4 className="font-bold text-gray-800 mb-4">🔍 Détail par fournisseur</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supplierChartData.map(({ supplier, data }) => (
              <div key={supplier.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: supplierColors[supplier.name] }} />
                  <h5 className="font-semibold text-gray-800 text-sm">{supplier.name}</h5>
                  <span className="text-xs text-gray-400 ml-auto">{data.length} commande{data.length > 1 ? 's' : ''}</span>
                </div>
                {data.length === 1 ? (
                  <div className="flex items-center justify-center h-24 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold" style={{ color: supplierColors[supplier.name] }}>{data[0].prix}€</p>
                      <p className="text-xs text-gray-500 mt-1">{data[0].date} · {data[0].produit}</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" style={{ fontSize: '10px' }} stroke="#9ca3af" />
                      <YAxis style={{ fontSize: '10px' }} stroke="#9ca3af" unit="€" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '11px' }}
                        formatter={(v) => [`${v}€`, 'Prix unitaire']}
                        labelFormatter={(label, payload) => payload?.[0]?.payload?.produit || label}
                      />
                      <Line
                        type="monotone"
                        dataKey="prix"
                        stroke={supplierColors[supplier.name]}
                        strokeWidth={2}
                        dot={{ r: 4, fill: supplierColors[supplier.name] }}
                        activeDot={{ r: 6 }}
                        name="Prix unitaire"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}