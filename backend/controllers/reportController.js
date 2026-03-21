const Transaction = require('../models/Transaction');

exports.getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide month and year'
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const transactions = await Transaction.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryBreakdown = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
    });

    res.json({
      success: true,
      data: {
        month: parseInt(month),
        year: parseInt(year),
        totalIncome: income,
        totalExpenses: expenses,
        balance: income - expenses,
        categoryBreakdown,
        transactionCount: transactions.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getCategoryReport = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user.id,
      type: 'expense'
    });

    const categoryData = {};
    transactions.forEach(t => {
      if (!categoryData[t.category]) {
        categoryData[t.category] = {
          total: 0,
          count: 0,
          transactions: []
        };
      }
      categoryData[t.category].total += t.amount;
      categoryData[t.category].count += 1;
      categoryData[t.category].transactions.push({
        amount: t.amount,
        description: t.description,
        date: t.date
      });
    });

    res.json({
      success: true,
      data: categoryData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};