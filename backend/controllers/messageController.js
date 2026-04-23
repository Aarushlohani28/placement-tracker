const Message = require('../models/Message')
const User = require('../models/User')

// @desc    Get conversation between current user and target user
// @route   GET /api/messages/:userId
const getMessages = async (req, res) => {
  try {
    const currentUserId = req.user._id
    const targetUserId = req.params.userId

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: targetUserId },
        { sender: targetUserId, receiver: currentUserId }
      ],
      deletedBy: { $ne: currentUserId }
    }).sort({ createdAt: 1 })

    res.json(messages)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get all conversations metadata
// @route   GET /api/messages/all/conversations
const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id

    const users = await User.find({ _id: { $ne: currentUserId } }).select('-password')

    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
      deletedBy: { $ne: currentUserId }
    }).sort({ createdAt: 1 })

    const conversations = users.map(user => {
      const uId = user._id.toString()
      const convMsgs = messages.filter(m => 
        m.sender.toString() === uId || m.receiver.toString() === uId
      )
      
      const unreadCount = convMsgs.filter(m => m.receiver.toString() === currentUserId.toString() && !m.read).length
      // Keep sort stable for users with no messages by using a very old date
      const lastMessageAt = convMsgs.length > 0 ? convMsgs[convMsgs.length - 1].createdAt : new Date(0)
      
      return {
        user,
        unreadCount,
        lastMessageAt,
        messageCount: convMsgs.length
      }
    }).filter(c => c.messageCount > 0)

    conversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))

    res.json(conversations)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Mark chat as read
// @route   PUT /api/messages/:userId/mark-read
const markRead = async (req, res) => {
  try {
    const currentUserId = req.user._id
    const targetUserId = req.params.userId

    await Message.updateMany(
      { sender: targetUserId, receiver: currentUserId, read: false },
      { $set: { read: true } }
    )

    res.json({ message: 'Messages marked as read' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete chat asymmetrically
// @route   DELETE /api/messages/:userId
const deleteChat = async (req, res) => {
  try {
    const currentUserId = req.user._id
    const targetUserId = req.params.userId

    const msgs = await Message.find({
      $or: [
        { sender: currentUserId, receiver: targetUserId },
        { sender: targetUserId, receiver: currentUserId }
      ],
      deletedBy: { $ne: currentUserId }
    })

    for (let msg of msgs) {
      msg.deletedBy.push(currentUserId)
      await msg.save()
    }

    res.json({ message: 'Chat deleted for current user' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Upload message image
// @route   POST /api/messages/upload-image
const uploadImage = async (req, res) => {
  try {
    if (req.file) {
      // Cloudinary returns the full absolute URL in req.file.path
      const mediaUrl = req.file.path
      res.json({ mediaUrl })
    } else {
      res.status(400).json({ message: 'No image file provided' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { getMessages, getConversations, markRead, deleteChat, uploadImage }
