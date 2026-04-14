import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import D3DonutChart from '../../components/D3DonutChart';

const card = "benji-money-lines bg-benji-paper dark:bg-benji-vault-card p-4 rounded-xl shadow-warm dark:shadow-vault border border-benji-sage/10 dark:border-benji-gold/10 h-full";
const cardAnim = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

function KpiCard({ title, value, sub, icon: Icon, gradient }) {
  return (
    <motion.div {...cardAnim} className={`benji-money-lines ${gradient} p-4 rounded-xl shadow-warm dark:shadow-vault text-white h-full`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-semibold opacity-90">{title}</h3>
        {Icon && <Icon size={24} className="opacity-80" />}
      </div>
      <p className="text-3xl font-bold mb-1">{value}</p>
      {sub && <p className="text-xs opacity-80">{sub}</p>}
    </motion.div>
  );
}

function SimpleKpi({ title, value, sub }) {
  return (
    <motion.div {...cardAnim} className={card}>
      <p className="text-sm text-benji-ink/70 dark:text-benji-mist-dim/70 mb-1">{title}</p>
      <p className="text-2xl font-bold text-benji-forest dark:text-benji-mist">{value}</p>
      {sub && <p className="text-xs text-benji-ink/70 dark:text-benji-mist-dim/70 mt-1">{sub}</p>}
    </motion.div>
  );
}

function TableWidget({ title, headers, rows, emptyMsg }) {
  return (
    <motion.div {...cardAnim} className={card}>
      <h2 className="text-xl font-bold text-benji-forest dark:text-benji-mist mb-4">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-benji-ink/70 dark:text-benji-mist-dim/70">{emptyMsg || 'No data'}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-benji-sage/20 dark:border-benji-gold/10">
                {headers.map(h => <th key={h} className="text-left py-2 px-3 text-sm text-benji-forest dark:text-benji-mist">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-benji-sage/10 dark:border-benji-gold/5">
                  {row.map((cell, j) => <td key={j} className="py-2 px-3 text-sm text-benji-forest dark:text-benji-mist">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}

function ListWidget({ title, items, emptyMsg }) {
  return (
    <motion.div {...cardAnim} className={card}>
      <h2 className="text-xl font-bold text-benji-forest dark:text-benji-mist mb-4">{title}</h2>
      {items.length === 0 ? (
        <p className="text-benji-ink/70 dark:text-benji-mist-dim/70">{emptyMsg || 'No data'}</p>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-benji-cream/50 dark:bg-benji-vault-up rounded-lg">
              <span className="text-sm text-benji-forest dark:text-benji-mist">{item.label}</span>
              <span className="text-sm font-semibold text-benji-forest dark:text-benji-mist">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function BarListWidget({ title, items, maxValue }) {
  const max = maxValue || Math.max(...items.map(i => i.amount), 1);
  return (
    <motion.div {...cardAnim} className={card}>
      <h2 className="text-xl font-bold text-benji-forest dark:text-benji-mist mb-4">{title}</h2>
      {items.length === 0 ? (
        <p className="text-benji-ink/70 dark:text-benji-mist-dim/70">No data</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-benji-ink dark:text-benji-mist-dim">{item.label}</span>
                <span className="font-semibold text-benji-forest dark:text-benji-mist">${item.amount.toFixed(2)}</span>
              </div>
              <div className="w-full bg-benji-sage/20 dark:bg-benji-vault-up rounded-full h-2">
                <div className="bg-benji-sage-dark dark:bg-benji-gold h-2 rounded-full" style={{ width: `${(item.amount / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ---------- Exported widget render map ----------

export function renderWidget(widgetId, metrics, budgetSummary, filteredTransactions) {
  const m = metrics;
  const bs = budgetSummary;

  switch (widgetId) {
    // Overview
    case 'total-income':
      return <KpiCard title="Total Income" value={`$${m.totalIncome.toFixed(2)}`} icon={TrendingUp} gradient="bg-gradient-to-br from-benji-sage to-benji-sage-dark dark:from-benji-jade-dim dark:to-benji-jade-dim/70" />;
    case 'total-expenses':
      return <KpiCard title="Total Expenses" value={`$${m.totalExpenses.toFixed(2)}`} icon={TrendingDown} gradient="bg-gradient-to-br from-benji-brick to-benji-brick/80 dark:from-benji-coral dark:to-benji-coral/70" />;
    case 'net-balance':
      return <KpiCard title="Net Balance" value={`$${m.netBalance.toFixed(2)}`} sub={m.netBalance >= 0 ? 'Surplus' : 'Deficit'} icon={Calendar} gradient="bg-gradient-to-br from-benji-forest to-benji-forest-light dark:from-benji-gold/90 dark:to-benji-gold/60" />;
    case 'transaction-count':
      return <SimpleKpi title="Transaction Count" value={m.txnCount} />;
    case 'avg-transaction':
      return <SimpleKpi title="Avg Transaction" value={`$${m.avgTransaction.toFixed(2)}`} />;
    case 'largest-expense':
      return <SimpleKpi title="Largest Expense" value={m.largestExpense ? `$${m.largestExpense.amount.toFixed(2)}` : '--'} sub={m.largestExpense?.description || m.largestExpense?.merchantName || ''} />;
    case 'largest-income':
      return <SimpleKpi title="Largest Income" value={m.largestIncome ? `$${m.largestIncome.amount.toFixed(2)}` : '--'} sub={m.largestIncome?.description || m.largestIncome?.merchantName || ''} />;

    // Spending
    case 'spending-chart':
      return m.categoryData.length > 0 ? (
        <motion.div {...cardAnim} className={card}>
          <h2 className="text-xl font-bold text-benji-forest dark:text-benji-mist mb-4">Spending Breakdown</h2>
          <D3DonutChart data={m.categoryData} width={400} height={400} />
        </motion.div>
      ) : null;

    case 'category-breakdown':
      return (
        <BarListWidget
          title="Category Details"
          items={m.categoryData.map(c => ({ label: `${c.name} (${c.percentage}%)`, amount: c.value }))}
        />
      );

    case 'top-merchants':
      return (
        <ListWidget
          title="Top Merchants"
          items={m.topMerchants.map((mer, i) => ({ label: `${i + 1}. ${mer.name}`, value: `$${mer.value.toFixed(2)}` }))}
          emptyMsg="No merchant data"
        />
      );

    case 'avg-daily-spend':
      return <SimpleKpi title="Avg Daily Spend" value={`$${m.avgDailySpend.toFixed(2)}`} sub="Average per day with spending" />;

    case 'spend-by-weekday':
      return (
        <BarListWidget
          title="Spend by Weekday"
          items={m.spendByWeekday.map(d => ({ label: d.day, amount: d.amount }))}
        />
      );

    case 'expense-frequency':
      return <SimpleKpi title="Expense Frequency" value={`${m.expenseFrequency} / day`} sub="Avg transactions per spending day" />;

    case 'top-categories':
      return (
        <ListWidget
          title="Top 3 Categories"
          items={m.topCategories.map(c => ({ label: c.name, value: `$${c.value.toFixed(2)} (${c.percentage}%)` }))}
        />
      );

    case 'small-purchases':
      return <SimpleKpi title="Small Purchases (<$10)" value={`$${m.smallPurchasesTotal.toFixed(2)}`} sub={`${m.smallPurchasesCount} transactions`} />;

    // Income
    case 'income-by-category':
      return (
        <ListWidget
          title="Income by Category"
          items={m.incomeByCategory.map(c => ({ label: c.name, value: `$${c.value.toFixed(2)}` }))}
          emptyMsg="No income data"
        />
      );

    case 'income-count':
      return <SimpleKpi title="Income Deposits" value={m.incomeCount} />;

    case 'savings-rate':
      return <SimpleKpi title="Savings Rate" value={`${m.savingsRate}%`} sub={parseFloat(m.savingsRate) >= 20 ? 'Great job!' : 'Try to save more'} />;

    // Trends
    case 'monthly-trends':
      return m.monthlyData.length > 0 ? (
        <TableWidget
          title="Monthly Trends"
          headers={['Month', 'Income', 'Expenses', 'Net']}
          rows={m.monthlyData.map(mo => [
            mo.month,
            <span className="text-benji-moss dark:text-benji-jade">+${mo.income.toFixed(2)}</span>,
            <span className="text-benji-brick dark:text-benji-coral">-${mo.expense.toFixed(2)}</span>,
            <span className={mo.net >= 0 ? 'text-benji-moss dark:text-benji-jade font-bold' : 'text-benji-brick dark:text-benji-coral font-bold'}>
              {mo.net >= 0 ? '+' : ''}${mo.net.toFixed(2)}
            </span>
          ])}
        />
      ) : null;

    case 'daily-spending-trend':
      return m.dailySpendingTrend.length > 0 ? (
        <BarListWidget
          title="Daily Spending (Last 30 days)"
          items={m.dailySpendingTrend.slice(-15).map(d => ({ label: d.day, amount: d.amount }))}
        />
      ) : null;

    case 'monthly-net':
      return (
        <ListWidget
          title="Monthly Net Savings"
          items={m.monthlyNet.map(mo => ({
            label: mo.month,
            value: <span className={mo.net >= 0 ? 'text-benji-moss dark:text-benji-jade' : 'text-benji-brick dark:text-benji-coral'}>{mo.net >= 0 ? '+' : ''}${mo.net.toFixed(2)}</span>
          }))}
        />
      );

    // Transactions
    case 'recent-transactions':
      return (
        <motion.div {...cardAnim} className={card}>
          <h2 className="text-xl font-bold text-benji-forest dark:text-benji-mist mb-4">Recent Transactions ({m.recentTransactions.length})</h2>
          {m.recentTransactions.length === 0 ? (
            <p className="text-benji-ink/70 dark:text-benji-mist-dim/70">No transactions</p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {m.recentTransactions.map(t => (
                <div key={t._id} className="flex justify-between items-center p-3 bg-benji-cream/50 dark:bg-benji-vault-up rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-benji-sage/20 dark:bg-benji-gold/20 text-benji-sage-dark dark:text-benji-gold">{t.category}</span>
                      {t.accountType && (
                        <span className={`px-2 py-0.5 text-xs rounded-full ${t.accountType === 'checking' ? 'bg-benji-sage/15 dark:bg-benji-jade/15 text-benji-moss dark:text-benji-jade' : 'bg-benji-gold/15 dark:bg-benji-gold/10 text-benji-gold dark:text-benji-gold-light'}`}>
                          {t.accountType}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-benji-forest dark:text-benji-mist">{t.description || t.merchantName || 'No description'}</p>
                    <p className="text-xs text-benji-ink/70 dark:text-benji-mist-dim/70">{new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <p className={`text-sm font-bold ${t.type === 'income' ? 'text-benji-moss dark:text-benji-jade' : 'text-benji-brick dark:text-benji-coral'}`}>
                    {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      );

    case 'recurring-vs-onetime':
      return (
        <SimpleKpi
          title="Recurring vs One-time"
          value={`${m.recurringCount} / ${m.oneTimeCount}`}
          sub={`Recurring $${m.recurringTotal.toFixed(2)} | One-time $${m.oneTimeTotal.toFixed(2)}`}
        />
      );

    case 'import-source':
      return (
        <ListWidget
          title="Import Source Mix"
          items={m.importSourceMix.map(s => ({ label: s.source, value: `${s.count} txns` }))}
        />
      );

    case 'top-tags':
      return (
        <ListWidget
          title="Top Tags"
          items={m.topTags.map(t => ({ label: t.tag, value: `${t.count} uses` }))}
          emptyMsg="No tags found"
        />
      );

    // Budgets
    case 'budget-overview': {
      if (!bs) return <SimpleKpi title="Budget Overview" value="--" sub="No budget data" />;
      const overall = bs.data.find(b => b.category === '__overall__');
      const catBudgets = bs.data.filter(b => b.category !== '__overall__');
      const hasCatBudgets = catBudgets.length > 0;
      return (
        <motion.div {...cardAnim} className={card}>
          <h2 className="text-xl font-bold text-benji-forest dark:text-benji-mist mb-3">Budget Overview</h2>
          {overall && (
            <div className="mb-4 p-3 bg-benji-cream/50 dark:bg-benji-vault-up rounded-lg">
              <p className="text-xs text-benji-ink/70 dark:text-benji-mist-dim/70 mb-1">Overall Monthly Budget</p>
              <div className="flex justify-between items-end mb-2">
                <p className="text-lg font-bold text-benji-forest dark:text-benji-mist">${overall.actual.toFixed(2)} <span className="text-sm font-normal text-benji-ink/60 dark:text-benji-mist-dim/60">/ ${overall.limit.toFixed(2)}</span></p>
                <span className={`text-xs font-semibold ${overall.overBudget ? 'text-benji-brick dark:text-benji-coral' : 'text-benji-moss dark:text-benji-jade'}`}>
                  {overall.overBudget ? 'Over Budget' : 'On Track'}
                </span>
              </div>
              <div className="w-full bg-benji-sage/20 dark:bg-benji-vault-up rounded-full h-2">
                <div className={`h-2 rounded-full ${overall.overBudget ? 'bg-benji-brick dark:bg-benji-coral' : 'bg-benji-sage-dark dark:bg-benji-jade-dim'}`} style={{ width: `${Math.min(overall.percentUsed, 100)}%` }} />
              </div>
            </div>
          )}
          {hasCatBudgets && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-benji-ink/70 dark:text-benji-mist-dim/70">Categories Planned</p>
                  <p className="text-xl font-bold text-benji-forest dark:text-benji-mist">${bs.totalPlanned.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-benji-ink/70 dark:text-benji-mist-dim/70">Categories Spent</p>
                  <p className={`text-xl font-bold ${bs.totalActual > bs.totalPlanned ? 'text-benji-brick dark:text-benji-coral' : 'text-benji-moss dark:text-benji-jade'}`}>
                    ${bs.totalActual.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="w-full bg-benji-sage/20 dark:bg-benji-vault-up rounded-full h-3 mt-3">
                <div
                  className={`h-3 rounded-full ${bs.totalActual > bs.totalPlanned ? 'bg-benji-brick dark:bg-benji-coral' : 'bg-benji-sage-dark dark:bg-benji-jade-dim'}`}
                  style={{ width: `${Math.min((bs.totalActual / (bs.totalPlanned || 1)) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-benji-ink/70 dark:text-benji-mist-dim/70 mt-1">
                {bs.totalRemaining >= 0 ? `$${bs.totalRemaining.toFixed(2)} remaining` : `$${Math.abs(bs.totalRemaining).toFixed(2)} over budget`}
              </p>
            </>
          )}
          {!overall && !hasCatBudgets && (
            <p className="text-benji-ink/70 dark:text-benji-mist-dim/70 text-sm">No budgets set this month</p>
          )}
        </motion.div>
      );
    }

    case 'budget-overspent':
      if (!bs) return null;
      const overspent = bs.data.filter(b => b.overBudget && b.category !== '__overall__');
      return (
        <ListWidget
          title="Over-budget Categories"
          items={overspent.map(b => ({
            label: b.category,
            value: <span className="text-benji-brick dark:text-benji-coral font-semibold">${b.actual.toFixed(2)} / ${b.limit.toFixed(2)}</span>
          }))}
          emptyMsg="All categories within budget!"
        />
      );

    case 'budget-near-limit':
      if (!bs) return null;
      const nearLimit = bs.data.filter(b => !b.overBudget && b.percentUsed >= b.alertThreshold && b.category !== '__overall__');
      return (
        <ListWidget
          title="Near Budget Limit"
          items={nearLimit.map(b => ({
            label: `${b.category} (${b.percentUsed}%)`,
            value: `$${b.remaining.toFixed(2)} left`
          }))}
          emptyMsg="No categories near their limit"
        />
      );

    // Accounts
    case 'account-balances':
      const balEntries = Object.entries(m.accountBalances);
      return (
        <ListWidget
          title="Account Balances"
          items={balEntries.map(([acct, info]) => ({
            label: acct.charAt(0).toUpperCase() + acct.slice(1),
            value: `$${info.balance.toFixed(2)}`
          }))}
          emptyMsg="No balance data from CSV imports"
        />
      );

    case 'account-activity':
      const actEntries = Object.entries(m.accountActivity);
      return (
        <ListWidget
          title="Account Activity"
          items={actEntries.map(([acct, count]) => ({
            label: acct.charAt(0).toUpperCase() + acct.slice(1),
            value: `${count} transactions`
          }))}
          emptyMsg="No account data"
        />
      );

    // ===== Cash Flow =====
    case 'cash-flow-ratio':
      return (
        <SimpleKpi
          title="Cash Flow Ratio"
          value={`${m.cashFlowRatio}x`}
          sub={m.cashFlowRatio >= 1 ? 'Earning more than spending' : 'Spending exceeds income'}
        />
      );

    case 'monthly-cash-flow':
      return (
        <ListWidget
          title="Monthly Cash Flow"
          items={m.monthlyCashFlow.map(mo => ({
            label: mo.month,
            value: <span className={mo.net >= 0 ? 'text-benji-moss dark:text-benji-jade' : 'text-benji-brick dark:text-benji-coral'}>{mo.net >= 0 ? '+' : ''}${mo.net.toFixed(2)}</span>
          }))}
          emptyMsg="No monthly data"
        />
      );

    case 'income-vs-expense-trend':
      return m.incomeVsExpenseTrend.length > 0 ? (
        <TableWidget
          title="Income vs Expense Trend"
          headers={['Month', 'Income', 'Expenses', 'Status']}
          rows={m.incomeVsExpenseTrend.map(mo => [
            mo.month,
            <span className="text-benji-moss dark:text-benji-jade">${mo.income.toFixed(2)}</span>,
            <span className="text-benji-brick dark:text-benji-coral">${mo.expense.toFixed(2)}</span>,
            mo.income >= mo.expense
              ? <span className="text-benji-moss dark:text-benji-jade font-semibold">Surplus</span>
              : <span className="text-benji-brick dark:text-benji-coral font-semibold">Deficit</span>
          ])}
        />
      ) : null;

    case 'biggest-spending-month':
      return (
        <SimpleKpi
          title="Biggest Spending Month"
          value={m.biggestSpendingMonth ? `$${m.biggestSpendingMonth.expense.toFixed(2)}` : '--'}
          sub={m.biggestSpendingMonth?.month || ''}
        />
      );

    case 'biggest-income-month':
      return (
        <SimpleKpi
          title="Biggest Income Month"
          value={m.biggestIncomeMonth ? `$${m.biggestIncomeMonth.income.toFixed(2)}` : '--'}
          sub={m.biggestIncomeMonth?.month || ''}
        />
      );

    case 'expense-growth-rate':
      return (
        <SimpleKpi
          title="Expense Growth Rate"
          value={m.expenseGrowthRate != null ? `${m.expenseGrowthRate >= 0 ? '+' : ''}${m.expenseGrowthRate}%` : '--'}
          sub="vs previous month"
        />
      );

    // ===== Bills & Essentials =====
    case 'essentials-vs-wants':
      return (
        <motion.div {...cardAnim} className={card}>
          <h2 className="text-xl font-bold text-benji-forest dark:text-benji-mist mb-4">Essentials vs Wants</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-benji-ink dark:text-benji-mist-dim">Essentials (Food, Bills, Healthcare, Education)</span>
                <span className="font-semibold text-benji-forest dark:text-benji-mist">${m.essentialsTotal.toFixed(2)}</span>
              </div>
              <div className="w-full bg-benji-sage/20 dark:bg-benji-vault-up rounded-full h-3">
                <div className="bg-benji-sage-dark dark:bg-benji-jade-dim h-3 rounded-full" style={{ width: `${(m.essentialsTotal + m.wantsTotal) > 0 ? (m.essentialsTotal / (m.essentialsTotal + m.wantsTotal)) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-benji-ink dark:text-benji-mist-dim">Wants (Shopping, Entertainment, Travel, Gifts)</span>
                <span className="font-semibold text-benji-forest dark:text-benji-mist">${m.wantsTotal.toFixed(2)}</span>
              </div>
              <div className="w-full bg-benji-sage/20 dark:bg-benji-vault-up rounded-full h-3">
                <div className="bg-benji-gold dark:bg-benji-gold/70 h-3 rounded-full" style={{ width: `${(m.essentialsTotal + m.wantsTotal) > 0 ? (m.wantsTotal / (m.essentialsTotal + m.wantsTotal)) * 100 : 0}%` }} />
              </div>
            </div>
            <p className="text-xs text-benji-ink/70 dark:text-benji-mist-dim/70">
              {(m.essentialsTotal + m.wantsTotal) > 0
                ? `${Math.round((m.essentialsTotal / (m.essentialsTotal + m.wantsTotal)) * 100)}% essentials / ${Math.round((m.wantsTotal / (m.essentialsTotal + m.wantsTotal)) * 100)}% wants`
                : 'No expense data'}
            </p>
          </div>
        </motion.div>
      );

    case 'bills-total':
      return <SimpleKpi title="Bills Total" value={`$${m.billsTotal.toFixed(2)}`} sub="Bills & utilities" />;

    case 'subscriptions-total':
      return <SimpleKpi title="Subscriptions Total" value={`$${m.subscriptionsTotal.toFixed(2)}`} sub="Recurring subscriptions" />;

    case 'fixed-expense-ratio':
      return <SimpleKpi title="Fixed Expense Ratio" value={`${m.fixedExpenseRatio}%`} sub="Bills + subscriptions as % of expenses" />;

    // ===== Spending Habits =====
    case 'weekend-vs-weekday':
      return (
        <SimpleKpi
          title="Weekend vs Weekday"
          value={`$${m.weekendAvg} / $${m.weekdayAvg}`}
          sub="Weekend avg / Weekday avg per day"
        />
      );

    case 'spending-velocity':
      return (
        <SimpleKpi
          title="Spending Velocity"
          value={`$${m.spendingVelocity.toFixed(2)}`}
          sub="Projected month-end spend at current pace"
        />
      );

    case 'median-transaction':
      return <SimpleKpi title="Median Transaction" value={`$${m.medianTransaction.toFixed(2)}`} sub="Middle-value expense (typical spend)" />;

    case 'transactions-over-100':
      return (
        <SimpleKpi
          title="Large Purchases (>$100)"
          value={`${m.largeTransactionsCount}`}
          sub={`$${m.largeTransactionsTotal.toFixed(2)} total`}
        />
      );

    case 'category-count':
      return <SimpleKpi title="Category Diversity" value={m.categoryCount} sub="Distinct expense categories" />;

    case 'merchant-count':
      return <SimpleKpi title="Unique Merchants" value={m.merchantCount} sub="Different payees / merchants" />;

    // ===== Savings & Goals =====
    case 'monthly-savings-trend':
      return (
        <ListWidget
          title="Monthly Savings Trend"
          items={m.monthlySavingsTrend.map(mo => ({
            label: mo.month,
            value: <span className={mo.saved >= 0 ? 'text-benji-moss dark:text-benji-jade' : 'text-benji-brick dark:text-benji-coral'}>{mo.saved >= 0 ? '+' : ''}${mo.saved.toFixed(2)}</span>
          }))}
          emptyMsg="No monthly data"
        />
      );

    case 'avg-monthly-savings':
      return (
        <SimpleKpi
          title="Avg Monthly Savings"
          value={`$${m.avgMonthlySavings.toFixed(2)}`}
          sub={m.avgMonthlySavings >= 0 ? 'Average saved per month' : 'Average deficit per month'}
        />
      );

    case 'best-savings-month':
      return (
        <SimpleKpi
          title="Best Savings Month"
          value={m.bestSavingsMonth ? `$${(m.bestSavingsMonth.income - m.bestSavingsMonth.expense).toFixed(2)}` : '--'}
          sub={m.bestSavingsMonth?.month || ''}
        />
      );

    case 'worst-savings-month':
      return (
        <SimpleKpi
          title="Worst Savings Month"
          value={m.worstSavingsMonth ? `$${(m.worstSavingsMonth.income - m.worstSavingsMonth.expense).toFixed(2)}` : '--'}
          sub={m.worstSavingsMonth?.month || ''}
        />
      );

    case 'days-of-runway':
      return (
        <SimpleKpi
          title="Days of Runway"
          value={m.daysOfRunway != null ? `${m.daysOfRunway} days` : '--'}
          sub="Based on balance and avg daily spend"
        />
      );

    // ===== Account Insights =====
    case 'checking-vs-savings-spend':
      return (
        <motion.div {...cardAnim} className={card}>
          <h2 className="text-xl font-bold text-benji-forest dark:text-benji-mist mb-4">Checking vs Savings Spend</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-benji-ink dark:text-benji-mist-dim">Checking</span>
                <span className="font-semibold text-benji-forest dark:text-benji-mist">${m.checkingExpenses.toFixed(2)}</span>
              </div>
              <div className="w-full bg-benji-sage/20 dark:bg-benji-vault-up rounded-full h-2">
                <div className="bg-benji-sage-dark dark:bg-benji-jade-dim h-2 rounded-full" style={{ width: `${(m.checkingExpenses + m.savingsExpenses) > 0 ? (m.checkingExpenses / (m.checkingExpenses + m.savingsExpenses)) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-benji-ink dark:text-benji-mist-dim">Savings</span>
                <span className="font-semibold text-benji-forest dark:text-benji-mist">${m.savingsExpenses.toFixed(2)}</span>
              </div>
              <div className="w-full bg-benji-sage/20 dark:bg-benji-vault-up rounded-full h-2">
                <div className="bg-benji-gold dark:bg-benji-gold/70 h-2 rounded-full" style={{ width: `${(m.checkingExpenses + m.savingsExpenses) > 0 ? (m.savingsExpenses / (m.checkingExpenses + m.savingsExpenses)) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </motion.div>
      );

    case 'checking-income':
      return <SimpleKpi title="Checking Income" value={`$${m.checkingIncome.toFixed(2)}`} sub="Total income into checking" />;

    case 'savings-income':
      return <SimpleKpi title="Savings Income" value={`$${m.savingsIncome.toFixed(2)}`} sub="Total income into savings" />;

    case 'account-transaction-split': {
      const splitEntries = Object.entries(m.accountTxnSplit);
      const splitTotal = splitEntries.reduce((s, [, c]) => s + c, 0);
      return (
        <ListWidget
          title="Account Transaction Split"
          items={splitEntries.map(([acct, count]) => ({
            label: acct.charAt(0).toUpperCase() + acct.slice(1),
            value: `${count} (${splitTotal > 0 ? Math.round((count / splitTotal) * 100) : 0}%)`
          }))}
          emptyMsg="No account data"
        />
      );
    }

    // ===== Time Analysis =====
    case 'spending-heatmap':
      return (
        <BarListWidget
          title="Weekly Spending Totals"
          items={m.weeklySpending.slice(-12).map(w => ({ label: w.week, amount: w.amount }))}
        />
      );

    case 'avg-weekly-spend':
      return <SimpleKpi title="Avg Weekly Spend" value={`$${m.avgWeeklySpend.toFixed(2)}`} sub="Average per calendar week" />;

    case 'transactions-per-month':
      return (
        <ListWidget
          title="Transactions per Month"
          items={m.transactionsPerMonth.map(mo => ({
            label: mo.month,
            value: `${mo.count} txns`
          }))}
          emptyMsg="No monthly data"
        />
      );

    case 'days-since-last-income':
      return (
        <SimpleKpi
          title="Days Since Last Income"
          value={m.daysSinceLastIncome != null ? `${m.daysSinceLastIncome}` : '--'}
          sub={m.daysSinceLastIncome != null ? (m.daysSinceLastIncome > 30 ? 'Over 30 days ago' : 'days ago') : 'No income recorded'}
        />
      );

    case 'days-since-last-expense':
      return (
        <SimpleKpi
          title="Days Since Last Expense"
          value={m.daysSinceLastExpense != null ? `${m.daysSinceLastExpense}` : '--'}
          sub={m.daysSinceLastExpense != null ? 'days ago' : 'No expenses recorded'}
        />
      );

    default:
      return null;
  }
}
