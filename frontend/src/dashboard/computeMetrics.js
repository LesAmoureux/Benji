export default function computeDashboardMetrics(transactions) {
  const income = transactions.filter(t => t.type === 'income');
  const expenses = transactions.filter(t => t.type === 'expense');

  const totalIncome = income.reduce((s, t) => s + t.amount, 0);
  const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  const txnCount = transactions.length;
  const avgTransaction = txnCount > 0 ? (totalIncome + totalExpenses) / txnCount : 0;

  const largestExpense = expenses.length > 0
    ? expenses.reduce((max, t) => t.amount > max.amount ? t : max, expenses[0])
    : null;

  const largestIncome = income.length > 0
    ? income.reduce((max, t) => t.amount > max.amount ? t : max, income[0])
    : null;

  // Category breakdown
  const categoryMap = {};
  expenses.forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });
  const categoryData = Object.entries(categoryMap)
    .map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
      percentage: totalExpenses > 0 ? ((value / totalExpenses) * 100).toFixed(1) : '0'
    }))
    .sort((a, b) => b.value - a.value);

  // Top merchants
  const merchantMap = {};
  expenses.forEach(t => {
    const merchant = t.merchantName || t.description || 'Unknown';
    merchantMap[merchant] = (merchantMap[merchant] || 0) + t.amount;
  });
  const topMerchants = Object.entries(merchantMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Monthly trends
  const monthlyMap = {};
  transactions.forEach(t => {
    const month = new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    if (!monthlyMap[month]) monthlyMap[month] = { income: 0, expense: 0 };
    if (t.type === 'income') monthlyMap[month].income += t.amount;
    else monthlyMap[month].expense += t.amount;
  });
  const monthlyData = Object.entries(monthlyMap)
    .map(([month, data]) => ({ month, income: data.income, expense: data.expense, net: data.income - data.expense }))
    .sort((a, b) => new Date(a.month) - new Date(b.month))
    .slice(-6);

  // Avg daily spend
  const dateSet = new Set(expenses.map(t => new Date(t.date).toDateString()));
  const daysWithSpending = dateSet.size || 1;
  const avgDailySpend = totalExpenses / daysWithSpending;

  // Spend by weekday
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekdaySpend = [0, 0, 0, 0, 0, 0, 0];
  expenses.forEach(t => {
    weekdaySpend[new Date(t.date).getDay()] += t.amount;
  });
  const spendByWeekday = weekdays.map((day, i) => ({ day, amount: Math.round(weekdaySpend[i] * 100) / 100 }));

  // Expense frequency (avg transactions per day)
  const expenseFrequency = daysWithSpending > 0 ? (expenses.length / daysWithSpending) : 0;

  // Top 3 categories
  const topCategories = categoryData.slice(0, 3);

  // Small purchases (under $10)
  const smallPurchases = expenses.filter(t => t.amount < 10);
  const smallPurchasesTotal = smallPurchases.reduce((s, t) => s + t.amount, 0);

  // Income by category
  const incomeCatMap = {};
  income.forEach(t => {
    incomeCatMap[t.category] = (incomeCatMap[t.category] || 0) + t.amount;
  });
  const incomeByCategory = Object.entries(incomeCatMap)
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value);

  // Savings rate
  const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : '0';

  // Daily spending trend
  const dailyMap = {};
  expenses.forEach(t => {
    const day = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dailyMap[day] = (dailyMap[day] || 0) + t.amount;
  });
  const dailySpendingTrend = Object.entries(dailyMap)
    .map(([day, amount]) => ({ day, amount: Math.round(amount * 100) / 100 }))
    .sort((a, b) => new Date(a.day) - new Date(b.day))
    .slice(-30);

  // Monthly net
  const monthlyNet = monthlyData.map(m => ({ month: m.month, net: Math.round(m.net * 100) / 100 }));

  // Recurring vs one-time
  const recurring = transactions.filter(t => t.isRecurring);
  const oneTime = transactions.filter(t => !t.isRecurring);

  // Import source mix
  const sourceMap = {};
  transactions.forEach(t => {
    const src = t.importedFrom || 'manual';
    sourceMap[src] = (sourceMap[src] || 0) + 1;
  });
  const importSourceMix = Object.entries(sourceMap).map(([source, count]) => ({ source, count }));

  // Top tags
  const tagMap = {};
  transactions.forEach(t => {
    (t.tags || []).forEach(tag => {
      tagMap[tag] = (tagMap[tag] || 0) + 1;
    });
  });
  const topTags = Object.entries(tagMap)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Account balances (last csvData.balance per accountType)
  const accountBalances = {};
  const accountActivity = {};
  transactions.forEach(t => {
    const acct = t.accountType || 'unspecified';
    accountActivity[acct] = (accountActivity[acct] || 0) + 1;
    if (t.csvData?.balance != null) {
      if (!accountBalances[acct] || new Date(t.date) > new Date(accountBalances[acct].date)) {
        accountBalances[acct] = { balance: t.csvData.balance, date: t.date };
      }
    }
  });

  // Recent transactions (sorted by date desc, top 20)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20);

  // --- Cash Flow metrics ---
  const cashFlowRatio = totalExpenses > 0 ? Math.round((totalIncome / totalExpenses) * 100) / 100 : 0;

  const fullMonthlyMap = {};
  transactions.forEach(t => {
    const key = new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    if (!fullMonthlyMap[key]) fullMonthlyMap[key] = { income: 0, expense: 0 };
    if (t.type === 'income') fullMonthlyMap[key].income += t.amount;
    else fullMonthlyMap[key].expense += t.amount;
  });
  const allMonths = Object.entries(fullMonthlyMap)
    .map(([month, d]) => ({ month, income: d.income, expense: d.expense, net: d.income - d.expense }))
    .sort((a, b) => new Date(a.month) - new Date(b.month));

  const monthlyCashFlow = allMonths.map(m => ({ month: m.month, net: Math.round(m.net * 100) / 100 }));

  const incomeVsExpenseTrend = allMonths.map(m => ({
    month: m.month,
    income: Math.round(m.income * 100) / 100,
    expense: Math.round(m.expense * 100) / 100
  }));

  const biggestSpendingMonth = allMonths.length > 0
    ? allMonths.reduce((max, m) => m.expense > max.expense ? m : max, allMonths[0])
    : null;

  const biggestIncomeMonth = allMonths.length > 0
    ? allMonths.reduce((max, m) => m.income > max.income ? m : max, allMonths[0])
    : null;

  let expenseGrowthRate = null;
  if (allMonths.length >= 2) {
    const curr = allMonths[allMonths.length - 1].expense;
    const prev = allMonths[allMonths.length - 2].expense;
    expenseGrowthRate = prev > 0 ? Math.round(((curr - prev) / prev) * 1000) / 10 : null;
  }

  // --- Bills & Essentials ---
  const essentialsCats = new Set(['Bills', 'Healthcare', 'Education', 'Food']);
  const wantsCats = new Set(['Entertainment', 'Shopping', 'Travel', 'Gifts']);
  let essentialsTotal = 0, wantsTotal = 0;
  expenses.forEach(t => {
    if (essentialsCats.has(t.category)) essentialsTotal += t.amount;
    else if (wantsCats.has(t.category)) wantsTotal += t.amount;
  });

  const billsTotal = expenses.filter(t => t.category === 'Bills').reduce((s, t) => s + t.amount, 0);
  const subscriptionsTotal = expenses.filter(t => t.category === 'Subscription').reduce((s, t) => s + t.amount, 0);
  const fixedExpenseRatio = totalExpenses > 0
    ? Math.round(((billsTotal + subscriptionsTotal) / totalExpenses) * 1000) / 10
    : 0;

  // --- Spending Habits ---
  const weekendSpend = expenses.filter(t => { const d = new Date(t.date).getDay(); return d === 0 || d === 6; });
  const weekdaySpendArr = expenses.filter(t => { const d = new Date(t.date).getDay(); return d >= 1 && d <= 5; });
  const weekendDays = new Set(weekendSpend.map(t => new Date(t.date).toDateString())).size || 1;
  const weekdayDays = new Set(weekdaySpendArr.map(t => new Date(t.date).toDateString())).size || 1;
  const weekendAvg = Math.round((weekendSpend.reduce((s, t) => s + t.amount, 0) / weekendDays) * 100) / 100;
  const weekdayAvg = Math.round((weekdaySpendArr.reduce((s, t) => s + t.amount, 0) / weekdayDays) * 100) / 100;

  const now = new Date();
  const currentMonthExpenses = expenses.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentMonthSpent = currentMonthExpenses.reduce((s, t) => s + t.amount, 0);
  const spendingVelocity = dayOfMonth > 0
    ? Math.round((currentMonthSpent / dayOfMonth) * daysInMonth * 100) / 100
    : 0;

  const sortedExpenseAmounts = expenses.map(t => t.amount).sort((a, b) => a - b);
  const medianTransaction = sortedExpenseAmounts.length > 0
    ? sortedExpenseAmounts.length % 2 === 0
      ? Math.round(((sortedExpenseAmounts[sortedExpenseAmounts.length / 2 - 1] + sortedExpenseAmounts[sortedExpenseAmounts.length / 2]) / 2) * 100) / 100
      : sortedExpenseAmounts[Math.floor(sortedExpenseAmounts.length / 2)]
    : 0;

  const largeTransactions = expenses.filter(t => t.amount > 100);
  const largeTransactionsTotal = largeTransactions.reduce((s, t) => s + t.amount, 0);

  const categoryCount = new Set(expenses.map(t => t.category)).size;

  const merchantCount = new Set(expenses.map(t => t.merchantName || t.description || 'Unknown')).size;

  // --- Savings & Goals ---
  const monthlySavingsTrend = allMonths.map(m => ({
    month: m.month,
    saved: Math.round((m.income - m.expense) * 100) / 100
  }));

  const avgMonthlySavings = allMonths.length > 0
    ? Math.round((allMonths.reduce((s, m) => s + (m.income - m.expense), 0) / allMonths.length) * 100) / 100
    : 0;

  const bestSavingsMonth = allMonths.length > 0
    ? allMonths.reduce((best, m) => (m.income - m.expense) > (best.income - best.expense) ? m : best, allMonths[0])
    : null;

  const worstSavingsMonth = allMonths.length > 0
    ? allMonths.reduce((worst, m) => (m.income - m.expense) < (worst.income - worst.expense) ? m : worst, allMonths[0])
    : null;

  const totalBalance = Object.values(accountBalances).reduce((s, info) => s + (info.balance || 0), 0);
  const daysOfRunway = avgDailySpend > 0 ? Math.round(totalBalance / avgDailySpend) : null;

  // --- Account Insights ---
  const checkingExpenses = expenses.filter(t => t.accountType === 'checking').reduce((s, t) => s + t.amount, 0);
  const savingsExpenses = expenses.filter(t => t.accountType === 'savings').reduce((s, t) => s + t.amount, 0);
  const checkingIncome = income.filter(t => t.accountType === 'checking').reduce((s, t) => s + t.amount, 0);
  const savingsIncome = income.filter(t => t.accountType === 'savings').reduce((s, t) => s + t.amount, 0);

  const accountTxnSplit = {};
  transactions.forEach(t => {
    const acct = t.accountType || 'unspecified';
    accountTxnSplit[acct] = (accountTxnSplit[acct] || 0) + 1;
  });

  // --- Time Analysis ---
  const weekMap = {};
  expenses.forEach(t => {
    const d = new Date(t.date);
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const weekNum = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
    const key = `${d.getFullYear()} W${weekNum}`;
    weekMap[key] = (weekMap[key] || 0) + t.amount;
  });
  const weeklySpending = Object.entries(weekMap)
    .map(([week, amount]) => ({ week, amount: Math.round(amount * 100) / 100 }))
    .sort((a, b) => a.week.localeCompare(b.week));

  const avgWeeklySpend = weeklySpending.length > 0
    ? Math.round((weeklySpending.reduce((s, w) => s + w.amount, 0) / weeklySpending.length) * 100) / 100
    : 0;

  const transactionsPerMonth = allMonths.map(m => {
    const count = transactions.filter(t => {
      const key = new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      return key === m.month;
    }).length;
    return { month: m.month, count };
  });

  const sortedIncome = [...income].sort((a, b) => new Date(b.date) - new Date(a.date));
  const lastIncomeDate = sortedIncome.length > 0 ? new Date(sortedIncome[0].date) : null;
  const daysSinceLastIncome = lastIncomeDate ? Math.floor((new Date() - lastIncomeDate) / 86400000) : null;

  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
  const lastExpenseDate = sortedExpenses.length > 0 ? new Date(sortedExpenses[0].date) : null;
  const daysSinceLastExpense = lastExpenseDate ? Math.floor((new Date() - lastExpenseDate) / 86400000) : null;

  return {
    totalIncome,
    totalExpenses,
    netBalance,
    txnCount,
    avgTransaction: Math.round(avgTransaction * 100) / 100,
    largestExpense,
    largestIncome,
    categoryData,
    topMerchants,
    monthlyData,
    avgDailySpend: Math.round(avgDailySpend * 100) / 100,
    spendByWeekday,
    expenseFrequency: Math.round(expenseFrequency * 10) / 10,
    topCategories,
    smallPurchasesTotal: Math.round(smallPurchasesTotal * 100) / 100,
    smallPurchasesCount: smallPurchases.length,
    incomeByCategory,
    incomeCount: income.length,
    savingsRate,
    dailySpendingTrend,
    monthlyNet,
    recurringCount: recurring.length,
    oneTimeCount: oneTime.length,
    recurringTotal: recurring.reduce((s, t) => s + t.amount, 0),
    oneTimeTotal: oneTime.reduce((s, t) => s + t.amount, 0),
    importSourceMix,
    topTags,
    accountBalances,
    accountActivity,
    recentTransactions,
    cashFlowRatio,
    monthlyCashFlow,
    incomeVsExpenseTrend,
    biggestSpendingMonth,
    biggestIncomeMonth,
    expenseGrowthRate,
    essentialsTotal: Math.round(essentialsTotal * 100) / 100,
    wantsTotal: Math.round(wantsTotal * 100) / 100,
    billsTotal: Math.round(billsTotal * 100) / 100,
    subscriptionsTotal: Math.round(subscriptionsTotal * 100) / 100,
    fixedExpenseRatio,
    weekendAvg,
    weekdayAvg,
    spendingVelocity,
    medianTransaction,
    largeTransactionsCount: largeTransactions.length,
    largeTransactionsTotal: Math.round(largeTransactionsTotal * 100) / 100,
    categoryCount,
    merchantCount,
    monthlySavingsTrend,
    avgMonthlySavings,
    bestSavingsMonth,
    worstSavingsMonth,
    daysOfRunway,
    checkingExpenses: Math.round(checkingExpenses * 100) / 100,
    savingsExpenses: Math.round(savingsExpenses * 100) / 100,
    checkingIncome: Math.round(checkingIncome * 100) / 100,
    savingsIncome: Math.round(savingsIncome * 100) / 100,
    accountTxnSplit,
    weeklySpending,
    avgWeeklySpend,
    transactionsPerMonth,
    daysSinceLastIncome,
    daysSinceLastExpense,
  };
}
