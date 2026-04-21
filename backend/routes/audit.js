const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const permit = require('../middleware/roles');
const { generateReport } = require('../controllers/auditController');

router.use(authMiddleware);
router.get('/report', permit('admin', 'manager'), generateReport);

module.exports = router;
