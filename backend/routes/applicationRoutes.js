const express = require('express')
const router = express.Router()
const {
  applyToDrive,
  getMyApplications,
  getAllApplications,
  updateApplicationStatus
} = require('../controllers/applicationController')
const { protect, adminOnly } = require('../middleware/AuthMiddleware')

// Important: /my route must come BEFORE /:id route
// otherwise Express thinks "my" is an id and gets confused!
router.get('/my', protect, getMyApplications)

router.route('/')
  .get(protect, adminOnly, getAllApplications)
  .post(protect, applyToDrive)

router.route('/:id')
  .put(protect, adminOnly, updateApplicationStatus)

module.exports = router