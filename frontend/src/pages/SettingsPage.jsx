import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [company, setCompany] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Maroc',
    taxNumber: '',
    rcNumber: '',
    iceNumber: ''
  });
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [preferences, setPreferences] = useState({
    language: 'fr',
    timezone: 'Africa/Casablanca',
    currency: 'MAD',
    dateFormat: 'DD/MM/YYYY',
    notifications: {
      email: true,
      push: true,
      orders: true,
      projects: true,
      employees: true
    }
  });

  useEffect(() => {
    if (user?.companyId) {
      setCompany(prev => ({ ...prev, name: user.companyId.name || '' }));
    }
  }, [user]);

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    addToast('Paramètres de l\'entreprise enregistrés', 'success');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (profile.newPassword && profile.newPassword !== profile.confirmPassword) {
      addToast('Les mots de passe ne correspondent pas', 'error');
      return;
    }
    addToast('Profil mis à jour avec succès', 'success');
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    addToast('Préférences enregistrées', 'success');
  };

  const tabs = [
    { key: 'profile', label: 'Mon Profil', icon: '👤' },
    { key: 'company', label: 'Entreprise', icon: '🏢' },
    { key: 'preferences', label: 'Préférences', icon: '⚙️' },
    { key: 'security', label: 'Sécurité', icon: '🔒' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
          <p className="text-slate-500 mt-1">Gérez votre profil et les paramètres de l'application</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-4">
        <div className="xl:col-span-1 bg-white rounded-2xl p-4 shadow-lg border border-slate-100">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  activeTab === tab.key
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="xl:col-span-3 bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Informations du profil</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Nom complet</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      value={profile.name}
                      onChange={e => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      value={profile.email}
                      onChange={e => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      value={profile.phone}
                      onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-md font-semibold text-slate-800 mb-4">Changer le mot de passe</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Mot de passe actuel</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      value={profile.currentPassword}
                      onChange={e => setProfile({ ...profile, currentPassword: e.target.value })}
                    />
                  </div>
                  <div></div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Nouveau mot de passe</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      value={profile.newPassword}
                      onChange={e => setProfile({ ...profile, newPassword: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Confirmer le mot de passe</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      value={profile.confirmPassword}
                      onChange={e => setProfile({ ...profile, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          )}

          {activeTab === 'company' && (
            <form onSubmit={handleSaveCompany} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Informations de l'entreprise</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Nom de l'entreprise</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      value={company.name}
                      onChange={e => setCompany({ ...company, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      value={company.email}
                      onChange={e => setCompany({ ...company, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      value={company.phone}
                      onChange={e => setCompany({ ...company, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Ville</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      value={company.city}
                      onChange={e => setCompany({ ...company, city: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-600 mb-1">Adresse</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      value={company.address}
                      onChange={e => setCompany({ ...company, address: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-md font-semibold text-slate-800 mb-4">Informations fiscales (Maroc)</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">RC Number</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      value={company.rcNumber}
                      onChange={e => setCompany({ ...company, rcNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">ICE</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      value={company.iceNumber}
                      onChange={e => setCompany({ ...company, iceNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Numéro Fiscal</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      value={company.taxNumber}
                      onChange={e => setCompany({ ...company, taxNumber: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          )}

          {activeTab === 'preferences' && (
            <form onSubmit={handleSavePreferences} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Préférences régionales</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Langue</label>
                    <select
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      value={preferences.language}
                      onChange={e => setPreferences({ ...preferences, language: e.target.value })}
                    >
                      <option value="fr">Français</option>
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Fuseau horaire</label>
                    <select
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      value={preferences.timezone}
                      onChange={e => setPreferences({ ...preferences, timezone: e.target.value })}
                    >
                      <option value="Africa/Casablanca">Casablanca (GMT+1)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Devise</label>
                    <select
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      value={preferences.currency}
                      onChange={e => setPreferences({ ...preferences, currency: e.target.value })}
                    >
                      <option value="MAD">MAD - Dirham Marocain</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="USD">USD - Dollar US</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Format de date</label>
                    <select
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      value={preferences.dateFormat}
                      onChange={e => setPreferences({ ...preferences, dateFormat: e.target.value })}
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-md font-semibold text-slate-800 mb-4">Notifications</h3>
                <div className="space-y-3">
                  {[
                    { key: 'email', label: 'Notifications par email' },
                    { key: 'push', label: 'Notifications push' },
                    { key: 'orders', label: 'Alertes commandes' },
                    { key: 'projects', label: 'Alertes projets' },
                    { key: 'employees', label: 'Alertes employés' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                        checked={preferences.notifications[item.key]}
                        onChange={e => setPreferences({
                          ...preferences,
                          notifications: { ...preferences.notifications, [item.key]: e.target.checked }
                        })}
                      />
                      <span className="text-sm text-slate-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Sécurité du compte</h2>
                <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800">Authentification à deux facteurs</p>
                      <p className="text-sm text-slate-500">Ajoutez une couche de sécurité supplémentaire</p>
                    </div>
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
                      Configurer
                    </button>
                  </div>
                  <div className="border-t border-slate-200"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800">Sessions actives</p>
                      <p className="text-sm text-slate-500">Gérez vos sessions sur tous les appareils</p>
                    </div>
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
                      Voir les sessions
                    </button>
                  </div>
                  <div className="border-t border-slate-200"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800">Historique de connexion</p>
                      <p className="text-sm text-slate-500"> Consultez les dernières activités</p>
                    </div>
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
                      Voir l'historique
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}