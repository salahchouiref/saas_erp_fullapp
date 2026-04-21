import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, error, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalError('');
    try {
      const user = await login(email, password);
      if (user && user.role === 'admin') {
        navigate('/admin');
      } else {
        setLocalError('Accès réservé aux administrateurs');
      }
    } catch (err) {
      setLocalError(err.data?.message || 'Échec de connexion');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-800 to-slate-900">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">SaaS Audit</h1>
          <p className="text-slate-400 mt-2">Connexion administrateur</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">Connexion</h2>
          
          <div className="mb-4">
            <label className="block text-sm text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
              placeholder="email@exemple.com"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm text-slate-300 mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
              placeholder="••••••••"
              required
            />
            <p className="text-xs text-slate-500 mt-1">Par défaut: admin@example.com / admin123</p>
          </div>
          
          {(error || localError) && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
              {error || localError}
            </div>
          )}
          
          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {submitting ? 'Connexion...' : 'Se connecter'}
          </button>
          
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-slate-400 hover:text-white transition">
              ← Retour à l'accueil
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}