const express = require('express');
const router = express.Router();
const { authMiddleware, permit } = require('../../core/auth.middleware');
const notificationController = require('../../controllers/notificationController');

router.use(authMiddleware);

router.get('/', permit('admin', 'manager', 'employee'), notificationController.getNotifications);
router.put('/read-all', permit('admin', 'manager', 'employee'), notificationController.markAllAsRead);
router.put('/:id/read', permit('admin', 'manager', 'employee'), notificationController.markAsRead);
router.delete('/:id', permit('admin', 'manager', 'employee'), notificationController.deleteNotification);

const name = 'Notifications';
const mountPath = '/api/notifications';

function register(app, io) {
  notificationController.setSocketIO(io);
  app.use(mountPath, router);
  app.set('io', io);
}

module.exports = { name, mountPath, router, register };
