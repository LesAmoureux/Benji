const express = require('express');
const multer = require('multer');
const { previewCSV, importCSV, deleteAllCSVTransactions } = require('../controllers/csvController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

router.use(protect);

router.post('/preview', upload.single('file'), previewCSV);
router.post('/import', importCSV);
router.delete('/delete-all', deleteAllCSVTransactions);

module.exports = router;