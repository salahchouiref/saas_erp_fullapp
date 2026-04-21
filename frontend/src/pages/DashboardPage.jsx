import { useState, useEffect } from 'react';
import { getEmployees } from '../api/employees';
import { getClients } from '../api/clients';
import { getProjects } from '../api/projects';
import { useToast } from '../components/Toast';

export default function DashboardPage() {
  const [stats, setStats] = useState({ employees: 0, clients: 0, projects: 0, activeProjects: 0, completedProjects: 0 });
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [empData, clientData, projData] = await Promise.all([
        getEmployees({}),
        getClients({}),
        getProjects({})
      ]);
      
      const activeProjects = projData.filter(p => p.status === 'active').length;
      const completedProjects = projData.filter(p => p.status === 'completed').length;
      
      setStats({
        employees: empData.length,
        clients: clientData.length,
        projects: projData.length,
        activeProjects,
        completedProjects
      });
    } catch (e) {
      addToast(e.data?.message || 'Erreur de chargement des statistiques', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    const warnings = [];
    const recommendations = [];
    const date = new Date();

    if (stats.employees === 0) {
      warnings.push('Aucun employé enregistré dans le système.');
    }
    if (stats.clients === 0) {
      warnings.push('Aucun client enregistré. Commencez par添加 vos premiers clients.');
    }
    if (stats.projects === 0) {
      warnings.push('Aucun projet créé. Créez votre premier projet.');
    }
    
    if (stats.activeProjects > stats.employees) {
      warnings.push('Plus de projets actifs que d\'employés. Répartition déséquilibrée.');
    }
    
    if (stats.employees > 20) {
      recommendations.push('Envisagez de diviser les équipes en départements fonctionnels.');
    }
    
    if (stats.activeProjects > 10 && stats.employees < 10) {
      recommendations.push('Attention: risque de surcharge. Ajoutez plus d\'employés pour gérer les projets.');
    }
    
    if (stats.activeProjects > 0 && stats.activeProjects < 3) {
      recommendations.push('Peu de projets actifs. Pensez à développer votre portfolio clients.');
    }
    
    if (stats.completedProjects > 5) {
      recommendations.push('Félicitations! Vous avez terminé plus de 5 projetos. Considérez des témoignages clients.');
    }
    
    recommendations.push('Utilisez le module IA pour analyser les tendances et automatiser les tâches.');

    setReport({
      generatedAt: date.toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
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

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getHealthBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 50) return 'bg-amber-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Résumé du système</h2>
              <p className="mt-1 text-sm text-slate-500">Vue centralisée des performances d'audit.</p>
            </div>
            <button
              onClick={generateReport}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg shadow-indigo-200"
            >
              Générer rapport
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="bg-slate-50 rounded-xl p-5">
              <p className="text-xs uppercase tracking-wider text-slate-400">Projets</p>
              <p className="mt-3 text-3xl font-semibold">{stats.projects}</p>
              <p className="text-xs text-emerald-600 mt-1">{stats.activeProjects} actifs</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-5">
              <p className="text-xs uppercase tracking-wider text-slate-400">Clients</p>
              <p className="mt-3 text-3xl font-semibold">{stats.clients}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-5">
              <p className="text-xs uppercase tracking-wider text-slate-400">Employés</p>
              <p className="mt-3 text-3xl font-semibold">{stats.employees}</p>
            </div>
          </div>
        </div>

        {report && (
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Rapport d'audit</h3>
              <span className="text-xs text-slate-400">Généré le {report.generatedAt}</span>
            </div>
            
            <div className={`p-4 rounded-xl mb-4 ${getHealthBg(report.healthScore)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Score de santé</p>
                  <p className={`text-2xl font-bold ${getHealthColor(report.healthScore)}`}>
                    {report.healthScore}/100
                  </p>
                </div>
                <div className="text-4xl">
                  {report.healthScore >= 80 ? '✓' : report.healthScore >= 50 ? '⚠' : '✕'}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {report.warnings.length > 0 && (
                <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
                  <h4 className="font-semibold text-amber-800 mb-2">Avertissements ({report.warnings.length})</h4>
                  <ul className="space-y-1 text-sm text-amber-900">
                    {report.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {report.recommendations.length > 0 && (
                <div className="border border-sky-200 bg-sky-50 rounded-xl p-4">
                  <h4 className="font-semibold text-sky-800 mb-2">Recommandations ({report.recommendations.length})</h4>
                  <ul className="space-y-1 text-sm text-slate-700">
                    {report.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-sky-500">→</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-lg font-semibold">Assistant IA</h3>
          <p className="mt-2 text-sm text-slate-500">
            Utilisez l'onglet AI pour analyser vos données et automatiser les tâches.
          </p>
          <div className="mt-4 bg-slate-50 rounded-xl p-4">
            <p className="text-sm text-slate-600">
              Posez des questions, créez des clients ou organisez des projets via l'IA.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-lg font-semibold">Statut du système</h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Base de données</span>
              <span className="flex items-center gap-2 text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Connectée
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">API</span>
              <span className="flex items-center gap-2 text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Opérationnelle
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Rôle</span>
              <span className="text-indigo-600 font-medium">Administrateur</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}