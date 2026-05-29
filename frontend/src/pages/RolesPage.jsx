import { useState } from 'react';
import { useToast } from '../components/Toast';

const roles = [
  {
    id: 'admin',
    name: 'Administrateur',
    description: 'Accès complet à toutes les fonctionnalités',
    color: 'indigo',
    permissions: ['*'],
    userCount: 3
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Gestion des équipes et des projets',
    color: 'emerald',
    permissions: ['hr', 'clients', 'projects', 'orders', 'ai'],
    userCount: 5
  },
  {
    id: 'employee',
    name: 'Employé',
    description: 'Accès limité aux fonctionnalités de base',
    color: 'blue',
    permissions: ['projects', 'ai'],
    userCount: 12
  }
];

const allPermissions = [
  { key: 'hr', label: 'Gestion RH', description: 'Voir et gérer les employés' },
  { key: 'clients', label: 'Clients', description: 'Gérer les clients et leads' },
  { key: 'projects', label: 'Projets', description: 'Créer et suivre les projets' },
  { key: 'orders', label: 'Commandes', description: 'Gérer les commandes' },
  { key: 'stock', label: 'Stock', description: 'Gérer l\'inventaire' },
  { key: 'delivery', label: 'Livraisons', description: 'Suivre les livraisons' },
  { key: 'services', label: 'Services', description: 'Gérer les services' },
  { key: 'payslips', label: 'Paie', description: 'Gérer les bulletins de salaire' },
  { key: 'audit', label: 'Audit', description: 'Voir les logs d\'activité' },
  { key: 'settings', label: 'Paramètres', description: 'Modifier les paramètres' },
  { key: 'ai', label: 'IA', description: 'Accéder à l\'assistant IA' }
];

export default function RolesPage() {
  const { addToast } = useToast();
  const [selectedRole, setSelectedRole] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedPermissions, setEditedPermissions] = useState([]);

  const handlePermissionToggle = (permission) => {
    if (editedPermissions.includes(permission)) {
      setEditedPermissions(editedPermissions.filter(p => p !== permission));
    } else {
      setEditedPermissions([...editedPermissions, permission]);
    }
  };

  const handleSavePermissions = () => {
    addToast('Permissions mises à jour avec succès', 'success');
    setShowEditModal(false);
  };

  const openEditModal = (role) => {
    setSelectedRole(role);
    setEditedPermissions(role.permissions.includes('*') ? ['*'] : [...role.permissions]);
    setShowEditModal(true);
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      manager: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      employee: 'bg-blue-100 text-blue-700 border-blue-200'
    };
    return colors[role.id] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des Rôles</h1>
          <p className="text-slate-500 mt-1">Définissez les permissions pour chaque rôle</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <h2 className="text-lg font-semibold mb-4">Rôles Existants</h2>
            <div className="space-y-3">
              {roles.map(role => (
                <div
                  key={role.id}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedRole?.id === role.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                  onClick={() => setSelectedRole(role)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-${role.color}-100 flex items-center justify-center text-2xl`}>
                        {role.id === 'admin' ? '👑' : role.id === 'manager' ? '👔' : '👤'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{role.name}</h3>
                        <p className="text-sm text-slate-500">{role.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadge(role)}`}>
                        {role.userCount} utilisateur(s)
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditModal(role); }}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2l3.293 3.293-1.414 1.414z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <h2 className="text-lg font-semibold mb-4">Permissions</h2>
            {selectedRole ? (
              <div className="space-y-2">
                <p className="text-sm text-slate-500 mb-3">
                  Permissions pour le rôle <span className="font-medium text-slate-800">{selectedRole.name}</span>
                </p>
                {selectedRole.permissions.includes('*') ? (
                  <div className="p-3 bg-indigo-50 rounded-xl text-sm text-indigo-700">
                    ✓ Accès complet à toutes les fonctionnalités
                  </div>
                ) : (
                  allPermissions.map(perm => (
                    <div
                      key={perm.key}
                      className={`p-3 rounded-xl border transition ${
                        selectedRole.permissions.includes(perm.key)
                          ? 'border-emerald-200 bg-emerald-50'
                          : 'border-slate-100 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{perm.label}</p>
                          <p className="text-xs text-slate-500">{perm.description}</p>
                        </div>
                        <span className={`text-lg ${selectedRole.permissions.includes(perm.key) ? 'text-emerald-600' : 'text-slate-300'}`}>
                          {selectedRole.permissions.includes(perm.key) ? '✓' : '✕'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Sélectionnez un rôle pour voir ses permissions</p>
            )}
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
            <h3 className="font-semibold mb-2">Créer un Nouveau Rôle</h3>
            <p className="text-sm text-indigo-100 mb-4">Définissez un nouveau rôle avec des permissions personnalisées</p>
            <button className="w-full py-2.5 bg-white/20 rounded-xl text-sm font-medium hover:bg-white/30 transition">
              + Nouveau Rôle
            </button>
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-soft" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-6">Modifier les permissions</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {allPermissions.map(perm => (
                <label
                  key={perm.key}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
                    editedPermissions.includes(perm.key) ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                  } border`}
                >
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    checked={editedPermissions.includes(perm.key)}
                    onChange={() => handlePermissionToggle(perm.key)}
                  />
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{perm.label}</p>
                    <p className="text-xs text-slate-500">{perm.description}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSavePermissions} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition">
                Enregistrer
              </button>
              <button onClick={() => setShowEditModal(false)} className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}