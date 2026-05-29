const express = require('express');
const router = express.Router();
const { authMiddleware, permit } = require('../../core/auth.middleware');
const payslipController = require('../../controllers/payslipController');

router.use(authMiddleware);

router.get('/', permit('admin', 'manager', 'employee'), payslipController.getPayslips);
router.get('/:id', permit('admin', 'manager', 'employee'), payslipController.getPayslip);
router.post('/', permit('admin', 'manager'), payslipController.createPayslip);
router.put('/:id', permit('admin', 'manager'), payslipController.updatePayslip);
router.delete('/:id', permit('admin'), payslipController.deletePayslip);

const name = 'Payslips';
const mountPath = '/api/payslips';

function register(app, io) {
  app.use(mountPath, router);
}

module.exports = { name, mountPath, router, register };
