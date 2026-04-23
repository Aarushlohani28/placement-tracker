const User = require('../models/User')

// @desc    Get all users
// @route   GET /api/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password')
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update user profile picture
// @route   PUT /api/users/:id/profile-pic
const updateProfilePic = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    // Check if the authenticated user is updating their own profile picture
    if (req.user.id !== user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    if (req.file) {
      // The file path relative to standard public path
      user.profilePic = `/uploads/${req.file.filename}`
      await user.save()
      res.json({ message: 'Profile picture updated', profilePic: user.profilePic })
    } else {
      res.status(400).json({ message: 'No image file provided' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update user info
// @route   PUT /api/users/:id
  const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (req.user.id !== user._id.toString()) return res.status(403).json({ message: 'Not authorized' })

    user.name = req.body.name || user.name
    if (req.body.bio !== undefined) user.bio = req.body.bio

    if (user.role === 'student') {
      user.branch = req.body.branch || user.branch
      user.cgpa = req.body.cgpa !== undefined ? req.body.cgpa : user.cgpa
      user.year = req.body.year || user.year
    } else if (user.role === 'admin') {
      user.designation = req.body.designation || user.designation
    }

    const updatedUser = await user.save()
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      cgpa: updatedUser.cgpa,
      branch: updatedUser.branch,
      year: updatedUser.year,
      designation: updatedUser.designation,
      profilePic: updatedUser.profilePic,
      bio: updatedUser.bio,
      resumeURL: updatedUser.resumeURL
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Request account deletion (student)
// @route   POST /api/users/:id/request-delete
const requestDelete = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (req.user.id !== user._id.toString()) return res.status(403).json({ message: 'Not authorized' })

    user.deletionRequested = true
    await user.save()
    res.json({ message: 'Deletion requested successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete user account (Admin only)
// @route   DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    // Only an admin can delete an account (their own or others)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' })
    }

    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    await user.deleteOne()
    res.json({ message: 'User removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Upload user resume (student)
// @route   PUT /api/users/:id/resume
const uploadResume = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (req.user.id !== user._id.toString()) return res.status(403).json({ message: 'Not authorized' })
    if (user.role !== 'student') return res.status(400).json({ message: 'Only students can have resumes' })

    if (req.file) {
      user.resumeURL = `/uploads/resumes/${req.file.filename}`
      await user.save()
      res.json({ message: 'Resume uploaded', resumeURL: user.resumeURL })
    } else {
      res.status(400).json({ message: 'No document file provided' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { getUsers, updateProfilePic, updateUser, requestDelete, deleteUser, uploadResume }
