import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Trash2, Edit2, ExternalLink, Package, FileText, TrendingDown } from 'lucide-react';
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
      resetForm();
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
      setEditingSupplier(null);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Erreur');
    }
  };

  const resetForm = () => {
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
    <div className="h-[calc(100vh-200px)] flex flex-col gap-4">
      {/* Top Bar */}
      <div className="flex gap-3">
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-rose-500 hover:bg-rose-600">
            <Plus className="w-4 h-4 mr-2" /> Nouveau fournisseur
          </Button>
        )}
      </div>

      {/* Main Content - Two columns */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left: Suppliers List */}
        <div className="w-80 bg-white rounded-xl border border-gray-200 p-4 overflow-y-auto flex flex-col">
          <h3 className="font-bold text-gray-800 mb-4">Fournisseurs ({suppliers.length})</h3>
          {suppliers.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Aucun fournisseur</p>
          ) : (
            <div className="space-y-2 flex-1">
              {suppliers.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setEditingSupplier(s);
                    setFormData(s);
                    setShowForm(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition border ${
                    editingSupplier?.id === s.id
                      ? 'bg-rose-50 border-rose-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <p className="font-semibold text-gray-800">{s.name}</p>
                  <p className="text-xs text-gray-500">{getCategoryLabel(s.category)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details or Form */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 overflow-y-auto flex flex-col">
          {/* Form View */}
          {showForm && (
            <>
              <h3 className="font-bold text-gray-800 mb-4">
                {editingSupplier ? 'Modifier le fournisseur' : 'Ajouter un fournisseur'}
              </h3>
              <form onSubmit={handleSave} className="space-y-4 flex-1 overflow-y-auto">
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
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <Button type="submit" className="bg-rose-500 hover:bg-rose-600">
                    {editingSupplier ? 'Mettre à jour' : 'Ajouter'}
                  </Button>
                  <Button type="button" onClick={resetForm} variant="outline">
                    Annuler
                  </Button>
                </div>
              </form>
            </>
          )}

          {/* Detail View */}
          {!showForm && editingSupplier && (
            <>
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{editingSupplier.name}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 inline-block mt-2">
                    {getCategoryLabel(editingSupplier.category)}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setFormData(editingSupplier);
                      setShowForm(true);
                    }}
                    className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(editingSupplier.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {editingSupplier.contact_name && (
                <p className="text-sm text-gray-600 mb-4">👤 {editingSupplier.contact_name}</p>
              )}

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
                {editingSupplier.email && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Email</p>
                    <a href={`mailto:${editingSupplier.email}`} className="text-rose-500 hover:underline text-sm flex items-center gap-1">
                      {editingSupplier.email} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {editingSupplier.phone && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Téléphone</p>
                    <a href={`tel:${editingSupplier.phone}`} className="text-rose-500 hover:underline text-sm">
                      {editingSupplier.phone}
                    </a>
                  </div>
                )}
                {editingSupplier.website && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Site web</p>
                    <a href={editingSupplier.website} target="_blank" rel="noreferrer" className="text-rose-500 hover:underline text-sm flex items-center gap-1">
                      Visiter <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Budget */}
              {editingSupplier.contract_amount > 0 && (
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-4 mb-6">
                  <p className="text-xs text-gray-500 mb-3 font-semibold">BUDGET</p>
                  <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-gray-500 text-xs">Total</p>
                      <p className="font-bold text-gray-800">{editingSupplier.contract_amount.toFixed(2)}€</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Acompte</p>
                      <p className="font-bold text-green-600">{editingSupplier.deposit_paid.toFixed(2)}€</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Reste</p>
                      <p className={`font-bold ${editingSupplier.contract_amount - editingSupplier.deposit_paid > 0 ? 'text-rose-600' : 'text-green-600'}`}>
                        {(editingSupplier.contract_amount - editingSupplier.deposit_paid).toFixed(2)}€
                      </p>
                    </div>
                  </div>
                  {editingSupplier.next_payment_date && (
                    <p className="text-xs text-gray-500">Prochaine échéance : <strong>{editingSupplier.next_payment_date}</strong></p>
                  )}
                </div>
              )}

              {/* Notes */}
              {editingSupplier.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                  <p className="text-xs text-amber-700 italic">{editingSupplier.notes}</p>
                </div>
              )}

              {/* Orders */}
              {getSupplierOrders(editingSupplier.name).length > 0 && (
                <div className="space-y-4 flex-1 overflow-y-auto">
                  <div className="flex items-center justify-between sticky top-0 bg-white z-10">
                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <Package className="w-4 h-4" /> Commandes ({getSupplierOrders(editingSupplier.name).length})
                    </h4>
                    {getSupplierOrders(editingSupplier.name).some(o => o.unit_price) && (
                      <button
                        onClick={() => setSelectedSupplierForChart(selectedSupplierForChart === editingSupplier.name ? null : editingSupplier.name)}
                        className="text-xs px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition flex items-center gap-1"
                      >
                        <TrendingDown className="w-3 h-3" /> Courbe prix
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {getSupplierOrders(editingSupplier.name).map(order => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{order.product_description}</p>
                          <p className="text-xs text-gray-500">Réf: {order.reference || 'N/A'} · Qté: {order.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <span className="text-sm font-bold text-gray-800 min-w-12 text-right">
                            {order.total_price?.toFixed(2) || (order.quantity * order.unit_price).toFixed(2)}€
                          </span>
                          {!order.invoice_url && (
                            <label className="p-2 hover:bg-white rounded-lg transition text-gray-400 hover:text-green-600 cursor-pointer flex-shrink-0">
                              <FileText className="w-4 h-4" />
                              <input type="file" accept="application/pdf,.pdf" onChange={(e) => handleInvoiceUpload(order.id, e.target.files?.[0])} className="hidden" />
                            </label>
                          )}
                          {order.invoice_url && (
                            <a href={order.invoice_url} target="_blank" rel="noreferrer" className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition flex-shrink-0" title="Voir la facture">
                              <FileText className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Price Chart */}
                  {selectedSupplierForChart === editingSupplier.name && (
                    <div className="mt-4 pt-4 border-t border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4">
                      <h5 className="text-sm font-bold text-gray-800 mb-3">Suivi des prix unitaires</h5>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={getPriceChartData(editingSupplier.name)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '11px' }} />
                          <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} />
                          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} formatter={(value) => `${value.toFixed(2)}€`} />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                          <Line type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} activeDot={{ r: 5 }} name="Prix unitaire (€)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!showForm && !editingSupplier && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Package className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500">Sélectionnez un fournisseur pour voir les détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}