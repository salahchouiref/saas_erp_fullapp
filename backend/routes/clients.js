const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const permit = require('../middleware/roles');
const {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient,
} = require('../controllers/clientController');

router.use(authMiddleware);
router.get('/', permit('admin', 'manager', 'employee'), getClients);
router.get('/:id', permit('admin', 'manager', 'employee'), getClient);
router.post('/', permit('admin', 'manager'), createClient);
router.put('/:id', permit('admin', 'manager'), updateClient);
router.delete('/:id', permit('admin'), deleteClient);

module.exports = router;
