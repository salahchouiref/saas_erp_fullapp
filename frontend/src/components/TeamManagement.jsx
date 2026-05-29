import { useState, useEffect } from 'react';
import {
  getTeamMembers,
  addTeamMember,
  removeTeamMember,
  updateTeamMember
} from '../api/tasks';
import { getEmployees } from '../api/employees';
import { useToast } from './Toast';

const roles = [
  { value: 'manager', label: 'Manager', description: 'Gère le projet' },
  { value: 'developer', label: 'Développeur', description: 'Développe les fonctionnalités' },
  { value: 'designer', label: 'Designer', description: 'Conçoit les interfaces' },
  { value: 'qa', label: 'QA', description: 'Assure la qualité' },
  { value: 'analyst', label: 'Analyste', description: 'Analyse les besoins' },
  { value: 'other', label: 'Autre', description: 'Autre rôle' }
];

function getRoleLabel(role) {
  const r = roles.find(x => x.value === role);
  return r ? r.label : role;
}

function getRoleDescription(role) {
  const r = roles.find(x => x.value === role);
  return r ? r.description : '';
}

export default function TeamManagement({ projectId, onClose }) {
  const [members, setMembers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newMember, setNewMember] = useState({ userId: '', role: 'developer' });
  const { addToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [membersData, employeesData] = await Promise.all([
        getTeamMembers(projectId),
        getEmployees({})
      ]);
      setMembers(membersData || []);
      setEmployees(employeesData || []);
    } catch (e) {
      console.error('Error loading team:', e);
      addToast(e?.data?.message || 'Erreur de chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) loadData();
  }, [projectId]);

  const handleAdd = async () => {
    if (!newMember.userId) {
      addToast('Sélectionnez un membre', 'warning');
      return;
    }
    try {
      await addTeamMember(projectId, newMember);
      addToast('Membre ajouté', 'success');
      setShowAdd(false);
      setNewMember({ userId: '', role: 'developer' });
      loadData();
    } catch (e) {
      addToast(e.data?.message || 'Erreur', 'error');
    }
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm('Retirer ce membre de l\'équipe ?')) return;
    try {
      await removeTeamMember(projectId, memberId);
      addToast('Membre retiré', 'success');
      loadData();
    } catch (e) {
      addToast(e.data?.message || 'Erreur', 'error');
    }
  };

  const alreadyMembers = members.map(m => m.userId?._id || m.userId);
  const availableEmployees = employees.filter(e => {
    const empId = e._id?.toString();
    return !alreadyMembers.includes(empId);
  });

  const getEmployeeDisplayName = (emp) => {
    if (emp.firstName && emp.lastName) {
      return `${emp.firstName} ${emp.lastName}`;
    }
    return emp.position || emp.email || 'Employé';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Équipe du projet</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>Aucun membre dans l'équipe</p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map(member => (
                <div key={member._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {(member.userId?.name || 'M')[0]}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{member.userId?.name || 'Membre'}</p>
                      <p className="text-xs text-slate-500">{member.userId?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                      {getRoleLabel(member.role)}
                    </span>
                    <button
                      onClick={() => handleRemove(member._id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          {showAdd ? (
            <div className="space-y-3">
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                value={newMember.userId}
                onChange={e => setNewMember({ ...newMember, userId: e.target.value })}
              >
                <option value="">Sélectionner un employé</option>
                {availableEmployees.map(emp => (
                  <option key={emp._id} value={emp._id}>
                    {getEmployeeDisplayName(emp)} - {emp.position || emp.department || 'N/A'}
                  </option>
                ))}
              </select>
              
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                value={newMember.role}
                onChange={e => setNewMember({ ...newMember, role: e.target.value })}
              >
                {roles.map(r => (
                  <option key={r.value} value={r.value}>{r.label} - {r.description}</option>
                ))}
              </select>
              
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                >
                  Ajouter
                </button>
                <button
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              + Ajouter un membre
            </button>
          )}
        </div>
      </div>
    </div>
  );
}