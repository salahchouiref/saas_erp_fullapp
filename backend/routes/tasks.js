const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const permit = require('../middleware/roles');
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  addComment,
  getTaskStats,
  addTeamMember,
  getTeamMembers,
  updateTeamMember,
  removeTeamMember
} = require('../controllers/taskController');

router.use(authMiddleware);

router.get('/', permit('admin', 'manager', 'employee'), getTasks);
router.get('/stats', permit('admin', 'manager'), getTaskStats);

router.post('/team', permit('admin', 'manager'), addTeamMember);
router.get('/team', permit('admin', 'manager', 'employee'), getTeamMembers);
router.put('/team/:id', permit('admin', 'manager'), updateTeamMember);
router.delete('/team/:id', permit('admin', 'manager'), removeTeamMember);

router.get('/:id', permit('admin', 'manager', 'employee'), getTask);
router.post('/', permit('admin', 'manager', 'employee'), createTask);
router.put('/:id', permit('admin', 'manager', 'employee'), updateTask);
router.delete('/:id', permit('admin', 'manager'), deleteTask);
router.post('/:id/comments', permit('admin', 'manager', 'employee'), addComment);

module.exports = router;