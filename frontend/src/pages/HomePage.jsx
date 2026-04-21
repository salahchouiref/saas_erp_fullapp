import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6">
        <div className="text-xl font-bold text-white">SaaS Audit</div>
        <nav className="flex gap-6">
          <Link to="/login" className="text-white hover:text-indigo-300 transition">Connexion</Link>
        </nav>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-800 to-slate-900 text-white p-8">
        <div className="max-w-3xl text-center space-y-8">
          <h1 className="text-5xl font-bold leading-tight">
            Plateforme d'Audit IA
            <span className="block text-indigo-400">Intelligent</span>
          </h1>
          <p className="text-xl text-slate-300">
            Automatisez vos audits d'entreprise avec l'intelligence artificielle.
            Gérez vos employés, projets et clients en toute simplicité.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link
              to="/login"
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-full font-semibold transition shadow-lg"
            >
              Commencer
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-2">Gestion des Employés</h3>
            <p className="text-slate-300 text-sm">Suivez et gérez votre effectif avec des fonctionnalités avancées.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-2">Projets & Clients</h3>
            <p className="text-slate-300 text-sm">Organisez vos projets et maintenez vos relations clients.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-2">Assistant IA</h3>
            <p className="text-slate-300 text-sm">Automatisez vos tâches avec notre assistant intelligent.</p>
          </div>
        </div>
      </div>

      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-sm">
        <p>&copy; 2026 SaaS IA Audit Assistant. Tous droits réservés.</p>
      </footer>
    </div>
  );
}