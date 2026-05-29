const express = require('express');
const router = express.Router();
const { authMiddleware, permit } = require('../../core/auth.middleware');
const ctrl = require('./services.controller');

router.use(authMiddleware);

router.get('/catalog', permit('admin', 'manager', 'employee'), ctrl.getCatalog);
router.post('/catalog', permit('admin', 'manager'), ctrl.createCatalogItem);

router.get('/requests', permit('admin', 'manager', 'employee'), ctrl.getRequests);
router.post('/requests', permit('admin', 'manager'), ctrl.createRequest);
router.put('/requests/:id/status', permit('admin', 'manager', 'employee'), ctrl.updateRequestStatus);
router.get('/requests/:id/history', permit('admin', 'manager', 'employee'), ctrl.getRequestHistory);

router.get('/technicians', permit('admin', 'manager', 'employee'), ctrl.getTechnicians);
router.post('/technicians', permit('admin', 'manager'), ctrl.createTechnician);

router.get('/reports', permit('admin', 'manager'), ctrl.getReports);
router.post('/reports', permit('admin', 'manager'), ctrl.createReport);

const name = 'Services';
const mountPath = '/api/services';

function register(app, io) {
  app.use(mountPath, router);
}

module.exports = { name, mountPath, router, register, models: ['ServiceCatalog', 'ServiceRequest', 'Technician', 'ServiceLifecycle', 'ServiceReport'] };
