const express = require('express')
const router = express.Router()
const { registerUser, loginUser, getUserProfile } = require('../controllers/AuthController')
const { protect } = require('../middleware/AuthMiddleware')

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/profile', protect, getUserProfile)

module.exports = router