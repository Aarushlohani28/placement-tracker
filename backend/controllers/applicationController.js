const Application = require('../models/Application')
const Drive = require('../models/Drive')

// @desc    Apply to a drive
// @route   POST /api/applications
// @access  Students only
const applyToDrive = async (req, res) => {
  try {
    const { driveId } = req.body

    // First check if the drive actually exists
    const drive = await Drive.findById(driveId)
    if (!drive) {
      return res.status(404).json({ message: 'Drive not found' })
    }

    // Check if student is eligible based on CGPA
    // req.user is available because of our protect middleware
    // it attached the logged in user's details to the request
    if (req.user.cgpa < drive.eligibilityCGPA) {
      return res.status(400).json({ 
        message: `You need a minimum CGPA of ${drive.eligibilityCGPA} to apply` 
      })
    }

    // Check if student already applied to this drive
    // We don't want duplicate applications
    const alreadyApplied = await Application.findOne({
      student: req.user._id,
      drive: driveId
    })
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied to this drive' })
    }

    // Create the application
    // Notice we get the student id from req.user — not from the request body
    // This is important — students can't apply on behalf of someone else
    const application = await Application.create({
      student: req.user._id,
      drive: driveId
    })

    // Populate both student and drive details in the response
    const populatedApplication = await Application.findById(application._id)
      .populate('student', '-password')  // exclude password from response
      .populate({ 
        path: 'drive',
        populate: { path: 'company' }  // nested populate — drive contains company
      })

    res.status(201).json(populatedApplication)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get my applications (student sees their own)
// @route   GET /api/applications/my
// @access  Students only
const getMyApplications = async (req, res) => {
  try {
    // req.user._id filters applications belonging to
    // only the logged in student — not everyone's
    const applications = await Application.find({ student: req.user._id })
      .populate({
        path: 'drive',
        populate: { path: 'company' }
      })
      .sort({ createdAt: -1 })  // newest first

    res.json(applications)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get all applications (admin sees everyone's)
// @route   GET /api/applications
// @access  Admin only
const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find({})
      .populate('student', '-password')
      .populate({
        path: 'drive',
        populate: { path: 'company' }
      })
      .sort({ createdAt: -1 })

    res.json(applications)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update application status
// @route   PUT /api/applications/:id
// @access  Admin only
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body

    // Validate the status is one of our allowed values
    const allowedStatuses = ['applied', 'shortlisted', 'interviewed', 'offered', 'rejected']
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' })
    }

    const application = await Application.findById(req.params.id)
    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    .populate('student', '-password')
    .populate({
      path: 'drive',
      populate: { path: 'company' }
    })

    res.json(updatedApplication)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { 
  applyToDrive, 
  getMyApplications, 
  getAllApplications, 
  updateApplicationStatus 
}