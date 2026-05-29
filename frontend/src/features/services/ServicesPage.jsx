import { useState, useEffect } from 'react';
import { getCatalog, createCatalogItem, getServiceRequests, createServiceRequest, updateServiceRequestStatus, getTechnicians, createTechnician, getRequestHistory } from '../../api/services';

const requestStatusLabels = {
  new: 'Nouveau', assigned: 'Assigné', in_progress: 'En cours',
  on_hold: 'En pause', completed: 'Terminé', cancelled: 'Annulé'
};

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState('catalog');
  const [catalog, setCatalog] = useState([]);
  const [requests, setRequests] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [catalogForm, setCatalogForm] = useState({ name: '', description: '', category: 'consulting', basePrice: '', estimatedDuration: '', durationUnit: 'hours' });
  const [requestForm, setRequestForm] = useState({ serviceId: '', clientId: '', title: '', description: '', priority: 'medium' });

  useEffect(() => { loadCatalog(); loadRequests(); loadTechnicians(); }, []);

  const loadCatalog = async () => {
    try { const data = await getCatalog(); setCatalog(data); } catch {}
  };
  const loadRequests = async () => {
    try { const data = await getServiceRequests(); setRequests(data); } catch {}
  };
  const loadTechnicians = async () => {
    try { const data = await getTechnicians(); setTechnicians(data); } catch {}
  };

  const handleCreateCatalog = async (e) => {
    e.preventDefault();
    try {
      await createCatalogItem({ ...catalogForm, basePrice: Number(catalogForm.basePrice), estimatedDuration: catalogForm.estimatedDuration ? Number(catalogForm.estimatedDuration) : undefined });
      setShowForm(false);
      setCatalogForm({ name: '', description: '', category: 'consulting', basePrice: '', estimatedDuration: '', durationUnit: 'hours' });
      loadCatalog();
    } catch (err) { alert(err.data?.message || 'Error'); }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      await createServiceRequest(requestForm);
      setShowRequestForm(false);
      setRequestForm({ serviceId: '', clientId: '', title: '', description: '', priority: 'medium' });
      loadRequests();
    } catch (err) { alert(err.data?.message || 'Error'); }
  };

  const handleStatusUpdate = async (id, status) => {
    try { await updateServiceRequestStatus(id, { status }); loadRequests(); } catch {}
  };

  const tabs = [
    { id: 'catalog', label: 'Catalogue' },
    { id: 'requests', label: 'Demandes' },
    { id: 'technicians', label: 'Techniciens' }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Gestion des Services</h2>
        <div className="flex gap-2">
          {activeTab === 'catalog' && <button onClick={() => setShowForm(true)} className="btn-primary">+ Nouveau Service</button>}
          {activeTab === 'requests' && <button onClick={() => setShowRequestForm(true)} className="btn-primary">+ Nouvelle Demande</button>}
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-700 shadow-sm hover:bg-slate-100'}`}
          >{tab.label}</button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-soft" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Nouveau Service</h3>
            <form onSubmit={handleCreateCatalog} className="space-y-4">
              <label className="label-field">Nom <input className="input-field" value={catalogForm.name} onChange={e => setCatalogForm({ ...catalogForm, name: e.target.value })} required /></label>
              <label className="label-field">Description <textarea className="input-field" value={catalogForm.description} onChange={e => setCatalogForm({ ...catalogForm, description: e.target.value })} /></label>
              <label className="label-field">Catégorie
                <select className="input-field" value={catalogForm.category} onChange={e => setCatalogForm({ ...catalogForm, category: e.target.value })}>
                  <option value="consulting">Consulting</option>
                  <option value="development">Développement</option>
                  <option value="design">Design</option>
                  <option value="support">Support</option>
                  <option value="training">Formation</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="label-field">Prix de base <input type="number" className="input-field" value={catalogForm.basePrice} onChange={e => setCatalogForm({ ...catalogForm, basePrice: e.target.value })} /></label>
                <label className="label-field">Durée estimée <input type="number" className="input-field" value={catalogForm.estimatedDuration} onChange={e => setCatalogForm({ ...catalogForm, estimatedDuration: e.target.value })} /></label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">Créer</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRequestForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowRequestForm(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-soft" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Nouvelle Demande</h3>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <label className="label-field">ID Service <input className="input-field" value={requestForm.serviceId} onChange={e => setRequestForm({ ...requestForm, serviceId: e.target.value })} /></label>
              <label className="label-field">ID Client <input className="input-field" value={requestForm.clientId} onChange={e => setRequestForm({ ...requestForm, clientId: e.target.value })} /></label>
              <label className="label-field">Titre <input className="input-field" value={requestForm.title} onChange={e => setRequestForm({ ...requestForm, title: e.target.value })} required /></label>
              <label className="label-field">Description <textarea className="input-field" value={requestForm.description} onChange={e => setRequestForm({ ...requestForm, description: e.target.value })} /></label>
              <label className="label-field">Priorité
                <select className="input-field" value={requestForm.priority} onChange={e => setRequestForm({ ...requestForm, priority: e.target.value })}>
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                  <option value="urgent">Urgente</option>
                </select>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">Créer</button>
                <button type="button" onClick={() => setShowRequestForm(false)} className="btn-secondary">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {catalog.map(item => (
            <div key={item._id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">{item.category}</span>
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">{item.name}</h4>
              {item.description && <p className="text-xs text-slate-500 mb-3">{item.description}</p>}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="font-bold text-slate-900">{item.basePrice ? `${Number(item.basePrice).toLocaleString()} DH` : 'Sur devis'}</span>
                {item.estimatedDuration && <span className="text-xs text-slate-400">{item.estimatedDuration} {item.durationUnit}</span>}
              </div>
            </div>
          ))}
          {catalog.length === 0 && <p className="text-slate-400 col-span-full text-center py-8">Aucun service dans le catalogue</p>}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req._id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-slate-800">{req.title}</h4>
                  <p className="text-xs text-slate-500">{req.serviceId?.name} • {req.clientId?.name || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    req.status === 'completed' ? 'bg-green-100 text-green-700' :
                    req.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    req.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    req.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>{requestStatusLabels[req.status]}</span>
                </div>
              </div>
              {req.description && <p className="text-sm text-slate-600 mb-3">{req.description}</p>}
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-xs text-slate-400">
                  <span>Priorité: {req.priority}</span>
                  <span>Créé: {new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  {req.status === 'new' && <button onClick={() => handleStatusUpdate(req._id, 'assigned')} className="text-xs text-indigo-600 hover:underline">Assigner</button>}
                  {req.status === 'assigned' && <button onClick={() => handleStatusUpdate(req._id, 'in_progress')} className="text-xs text-blue-600 hover:underline">Démarrer</button>}
                  {req.status === 'in_progress' && <button onClick={() => handleStatusUpdate(req._id, 'completed')} className="text-xs text-green-600 hover:underline">Terminer</button>}
                  {req.status !== 'completed' && req.status !== 'cancelled' && (
                    <button onClick={() => handleStatusUpdate(req._id, 'cancelled')} className="text-xs text-red-600 hover:underline">Annuler</button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {requests.length === 0 && <p className="text-slate-400 text-center py-8">Aucune demande</p>}
        </div>
      )}

      {activeTab === 'technicians' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {technicians.map(tech => (
            <div key={tech._id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-slate-800">{tech.name}</h4>
                <span className={`w-3 h-3 rounded-full ${tech.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              <p className="text-xs text-slate-500 mb-1">{tech.email || tech.phone}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {(tech.skills || []).map((skill, i) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{skill}</span>
                ))}
              </div>
              {tech.rating && <p className="text-xs text-amber-500 mt-2">{'★'.repeat(Math.round(tech.rating))}</p>}
            </div>
          ))}
          {technicians.length === 0 && <p className="text-slate-400 col-span-full text-center py-8">Aucun technicien</p>}
        </div>
      )}
    </div>
  );
}
