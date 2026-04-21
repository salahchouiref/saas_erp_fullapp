const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const permit = require('../middleware/roles');
const {
  createPayslip,
  getPayslips,
  getPayslip,
  updatePayslip,
  deletePayslip,
} = require('../controllers/payslipController');

router.use(authMiddleware);
router.get('/', permit('admin', 'manager', 'employee'), getPayslips);
router.get('/:id', permit('admin', 'manager', 'employee'), getPayslip);
router.post('/', permit('admin', 'manager'), createPayslip);
router.put('/:id', permit('admin', 'manager'), updatePayslip);
router.delete('/:id', permit('admin'), deletePayslip);

module.exports = router;
