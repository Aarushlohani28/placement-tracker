const Company = require('../models/Company')

// @desc    Create a company
// @route   POST /api/companies
// @access  Admin only
const createCompany = async (req, res) => {
  try {
    // We take the company details from the request body
    // and create a new document in MongoDB
    const { name, logoURL, industry, website, description } = req.body

    const company = await Company.create({
      name,
      logoURL,
      industry,
      website,
      description
    })

    res.status(201).json(company)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get all companies
// @route   GET /api/companies
// @access  Any logged in user
const getCompanies = async (req, res) => {
  try {
    // .find({}) means "give me everything" from the Company collection
    const companies = await Company.find({})
    res.json(companies)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Any logged in user
const getCompanyById = async (req, res) => {
  try {
    // req.params.id grabs the id from the URL
    // e.g. /api/companies/64abc → id = 64abc
    const company = await Company.findById(req.params.id)

    if (!company) {
      return res.status(404).json({ message: 'Company not found' })
    }

    res.json(company)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete a company
// @route   DELETE /api/companies/:id
// @access  Admin only
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)

    if (!company) {
      return res.status(404).json({ message: 'Company not found' })
    }

    await company.deleteOne()
    res.json({ message: 'Company removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { createCompany, getCompanies, getCompanyById, deleteCompany }