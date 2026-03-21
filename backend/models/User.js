const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  cgpa: {
    type: Number,
    min: 0,
    max: 10
  },
  branch: {
    type: String,
    trim: true
  },
  year: {
    type: Number,
    enum: [1, 2, 3, 4]
  },
  resumeURL: {
    type: String,
    trim: true
  }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)