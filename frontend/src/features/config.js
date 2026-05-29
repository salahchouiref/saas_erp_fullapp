export const FEATURES = {
  hr: {
    key: 'hr',
    name: 'RH',
    label: 'Employés',
    path: '/admin/hr',
    icon: '👥',
    roles: ['admin', 'manager'],
    enabled: true,
    component: 'HRPage'
  },
  crm: {
    key: 'crm',
    name: 'CRM',
    label: 'Clients',
    path: '/admin/clients',
    icon: '🤝',
    roles: ['admin', 'manager', 'employee'],
    enabled: true,
    component: 'ClientsPage'
  },
  projects: {
    key: 'projects',
    name: 'Projets',
    label: 'Projets',
    path: '/admin/projects',
    icon: '📁',
    roles: ['admin', 'manager', 'employee'],
    enabled: true,
    component: 'ProjectsPage'
  },
  ai: {
    key: 'ai',
    name: 'IA',
    label: 'Assistant IA',
    path: '/admin/ai',
    icon: '🤖',
    roles: ['admin', 'manager', 'employee'],
    enabled: true,
    component: 'AIPage'
  },
  stock: {
    key: 'stock',
    name: 'Stock',
    label: 'Stock & Inventaire',
    path: '/admin/stock',
    icon: '📦',
    roles: ['admin', 'manager'],
    enabled: true,
    component: 'StockPage'
  },
  orders: {
    key: 'orders',
    name: 'Commandes',
    label: 'Commandes',
    path: '/admin/orders',
    icon: '🛒',
    roles: ['admin', 'manager', 'employee'],
    enabled: true,
    component: 'OrdersPage'
  },
  delivery: {
    key: 'delivery',
    name: 'Livraison',
    label: 'Livraison',
    path: '/admin/delivery',
    icon: '🚚',
    roles: ['admin', 'manager'],
    enabled: true,
    component: 'DeliveryPage'
  },
  services: {
    key: 'services',
    name: 'Services',
    label: 'Services',
    path: '/admin/services',
    icon: '🔧',
    roles: ['admin', 'manager', 'employee'],
    enabled: true,
    component: 'ServicesPage'
  },
  payslips: {
    key: 'payslips',
    name: 'Paie',
    label: 'Bullions de Paie',
    path: '/admin/payslips',
    icon: '💰',
    roles: ['admin', 'manager'],
    enabled: true,
    component: 'PayslipsPage'
  },
  audit: {
    key: 'audit',
    name: 'Audit',
    label: 'Journal d\'Audit',
    path: '/admin/audit',
    icon: '📊',
    roles: ['admin'],
    enabled: true,
    component: 'AuditPage'
  },
  settings: {
    key: 'settings',
    name: 'Paramètres',
    label: 'Paramètres',
    path: '/admin/settings',
    icon: '⚙️',
    roles: ['admin', 'manager'],
    enabled: true,
    component: 'SettingsPage'
  },
  roles: {
    key: 'roles',
    name: 'Rôles',
    label: 'Gestion des Rôles',
    path: '/admin/roles',
    icon: '🔑',
    roles: ['admin'],
    enabled: true,
    component: 'RolesPage'
  }
};

export const EMPLOYEE_FEATURES = {
  dashboard: {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/employee',
    icon: '📊',
    component: 'DashboardPage'
  },
  projects: {
    key: 'projects',
    label: 'Projets',
    path: '/employee/projects',
    icon: '📁',
    component: 'ProjectsPage'
  },
  ai: {
    key: 'ai',
    label: 'Assistant IA',
    path: '/employee/ai',
    icon: '🤖',
    component: 'AIPage'
  }
};

export function getFeaturesByRole(role) {
  return Object.values(FEATURES)
    .filter(f => f.enabled && f.roles.includes(role));
}

export function getEmployeeFeatures() {
  return Object.values(EMPLOYEE_FEATURES);
}
