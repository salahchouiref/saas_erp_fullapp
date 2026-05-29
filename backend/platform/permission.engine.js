function checkPermission(user, requiredRoles) {
  if (!user) return false;
  if (!requiredRoles || requiredRoles.length === 0) return true;
  return requiredRoles.includes(user.role);
}

function requireFeature(featureKey) {
  return (req, res, next) => {
    const tenantId = req.tenant ? req.tenant.id : 'default';
    const { isFeatureEnabled } = require('./feature.registry');
    if (!isFeatureEnabled(tenantId, featureKey)) {
      return res.status(403).json({ message: 'Feature not enabled for this tenant' });
    }
    next();
  };
}

function canAccessModule(user, modulePermissions) {
  return checkPermission(user, modulePermissions);
}

module.exports = { checkPermission, requireFeature, canAccessModule };
