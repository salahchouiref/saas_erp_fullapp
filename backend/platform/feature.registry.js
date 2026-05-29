const FEATURES = {
  HR: {
    key: 'HR',
    name: 'Gestion RH',
    description: 'Employés, présences, congés, paie, contrats',
    defaultEnabled: true,
    permissions: ['admin', 'manager'],
    aiCapabilities: ['salary_optimization', 'hiring_suggestions'],
    routes: ['/api/hr']
  },
  CRM: {
    key: 'CRM',
    name: 'CRM Clients',
    description: 'Profils clients, historique, tickets, interactions',
    defaultEnabled: true,
    permissions: ['admin', 'manager', 'employee'],
    aiCapabilities: ['sentiment_analysis'],
    routes: ['/api/clients']
  },
  PROJECTS: {
    key: 'PROJECTS',
    name: 'Gestion Projets',
    description: 'Projets, tâches, équipes, jalons',
    defaultEnabled: true,
    permissions: ['admin', 'manager', 'employee'],
    aiCapabilities: ['delay_prediction'],
    routes: ['/api/projects']
  },
  STOCK: {
    key: 'STOCK',
    name: 'Stock & Inventaire',
    description: 'Produits, catégories, entrepôts, mouvements',
    defaultEnabled: false,
    permissions: ['admin', 'manager'],
    aiCapabilities: ['demand_prediction', 'low_stock_alerts'],
    routes: ['/api/stock']
  },
  ORDERS: {
    key: 'ORDERS',
    name: 'Gestion Commandes',
    description: 'Commandes clients, factures, paiements, retours',
    defaultEnabled: false,
    permissions: ['admin', 'manager', 'employee'],
    aiCapabilities: ['delay_prediction', 'order_optimization'],
    routes: ['/api/orders']
  },
  DELIVERY: {
    key: 'DELIVERY',
    name: 'Livraison & Logistique',
    description: 'Livreurs, tournées, suivi temps réel',
    defaultEnabled: false,
    permissions: ['admin', 'manager'],
    aiCapabilities: ['route_optimization'],
    routes: ['/api/delivery']
  },
  SERVICES: {
    key: 'SERVICES',
    name: 'Gestion Services',
    description: 'Catalogue, demandes, réservations, interventions',
    defaultEnabled: false,
    permissions: ['admin', 'manager', 'employee'],
    aiCapabilities: ['task_automation'],
    routes: ['/api/services']
  },
  AI: {
    key: 'AI',
    name: 'Assistant IA',
    description: 'Chatbot, analyse, automatisation',
    defaultEnabled: true,
    permissions: ['admin', 'manager', 'employee'],
    aiCapabilities: ['chat', 'analysis', 'automation'],
    routes: ['/api/ai']
  },
  PAYSLIPS: {
    key: 'PAYSLIPS',
    name: 'Bulletins de Paie',
    description: 'Génération et gestion des bulletins de paie',
    defaultEnabled: true,
    permissions: ['admin', 'manager', 'employee'],
    aiCapabilities: [],
    routes: ['/api/payslips']
  },
  AUDIT: {
    key: 'AUDIT',
    name: 'Audit Intelligent',
    description: 'Rapports d\'audit, détection d\'anomalies',
    defaultEnabled: true,
    permissions: ['admin', 'manager'],
    aiCapabilities: ['fraud_detection', 'anomaly_detection'],
    routes: ['/api/audit', '/api/audit-reports']
  },
  NOTIFICATIONS: {
    key: 'NOTIFICATIONS',
    name: 'Notifications',
    description: 'Notifications temps réel, rappels',
    defaultEnabled: true,
    permissions: ['admin', 'manager', 'employee'],
    aiCapabilities: [],
    routes: ['/api/notifications']
  }
};

const tenantFeatures = new Map();

function getEnabledFeatures() {
  return Object.fromEntries(
    Object.entries(FEATURES).map(([key, feat]) => [key, { ...feat, enabled: true }])
  );
}

function getFeature(key) {
  return FEATURES[key] || null;
}

function setTenantFeatures(tenantId, features) {
  tenantFeatures.set(tenantId, features);
}

function getTenantFeatures(tenantId) {
  return tenantFeatures.get(tenantId) || Object.keys(FEATURES).reduce((acc, key) => {
    acc[key] = FEATURES[key].defaultEnabled;
    return acc;
  }, {});
}

function isFeatureEnabled(tenantId, featureKey) {
  const features = getTenantFeatures(tenantId);
  return features[featureKey] === true;
}

function getModuleAICapabilities(moduleKey) {
  const feature = FEATURES[moduleKey];
  return feature ? feature.aiCapabilities : [];
}

module.exports = {
  FEATURES,
  getEnabledFeatures,
  getFeature,
  setTenantFeatures,
  getTenantFeatures,
  isFeatureEnabled,
  getModuleAICapabilities
};
