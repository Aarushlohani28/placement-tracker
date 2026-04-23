const express = require('express')
const router = express.Router()
const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cloudinary = require('../config/cloudinary')
const { getMessages, getConversations, markRead, deleteChat, uploadImage } = require('../controllers/messageController')
const { protect } = require('../middleware/authMiddleware')

const chatStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'placement-tracker/chats',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    resource_type: 'image'
  }
})

const upload = multer({ storage: chatStorage })

router.route('/all/conversations').get(protect, getConversations)
router.route('/upload-image').post(protect, upload.single('image'), uploadImage)
router.route('/:userId').get(protect, getMessages).delete(protect, deleteChat)
router.route('/:userId/mark-read').put(protect, markRead)

module.exports = router
