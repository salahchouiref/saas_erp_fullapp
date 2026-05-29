const express = require('express');
const router = express.Router();
const { authMiddleware, permit } = require('../../core/auth.middleware');
const clientController = require('../../controllers/clientController');

router.use(authMiddleware);

router.get('/', permit('admin', 'manager', 'employee'), clientController.getClients);
router.get('/stats/overview', permit('admin', 'manager'), (req, res, next) => {
  res.json({ message: 'CRM stats endpoint' });
});
router.get('/:id', permit('admin', 'manager', 'employee'), clientController.getClient);
router.post('/', permit('admin', 'manager'), clientController.createClient);
router.put('/:id', permit('admin', 'manager'), clientController.updateClient);
router.delete('/:id', permit('admin'), clientController.deleteClient);

const name = 'CRM';
const mountPath = '/api/clients';

function register(app, io) {
  app.use(mountPath, router);
}

module.exports = { name, mountPath, router, register };
