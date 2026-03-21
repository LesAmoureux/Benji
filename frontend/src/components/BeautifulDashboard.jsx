import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import API from '../services/api';
import D3DonutChart from './D3DonutChart';
import DashboardSettings from './DashboardSettings';

export default function BeautifulDashboard() {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    recentTransactions: []
  });
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [topMerchants, setTopMerchants] = useState([]);
  const [preferences, setPreferences] = useState({
    widgets: [
      { id: 'stats-cards', enabled: true },
      { id: 'spending-chart', enabled: true },
      { id: 'recent-transactions', enabled: true },
      { id: 'monthly-trends', enabled: true },
      { id: 'top-merchants', enabled: true },
      { id: 'category-breakdown', enabled: true }
    ]
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    fetchData();
    fetchPreferences();
  }, []);

  useEffect(() => {
    filterDataByTimeRange();
  }, [allTransactions, timeRange, customStartDate, customEndDate]);

  useEffect(() => {
    calculateStats();
  }, [filteredTransactions, sortBy]);

  const fetchData = async () => {
    try {
      const { data } = await API.get('/transactions');
      setAllTransactions(data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const { data } = await API.get('/preferences');
      if (data.data && data.data.widgets && data.data.widgets.length > 0) {
        setPreferences(data.data);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const filterDataByTimeRange = () => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    
    let filtered = [...allTransactions];
    let startDate;
    let endDate = now;

    if (timeRange === 'custom') {
      if (customStartDate && customEndDate) {
        startDate = new Date(customStartDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(customEndDate);
        endDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter(t => {
          const transDate = new Date(t.date);
          return transDate >= startDate && transDate <= endDate;
        });
      }
    } else {
      switch (timeRange) {
        case '7days':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
          filtered = filtered.filter(t => new Date(t.date) >= startDate);
          break;
          
        case '30days':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 30);
          filtered = filtered.filter(t => new Date(t.date) >= startDate);
          break;
          
        case '3months':
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 3);
          filtered = filtered.filter(t => new Date(t.date) >= startDate);
          break;
          
        case '6months':
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 6);
          filtered = filtered.filter(t => new Date(t.date) >= startDate);
          break;
          
        case 'year':
          startDate = new Date(now);
          startDate.setFullYear(startDate.getFullYear() - 1);
          filtered = filtered.filter(t => new Date(t.date) >= startDate);
          break;
          
        case 'all':
        default:
          break;
      }
    }
    
    setFilteredTransactions(filtered);
  };

  const calculateStats = () => {
    let transactions = [...filteredTransactions];

    transactions.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date) - new Date(a.date);
        case 'amount-high':
          return b.amount - a.amount;
        case 'amount-low':
          return a.amount - b.amount;
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryMap = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

    const chartData = Object.entries(categoryMap)
      .map(([name, value]) => ({
        name,
        value: Math.round(value * 100) / 100,
        percentage: expenses > 0 ? ((value / expenses) * 100).toFixed(1) : '0'
      }))
      .sort((a, b) => b.value - a.value);

    const merchantMap = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const merchant = t.merchantName || t.description || 'Unknown';
      merchantMap[merchant] = (merchantMap[merchant] || 0) + t.amount;
    });

    const topMerchantsData = Object.entries(merchantMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const monthlyMap = {};
    transactions.forEach(t => {
      const month = new Date(t.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      if (!monthlyMap[month]) {
        monthlyMap[month] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        monthlyMap[month].income += t.amount;
      } else {
        monthlyMap[month].expense += t.amount;
      }
    });

    const monthlyTrends = Object.entries(monthlyMap)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense
      }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA - dateB;
      })
      .slice(-6);

    setStats({
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
      recentTransactions: transactions.slice(0, 20)
    });
    setCategoryData(chartData);
    setTopMerchants(topMerchantsData);
    setMonthlyData(monthlyTrends);
  };

  const savePreferences = async (newPreferences) => {
    try {
      await API.put('/preferences', newPreferences);
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences');
    }
  };

  const isWidgetEnabled = (widgetId) => {
    const widget = preferences.widgets.find(w => w.id === widgetId);
    return widget ? widget.enabled : true;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900 dark:text-white">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header with Filters */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                Your Financial Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Showing data for: <span className="font-semibold">{
                  timeRange === '7days' ? 'Last 7 Days' :
                  timeRange === '30days' ? 'Last 30 Days' :
                  timeRange === '3months' ? 'Last 3 Months' :
                  timeRange === '6months' ? 'Last 6 Months' :
                  timeRange === 'year' ? 'Last Year' :
                  timeRange === 'custom' ? `${customStartDate} to ${customEndDate}` :
                  'All Time'
                }</span>
                {' '}({filteredTransactions.length} transactions)
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex gap-3">
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-2">
                <label className="text-xs text-gray-600 dark:text-gray-300 block mb-1">Time Range</label>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border-none rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="3months">Last 3 Months</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="year">Last Year</option>
                  <option value="custom">Custom Range</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              {timeRange === 'custom' && (
                <>
                  <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-2">
                    <label className="text-xs text-gray-600 dark:text-gray-300 block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-3 py-2 border-none rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-2">
                    <label className="text-xs text-gray-600 dark:text-gray-300 block mb-1">End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-3 py-2 border-none rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                    />
                  </div>
                </>
              )}

              <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-2">
                <label className="text-xs text-gray-600 dark:text-gray-300 block mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border-none rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                >
                  <option value="date">Date (Newest)</option>
                  <option value="amount-high">Amount (High to Low)</option>
                  <option value="amount-low">Amount (Low to High)</option>
                  <option value="category">Category</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {isWidgetEnabled('stats-cards') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-gradient-to-br from-green-400 to-green-600 p-6 rounded-2xl shadow-lg text-white">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-semibold opacity-90">Total Income</h3>
                <TrendingUp size={24} className="opacity-80" />
              </div>
              <p className="text-4xl font-bold mb-1">${stats.totalIncome.toFixed(2)}</p>
              <p className="text-xs opacity-80">{filteredTransactions.filter(t => t.type === 'income').length} transactions</p>
            </div>

            <div className="bg-gradient-to-br from-red-400 to-red-600 p-6 rounded-2xl shadow-lg text-white">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-semibold opacity-90">Total Expenses</h3>
                <TrendingDown size={24} className="opacity-80" />
              </div>
              <p className="text-4xl font-bold mb-1">${stats.totalExpenses.toFixed(2)}</p>
              <p className="text-xs opacity-80">{filteredTransactions.filter(t => t.type === 'expense').length} transactions</p>
            </div>

            <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-semibold opacity-90">Net Balance</h3>
                <Calendar size={24} className="opacity-80" />
              </div>
              <p className="text-4xl font-bold mb-1">${stats.balance.toFixed(2)}</p>
              <p className="text-xs opacity-80">
                {stats.balance >= 0 ? 'Surplus' : 'Deficit'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* D3 Donut Chart */}
          {isWidgetEnabled('spending-chart') && categoryData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Spending Breakdown
              </h2>
              <D3DonutChart data={categoryData} width={450} height={450} />
            </motion.div>
          )}

          {/* Category Breakdown List */}
          {isWidgetEnabled('category-breakdown') && categoryData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Category Details
              </h2>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {categoryData.map((category, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-800 dark:text-white">{category.name}</span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        ${category.value.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{category.percentage}% of total</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Monthly Trends */}
        {isWidgetEnabled('monthly-trends') && monthlyData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Monthly Trends
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-600">
                    <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-200">Month</th>
                    <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-200">Income</th>
                    <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-200">Expenses</th>
                    <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-200">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((month, idx) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4 font-semibold text-gray-800 dark:text-gray-200">{month.month}</td>
                      <td className="text-right py-3 px-4 text-green-600 dark:text-green-400">
                        +${month.income.toFixed(2)}
                      </td>
                      <td className="text-right py-3 px-4 text-red-600 dark:text-red-400">
                        -${month.expense.toFixed(2)}
                      </td>
                      <td className={`text-right py-3 px-4 font-bold ${
                        month.net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {month.net >= 0 ? '+' : ''}${month.net.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Bottom Row: Top Merchants and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Merchants */}
          {isWidgetEnabled('top-merchants') && topMerchants.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Top Merchants
              </h2>
              <div className="space-y-3">
                {topMerchants.map((merchant, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {idx + 1}
                      </div>
                      <span className="font-semibold text-gray-800 dark:text-white">{merchant.name}</span>
                    </div>
                    <span className="text-lg font-bold text-red-600 dark:text-red-400">
                      ${merchant.value.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recent Transactions */}
          {isWidgetEnabled('recent-transactions') && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Recent Transactions ({stats.recentTransactions.length})
              </h2>
              {stats.recentTransactions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No transactions in this time range.</p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {stats.recentTransactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            {transaction.category}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-800 dark:text-white">
                          {transaction.description || transaction.merchantName || 'No description'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(transaction.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <p
                        className={`text-lg font-bold ${
                          transaction.type === 'income'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}$
                        {transaction.amount.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Settings Button */}
        <DashboardSettings
          preferences={preferences}
          onSave={savePreferences}
        />
      </div>
    </div>
  );
}