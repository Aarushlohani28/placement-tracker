const express = require('express')
const router = express.Router()
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const { getUsers, updateProfilePic, updateUser, requestDelete, deleteUser, uploadResume } = require('../controllers/userController')
const { protect } = require('../middleware/authMiddleware')

const uploadDir = path.join(__dirname, '../public/uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}
const resumeDir = path.join(__dirname, '../public/uploads/resumes')
if (!fs.existsSync(resumeDir)) {
  fs.mkdirSync(resumeDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    if (file.fieldname === 'resume') cb(null, resumeDir)
    else cb(null, uploadDir)
  },
  filename(req, file, cb) {
    cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`)
  }
})

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'resume') {
      if (file.mimetype === 'application/pdf' && path.extname(file.originalname).toLowerCase() === '.pdf') {
        return cb(null, true)
      } else {
        return cb('PDFs only!')
      }
    } else {
      const filetypes = /jpeg|jpg|png|gif/
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
      const mimetype = filetypes.test(file.mimetype)

      if (mimetype && extname) {
        return cb(null, true)
      } else {
        cb('Images only!')
      }
    }
  }
})

router.route('/').get(protect, getUsers)
router.route('/:id').put(protect, updateUser).delete(protect, deleteUser)
router.route('/:id/request-delete').post(protect, requestDelete)
router.route('/:id/profile-pic').put(protect, upload.single('image'), updateProfilePic)
router.route('/:id/resume').put(protect, upload.single('resume'), uploadResume)

module.exports = router
