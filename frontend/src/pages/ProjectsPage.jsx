import { useEffect, useState } from 'react';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject
} from '../api/projects';
import { getClients } from '../api/clients';
import { useToast } from '../components/Toast';
import KanbanBoard from '../components/KanbanBoard';
import TeamManagement from '../components/TeamManagement';

const projectStatuses = [
  { value: 'draft', label: 'Brouillon', color: 'bg-slate-100 text-slate-600' },
  { value: 'pending', label: 'En attente', color: 'bg-amber-100 text-amber-700' },
  { value: 'active', label: 'Actif', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'on_hold', label: 'En pause', color: 'bg-orange-100 text-orange-700' },
  { value: 'completed', label: 'Terminé', color: 'bg-blue-100 text-blue-700' },
  { value: 'cancelled', label: 'Annulé', color: 'bg-red-100 text-red-600' },
  { value: 'archived', label: 'Archivé', color: 'bg-gray-100 text-gray-600' }
];

const priorities = [
  { value: 'low', label: 'Basse', color: 'text-slate-500' },
  { value: 'medium', label: 'Moyenne', color: 'text-amber-600' },
  { value: 'high', label: 'Haute', color: 'text-orange-600' },
  { value: 'critical', label: 'Critique', color: 'text-red-600' }
];

function getStatusColor(status) {
  const s = projectStatuses.find(x => x.value === status);
  return s ? s.color : 'bg-slate-100 text-slate-600';
}

function getStatusLabel(status) {
  const s = projectStatuses.find(x => x.value === status);
  return s ? s.label : status;
}

function getPriorityColor(priority) {
  const p = priorities.find(x => x.value === priority);
  return p ? p.color : 'text-slate-500';
}

