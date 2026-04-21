const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const permit = require('../middleware/roles');
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');

router.use(authMiddleware);
router.get('/', permit('admin', 'manager', 'employee'), getProjects);
router.get('/:id', permit('admin', 'manager', 'employee'), getProject);
router.post('/', permit('admin', 'manager'), createProject);
router.put('/:id', permit('admin', 'manager'), updateProject);
router.delete('/:id', permit('admin'), deleteProject);

module.exports = router;
