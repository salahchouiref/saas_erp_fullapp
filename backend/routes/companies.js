const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const permit = require('../middleware/roles');
const {
  createCompany,
  getCompanies,
  getCompany,
  updateCompany,
  deleteCompany,
} = require('../controllers/companyController');

router.use(authMiddleware);
router.get('/', permit('admin'), getCompanies);
router.get('/:id', permit('admin'), getCompany);
router.post('/', permit('admin'), createCompany);
router.put('/:id', permit('admin'), updateCompany);
router.delete('/:id', permit('admin'), deleteCompany);

module.exports = router;