function getPriorityLabel(priority) {
  const p = priorities.find(x => x.value === priority);
  return p ? p.label : priority;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [filter, setFilter] = useState({ search: '', status: '', priority: '' });
  const [form, setForm] = useState({
    name: '',
    description: '',
    clientId: '',
    status: 'draft',
    priority: 'medium',
    startDate: '',
    dueDate: '',
    budget: 0,
    actualCost: 0,
    progress: 0,
    isBillable: true,
    notes: ''
  });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [projData, clientData] = await Promise.all([
        getProjects(filter),
        getClients()
      ]);
      setProjects(projData);
      setClients(clientData);
    } catch (e) {
      addToast(e.data?.message || 'Erreur de chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.clientId) {
      addToast('Veuillez remplir tous les champs obligatoires', 'warning');
      return;
    }
    const payload = { ...form };
    payload.budget = Number(payload.budget) || 0;
    payload.actualCost = Number(payload.actualCost) || 0;
    payload.progress = Number(payload.progress) || 0;
    
    try {
      if (selected) {
        await updateProject(selected._id, payload);
        addToast('Projet mis à jour avec succès', 'success');
      } else {
        await createProject(payload);
        addToast('Projet créé avec succès', 'success');
      }
      resetForm();
      load();
    } catch (e) {
      addToast(e.data?.message || 'Erreur lors de la sauvegarde', 'error');
    }
  };

  const handleEdit = (project) => {
    setSelected(project);
    setForm({
      name: project.name || '',
      description: project.description || '',
      clientId: project.clientId?._id || project.clientId || '',
      status: project.status || 'draft',
      priority: project.priority || 'medium',
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      dueDate: project.dueDate ? project.dueDate.split('T')[0] : '',
      budget: project.budget || 0,
      actualCost: project.actualCost || 0,
      progress: project.progress || 0,
      isBillable: project.isBillable !== false,
      notes: project.notes || ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;
    try {
      await deleteProject(id);
      addToast('Projet supprimé avec succès', 'success');
      load();
    } catch (e) {
      addToast(e.data?.message || 'Erreur lors de la suppression', 'error');
    }
  };

  const resetForm = () => {
    setSelected(null);
    setForm({
      name: '', description: '', clientId: '', status: 'draft', priority: 'medium',
      startDate: '', dueDate: '', budget: 0, actualCost: 0, progress: 0, isBillable: true, notes: ''
    });
  };

  const getClientName = (clientId) => {
    if (!clientId) return 'Client inconnu';
    if (typeof clientId === 'object') return clientId.name;
    const client = clients.find(c => c._id === clientId);
    return client?.name || 'Client inconnu';
  };

  const isOverdue = (project) => {
    if (!project.dueDate) return false;
    return new Date(project.dueDate) < new Date() && !['completed', 'cancelled', 'archived'].includes(project.status);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des Projets</h1>
          <p className="text-slate-500 mt-1">Gérez vos projets et missions</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            {projects.length} projet(s)
          </span>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1 bg-white rounded-2xl p-6 shadow-lg border border-slate-100 h-fit">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800">
              {selected ? 'Modifier' : 'Créer'} un projet
            </h2>
            {selected && (
              <button onClick={resetForm} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                + Nouveau
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Nom du projet <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                placeholder="Ex: Audit financier 2026"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                value={form.clientId}
                onChange={e => setForm({ ...form, clientId: e.target.value })}
                required
              >
                <option value="">Sélectionner un client</option>
                {clients.map(client => (
                  <option key={client._id} value={client._id}>{client.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                rows={2}
                placeholder="Description du projet..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Statut</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  {projectStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Priorité</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                >
                  {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date de début</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date limite</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  value={form.dueDate}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Budget (DH)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  placeholder="0"
                  value={form.budget}
                  onChange={e => setForm({ ...form, budget: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Coût réel (DH)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  placeholder="0"
                  value={form.actualCost}
                  onChange={e => setForm({ ...form, actualCost: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Progression ({form.progress}%)</label>
              <input
                type="range"
                min="0"
                max="100"
                className="w-full"
                value={form.progress}
                onChange={e => setForm({ ...form, progress: e.target.value })}
              />
            </div>
            
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isBillable}
                onChange={e => setForm({ ...form, isBillable: e.target.checked })}
                className="rounded"
              />
              <span className="text-slate-600">Projet facturable</span>
            </label>
            
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
            >
              {selected ? 'Mettre à jour' : 'Créer le projet'}
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
            <h2 className="text-lg font-semibold text-slate-800">Liste des projets</h2>
          </div>
          
          <div className="flex gap-2 mb-4">
            <input
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
              placeholder="Rechercher un projet..."
              value={filter.search}
              onChange={e => setFilter({ ...filter, search: e.target.value })}
            />
            <select
              className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
              value={filter.status}
              onChange={e => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="">Tous statuts</option>
              {projectStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select
              className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
              value={filter.priority}
              onChange={e => setFilter({ ...filter, priority: e.target.value })}
            >
              <option value="">Toutes priorités</option>
              {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
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
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p>Aucun projet trouvé</p>
              </div>
            ) : (
              projects.map(project => (
                <div
                  key={project._id}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selected?._id === project._id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-slate-100 hover:border-slate-200 hover:shadow-md'
                  }`}
                  onClick={() => handleEdit(project)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl ${
                        project.status === 'active' ? 'bg-emerald-100' :
                        project.status === 'completed' ? 'bg-blue-100' :
                        project.status === 'cancelled' ? 'bg-red-100' :
                        project.status === 'on_hold' ? 'bg-orange-100' : 'bg-amber-100'
                      }`}>
                        {project.status === 'completed' ? '✓' : 
                         project.status === 'active' ? '⚡' :
                         project.status === 'on_hold' ? '⏸' :
                         project.status === 'cancelled' ? '✕' : '📋'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-slate-900">{project.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {getStatusLabel(project.status)}
                          </span>
                          {isOverdue(project) && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                              En retard
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          Client: {getClientName(project.clientId)}
                        </p>
                        <div className="flex gap-4 mt-2 text-xs text-slate-400">
                          {project.dueDate && (
                            <span className={`flex items-center gap-1 ${isOverdue(project) ? 'text-red-500' : ''}`}>
                              📅 {new Date(project.dueDate).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                          <span className={`flex items-center gap-1 ${getPriorityColor(project.priority)}`}>
                            ⚠ {getPriorityLabel(project.priority)}
                          </span>
                          {project.budget > 0 && (
                            <span className="flex items-center gap-1">
                              💰 {project.budget.toLocaleString('fr-MA')} DH
                            </span>
                          )}
                        </div>
                        {project.progress > 0 && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                              <span>Progression</span>
                              <span>{project.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  project.progress === 100 ? 'bg-emerald-500' :
                                  project.progress >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                                }`} 
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => { setActiveProjectId(project._id); setShowKanban(true); }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                        title="Kanban"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2m0-10a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </button>
                      <button
                        onClick={() => { setActiveProjectId(project._id); setShowTeam(true); }}
                        className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition"
                        title="Équipe"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H3v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEdit(project)}
                        className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
                        title="Modifier"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2l3.293 3.293-1.414 1.414z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(project._id)}
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
      
      {showKanban && activeProjectId && (
        <KanbanBoard projectId={activeProjectId} onClose={() => { setShowKanban(false); setActiveProjectId(null); }} />
      )}
      
      {showTeam && activeProjectId && (
        <TeamManagement projectId={activeProjectId} onClose={() => { setShowTeam(false); setActiveProjectId(null); }} />
      )}
    </div>
  );
}