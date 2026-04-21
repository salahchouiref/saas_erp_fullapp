import { useEffect, useState } from 'react';
import {
  getClients,
  createClient,
  updateClient,
  deleteClient
} from '../api/clients';
import { useToast } from '../components/Toast';

const clientStatuses = [
  { value: 'lead', label: 'Prospect', color: 'bg-blue-100 text-blue-700' },
  { value: 'prospect', label: 'Intéressé', color: 'bg-purple-100 text-purple-700' },
  { value: 'active', label: 'Actif', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'inactive', label: 'Inactif', color: 'bg-slate-100 text-slate-600' },
  { value: 'churned', label: 'Perdu', color: 'bg-red-100 text-red-600' }
];

const industries = ['Technologie', 'Finance', 'Santé', 'Retail', 'Industrie', 'Construction', 'Service', 'Autre'];

function getStatusColor(status) {
  const s = clientStatuses.find(x => x.value === status);
  return s ? s.color : 'bg-slate-100 text-slate-600';
}

function getStatusLabel(status) {
  const s = clientStatuses.find(x => x.value === status);
  return s ? s.label : status;
}

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [filter, setFilter] = useState({ search: '', status: '', industry: '' });
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    industry: '',
    status: 'lead',
    website: '',
    taxId: '',
    address: { street: '', city: '', state: '', zipCode: '', country: 'Maroc' },
    contactPerson: { name: '', role: '', email: '', phone: '' },
    annualRevenue: 0,
    employeeCount: 0,
    notes: '',
    tags: []
  });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await getClients(filter);
      setClients(data);
    } catch (e) {
      addToast(e.data?.message || 'Erreur de chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    payload.annualRevenue = Number(payload.annualRevenue) || 0;
    payload.employeeCount = Number(payload.employeeCount) || 0;
    
    try {
      if (selected) {
        await updateClient(selected._id, payload);
        addToast('Client mis à jour avec succès', 'success');
      } else {
        await createClient(payload);
        addToast('Client créé avec succès', 'success');
      }
      resetForm();
      load();
    } catch (e) {
      addToast(e.data?.message || 'Erreur lors de la sauvegarde', 'error');
    }
  };

  const handleEdit = (client) => {
    setSelected(client);
    setForm({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || '',
      industry: client.industry || '',
      status: client.status || 'lead',
      website: client.website || '',
      taxId: client.taxId || '',
      address: client.address || { street: '', city: '', state: '', zipCode: '', country: 'Maroc' },
      contactPerson: client.contactPerson || { name: '', role: '', email: '', phone: '' },
      annualRevenue: client.annualRevenue || 0,
      employeeCount: client.employeeCount || 0,
      notes: client.notes || '',
      tags: client.tags || []
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return;
    try {
      await deleteClient(id);
      addToast('Client supprimé avec succès', 'success');
      load();
    } catch (e) {
      addToast(e.data?.message || 'Erreur lors de la suppression', 'error');
    }
  };

  const resetForm = () => {
    setSelected(null);
    setForm({
      name: '', email: '', phone: '', company: '', industry: '', status: 'lead', website: '', taxId: '',
      address: { street: '', city: '', state: '', zipCode: '', country: 'Maroc' },
      contactPerson: { name: '', role: '', email: '', phone: '' },
      annualRevenue: 0, employeeCount: 0, notes: '', tags: []
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des Clients</h1>
          <p className="text-slate-500 mt-1">Gérez vos clients et partenaires</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
            {clients.length} client(s)
          </span>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1 bg-white rounded-2xl p-6 shadow-lg border border-slate-100 h-fit">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800">
              {selected ? 'Modifier' : 'Ajouter'} un client
            </h2>
            {selected && (
              <button onClick={resetForm} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                + Nouveau
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nom du client <span className="text-red-500">*</span></label>
              <input
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                placeholder="Nom ou raison sociale"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Entreprise</label>
                <input
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  placeholder="Nom de l'entreprise"
                  value={form.company}
                  onChange={e => setForm({ ...form, company: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Secteur</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  value={form.industry}
                  onChange={e => setForm({ ...form, industry: e.target.value })}
                >
                  <option value="">Sélectionner</option>
                  {industries.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  placeholder="contact@entreprise.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Téléphone</label>
                <input
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  placeholder="+212 6XX XXX XXX"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Site web</label>
                <input
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  placeholder="https://..."
                  value={form.website}
                  onChange={e => setForm({ ...form, website: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Statut</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  {clientStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Chiffre d'affaires</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  placeholder="Revenue annuel"
                  value={form.annualRevenue}
                  onChange={e => setForm({ ...form, annualRevenue: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Effectif</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  placeholder="Nombre d'employés"
                  value={form.employeeCount}
                  onChange={e => setForm({ ...form, employeeCount: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Adresse</label>
              <input
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                placeholder="Adresse complète"
                value={form.address?.street || ''}
                onChange={e => setForm({ ...form, address: { ...form.address, street: e.target.value } })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Ville</label>
                <input
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  placeholder="Ville"
                  value={form.address?.city || ''}
                  onChange={e => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">ICE/IF</label>
                <input
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  placeholder="Numéro d'identification"
                  value={form.taxId}
                  onChange={e => setForm({ ...form, taxId: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
              <textarea
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                rows={2}
                placeholder="Notes supplémentaires..."
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg"
            >
              {selected ? 'Mettre à jour' : 'Ajouter le client'}
            </button>
            
            {selected && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition"
              >
                Annuler
              </button>
            )}
          </form>
        </div>

        <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Liste des clients</h2>
          </div>
          
          <div className="flex gap-2 mb-4">
            <input
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
              placeholder="Rechercher un client..."
              value={filter.search}
              onChange={e => setFilter({ ...filter, search: e.target.value })}
            />
            <select
              className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
              value={filter.status}
              onChange={e => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="">Tous statuts</option>
              {clientStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select
              className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
              value={filter.industry}
              onChange={e => setFilter({ ...filter, industry: e.target.value })}
            >
              <option value="">Tous secteurs</option>
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
            <button
              onClick={load}
              className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : clients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p>Aucun client trouvé</p>
              </div>
            ) : (
              clients.map(client => (
                <div
                  key={client._id}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selected?._id === client._id
                      ? 'border-emerald-500 bg-emerald-50 shadow-md'
                      : 'border-slate-100 hover:border-slate-200 hover:shadow-md'
                  }`}
                  onClick={() => handleEdit(client)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                        {(client.name || 'C')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{client.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                            {getStatusLabel(client.status)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">
                          {client.company || 'Entreprise non définie'} • {client.industry || 'Secteur non défini'}
                        </p>
                        <div className="flex gap-4 mt-1 text-xs text-slate-400">
                          {client.email && <span className="flex items-center gap-1">✉ {client.email}</span>}
                          {client.phone && <span className="flex items-center gap-1">📞 {client.phone}</span>}
                          {client.annualRevenue > 0 && <span className="flex items-center gap-1">💰 {client.annualRevenue.toLocaleString('fr-MA')} DH</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleEdit(client)}
                        className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
                        title="Modifier"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2l3.293 3.293-1.414 1.414z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(client._id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                        title="Supprimer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}