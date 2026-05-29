import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './layout/AppLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import HRPage from './pages/EmployeesPage';
import ClientsPage from './pages/ClientsPage';
import ProjectsPage from './pages/ProjectsPage';
import AIPage from './pages/AIPage';
import StockPage from './features/stock/StockPage';
import OrdersPage from './features/orders/OrdersPage';
import DeliveryPage from './features/delivery/DeliveryPage';
import ServicesPage from './features/services/ServicesPage';
import SettingsPage from './pages/SettingsPage';
import AuditPage from './pages/AuditPage';
import PayslipsPage from './features/payslips/PayslipsPage';
import RolesPage from './pages/RolesPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">Chargement...</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminPage({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout role="admin">
        {children}
      </AppLayout>
    </ProtectedRoute>
  );
}

function EmployeePage({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout role="employee">
        {children}
      </AppLayout>
    </ProtectedRoute>
  );
}

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/admin" element={<AdminPage><DashboardPage /></AdminPage>} />
      <Route path="/admin/hr" element={<AdminPage><HRPage /></AdminPage>} />
      <Route path="/admin/clients" element={<AdminPage><ClientsPage /></AdminPage>} />
      <Route path="/admin/projects" element={<AdminPage><ProjectsPage /></AdminPage>} />
      <Route path="/admin/ai" element={<AdminPage><AIPage /></AdminPage>} />
      <Route path="/admin/stock" element={<AdminPage><StockPage /></AdminPage>} />
      <Route path="/admin/orders" element={<AdminPage><OrdersPage /></AdminPage>} />
      <Route path="/admin/delivery" element={<AdminPage><DeliveryPage /></AdminPage>} />
      <Route path="/admin/services" element={<AdminPage><ServicesPage /></AdminPage>} />
      <Route path="/admin/settings" element={<AdminPage><SettingsPage /></AdminPage>} />
      <Route path="/admin/audit" element={<AdminPage><AuditPage /></AdminPage>} />
      <Route path="/admin/payslips" element={<AdminPage><PayslipsPage /></AdminPage>} />
      <Route path="/admin/roles" element={<AdminPage><RolesPage /></AdminPage>} />

      <Route path="/employee" element={<EmployeePage><DashboardPage /></EmployeePage>} />
      <Route path="/employee/projects" element={<EmployeePage><ProjectsPage /></EmployeePage>} />
      <Route path="/employee/ai" element={<EmployeePage><AIPage /></EmployeePage>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
