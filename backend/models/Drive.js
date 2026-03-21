const mongoose = require('mongoose')

const driveSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  package: {
    type: Number,
    required: true
  },
  eligibilityCGPA: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  branches: [{
    type: String,
    trim: true
  }],
  date: {
    type: Date,
    required: true
  },
  venue: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  }
}, { timestamps: true })

module.exports = mongoose.model('Drive', driveSchema)