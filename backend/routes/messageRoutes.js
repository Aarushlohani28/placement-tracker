const express = require('express')
const router = express.Router()
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const { getMessages, getConversations, markRead, deleteChat, uploadImage } = require('../controllers/messageController')
const { protect } = require('../middleware/authMiddleware')

const uploadDir = path.join(__dirname, '../public/uploads/messages')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir)
  },
  filename(req, file, cb) {
    cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`)
  }
})

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = filetypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb('Images only!')
    }
  }
})

router.route('/all/conversations').get(protect, getConversations)
router.route('/upload-image').post(protect, upload.single('image'), uploadImage)
router.route('/:userId').get(protect, getMessages).delete(protect, deleteChat)
router.route('/:userId/mark-read').put(protect, markRead)

module.exports = router
