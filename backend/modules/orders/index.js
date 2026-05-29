const express = require('express');
const router = express.Router();
const { authMiddleware, permit } = require('../../core/auth.middleware');
const ctrl = require('./orders.controller');

router.use(authMiddleware);

router.get('/orders/stats', permit('admin', 'manager'), ctrl.getOrderStats);
router.get('/orders', permit('admin', 'manager', 'employee'), ctrl.getOrders);
router.get('/orders/:id', permit('admin', 'manager', 'employee'), ctrl.getOrder);
router.post('/orders', permit('admin', 'manager'), ctrl.createOrder);
router.put('/orders/:id', permit('admin', 'manager'), ctrl.updateOrder);
router.delete('/orders/:id', permit('admin'), ctrl.deleteOrder);
router.post('/orders/:id/payments', permit('admin', 'manager'), ctrl.addPayment);

router.get('/invoices', permit('admin', 'manager', 'employee'), ctrl.getInvoices);

const name = 'Orders';
const mountPath = '/api/orders';

function register(app, io) {
  app.use(mountPath, router);
}

module.exports = { name, mountPath, router, register, models: ['Order', 'Invoice', 'Return'] };
