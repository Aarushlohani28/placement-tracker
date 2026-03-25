const Drive = require('../models/Drive')

// @desc    Create a drive
// @route   POST /api/drives
// @access  Admin only
const createDrive = async (req, res) => {
  try {
    const { company, role, package: pkg, eligibilityCGPA, 
            branches, date, venue, description } = req.body

    // Notice we're storing company as just an ID (ref)
    // not the entire company object — that keeps data clean
    // and avoids duplication in MongoDB
    const drive = await Drive.create({
      company,
      role,
      package: pkg,
      eligibilityCGPA,
      branches,
      date,
      venue,
      description
    })

    // populate() is magic — instead of returning just the company ID,
    // it fetches the actual company details and embeds them in the response
    // so the frontend gets everything it needs in one call
    const populatedDrive = await Drive.findById(drive._id).populate('company')

    res.status(201).json(populatedDrive)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get all drives
// @route   GET /api/drives
// @access  Any logged in user
const getDrives = async (req, res) => {
  try {
    // We sort by date so upcoming drives appear first
    // populate() again so company name shows up in the list
    const drives = await Drive.find({})
      .populate('company')
      .sort({ date: 1 })

    res.json(drives)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get single drive
// @route   GET /api/drives/:id
// @access  Any logged in user
const getDriveById = async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id).populate('company')

    if (!drive) {
      return res.status(404).json({ message: 'Drive not found' })
    }

    res.json(drive)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update drive status
// @route   PUT /api/drives/:id
// @access  Admin only
const updateDrive = async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id)

    if (!drive) {
      return res.status(404).json({ message: 'Drive not found' })
    }

    // findByIdAndUpdate takes 3 things:
    // 1. the id to find
    // 2. the new data to update
    // 3. { new: true } means return the UPDATED document
    //    not the old one before the update
    const updatedDrive = await Drive.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('company')

    res.json(updatedDrive)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete a drive
// @route   DELETE /api/drives/:id
// @access  Admin only
const deleteDrive = async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id)

    if (!drive) {
      return res.status(404).json({ message: 'Drive not found' })
    }

    await drive.deleteOne()
    res.json({ message: 'Drive removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { createDrive, getDrives, getDriveById, updateDrive, deleteDrive }