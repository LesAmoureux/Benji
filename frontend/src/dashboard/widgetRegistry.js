const WIDGET_REGISTRY = [
  // --- Overview KPIs ---
  { id: 'total-income', name: 'Total Income', description: 'Sum of all income', icon: '💰', category: 'Overview', defaultEnabled: true },
  { id: 'total-expenses', name: 'Total Expenses', description: 'Sum of all expenses', icon: '💸', category: 'Overview', defaultEnabled: true },
  { id: 'net-balance', name: 'Net Balance', description: 'Income minus expenses', icon: '⚖️', category: 'Overview', defaultEnabled: true },
  { id: 'transaction-count', name: 'Transaction Count', description: 'Total number of transactions', icon: '🔢', category: 'Overview', defaultEnabled: false },
  { id: 'avg-transaction', name: 'Avg Transaction Size', description: 'Average amount per transaction', icon: '📐', category: 'Overview', defaultEnabled: false },
  { id: 'largest-expense', name: 'Largest Expense', description: 'Single biggest expense', icon: '🏷️', category: 'Overview', defaultEnabled: false },
  { id: 'largest-income', name: 'Largest Income', description: 'Single biggest income', icon: '🎯', category: 'Overview', defaultEnabled: false },

  // --- Spending ---
  { id: 'spending-chart', name: 'Spending Breakdown', description: 'Interactive donut chart of expenses', icon: '📊', category: 'Spending', defaultEnabled: true },
  { id: 'category-breakdown', name: 'Category Details', description: 'Category list with amounts and percentages', icon: '📋', category: 'Spending', defaultEnabled: true },
  { id: 'top-merchants', name: 'Top Merchants', description: 'Where you spend the most', icon: '🏪', category: 'Spending', defaultEnabled: true },
  { id: 'avg-daily-spend', name: 'Avg Daily Spend', description: 'Average spending per day in range', icon: '📆', category: 'Spending', defaultEnabled: false },
  { id: 'spend-by-weekday', name: 'Spend by Weekday', description: 'Which days you spend the most', icon: '📅', category: 'Spending', defaultEnabled: false },
  { id: 'expense-frequency', name: 'Expense Frequency', description: 'How often you make purchases', icon: '⏱️', category: 'Spending', defaultEnabled: false },
  { id: 'top-categories', name: 'Top 3 Categories', description: 'Your three biggest expense categories', icon: '🏆', category: 'Spending', defaultEnabled: false },
  { id: 'small-purchases', name: 'Small Purchases Total', description: 'Sum of transactions under $10', icon: '🪙', category: 'Spending', defaultEnabled: false },

  // --- Income ---
  { id: 'income-by-category', name: 'Income by Category', description: 'Breakdown of income sources', icon: '💵', category: 'Income', defaultEnabled: false },
  { id: 'income-count', name: 'Income Deposits', description: 'Number of income transactions', icon: '📥', category: 'Income', defaultEnabled: false },
  { id: 'savings-rate', name: 'Savings Rate', description: 'Percentage of income saved', icon: '🐖', category: 'Income', defaultEnabled: false },

  // --- Trends ---
  { id: 'monthly-trends', name: 'Monthly Trends', description: 'Income vs expenses by month', icon: '📈', category: 'Trends', defaultEnabled: true },
  { id: 'daily-spending-trend', name: 'Daily Spending', description: 'Day-by-day spending for current range', icon: '📉', category: 'Trends', defaultEnabled: false },
  { id: 'monthly-net', name: 'Monthly Net Savings', description: 'Net income minus expenses per month', icon: '💹', category: 'Trends', defaultEnabled: false },

  // --- Transactions ---
  { id: 'recent-transactions', name: 'Recent Transactions', description: 'Latest transactions list', icon: '📝', category: 'Transactions', defaultEnabled: true },
  { id: 'recurring-vs-onetime', name: 'Recurring vs One-time', description: 'Split between recurring and one-time', icon: '🔄', category: 'Transactions', defaultEnabled: false },
  { id: 'import-source', name: 'Import Source Mix', description: 'Manual vs CSV imported', icon: '📂', category: 'Transactions', defaultEnabled: false },
  { id: 'top-tags', name: 'Top Tags', description: 'Most used transaction tags', icon: '🏷️', category: 'Transactions', defaultEnabled: false },

  // --- Budgets ---
  { id: 'budget-overview', name: 'Budget Overview', description: 'Total planned vs actual spending', icon: '📊', category: 'Budgets', defaultEnabled: true },
  { id: 'budget-overspent', name: 'Over-budget Categories', description: 'Categories that exceeded their limit', icon: '🚨', category: 'Budgets', defaultEnabled: true },
  { id: 'budget-near-limit', name: 'Near Limit', description: 'Categories approaching their budget', icon: '⚠️', category: 'Budgets', defaultEnabled: false },

  // --- Accounts ---
  { id: 'account-balances', name: 'Account Balances', description: 'Last known balance per account type', icon: '🏦', category: 'Accounts', defaultEnabled: false },
  { id: 'account-activity', name: 'Account Activity', description: 'Transaction counts per account', icon: '📊', category: 'Accounts', defaultEnabled: false },

  // --- Cash Flow ---
  { id: 'cash-flow-ratio', name: 'Cash Flow Ratio', description: 'Income-to-expense ratio (above 1x = earning more than spending)', icon: '⚡', category: 'Cash Flow', defaultEnabled: false },
  { id: 'monthly-cash-flow', name: 'Monthly Cash Flow', description: 'Net cash flow per month showing surpluses and deficits', icon: '🌊', category: 'Cash Flow', defaultEnabled: false },
  { id: 'income-vs-expense-trend', name: 'Income vs Expense Trend', description: 'Side-by-side monthly comparison of income and expenses', icon: '📊', category: 'Cash Flow', defaultEnabled: false },
  { id: 'biggest-spending-month', name: 'Biggest Spending Month', description: 'The month with your highest total expenses', icon: '🔥', category: 'Cash Flow', defaultEnabled: false },
  { id: 'biggest-income-month', name: 'Biggest Income Month', description: 'The month with your highest total income', icon: '🎉', category: 'Cash Flow', defaultEnabled: false },
  { id: 'expense-growth-rate', name: 'Expense Growth Rate', description: 'How expenses changed compared to the previous month', icon: '📈', category: 'Cash Flow', defaultEnabled: false },

  // --- Bills & Essentials ---
  { id: 'essentials-vs-wants', name: 'Essentials vs Wants', description: 'Needs (Bills, Food, Healthcare) vs wants (Shopping, Entertainment)', icon: '⚖️', category: 'Bills & Essentials', defaultEnabled: false },
  { id: 'bills-total', name: 'Bills Total', description: 'Total spent on bills and utilities', icon: '🧾', category: 'Bills & Essentials', defaultEnabled: false },
  { id: 'subscriptions-total', name: 'Subscriptions Total', description: 'Total spent on recurring subscriptions', icon: '🔁', category: 'Bills & Essentials', defaultEnabled: false },
  { id: 'fixed-expense-ratio', name: 'Fixed Expense Ratio', description: 'Percentage of expenses going to bills and subscriptions', icon: '📌', category: 'Bills & Essentials', defaultEnabled: false },

  // --- Spending Habits ---
  { id: 'weekend-vs-weekday', name: 'Weekend vs Weekday', description: 'Compare average spending on weekends vs weekdays', icon: '🗓️', category: 'Spending Habits', defaultEnabled: false },
  { id: 'spending-velocity', name: 'Spending Velocity', description: 'Current month run rate projected to month end', icon: '🚀', category: 'Spending Habits', defaultEnabled: false },
  { id: 'median-transaction', name: 'Median Transaction', description: 'Middle-value transaction (more typical than average)', icon: '📏', category: 'Spending Habits', defaultEnabled: false },
  { id: 'transactions-over-100', name: 'Large Purchases (>$100)', description: 'Count and total of big-ticket purchases', icon: '💎', category: 'Spending Habits', defaultEnabled: false },
  { id: 'category-count', name: 'Category Diversity', description: 'Number of distinct spending categories used', icon: '🎨', category: 'Spending Habits', defaultEnabled: false },
  { id: 'merchant-count', name: 'Unique Merchants', description: 'Number of different merchants or payees', icon: '🏬', category: 'Spending Habits', defaultEnabled: false },

  // --- Savings & Goals ---
  { id: 'monthly-savings-trend', name: 'Monthly Savings Trend', description: 'How much you saved each month over time', icon: '📈', category: 'Savings & Goals', defaultEnabled: false },
  { id: 'avg-monthly-savings', name: 'Avg Monthly Savings', description: 'Average amount saved per month', icon: '💵', category: 'Savings & Goals', defaultEnabled: false },
  { id: 'best-savings-month', name: 'Best Savings Month', description: 'The month where you saved the most', icon: '🏅', category: 'Savings & Goals', defaultEnabled: false },
  { id: 'worst-savings-month', name: 'Worst Savings Month', description: 'The month where you saved the least or overspent', icon: '📉', category: 'Savings & Goals', defaultEnabled: false },
  { id: 'days-of-runway', name: 'Days of Runway', description: 'How many days your balance can sustain current spending', icon: '⛽', category: 'Savings & Goals', defaultEnabled: false },

  // --- Account Insights ---
  { id: 'checking-vs-savings-spend', name: 'Checking vs Savings Spend', description: 'Compare total spending across account types', icon: '🏦', category: 'Account Insights', defaultEnabled: false },
  { id: 'checking-income', name: 'Checking Income', description: 'Total income deposited into checking', icon: '💳', category: 'Account Insights', defaultEnabled: false },
  { id: 'savings-income', name: 'Savings Income', description: 'Total income deposited into savings', icon: '🐷', category: 'Account Insights', defaultEnabled: false },
  { id: 'account-transaction-split', name: 'Account Transaction Split', description: 'Percentage of transactions by account type', icon: '📊', category: 'Account Insights', defaultEnabled: false },

  // --- Time Analysis ---
  { id: 'spending-heatmap', name: 'Weekly Spending Totals', description: 'Total spending broken down by calendar week', icon: '🗓️', category: 'Time Analysis', defaultEnabled: false },
  { id: 'avg-weekly-spend', name: 'Avg Weekly Spend', description: 'Average amount spent per calendar week', icon: '📅', category: 'Time Analysis', defaultEnabled: false },
  { id: 'transactions-per-month', name: 'Transactions per Month', description: 'Monthly activity level by transaction count', icon: '📊', category: 'Time Analysis', defaultEnabled: false },
  { id: 'days-since-last-income', name: 'Days Since Last Income', description: 'Days since your most recent income deposit', icon: '⏳', category: 'Time Analysis', defaultEnabled: false },
  { id: 'days-since-last-expense', name: 'Days Since Last Expense', description: 'Days since your most recent purchase', icon: '⏱️', category: 'Time Analysis', defaultEnabled: false },
];

export function mergeWidgetPreferences(savedWidgets, registry = WIDGET_REGISTRY) {
  const savedMap = {};
  if (savedWidgets && Array.isArray(savedWidgets)) {
    savedWidgets.forEach(w => { savedMap[w.id] = w.enabled; });
  }

  return registry.map(w => ({
    id: w.id,
    enabled: savedMap[w.id] !== undefined ? savedMap[w.id] : w.defaultEnabled
  }));
}

export function getWidgetCategories(registry = WIDGET_REGISTRY) {
  const cats = [];
  const seen = new Set();
  registry.forEach(w => {
    if (!seen.has(w.category)) {
      seen.add(w.category);
      cats.push(w.category);
    }
  });
  return cats;
}

export default WIDGET_REGISTRY;
