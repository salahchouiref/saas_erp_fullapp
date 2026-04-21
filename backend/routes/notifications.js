const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const permit = require('../middleware/roles');
const notificationController = require('../controllers/notificationController');

router.use(authMiddleware);

router.get('/', permit('admin', 'manager', 'employee'), notificationController.getNotifications);
router.put('/:id/read', permit('admin', 'manager', 'employee'), notificationController.markAsRead);
router.put('/read-all', permit('admin', 'manager', 'employee'), notificationController.markAllAsRead);
router.delete('/:id', permit('admin', 'manager', 'employee'), notificationController.deleteNotification);

module.exports = router;