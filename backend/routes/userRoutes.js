const express = require('express')
const router = express.Router()
const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cloudinary = require('../config/cloudinary')
const { getUsers, updateProfilePic, updateUser, requestDelete, deleteUser, uploadResume } = require('../controllers/userController')
const { protect } = require('../middleware/authMiddleware')

// Storage for profile pictures (images)
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'placement-tracker/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    resource_type: 'image'
  }
})

// Storage for resumes (raw PDFs)
const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'placement-tracker/resumes',
    allowed_formats: ['pdf'],
    resource_type: 'raw'
  }
})

const uploadImage = multer({ storage: profileStorage })
const uploadResumeMid = multer({ storage: resumeStorage })

router.route('/').get(protect, getUsers)
router.route('/:id').put(protect, updateUser).delete(protect, deleteUser)
router.route('/:id/request-delete').post(protect, requestDelete)
router.route('/:id/profile-pic').put(protect, uploadImage.single('image'), updateProfilePic)
router.route('/:id/resume').put(protect, uploadResumeMid.single('resume'), uploadResume)

module.exports = router
