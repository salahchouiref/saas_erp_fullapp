const express = require('express');
const router = express.Router();
const { authMiddleware, permit } = require('../../core/auth.middleware');
const ctrl = require('./stock.controller');

router.use(authMiddleware);

router.get('/products', permit('admin', 'manager', 'employee'), ctrl.getProducts);
router.get('/products/:id', permit('admin', 'manager', 'employee'), ctrl.getProduct);
router.post('/products', permit('admin', 'manager'), ctrl.createProduct);
router.put('/products/:id', permit('admin', 'manager'), ctrl.updateProduct);
router.delete('/products/:id', permit('admin'), ctrl.deleteProduct);

router.get('/categories', permit('admin', 'manager', 'employee'), ctrl.getCategories);
router.post('/categories', permit('admin', 'manager'), ctrl.createCategory);

router.get('/warehouses', permit('admin', 'manager', 'employee'), ctrl.getWarehouses);
router.post('/warehouses', permit('admin', 'manager'), ctrl.createWarehouse);

router.get('/movements', permit('admin', 'manager', 'employee'), ctrl.getStockMovements);
router.post('/movements', permit('admin', 'manager'), ctrl.createStockMovement);

router.get('/levels', permit('admin', 'manager', 'employee'), ctrl.getStockLevels);

router.get('/suppliers', permit('admin', 'manager', 'employee'), ctrl.getSuppliers);
router.post('/suppliers', permit('admin', 'manager'), ctrl.createSupplier);
router.put('/suppliers/:id', permit('admin', 'manager'), ctrl.updateSupplier);

const name = 'Stock';
const mountPath = '/api/stock';

function register(app, io) {
  app.use(mountPath, router);
}

module.exports = { name, mountPath, router, register, models: ['Category', 'Warehouse', 'Product', 'StockMovement', 'StockLevel', 'Supplier'] };
