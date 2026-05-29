import { useState, useEffect } from 'react';
import { getDeliveries, createDelivery, updateDeliveryStatus, getAgents, createAgent } from '../../api/delivery';

const statusLabels = {
  pending: 'En attente', assigned: 'Assignée', picked_up: 'Ramassée',
  in_transit: 'En transit', delivered: 'Livrée', failed: 'Échouée', returned: 'Retournée'
};

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [agents, setAgents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const [form, setForm] = useState({ orderId: '', agentId: '', deliveryAddress: { street: '', city: '' } });
  const [agentForm, setAgentForm] = useState({ name: '', phone: '', vehicleType: 'car' });

  useEffect(() => { loadDeliveries(); loadAgents(); }, [statusFilter]);

  const loadDeliveries = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = await getDeliveries(params);
      setDeliveries(data);
    } catch (err) { console.error(err); }
  };

  const loadAgents = async () => {
    try { setAgents(await getAgents()); } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createDelivery(form);
      setShowForm(false);
      setForm({ orderId: '', agentId: '', deliveryAddress: { street: '', city: '' } });
      loadDeliveries();
    } catch (err) { alert(err.data?.message || 'Error'); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateDeliveryStatus(id, { status });
      loadDeliveries();
    } catch {}
  };

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    try {
      await createAgent(agentForm);
      setShowAgentForm(false);
      setAgentForm({ name: '', phone: '', vehicleType: 'car' });
      loadAgents();
    } catch (err) { alert(err.data?.message || 'Error'); }
  };

  const getStatusColor = (status) => {
    const colors = {
      delivered: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      in_transit: 'bg-blue-100 text-blue-700',
      picked_up: 'bg-amber-100 text-amber-700',
      assigned: 'bg-indigo-100 text-indigo-700',
      pending: 'bg-slate-100 text-slate-600',
      returned: 'bg-purple-100 text-purple-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-600';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Gestion des Livraisons</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowAgentForm(true)} className="btn-secondary">+ Livreur</button>
          <button onClick={() => setShowForm(true)} className="btn-primary">+ Nouvelle Livraison</button>
        </div>
      </div>

      <div className="mb-6">
        <select className="input-field max-w-[180px]" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Tous les statuts</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-soft" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Nouvelle Livraison</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="label-field">ID Commande <input className="input-field" value={form.orderId} onChange={e => setForm({ ...form, orderId: e.target.value })} required /></label>
              <label className="label-field">Livreur
                <select className="input-field" value={form.agentId} onChange={e => setForm({ ...form, agentId: e.target.value })}>
                  <option value="">Sélectionner...</option>
                  {agents.map(a => <option key={a._id} value={a._id}>{a.name} {a.isAvailable ? '(Dispo)' : '(Occupé)'}</option>)}
                </select>
              </label>
              <label className="label-field">Rue <input className="input-field" value={form.deliveryAddress.street} onChange={e => setForm({ ...form, deliveryAddress: { ...form.deliveryAddress, street: e.target.value } })} /></label>
              <label className="label-field">Ville <input className="input-field" value={form.deliveryAddress.city} onChange={e => setForm({ ...form, deliveryAddress: { ...form.deliveryAddress, city: e.target.value } })} /></label>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">Créer</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAgentForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowAgentForm(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-soft" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Nouveau Livreur</h3>
            <form onSubmit={handleCreateAgent} className="space-y-4">
              <label className="label-field">Nom <input className="input-field" value={agentForm.name} onChange={e => setAgentForm({ ...agentForm, name: e.target.value })} required /></label>
              <label className="label-field">Téléphone <input className="input-field" value={agentForm.phone} onChange={e => setAgentForm({ ...agentForm, phone: e.target.value })} required /></label>
              <label className="label-field">Véhicule
                <select className="input-field" value={agentForm.vehicleType} onChange={e => setAgentForm({ ...agentForm, vehicleType: e.target.value })}>
                  <option value="car">Voiture</option>
                  <option value="bike">Moto</option>
                  <option value="van">Camionnette</option>
                  <option value="truck">Camion</option>
                </select>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">Créer</button>
                <button type="button" onClick={() => setShowAgentForm(false)} className="btn-secondary">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {deliveries.map(delivery => (
          <div key={delivery._id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm font-bold text-slate-800">Livraison #{delivery._id.slice(-6)}</span>
                <span className="text-xs text-slate-500 ml-3">Commande: {delivery.orderId?.orderNumber || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                  {statusLabels[delivery.status]}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Livreur</p>
                <p className="font-medium">{delivery.agentId?.name || 'Non assigné'}</p>
                {delivery.agentId?.phone && <p className="text-xs text-slate-400">{delivery.agentId.phone}</p>}
              </div>
              <div>
                <p className="text-slate-500">Adresse</p>
                <p className="font-medium">{delivery.deliveryAddress?.street || 'N/A'}</p>
                <p className="text-xs text-slate-400">{delivery.deliveryAddress?.city || ''}</p>
              </div>
              <div>
                <p className="text-slate-500">Estimée</p>
                <p className="font-medium">{delivery.estimatedDeliveryTime ? new Date(delivery.estimatedDeliveryTime).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            {delivery.status !== 'delivered' && delivery.status !== 'failed' && delivery.status !== 'returned' && (
              <div className="mt-4 flex gap-2 pt-3 border-t border-slate-100">
                {delivery.status === 'pending' && <button onClick={() => handleStatusUpdate(delivery._id, 'assigned')} className="btn-secondary text-xs py-2 px-4">Assigner</button>}
                {delivery.status === 'assigned' && <button onClick={() => handleStatusUpdate(delivery._id, 'picked_up')} className="btn-secondary text-xs py-2 px-4">Ramasser</button>}
                {delivery.status === 'picked_up' && <button onClick={() => handleStatusUpdate(delivery._id, 'in_transit')} className="btn-secondary text-xs py-2 px-4">En Transit</button>}
                {delivery.status === 'in_transit' && <button onClick={() => handleStatusUpdate(delivery._id, 'delivered')} className="btn-primary text-xs py-2 px-4">Livrer</button>}
                <button onClick={() => handleStatusUpdate(delivery._id, 'failed')} className="text-xs text-red-600 hover:underline px-2">Échec</button>
              </div>
            )}
            {delivery.timeline && delivery.timeline.length > 0 && (
              <div className="mt-3 flex gap-3 text-xs text-slate-400">
                {delivery.timeline.slice(-3).map((t, i) => (
                  <span key={i}>{statusLabels[t.status] || t.status} ({new Date(t.timestamp).toLocaleTimeString()})</span>
                ))}
              </div>
            )}
          </div>
        ))}
        {deliveries.length === 0 && <p className="text-slate-400 text-center py-8">Aucune livraison</p>}
      </div>

      <div className="mt-10">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Livreurs</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {agents.map(agent => (
            <div key={agent._id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{agent.name}</p>
                  <p className="text-xs text-slate-500">{agent.phone}</p>
                  <p className="text-xs text-slate-400">{agent.vehicleType} • {agent.totalDeliveries || 0} livraisons</p>
                </div>
                <span className={`w-3 h-3 rounded-full ${agent.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} title={agent.isAvailable ? 'Disponible' : 'Occupé'} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
