const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Get user preferences
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: user.dashboardPreferences || { widgets: [], theme: 'light' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update user preferences
router.put('/', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { dashboardPreferences: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: user.dashboardPreferences
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;