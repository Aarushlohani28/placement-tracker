const InterviewRound = require('../models/InterviewRound')
const Application = require('../models/Application')

// @desc    Add an interview round to an application
// @route   POST /api/interviews
// @access  Admin only
const addInterviewRound = async (req, res) => {
  try {
    const { applicationId, roundName, date, notes } = req.body

    // Make sure the application exists before adding a round to it
    const application = await Application.findById(applicationId)
    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    // Create the interview round linked to the application
    const round = await InterviewRound.create({
      application: applicationId,
      roundName,
      date,
      notes
    })

    // Populate the application details so admin
    // can see which student and drive this round belongs to
    const populatedRound = await InterviewRound.findById(round._id)
      .populate({
        path: 'application',
        populate: [
          { path: 'student', select: '-password' },
          { path: 'drive', populate: { path: 'company' } }
        ]
      })

    res.status(201).json(populatedRound)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get all rounds for a specific application
// @route   GET /api/interviews/:applicationId
// @access  Logged in user
const getRoundsByApplication = async (req, res) => {
  try {
    // Find all rounds belonging to this application
    // sorted so round 1 appears before round 2 etc.
    const rounds = await InterviewRound.find({ 
      application: req.params.applicationId 
    }).sort({ date: 1 })

    res.json(rounds)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update interview round result
// @route   PUT /api/interviews/:id
// @access  Admin only
const updateRoundResult = async (req, res) => {
  try {
    const { result, notes } = req.body

    const round = await InterviewRound.findById(req.params.id)
    if (!round) {
      return res.status(404).json({ message: 'Interview round not found' })
    }

    // Only update fields that were actually sent
    // if result wasn't sent, keep the old one
    // This is called a partial update — very clean pattern
    if (result) round.result = result
    if (notes) round.notes = notes

    const updatedRound = await round.save()

    res.json(updatedRound)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete an interview round
// @route   DELETE /api/interviews/:id
// @access  Admin only
const deleteRound = async (req, res) => {
  try {
    const round = await InterviewRound.findById(req.params.id)
    if (!round) {
      return res.status(404).json({ message: 'Interview round not found' })
    }

    await round.deleteOne()
    res.json({ message: 'Interview round removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { 
  addInterviewRound, 
  getRoundsByApplication, 
  updateRoundResult,
  deleteRound
}