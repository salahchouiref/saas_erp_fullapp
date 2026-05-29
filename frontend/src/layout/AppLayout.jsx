import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from '../components/NotificationBell';
import { getFeaturesByRole, getEmployeeFeatures } from '../features/config';

export default function AppLayout({ children, role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const features = role === 'employee' ? getEmployeeFeatures() : getFeaturesByRole(user?.role || 'employee');

  const isActive = (path) => {
    if (path === '/admin' || path === '/employee') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleNavigation = (feat) => {
    const path = feat.path || `/${role === 'employee' ? 'employee' : 'admin'}/${feat.key}`;
    navigate(path);
    setSidebarOpen(false);
  };

  const headerGradient = role === 'employee'
    ? 'from-indigo-600 to-purple-600'
    : 'from-slate-900 via-indigo-700 to-slate-900';

  const sidebarBg = role === 'employee'
    ? 'bg-indigo-600'
    : 'bg-slate-900';

  const navItems = role === 'employee' ? [
    { key: 'dashboard', label: 'Dashboard', icon: '📊', path: '/employee' },
    { key: 'projects', label: 'Projets', icon: '📁', path: '/employee/projects' },
    { key: 'ai', label: 'Assistant IA', icon: '🤖', path: '/employee/ai' },
  ] : features.map(f => ({
    key: f.key, label: f.label || f.name, icon: f.icon || '📋',
    path: f.path || `/admin/${f.key}`
  }));

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <NotificationBell />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${sidebarBg} text-white flex flex-col shadow-xl
        transition-all duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${collapsed ? 'w-20' : 'w-64'}
      `}>
        <div className={`p-4 lg:p-6 border-b border-white/10 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="min-w-0">
              <h2 className="font-bold text-lg tracking-wide truncate">SaaS ERP</h2>
              <p className="text-xs text-white/60 mt-1 capitalize truncate">{role}</p>
            </div>
          )}
          {collapsed && (
            <h2 className="font-bold text-lg">E</h2>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/60 hover:text-white p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 p-2 lg:p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => handleNavigation(item)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition ${
                isActive(item.path) ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className={`p-3 lg:p-4 border-t border-white/10 ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? (
            <div className="w-10 h-10 mx-auto rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
              {user?.name?.[0] || 'U'}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 shrink-0 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                  {user?.name?.[0] || 'U'}
                </div>
                <div className="text-sm truncate min-w-0">
                  <p className="font-medium truncate">{user?.name || user?.email}</p>
                  <p className="text-xs text-white/60 capitalize truncate">{user?.role}</p>
                </div>
              </div>
            </>
          )}
          <button
            onClick={handleLogout}
            className={`w-full py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition ${collapsed ? 'mt-2' : ''}`}
            title="Déconnexion"
          >
            {collapsed ? '🚪' : 'Déconnexion'}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className={`bg-gradient-to-r ${headerGradient} text-white shadow-lg`}>
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-white/80 hover:text-white p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:block text-white/60 hover:text-white p-1 mr-2"
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <svg className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="font-bold text-base lg:text-xl tracking-wide truncate">SaaS IA Audit Assistant</h1>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className="hidden sm:block text-sm text-white/70 truncate max-w-[150px]">{user?.email}</span>
            </div>
          </div>
        </header>
        <div className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
