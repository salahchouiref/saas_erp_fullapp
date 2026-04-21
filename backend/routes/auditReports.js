const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const permit = require('../middleware/roles');
const {
  createAuditReport,
  getAuditReports,
  getAuditReport,
  updateAuditReport,
  deleteAuditReport,
} = require('../controllers/auditReportController');

router.use(authMiddleware);
router.get('/', permit('admin', 'manager', 'employee'), getAuditReports);
router.get('/:id', permit('admin', 'manager', 'employee'), getAuditReport);
router.post('/', permit('admin', 'manager'), createAuditReport);
router.put('/:id', permit('admin', 'manager'), updateAuditReport);
router.delete('/:id', permit('admin'), deleteAuditReport);

module.exports = router;
