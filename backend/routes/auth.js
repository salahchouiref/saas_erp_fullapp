const express = require('express');
const { login, demo, me, logout } = require('../controllers/authController');
const router = express.Router();


const authMiddleware = require('../middleware/auth');

router.post('/login', login);
router.get('/demo', demo);
router.get('/me', authMiddleware, me);
router.post('/logout', authMiddleware, logout);

module.exports = router;
