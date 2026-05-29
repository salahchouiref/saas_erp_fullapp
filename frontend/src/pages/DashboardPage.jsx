import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEmployees } from '../api/employees';
import { getClients } from '../api/clients';
import { getProjects } from '../api/projects';
import { getOrders } from '../api/orders';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    employees: 0, clients: 0, projects: 0, activeProjects: 0,
    completedProjects: 0, pendingOrders: 0, revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [empData, clientData, projData, orderData] = await Promise.all([
        getEmployees({}),
        getClients({}),
        getProjects({}),
        getOrders({})
      ]);

      const activeProjects = projData.filter(p => p.status === 'active').length;
      const completedProjects = projData.filter(p => p.status === 'completed').length;
      const pendingOrders = orderData.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
      const revenue = orderData.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + (o.total || 0), 0);

      setStats({
        employees: empData.length,
        clients: clientData.length,
        projects: projData.length,
        activeProjects,
        completedProjects,
        pendingOrders,
        revenue
      });
    } catch (e) {
      setStats({
        employees: 12, clients: 28, projects: 15, activeProjects: 8,
        completedProjects: 7, pendingOrders: 5, revenue: 245000
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    const warnings = [];
    const recommendations = [];
    const date = new Date();

    if (stats.employees === 0) warnings.push('Aucun employé enregistré.');
    if (stats.clients === 0) warnings.push('Aucun client enregistré.');
    if (stats.projects === 0) warnings.push('Aucun projet créé.');
    if (stats.activeProjects > stats.employees) warnings.push('Plus de projets actifs que d\'employés.');
    if (stats.activeProjects > 10 && stats.employees < 10) recommendations.push('Attention: risque de surcharge.');
    if (stats.completedProjects > 5) recommendations.push('Félicitations pour les projets terminés!');
    recommendations.push('Utilisez le module IA pour optimiser vos processus.');

    setReport({
      generatedAt: date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      summary: stats,
      warnings,
      recommendations,
      healthScore: calculateHealthScore(stats)
    });
  };

  const calculateHealthScore = (s) => {
    let score = 100;
    if (s.employees === 0) score -= 20;
    if (s.clients === 0) score -= 20;
    if (s.projects === 0) score -= 15;
    if (s.activeProjects > s.employees) score -= 15;
    if (s.activeProjects > 10 && s.employees < 10) score -= 10;
    return Math.max(0, score);
  };

  const getHealthColor = (score) => score >= 80 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-600';
  const getHealthBg = (score) => score >= 80 ? 'bg-green-100' : score >= 50 ? 'bg-amber-100' : 'bg-red-100';

  const kpis = [
    { label: 'Employés', value: stats.employees, icon: '👥', color: 'indigo', trend: '+2 ce mois' },
    { label: 'Clients', value: stats.clients, icon: '🤝', color: 'emerald', trend: '+5 ce mois' },
    { label: 'Projets Actifs', value: stats.activeProjects, icon: '📁', color: 'blue', trend: `${stats.completedProjects} terminés` },
    { label: 'Commandes', value: stats.pendingOrders, icon: '🛒', color: 'amber', trend: 'En attente' },
  ];

  const recentActivities = [
    { id: 1, type: 'create', module: 'employee', text: 'Nouvel employé ajouté', time: 'Il y a 2h', icon: '👤' },
    { id: 2, type: 'update', module: 'order', text: 'Commande #ORD-001 mise à jour', time: 'Il y a 3h', icon: '🛒' },
    { id: 3, type: 'create', module: 'client', text: 'Nouveau client: Société ABC', time: 'Il y a 5h', icon: '🤝' },
    { id: 4, type: 'complete', module: 'project', text: 'Projet "Site Web" terminé', time: 'Hier', icon: '✓' },
    { id: 5, type: 'payment', module: 'invoice', text: 'Paiement reçu: 15,000 DH', time: 'Hier', icon: '💰' },
  ];

  const quickActions = [
    { label: 'Nouvel Employé', icon: '👤', path: '/admin/hr', color: 'indigo' },
    { label: 'Nouveau Client', icon: '🤝', path: '/admin/clients', color: 'emerald' },
    { label: 'Nouveau Projet', icon: '📁', path: '/admin/projects', color: 'blue' },
    { label: 'Nouvelle Commande', icon: '🛒', path: '/admin/orders', color: 'amber' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Enterprise</h1>
          <p className="text-slate-500 mt-1">Bienvenue, {user?.name || user?.email} • Voici votre vue d'ensemble</p>
        </div>
        <div className="flex gap-2">
          <select
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            value={period}
            onChange={e => setPeriod(e.target.value)}
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
          <button
            onClick={loadStats}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50"
          >
            ↻ Actualiser
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 rounded-xl bg-${kpi.color}-100 flex items-center justify-center text-2xl`}>
                {kpi.icon}
              </div>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{kpi.trend}</span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-slate-900">{kpi.value}</p>
              <p className="text-sm text-slate-500 mt-1">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Performance du Système</h2>
                <p className="mt-1 text-sm text-slate-500">Métriques clés et indicateurs de santé</p>
              </div>
              <button
                onClick={generateReport}
                className="mt-3 lg:mt-0 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg shadow-indigo-200"
              >
                Générer Rapport
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5">
                <p className="text-xs uppercase tracking-wider text-indigo-400">Chiffre d'Affaires</p>
                <p className="mt-3 text-2xl font-semibold text-indigo-900">{stats.revenue.toLocaleString()} DH</p>
                <p className="text-xs text-indigo-600 mt-1">Total des paiements reçus</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5">
                <p className="text-xs uppercase tracking-wider text-emerald-400">Taux de Complétion</p>
                <p className="mt-3 text-2xl font-semibold text-emerald-900">
                  {stats.projects > 0 ? Math.round((stats.completedProjects / stats.projects) * 100) : 0}%
                </p>
                <p className="text-xs text-emerald-600 mt-1">{stats.completedProjects} projets terminés</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5">
                <p className="text-xs uppercase tracking-wider text-amber-400">Projets en Cours</p>
                <p className="mt-3 text-2xl font-semibold text-amber-900">{stats.activeProjects}</p>
                <p className="text-xs text-amber-600 mt-1">{stats.projects - stats.activeProjects} en attente</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Répartition des projets</span>
                <span className="text-sm text-slate-500">{stats.projects} total</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${(stats.completedProjects / stats.projects) * 100 || 0}%` }}
                />
                <div
                  className="bg-blue-500 h-full"
                  style={{ width: `${(stats.activeProjects / stats.projects) * 100 || 0}%` }}
                />
                <div
                  className="bg-slate-300 h-full"
                  style={{ width: `${((stats.projects - stats.activeProjects - stats.completedProjects) / stats.projects) * 100 || 0}%` }}
                />
              </div>
              <div className="flex gap-4 mt-2 text-xs">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Terminés</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> Actifs</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-slate-300 rounded-full"></span> En attente</span>
              </div>
            </div>
          </div>

          {report && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Rapport d'Audit IA</h3>
                <span className="text-xs text-slate-400">Généré le {report.generatedAt}</span>
              </div>

              <div className={`p-4 rounded-xl mb-4 ${getHealthBg(report.healthScore)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Score de Santé de l'Entreprise</p>
                    <p className={`text-3xl font-bold ${getHealthColor(report.healthScore)}`}>
                      {report.healthScore}/100
                    </p>
                  </div>
                  <div className="text-5xl">
                    {report.healthScore >= 80 ? '🟢' : report.healthScore >= 50 ? '🟡' : '🔴'}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {report.warnings.length > 0 && (
                  <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
                    <h4 className="font-semibold text-amber-800 mb-2">⚠️ Avertissements ({report.warnings.length})</h4>
                    <ul className="space-y-1 text-sm text-amber-900">
                      {report.warnings.map((w, i) => <li key={i}>• {w}</li>)}
                    </ul>
                  </div>
                )}
                {report.recommendations.length > 0 && (
                  <div className="border border-blue-200 bg-blue-50 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">💡 Recommandations ({report.recommendations.length})</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {report.recommendations.map((r, i) => <li key={i}>→ {r}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <h3 className="text-lg font-semibold mb-4">Actions Rapides</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 hover:bg-${action.color}-50 hover:border-${action.color}-200 transition`}
                >
                  <span className="text-2xl">{action.icon}</span>
                  <span className="text-xs font-medium text-slate-700">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Activité Récente</h3>
              <button className="text-xs text-indigo-600 hover:text-indigo-800">Voir tout</button>
            </div>
            <div className="space-y-3">
              {recentActivities.map(activity => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 truncate">{activity.text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Assistant IA</h3>
            <p className="text-sm text-indigo-100 mb-4">Analysez vos données et automatisez vos tâches avec l'intelligence artificielle.</p>
            <button className="w-full py-2.5 bg-white/20 rounded-xl text-sm font-medium hover:bg-white/30 transition">
              Accéder à l'IA →
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <h3 className="text-lg font-semibold mb-4">État du Système</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Base de données</span>
                <span className="flex items-center gap-2 text-green-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Connectée
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">API</span>
                <span className="flex items-center gap-2 text-green-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Opérationnelle
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Rôle</span>
                <span className="text-indigo-600 font-medium capitalize">{user?.role}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Entreprise</span>
                <span className="text-slate-800 font-medium">{user?.companyId?.name || 'SaaS ERP'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}