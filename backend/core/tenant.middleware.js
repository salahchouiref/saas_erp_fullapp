const tenantMiddleware = async (req, res, next) => {
  const companyId = req.headers['x-tenant-id'] || req.query.companyId;
  if (companyId) {
    try {
      const Company = require('mongoose').model('Company');
      const company = await Company.findById(companyId);
      if (company) {
        req.tenant = { id: company._id.toString(), name: company.name, data: company.data };
      }
    } catch {
      req.tenant = { id: 'default', name: 'Default' };
    }
  } else {
    req.tenant = { id: 'default', name: 'Default' };
  }
  next();
};

module.exports = tenantMiddleware;
