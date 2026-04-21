import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import ClientsPage from './pages/ClientsPage';
import ProjectsPage from './pages/ProjectsPage';
import AIPage from './pages/AIPage';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const tabs = ['Dashboard', 'Employees', 'Projects', 'Clients', 'AI'];

function AdminLayout() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between px-8 py-4 bg-gradient-to-r from-slate-900 via-indigo-700 to-slate-900 text-white shadow-lg">
        <div>
          <span className="font-bold text-xl tracking-wide">SaaS Audit Assistant</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300">{user?.email}</span>
          <button onClick={handleLogout} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition">
            Déconnexion
          </button>
        </div>
      </header>

      <div className="p-8">
        <div className="mb-6 flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-semibold rounded-full transition ${
                activeTab === tab
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-700 shadow-sm hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Dashboard' && <DashboardPage />}
        {activeTab === 'Employees' && <EmployeesPage />}
        {activeTab === 'Projects' && <ProjectsPage />}
        {activeTab === 'Clients' && <ClientsPage />}
        {activeTab === 'AI' && <AIPage />}
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Accès refusé</h2>
          <p className="text-slate-500">Seuls les administrateurs peuvent accéder à cette page.</p>
        </div>
      </div>
    );
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;