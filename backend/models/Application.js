const mongoose = require('mongoose')

const applicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  drive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drive',
    required: true
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'interviewed', 'offered', 'rejected'],
    default: 'applied'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true })

module.exports = mongoose.model('Application', applicationSchema)