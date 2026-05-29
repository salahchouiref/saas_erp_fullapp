const express = require('express');
const router = express.Router();
const { authMiddleware, permit } = require('../../core/auth.middleware');
const ctrl = require('./delivery.controller');

router.use(authMiddleware);

router.get('/agents/list', permit('admin', 'manager', 'employee'), ctrl.getAgents);
router.get('/routes/list', permit('admin', 'manager', 'employee'), ctrl.getRoutes);

router.get('/', permit('admin', 'manager', 'employee'), ctrl.getDeliveries);
router.get('/:id', permit('admin', 'manager', 'employee'), ctrl.getDelivery);
router.post('/', permit('admin', 'manager'), ctrl.createDelivery);
router.put('/:id/status', permit('admin', 'manager', 'employee'), ctrl.updateDeliveryStatus);

router.post('/agents', permit('admin', 'manager'), ctrl.createAgent);
router.put('/agents/:id', permit('admin', 'manager'), ctrl.updateAgent);

router.post('/routes', permit('admin', 'manager'), ctrl.createRoute);

const name = 'Delivery';
const mountPath = '/api/delivery';

function register(app, io) {
  app.use(mountPath, router);
}

module.exports = { name, mountPath, router, register, models: ['DeliveryAgent', 'Route', 'Delivery'] };
