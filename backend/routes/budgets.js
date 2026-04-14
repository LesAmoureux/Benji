const express = require('express');
const {
  createBudget,
  getBudgets,
  getBudgetSummary,
  updateBudget,
  deleteBudget
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/summary', getBudgetSummary);

router.route('/')
  .get(getBudgets)
  .post(createBudget);

router.route('/:id')
  .put(updateBudget)
  .delete(deleteBudget);

module.exports = router;