const express = require('express');
const router = express.Router();
const { authMiddleware, permit } = require('../../core/auth.middleware');
const { chat, scheduleReminder, getReminders, deleteReminder, updateReminderStatus, clearChat } = require('../../controllers/aiController');

router.use(authMiddleware);

router.post('/chat', permit('admin', 'manager', 'employee'), chat);
router.post('/clear', permit('admin', 'manager', 'employee'), clearChat);
router.post('/reminder', permit('admin', 'manager'), scheduleReminder);
router.get('/reminders', permit('admin', 'manager', 'employee'), getReminders);
router.delete('/reminder/:id', permit('admin', 'manager'), deleteReminder);
router.put('/reminder/:id/status', permit('admin', 'manager', 'employee'), updateReminderStatus);

const name = 'AI';
const mountPath = '/api/ai';

function register(app, io) {
  app.use(mountPath, router);
  app.set('aiModule', { router });
}

module.exports = { name, mountPath, router, register };
