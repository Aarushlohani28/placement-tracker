const express = require('express')
const router = express.Router()
const {
  addInterviewRound,
  getRoundsByApplication,
  updateRoundResult,
  deleteRound
} = require('../controllers/interviewRoundController')
const { protect, adminOnly } = require('../middleware/AuthMiddleware')

// Get all rounds for a specific application
// e.g. GET /api/interviews/64abc → all rounds for application 64abc
router.get('/:applicationId', protect, getRoundsByApplication)

router.route('/')
  .post(protect, adminOnly, addInterviewRound)

router.route('/:id')
  .put(protect, adminOnly, updateRoundResult)
  .delete(protect, adminOnly, deleteRound)

module.exports = router