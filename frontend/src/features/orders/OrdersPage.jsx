import { useState, useEffect } from 'react';
import { getOrders, createOrder, updateOrder, deleteOrder } from '../../api/orders';

const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusLabels = {
  pending: 'En attente', confirmed: 'Confirmée', processing: 'En cours',
  shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée'
};

const exportOrdersToCSV = (orders) => {
  const headers = ['N° Commande', 'Client', 'Statut', 'Total', 'Paiement', 'Date'];
  const rows = orders.map(o => [
    o.orderNumber,
    o.clientId?.name || o.clientId?.company || '',
    o.status,
    o.total,
    o.paymentStatus,
    new Date(o.createdAt).toLocaleDateString()
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `commandes-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [form, setForm] = useState({ clientId: '', items: [{ description: '', quantity: 1, unitPrice: 0 }], subtotal: 0, taxTotal: 0, total: 0, notes: '' });

  useEffect(() => { loadOrders(); }, [search, statusFilter, pagination.page]);

  const loadOrders = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const data = await getOrders(params);
      setOrders(data);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, subtotal: Number(form.subtotal), taxTotal: Number(form.taxTotal), total: Number(form.total) };
      if (editItem) { await updateOrder(editItem._id, payload); } else { await createOrder(payload); }
      setShowForm(false); setEditItem(null); loadOrders();
      setForm({ clientId: '', items: [{ description: '', quantity: 1, unitPrice: 0 }], subtotal: 0, taxTotal: 0, total: 0, notes: '' });
    } catch (err) { alert(err.data?.message || 'Error'); }
  };

  const handleEdit = (order) => {
    setEditItem(order);
    setForm({ clientId: order.clientId?._id || '', items: order.items, subtotal: String(order.subtotal), taxTotal: String(order.taxTotal), total: String(order.total), notes: order.notes || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette commande ?')) return;
    try { await deleteOrder(id); loadOrders(); } catch {}
  };

  const updateItem = (index, field, value) => {
    const items = [...form.items];
    items[index] = { ...items[index], [field]: value };
    setForm({ ...form, items });
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { description: '', quantity: 1, unitPrice: 0 }] });
  };

  const removeItem = (index) => {
    const items = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestion des Commandes</h2>
          <p className="text-slate-500 text-sm mt-1">Gérez les commandes et facturations</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportOrdersToCSV(orders)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm hover:bg-slate-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exporter
          </button>
          <button onClick={() => { setShowForm(true); setEditItem(null); }} className="btn-primary">+ Nouvelle Commande</button>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <input className="input-field max-w-sm" placeholder="Rechercher commande..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input-field max-w-[180px]" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Tous les statuts</option>
          {statusOptions.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-soft" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">{editItem ? 'Modifier' : 'Nouvelle'} Commande</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="label-field">ID Client <input className="input-field" value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} placeholder="ID Client" /></label>
              <div>
                <label className="label-field mb-2">Articles</label>
                {form.items.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-2 items-end">
                    <input className="input-field flex-1" placeholder="Description" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} />
                    <input type="number" className="input-field w-20" placeholder="Qté" value={item.quantity} onChange={e => updateItem(i, 'quantity', Number(e.target.value))} />
                    <input type="number" className="input-field w-28" placeholder="Prix unit." value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', Number(e.target.value))} />
                    {form.items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="text-red-500 text-sm">✕</button>}
                  </div>
                ))}
                <button type="button" onClick={addItem} className="text-sm text-indigo-600 hover:underline">+ Ajouter article</button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <label className="label-field">Sous-total <input type="number" className="input-field" value={form.subtotal} onChange={e => setForm({ ...form, subtotal: e.target.value })} /></label>
                <label className="label-field">Taxes <input type="number" className="input-field" value={form.taxTotal} onChange={e => setForm({ ...form, taxTotal: e.target.value })} /></label>
                <label className="label-field">Total <input type="number" className="input-field" value={form.total} onChange={e => setForm({ ...form, total: e.target.value })} required /></label>
              </div>
              <label className="label-field">Notes <textarea className="input-field" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></label>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">{editItem ? 'Modifier' : 'Créer'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left p-4">N° Commande</th>
              <th className="text-left p-4">Client</th>
              <th className="text-center p-4">Statut</th>
              <th className="text-right p-4">Total</th>
              <th className="text-center p-4">Paiement</th>
              <th className="text-left p-4">Date</th>
              <th className="text-center p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map(order => (
              <tr key={order._id} className="hover:bg-slate-50">
                <td className="p-4 font-medium">{order.orderNumber}</td>
                <td className="p-4">{order.clientId?.name || order.clientId?.company || 'N/A'}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>{statusLabels[order.status]}</span>
                </td>
                <td className="p-4 text-right font-bold">{Number(order.total).toLocaleString()} DH</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : order.paymentStatus === 'unpaid' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="p-4 text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => handleEdit(order)} className="text-xs text-indigo-600 hover:underline">Modifier</button>
                    <button onClick={() => handleDelete(order._id)} className="text-xs text-red-600 hover:underline">Supprimer</button>
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan="7" className="text-center text-slate-400 py-8">Aucune commande</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
