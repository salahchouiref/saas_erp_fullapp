const express = require('express');
const router = express.Router();
const { authMiddleware, permit } = require('../../core/auth.middleware');
const employeeController = require('../../controllers/employeeController');

router.use(authMiddleware);

router.get('/', permit('admin', 'manager'), employeeController.getEmployees);
router.get('/stats/overview', permit('admin', 'manager'), employeeController.getEmployeeStats);
router.get('/:id', permit('admin', 'manager'), employeeController.getEmployee);
router.post('/', permit('admin'), employeeController.createEmployee);
router.put('/:id', permit('admin'), employeeController.updateEmployee);
router.delete('/:id', permit('admin'), employeeController.deleteEmployee);

const name = 'HR';
const mountPath = '/api/hr';

function register(app, io) {
  app.use(mountPath, router);
}

module.exports = { name, mountPath, router, register };
