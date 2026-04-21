import { useEffect, useState } from 'react';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from '../api/employees';
import { useToast } from '../components/Toast';

const departments = ['IT', 'Finance', 'RH', 'Marketing', 'Ventes', 'Support', 'Direction', 'Juridique', 'Autre'];
const statuses = [
  { value: 'active', label: 'Actif', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'inactive', label: 'Inactif', color: 'bg-slate-100 text-slate-600' },
  { value: 'on_leave', label: 'En Congé', color: 'bg-amber-100 text-amber-700' },
  { value: 'terminated', label: 'Licencié', color: 'bg-red-100 text-red-600' }
];

function getStatusColor(status) {
  const s = statuses.find(x => x.value === status);
  return s ? s.color : 'bg-slate-100 text-slate-600';
}

function getStatusLabel(status) {
  const s = statuses.find(x => x.value === status);
  return s ? s.label : status;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [filter, setFilter] = useState({ search: '', department: '', status: '' });
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    salary: '',
    leaveBalance: 0,
    leaveTaken: 0,
    status: 'active',
    hireDate: '',
    address: { street: '', city: '', state: '', zipCode: '', country: 'Maroc' },
    emergencyContact: { name: '', phone: '', relationship: '' },
    skills: [],
    notes: ''
  });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await getEmployees(filter);
      setEmployees(data);
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
    payload.salary = Number(payload.salary);
    payload.leaveBalance = Number(payload.leaveBalance) || 0;
    payload.leaveTaken = Number(payload.leaveTaken) || 0;
    
    try {
      if (selected) {
        await updateEmployee(selected._id, payload);
        addToast('Employé mis à jour avec succès', 'success');
      } else {
        await createEmployee(payload);
        addToast('Employé créé avec succès', 'success');
      }
      resetForm();
      load();
    } catch (e) {
      addToast(e.data?.message || 'Erreur lors de la sauvegarde', 'error');
    }
  };

  const handleEdit = (emp) => {
    setSelected(emp);
    setForm({
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      email: emp.email || '',
      phone: emp.phone || '',
      position: emp.position || '',
      department: emp.department || '',
      salary: emp.salary || '',
      leaveBalance: emp.leaveBalance || 0,
      leaveTaken: emp.leaveTaken || 0,
      status: emp.status || 'active',
      hireDate: emp.hireDate ? emp.hireDate.split('T')[0] : '',
      address: emp.address || { street: '', city: '', state: '', zipCode: '', country: 'Maroc' },
      emergencyContact: emp.emergencyContact || { name: '', phone: '', relationship: '' },
      skills: emp.skills || [],
      notes: emp.notes || ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) return;
    try {
      await deleteEmployee(id);
      addToast('Employé supprimé avec succès', 'success');
      load();
    } catch (e) {
      addToast(e.data?.message || 'Erreur lors de la suppression', 'error');
    }
  };

  const resetForm = () => {
    setSelected(null);
    setForm({
      firstName: '', lastName: '', email: '', phone: '', position: '', department: '',
      salary: '', leaveBalance: 0, leaveTaken: 0, status: 'active', hireDate: '',
      address: { street: '', city: '', state: '', zipCode: '', country: 'Maroc' },
      emergencyContact: { name: '', phone: '', relationship: '' },
      skills: [], notes: ''
    });
  };

  const getFullName = (emp) => `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.position || 'Employé';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des Employés</h1>
          <p className="text-slate-500 mt-1">Gérez votre effectif facilement</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
            {employees.length} employé(s)
          </span>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1 bg-white rounded-2xl p-6 shadow-lg border border-slate-100 h-fit">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800">
              {selected ? 'Modifier' : 'Ajouter'}
            </h2>
            {selected && (
              <button onClick={resetForm} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                + Nouveau
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Prénom <span className="text-red-500">*</span></label>
                <input
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  placeholder="Prénom"
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nom <span className="text-red-500">*</span></label>
                <input
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  placeholder="Nom"
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                placeholder="email@exemple.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Téléphone</label>
                <input
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  placeholder="+212 6XX XXX XXX"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Département</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  value={form.department}
                  onChange={e => setForm({ ...form, department: e.target.value })}
                >
                  <option value="">Sélectionner</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Poste <span className="text-red-500">*</span></label>
                <input
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  placeholder="Poste"
                  value={form.position}
                  onChange={e => setForm({ ...form, position: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Salaire (DH)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  placeholder="5000"
                  value={form.salary}
                  onChange={e => setForm({ ...form, salary: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date d'embauche</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  value={form.hireDate}
                  onChange={e => setForm({ ...form, hireDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Statut</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Congés restants</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  value={form.leaveBalance}
                  onChange={e => setForm({ ...form, leaveBalance: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Congés pris</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  value={form.leaveTaken}
                  onChange={e => setForm({ ...form, leaveTaken: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Adresse</label>
              <input
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                placeholder="Adresse"
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
                <label className="block text-xs font-medium text-slate-600 mb-1">Code postal</label>
                <input
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  placeholder="XXXXX"
                  value={form.address?.zipCode || ''}
                  onChange={e => setForm({ ...form, address: { ...form.address, zipCode: e.target.value } })}
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg"
            >
              {selected ? 'Mettre à jour' : 'Ajouter l\'employé'}
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
            <h2 className="text-lg font-semibold text-slate-800">Liste des employés</h2>
          </div>
          
          <div className="flex gap-2 mb-4">
            <input
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
              placeholder="Rechercher..."
              value={filter.search}
              onChange={e => setFilter({ ...filter, search: e.target.value })}
            />
            <select
              className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
              value={filter.department}
              onChange={e => setFilter({ ...filter, department: e.target.value })}
            >
              <option value="">Tous</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select
              className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
              value={filter.status}
              onChange={e => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="">Tous statuts</option>
              {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
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
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : employees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H3v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p>Aucun employé trouvé</p>
              </div>
            ) : (
              employees.map(emp => (
                <div
                  key={emp._id}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selected?._id === emp._id
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-slate-100 hover:border-slate-200 hover:shadow-md'
                  }`}
                  onClick={() => handleEdit(emp)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {emp.firstName?.[0] || 'E'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{getFullName(emp)}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(emp.status)}`}>
                            {getStatusLabel(emp.status)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">{emp.position || 'Poste non défini'} • {emp.department || 'Département non défini'}</p>
                        <div className="flex gap-4 mt-1 text-xs text-slate-400">
                          {emp.email && <span className="flex items-center gap-1">✉ {emp.email}</span>}
                          {emp.phone && <span className="flex items-center gap-1">📞 {emp.phone}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleEdit(emp)}
                        className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
                        title="Modifier"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2l3.293 3.293-1.414 1.414z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(emp._id)}
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