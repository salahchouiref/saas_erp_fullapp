const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const permit = require('../middleware/roles');
const workflowController = require('../controllers/workflowController');

router.use(authMiddleware);

router.get('/actions', permit('admin', 'manager'), workflowController.getAvailableActions);
router.get('/', permit('admin', 'manager'), workflowController.getWorkflows);
router.get('/:id', permit('admin', 'manager'), workflowController.getWorkflow);
router.post('/', permit('admin', 'manager'), workflowController.createWorkflow);
router.put('/:id', permit('admin', 'manager'), workflowController.updateWorkflow);
router.delete('/:id', permit('admin', 'manager'), workflowController.deleteWorkflow);
router.post('/:id/run', permit('admin', 'manager'), workflowController.runWorkflow);

module.exports = router;