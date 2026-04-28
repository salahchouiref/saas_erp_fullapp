import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import ClientsPage from './pages/ClientsPage';
import ProjectsPage from './pages/ProjectsPage';
import AIPage from './pages/AIPage';
import { NotificationBell } from './components/NotificationBell';


const tabs = [
   { id: 'Dashboard', label: 'Dashboard', path: '/admin' },
   { id: 'Employees', label: 'Employes', path: '/admin/employees' },
   { id: 'Projects', label: 'Projets', path: '/admin/projects' },
   { id: 'Clients', label: 'Clients', path: '/admin/clients' },
   { id: 'AI', label: 'IA', path: '/admin/ai' }
];

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

const getActiveTab = () => {
     const path = location.pathname;
     if (path.includes('employees')) return 'Employees';
     if (path.includes('projects')) return 'Projects';
     if (path.includes('clients')) return 'Clients';
     if (path.includes('ai')) return 'AI';
     return 'Dashboard';
   };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab.id);
    navigate(tab.path);
  };

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between px-8 py-4 bg-gradient-to-r from-slate-900 via-indigo-700 to-slate-900 text-white shadow-lg">
        <div>
          <span className="font-bold text-xl tracking-wide">SaaS Audit Assistant</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300">{user?.email}</span>
          <span className="px-2 py-1 bg-white/20 rounded text-xs">{user?.role}</span>
          <button onClick={handleLogout} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition">
            Deconnexion
          </button>
        </div>
      </header>

      <div className="p-8">
        <div className="mb-6 flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab)}
              className={`px-5 py-3 text-sm font-semibold rounded-full transition ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-700 shadow-sm hover:bg-slate-100'
              }`}
            >
              {tab.label}
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

function EmployeeLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('projects')) return 'Projects';
    if (path.includes('ai')) return 'AI';
    return 'Dashboard';
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const employeeTabs = [
    { id: 'Dashboard', label: 'Dashboard', path: '/employee' },
    { id: 'Projects', label: 'Projets', path: '/employee/projects' },
    { id: 'AI', label: 'IA', path: '/employee/ai' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div>
          <span className="font-bold text-xl tracking-wide">SaaS Audit Assistant</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-indigo-100">{user?.email}</span>
          <button onClick={handleLogout} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition">
            Deconnexion
          </button>
        </div>
      </header>

      <div className="p-8">
        <div className="mb-6 flex flex-wrap gap-3">
          {employeeTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); navigate(tab.path); }}
              className={`px-5 py-3 text-sm font-semibold rounded-full transition ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-slate-700 shadow-sm hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'Dashboard' && <DashboardPage />}
        {activeTab === 'Projects' && <ProjectsPage />}
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

  return children;
}

function App() {
  const { user } = useAuth();

  return (
    <>
      {/* Background notification handler */}
      <NotificationBell />
      <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            {user?.role === 'admin' || user?.role === 'manager' ? <AdminLayout /> : <Navigate to="/employee" replace />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/*"
        element={
          <ProtectedRoute>
            <EmployeeLayout />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

export default App;