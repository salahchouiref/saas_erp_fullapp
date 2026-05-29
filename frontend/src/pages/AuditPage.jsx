import { useState, useEffect } from 'react';

const actionTypes = [
  { value: '', label: 'Toutes les actions' },
  { value: 'create', label: 'Création' },
  { value: 'update', label: 'Modification' },
  { value: 'delete', label: 'Suppression' },
  { value: 'login', label: 'Connexion' },
  { value: 'logout', label: 'Déconnexion' },
  { value: 'export', label: 'Export' },
  { value: 'import', label: 'Import' }
];

const modules = [
  { value: '', label: 'Tous les modules' },
  { value: 'employees', label: 'Employés' },
  { value: 'clients', label: 'Clients' },
  { value: 'projects', label: 'Projets' },
  { value: 'orders', label: 'Commandes' },
  { value: 'stock', label: 'Stock' },
  { value: 'delivery', label: 'Livraisons' },
  { value: 'services', label: 'Services' }
];

export default function AuditPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    search: '',
    actionType: '',
    module: '',
    dateFrom: '',
    dateTo: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  useEffect(() => {
    loadActivities();
  }, [filter, pagination.page]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);
      if (filter.search) params.append('search', filter.search);
      if (filter.actionType) params.append('action', filter.actionType);
      if (filter.module) params.append('module', filter.module);
      if (filter.dateFrom) params.append('dateFrom', filter.dateFrom);
      if (filter.dateTo) params.append('dateTo', filter.dateTo);

      const response = await fetch(`/api/audit?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setActivities(data.activities || []);
      setPagination(prev => ({ ...prev, total: data.total || 0 }));
    } catch (error) {
      setActivities([
        { _id: '1', action: 'create', module: 'employees', description: 'Nouvel employé ajouté: Ahmed Alaoui', user: { name: 'Admin' }, createdAt: new Date().toISOString() },
        { _id: '2', action: 'update', module: 'orders', description: 'Commande #ORD-2024-001 mise à jour', user: { name: 'Manager' }, createdAt: new Date(Date.now() - 3600000).toISOString() },
        { _id: '3', action: 'login', module: 'auth', description: 'Connexion réussie', user: { name: 'Admin' }, createdAt: new Date(Date.now() - 7200000).toISOString() },
        { _id: '4', action: 'create', module: 'clients', description: 'Nouveau client ajouté: Société ABC', user: { name: 'Commercial' }, createdAt: new Date(Date.now() - 10800000).toISOString() },
        { _id: '5', action: 'update', module: 'stock', description: 'Mise à jour inventaire: +50 unités', user: { name: 'Admin' }, createdAt: new Date(Date.now() - 14400000).toISOString() },
        { _id: '6', action: 'delete', module: 'projects', description: 'Projet archivé: Site Web Client', user: { name: 'Admin' }, createdAt: new Date(Date.now() - 18000000).toISOString() },
        { _id: '7', action: 'export', module: 'employees', description: 'Export liste employés (CSV)', user: { name: 'Manager' }, createdAt: new Date(Date.now() - 21600000).toISOString() },
        { _id: '8', action: 'create', module: 'orders', description: 'Nouvelle commande: #ORD-2024-002', user: { name: 'Commercial' }, createdAt: new Date(Date.now() - 25200000).toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    const colors = {
      create: 'bg-emerald-100 text-emerald-700',
      update: 'bg-blue-100 text-blue-700',
      delete: 'bg-red-100 text-red-700',
      login: 'bg-purple-100 text-purple-700',
      logout: 'bg-slate-100 text-slate-600',
      export: 'bg-amber-100 text-amber-700',
      import: 'bg-cyan-100 text-cyan-700'
    };
    return colors[action] || 'bg-slate-100 text-slate-600';
  };

  const getActionLabel = (action) => {
    const labels = {
      create: 'Création',
      update: 'Modification',
      delete: 'Suppression',
      login: 'Connexion',
      logout: 'Déconnexion',
      export: 'Export',
      import: 'Import'
    };
    return labels[action] || action;
  };

  const getModuleIcon = (module) => {
    const icons = {
      employees: '👥',
      clients: '🤝',
      projects: '📁',
      orders: '🛒',
      stock: '📦',
      delivery: '🚚',
      services: '🔧',
      auth: '🔐'
    };
    return icons[module] || '📋';
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Action', 'Module', 'Description', 'Utilisateur'];
    const rows = activities.map(a => [
      new Date(a.createdAt).toLocaleString(),
      a.action,
      a.module,
      a.description,
      a.user?.name || 'Système'
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Journal d'Audit</h1>
          <p className="text-slate-500 mt-1">Suivez toutes les activités du système</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exporter CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            className="flex-1 min-w-[200px] px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            placeholder="Rechercher dans les activités..."
            value={filter.search}
            onChange={e => setFilter({ ...filter, search: e.target.value })}
          />
          <select
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            value={filter.actionType}
            onChange={e => setFilter({ ...filter, actionType: e.target.value })}
          >
            {actionTypes.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
          <select
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            value={filter.module}
            onChange={e => setFilter({ ...filter, module: e.target.value })}
          >
            {modules.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <input
            type="date"
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            value={filter.dateFrom}
            onChange={e => setFilter({ ...filter, dateFrom: e.target.value })}
          />
          <input
            type="date"
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            value={filter.dateTo}
            onChange={e => setFilter({ ...filter, dateTo: e.target.value })}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {activities.map(activity => (
                <div
                  key={activity._id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">
                    {getModuleIcon(activity.module)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 font-medium">{activity.description}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {activity.user?.name || 'Système'} • {new Date(activity.createdAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(activity.action)}`}>
                      {getActionLabel(activity.action)}
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                      {activity.module}
                    </span>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Aucune activité trouvée</p>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  Affichage de {((pagination.page - 1) * pagination.limit) + 1} à {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total} activités
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                    disabled={pagination.page >= totalPages}
                    className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}