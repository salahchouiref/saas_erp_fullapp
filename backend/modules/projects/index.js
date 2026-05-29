const express = require('express');
const router = express.Router();
const { authMiddleware, permit } = require('../../core/auth.middleware');
const projectController = require('../../controllers/projectController');
const taskController = require('../../controllers/taskController');

router.use(authMiddleware);

router.get('/', permit('admin', 'manager', 'employee'), projectController.getProjects);
router.get('/stats/overview', permit('admin', 'manager'), projectController.getProjectStats);
router.get('/:id', permit('admin', 'manager', 'employee'), projectController.getProject);
router.post('/', permit('admin', 'manager'), projectController.createProject);
router.put('/:id', permit('admin', 'manager'), projectController.updateProject);
router.delete('/:id', permit('admin'), projectController.deleteProject);

router.get('/:projectId/tasks', permit('admin', 'manager', 'employee'), taskController.getTasks);
router.post('/:projectId/tasks', permit('admin', 'manager', 'employee'), taskController.createTask);
router.put('/:projectId/tasks/:id', permit('admin', 'manager', 'employee'), taskController.updateTask);
router.delete('/:projectId/tasks/:id', permit('admin', 'manager'), taskController.deleteTask);
router.get('/:projectId/tasks/stats', permit('admin', 'manager'), taskController.getTaskStats);
router.post('/:projectId/tasks/:id/comments', permit('admin', 'manager', 'employee'), taskController.addComment);
router.get('/:projectId/tasks/:id', permit('admin', 'manager', 'employee'), taskController.getTask);

router.get('/:projectId/team', permit('admin', 'manager', 'employee'), taskController.getTeamMembers);
router.post('/:projectId/team', permit('admin', 'manager'), taskController.addTeamMember);
router.put('/:projectId/team/:memberId', permit('admin', 'manager'), taskController.updateTeamMember);
router.delete('/:projectId/team/:memberId', permit('admin', 'manager'), taskController.removeTeamMember);

const name = 'Projects';
const mountPath = '/api/projects';

function register(app, io) {
  app.use(mountPath, router);
}

module.exports = { name, mountPath, router, register };
