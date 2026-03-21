const mongoose = require('mongoose')

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  logoURL: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  }
}, { timestamps: true })

module.exports = mongoose.model('Company', companySchema)