const express = require('express');
const router = express.Router();
const { authMiddleware, permit } = require('../../core/auth.middleware');
const auditController = require('../../controllers/auditController');
const auditReportController = require('../../controllers/auditReportController');

router.use(authMiddleware);

router.get('/report', permit('admin', 'manager'), auditController.generateReport);

router.get('/reports', permit('admin', 'manager', 'employee'), auditReportController.getAuditReports);
router.get('/reports/:id', permit('admin', 'manager', 'employee'), auditReportController.getAuditReport);
router.post('/reports', permit('admin', 'manager'), auditReportController.createAuditReport);
router.put('/reports/:id', permit('admin', 'manager'), auditReportController.updateAuditReport);
router.delete('/reports/:id', permit('admin'), auditReportController.deleteAuditReport);

const name = 'Audit';
const mountPath = '/api/audit';

function register(app, io) {
  app.use(mountPath, router);
}

module.exports = { name, mountPath, router, register };
