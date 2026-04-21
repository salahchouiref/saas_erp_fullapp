const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const permit = require('../middleware/roles');
const { chat, scheduleReminder, getReminders, deleteReminder, updateReminderStatus, clearChat } = require('../controllers/aiController');

router.use(authMiddleware);

router.post('/chat', permit('admin', 'manager', 'employee'), chat);
router.post('/clear', permit('admin', 'manager', 'employee'), clearChat);

router.post('/reminder', permit('admin', 'manager'), scheduleReminder);
router.get('/reminders', permit('admin', 'manager', 'employee'), getReminders);
router.delete('/reminder/:id', permit('admin', 'manager'), deleteReminder);
router.put('/reminder/:id/status', permit('admin', 'manager', 'employee'), updateReminderStatus);

module.exports = router;