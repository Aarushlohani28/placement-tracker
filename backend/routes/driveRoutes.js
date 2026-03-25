const express = require('express')
const router = express.Router()
const {
  createDrive,
  getDrives,
  getDriveById,
  updateDrive,
  deleteDrive
} = require('../controllers/driveController')
const { protect, adminOnly } = require('../middleware/AuthMiddleware')

router.route('/')
  .get(protect, getDrives)
  .post(protect, adminOnly, createDrive)

router.route('/:id')
  .get(protect, getDriveById)
  .put(protect, adminOnly, updateDrive)
  .delete(protect, adminOnly, deleteDrive)

module.exports = router