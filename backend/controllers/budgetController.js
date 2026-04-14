const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

exports.createBudget = async (req, res) => {
  try {
    req.body.user = req.user.id;
    const budget = await Budget.create(req.body);

    res.status(201).json({
      success: true,
      data: budget
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Budget already exists for this category and month'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let query = { user: req.user.id };
    
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    const budgets = await Budget.find(query);

    res.json({
      success: true,
      count: budgets.length,
      data: budgets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    if (budget.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const updatedBudget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedBudget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    if (budget.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await budget.deleteOne();

    res.json({
      success: true,
      message: 'Budget deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getBudgetSummary = async (req, res) => {
  try {
    const { month, year, accountType } = req.query;
    const m = parseInt(month);
    const y = parseInt(year);

    if (!m || !y) {
      return res.status(400).json({
        success: false,
        message: 'month and year query params are required'
      });
    }

    const budgets = await Budget.find({ user: req.user.id, month: m, year: y });

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59, 999);

    const matchStage = {
      user: new mongoose.Types.ObjectId(req.user.id),
      type: 'expense',
      date: { $gte: startDate, $lte: endDate }
    };
    if (accountType && ['checking', 'savings'].includes(accountType)) {
      matchStage.accountType = accountType;
    }

    const actuals = await Transaction.aggregate([
      { $match: matchStage },
      { $group: { _id: '$category', actual: { $sum: '$amount' } } }
    ]);

    const actualMap = {};
    actuals.forEach(a => { actualMap[a._id] = a.actual; });

    const allExpensesTotal = actuals.reduce((s, a) => s + a.actual, 0);

    const summary = budgets.map(b => {
      const actual = b.category === '__overall__'
        ? allExpensesTotal
        : (actualMap[b.category] || 0);
      return {
        _id: b._id,
        category: b.category,
        limit: b.limit,
        alertThreshold: b.alertThreshold,
        actual: Math.round(actual * 100) / 100,
        remaining: Math.round((b.limit - actual) * 100) / 100,
        overBudget: actual > b.limit,
        percentUsed: b.limit > 0 ? Math.round((actual / b.limit) * 1000) / 10 : 0
      };
    });

    const categoryBudgets = summary.filter(b => b.category !== '__overall__');
    const totalPlanned = categoryBudgets.reduce((s, b) => s + b.limit, 0);
    const totalActual = categoryBudgets.reduce((s, b) => s + b.actual, 0);

    res.json({
      success: true,
      month: m,
      year: y,
      totalPlanned: Math.round(totalPlanned * 100) / 100,
      totalActual: Math.round(totalActual * 100) / 100,
      totalRemaining: Math.round((totalPlanned - totalActual) * 100) / 100,
      count: summary.length,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};