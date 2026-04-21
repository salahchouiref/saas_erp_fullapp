const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const permit = require('../middleware/roles');
const {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');

router.use(authMiddleware);
router.get('/', permit('admin', 'manager'), getEmployees);
router.get('/:id', permit('admin', 'manager'), getEmployee);
router.post('/', permit('admin'), createEmployee);
router.put('/:id', permit('admin'), updateEmployee);
router.delete('/:id', permit('admin'), deleteEmployee);

module.exports = router;
