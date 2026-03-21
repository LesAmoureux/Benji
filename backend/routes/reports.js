const express = require('express');
const {
  getMonthlyReport,
  getCategoryReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/monthly', getMonthlyReport);
router.get('/category', getCategoryReport);

module.exports = router;