const mongoose = require('mongoose')

const interviewRoundSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  roundName: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date
  },
  result: {
    type: String,
    enum: ['pending', 'cleared', 'rejected'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  }
}, { timestamps: true })

module.exports = mongoose.model('InterviewRound', interviewRoundSchema)