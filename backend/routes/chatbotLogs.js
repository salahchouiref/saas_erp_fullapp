const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const permit = require('../middleware/roles');
const {
  createChatbotLog,
  getChatbotLogs,
  getChatbotLog,
  updateChatbotLog,
  deleteChatbotLog,
} = require('../controllers/chatbotLogController');

router.use(authMiddleware);
router.get('/', permit('admin', 'manager', 'employee'), getChatbotLogs);
router.get('/:id', permit('admin', 'manager', 'employee'), getChatbotLog);
router.post('/', permit('admin', 'manager', 'employee'), createChatbotLog);
router.put('/:id', permit('admin', 'manager'), updateChatbotLog);
router.delete('/:id', permit('admin'), deleteChatbotLog);

module.exports = router;
