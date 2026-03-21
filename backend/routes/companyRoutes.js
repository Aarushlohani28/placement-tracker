const express = require('express')
const router = express.Router()
const {
  createCompany,
  getCompanies,
  getCompanyById,
  deleteCompany
} = require('../controllers/companyController')
const { protect, adminOnly } = require('../middleware/AuthMiddleware')

// Notice how some routes have both 'protect' AND 'adminOnly'
// protect checks: are you logged in?
// adminOnly checks: are you an admin?
// Both must pass for the request to go through

router.route('/')
  .get(protect, getCompanies)        // any logged in user can see companies
  .post(protect, adminOnly, createCompany)  // only admin can create

router.route('/:id')
  .get(protect, getCompanyById)      // any logged in user can see one company
  .delete(protect, adminOnly, deleteCompany) // only admin can delete

module.exports = router