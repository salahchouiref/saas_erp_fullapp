const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const permit = require('../middleware/roles');
const { chat, automate } = require('../controllers/aiController');

router.use(authMiddleware);
router.post('/chat', permit('admin', 'manager', 'employee'), chat);
router.post('/automate', permit('admin', 'manager'), automate);

module.exports = router;
