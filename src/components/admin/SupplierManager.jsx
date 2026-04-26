import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Trash2, Edit2, ExternalLink, Package, AlertCircle, FileText, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SupplierManager({ eventId }) {
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [selectedSupplierForChart, setSelectedSupplierForChart] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_name: '',
    email: '',
    phone: '',
    website: '',
    category: 'autre',
    contract_amount: 0,
    deposit_paid: 0,
    next_payment_date: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [eventId]);

  const loadData = async () => {
    try {
      const [suppliersData, ordersData] = await Promise.all([
        base44.entities.Vendor.filter({ event_id: eventId }, '-created_date'),
        base44.entities.SupplierOrder.filter({}, '-created_date', 100),
      ]);
      setSuppliers(suppliersData || []);
      setOrders(ordersData || []);
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Le nom du fournisseur est requis');
      return;
    }

    try {
      if (editingSupplier) {
        await base44.entities.Vendor.update(editingSupplier.id, {
          ...formData,
          event_id: eventId,
        });
        toast.success('Fournisseur mis à jour');
      } else {
        await base44.entities.Vendor.create({
          ...formData,
          event_id: eventId,
        });
        toast.success('Fournisseur ajouté');
      }
      setFormData({
        name: '',
        contact_name: '',
        email: '',
        phone: '',
        website: '',
        category: 'autre',
        contract_amount: 0,
        deposit_paid: 0,
        next_payment_date: '',
        notes: '',
      });
      setEditingSupplier(null);
      setShowForm(false);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Confirmer la suppression ?')) return;
    try {
      await base44.entities.Vendor.delete(id);
      toast.success('Fournisseur supprimé');
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Erreur');
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData(supplier);
    setShowForm(true);
  };

  const getSupplierOrders = (supplierName) => {
    return orders.filter(o => o.supplier_name === supplierName);
  };

  const getCategoryLabel = (cat) => {
    const labels = {
      traiteur: '🍽️ Traiteur',
      fleuriste: '🌸 Fleuriste',
      photographe: '📸 Photographe',
      videaste: '🎥 Vidéaste',
      musique: '🎵 Musique',
      salle: '🏢 Salle',
      decoration: '✨ Décoration',
      coiffure_maquillage: '💄 Coiffure/Maquillage',
      transport: '🚗 Transport',
      faire_part: '📮 Faire-part',
      gateau: '🎂 Gâteau',
      autre: '📦 Autre',
    };
    return labels[cat] || cat;
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      ordered: 'bg-blue-100 text-blue-700',
      partial: 'bg-amber-100 text-amber-700',
      received: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const handleInvoiceUpload = async (orderId, file) => {
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const orderData = orders.find(o => o.id === orderId);
      await base44.entities.SupplierOrder.update(orderId, {
        invoice_url: file_url,
        invoice_number: file.name.split('.')[0],
        invoice_date: new Date().toISOString().split('T')[0],
      });
      toast.success('Facture uploadée');
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Erreur upload facture');
    }
  };

  const getPriceChartData = (supplierName) => {
    const supplierOrders = orders
      .filter(o => o.supplier_name === supplierName && o.unit_price && o.order_date)
      .sort((a, b) => new Date(a.order_date) - new Date(b.order_date))
      .map(o => ({
        date: new Date(o.order_date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        price: o.unit_price,
        product: o.product_description.substring(0, 20),
        fullDate: o.order_date,
      }));
    return supplierOrders;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Button */}
      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="bg-rose-500 hover:bg-rose-600">
          <Plus className="w-4 h-4 mr-2" /> Ajouter un fournisseur
        </Button>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-800 mb-4">
            {editingSupplier ? 'Modifier le fournisseur' : 'Ajouter un fournisseur'}
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nom</label>
                <Input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nom du fournisseur"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Catégorie</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="traiteur">🍽️ Traiteur</option>
                  <option value="fleuriste">🌸 Fleuriste</option>
                  <option value="photographe">📸 Photographe</option>
                  <option value="videaste">🎥 Vidéaste</option>
                  <option value="musique">🎵 Musique</option>
                  <option value="salle">🏢 Salle</option>
                  <option value="decoration">✨ Décoration</option>
                  <option value="coiffure_maquillage">💄 Coiffure/Maquillage</option>
                  <option value="transport">🚗 Transport</option>
                  <option value="faire_part">📮 Faire-part</option>
                  <option value="gateau">🎂 Gâteau</option>
                  <option value="autre">📦 Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contact</label>
                <Input
                  value={formData.contact_name}
                  onChange={e => setFormData({ ...formData, contact_name: e.target.value })}
                  placeholder="Nom du contact"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Téléphone</label>
                <Input
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Numéro de téléphone"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Site web</label>
                <Input
                  value={formData.website}
                  onChange={e => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Montant du contrat (€)</label>
                <Input
                  type="number"
                  value={formData.contract_amount}
                  onChange={e => setFormData({ ...formData, contract_amount: parseFloat(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Acompte versé (€)</label>
                <Input
                  type="number"
                  value={formData.deposit_paid}
                  onChange={e => setFormData({ ...formData, deposit_paid: parseFloat(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Date prochaine échéance</label>
                <Input
                  type="date"
                  value={formData.next_payment_date}
                  onChange={e => setFormData({ ...formData, next_payment_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes internes"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-24"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-rose-500 hover:bg-rose-600">
                {editingSupplier ? 'Mettre à jour' : 'Ajouter'}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingSupplier(null);
                  setFormData({
                    name: '',
                    contact_name: '',
                    email: '',
                    phone: '',
                    website: '',
                    category: 'autre',
                    contract_amount: 0,
                    deposit_paid: 0,
                    next_payment_date: '',
                    notes: '',
                  });
                }}
                variant="outline"
              >
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Suppliers List */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-800">Fournisseurs ({suppliers.length})</h3>
        {suppliers.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">Aucun fournisseur ajouté</p>
        ) : (
          suppliers.map(supplier => {
            const supplierOrders = getSupplierOrders(supplier.name);
            const remaining = supplier.contract_amount - supplier.deposit_paid;
            return (
              <div
                key={supplier.id}
                className="bg-white rounded-xl border border-gray-200 p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-gray-800">{supplier.name}</h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {getCategoryLabel(supplier.category)}
                      </span>
                    </div>
                    {supplier.contact_name && (
                      <p className="text-sm text-gray-600">👤 {supplier.contact_name}</p>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(supplier)}
                      className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(supplier.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  {supplier.email && (
                    <div>
                      <p className="text-gray-500 text-xs">Email</p>
                      <a
                        href={`mailto:${supplier.email}`}
                        className="text-rose-500 hover:underline flex items-center gap-1"
                      >
                        {supplier.email} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {supplier.phone && (
                    <div>
                      <p className="text-gray-500 text-xs">Téléphone</p>
                      <a href={`tel:${supplier.phone}`} className="text-rose-500 hover:underline">
                        {supplier.phone}
                      </a>
                    </div>
                  )}
                  {supplier.website && (
                    <div>
                      <p className="text-gray-500 text-xs">Site web</p>
                      <a
                        href={supplier.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-rose-500 hover:underline flex items-center gap-1"
                      >
                        Visiter <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Budget */}
                {supplier.contract_amount > 0 && (
                  <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-2 font-semibold">BUDGET</p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Total</p>
                        <p className="font-bold text-gray-800">{supplier.contract_amount.toFixed(2)}€</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Acompte versé</p>
                        <p className="font-bold text-green-600">{supplier.deposit_paid.toFixed(2)}€</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Reste à payer</p>
                        <p className={`font-bold ${remaining > 0 ? 'text-rose-600' : 'text-green-600'}`}>
                          {remaining.toFixed(2)}€
                        </p>
                      </div>
                    </div>
                    {supplier.next_payment_date && (
                      <p className="text-xs text-gray-500 mt-2">
                        Prochaine échéance : <strong>{supplier.next_payment_date}</strong>
                      </p>
                    )}
                  </div>
                )}

                {/* Notes */}
                {supplier.notes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-700 italic">{supplier.notes}</p>
                  </div>
                )}

                {/* Associated Orders */}
                {supplierOrders.length > 0 && (
                  <div className="border-t border-gray-200 pt-4 mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <Package className="w-4 h-4" /> Commandes liées ({supplierOrders.length})
                      </h5>
                      {supplierOrders.some(o => o.unit_price) && (
                        <button
                          onClick={() => setSelectedSupplierForChart(selectedSupplierForChart === supplier.name ? null : supplier.name)}
                          className="text-xs px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition flex items-center gap-1"
                        >
                          <TrendingDown className="w-3 h-3" /> Courbe prix
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {supplierOrders.map(order => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{order.product_description}</p>
                            <p className="text-xs text-gray-500">
                              Réf: {order.reference || 'N/A'} · Qté: {order.quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            <span className="text-sm font-bold text-gray-800 min-w-16 text-right">
                              {order.total_price?.toFixed(2) || (order.quantity * order.unit_price).toFixed(2)}€
                            </span>
                            {!order.invoice_url && (
                              <label className="p-2 hover:bg-white rounded-lg transition text-gray-400 hover:text-green-600 cursor-pointer">
                                <FileText className="w-4 h-4" />
                                <input
                                  type="file"
                                  accept="application/pdf,.pdf"
                                  onChange={(e) => handleInvoiceUpload(order.id, e.target.files?.[0])}
                                  className="hidden"
                                />
                              </label>
                            )}
                            {order.invoice_url && (
                              <a
                                href={order.invoice_url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                title="Voir la facture"
                              >
                                <FileText className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Price Chart */}
                    {selectedSupplierForChart === supplier.name && (
                      <div className="mt-4 pt-4 border-t border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4">
                        <h6 className="text-sm font-bold text-gray-800 mb-3">Suivi des prix unitaires</h6>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={getPriceChartData(supplier.name)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                              formatter={(value) => `${value.toFixed(2)}€`}
                              labelFormatter={(label) => `Date: ${label}`}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="price"
                              stroke="#6366f1"
                              strokeWidth={2}
                              dot={{ fill: '#6366f1', r: 4 }}
                              activeDot={{ r: 6 }}
                              name="Prix unitaire (€)"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}