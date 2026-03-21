import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#22D3EE'];

const CATEGORIES = ['Food', 'Travel', 'Bills', 'Entertainment', 'Shopping', 
                    'Healthcare', 'Education', 'Transfer', 'ATM', 'Subscription', 
                    'Salary', 'Freelance', 'Gifts', 'Other'];

export default function TransactionsPage() {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0
  });
  const [categoryData, setCategoryData] = useState([]);
  const [form, setForm] = useState({
    type: 'expense',
    category: 'Food',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data } = await API.get('/transactions');
      setTransactions(data.data);
      calculateStats(data.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const calculateStats = (transactions) => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    setStats({
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses
    });

    // Category data for pie chart
    const categoryMap = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      });

    const chartData = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100
    }));

    setCategoryData(chartData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/transactions', {
        ...form,
        amount: parseFloat(form.amount)
      });
      setForm({
        type: 'expense',
        category: 'Food',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchTransactions();
    } catch (error) {
      alert('Error adding transaction: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Add Transaction */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transition-colors">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Add Transaction</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="income"
                        checked={form.type === 'income'}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                        className="mr-2"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Income</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="expense"
                        checked={form.type === 'expense'}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                        className="mr-2"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Expense</span>
                    </label>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Add Transaction
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-400 to-green-600 p-6 rounded-xl shadow-lg text-white">
                  <h3 className="text-sm font-semibold opacity-90 mb-1">Total Income</h3>
                  <p className="text-3xl font-bold">${stats.totalIncome.toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-br from-red-400 to-red-600 p-6 rounded-xl shadow-lg text-white">
                  <h3 className="text-sm font-semibold opacity-90 mb-1">Total Expenses</h3>
                  <p className="text-3xl font-bold">${stats.totalExpenses.toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-6 rounded-xl shadow-lg text-white">
                  <h3 className="text-sm font-semibold opacity-90 mb-1">Balance</h3>
                  <p className="text-3xl font-bold">${stats.balance.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Pie Chart */}
            {categoryData.length > 0 && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transition-colors">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Spending by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(31, 41, 55, 0.9)', 
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{
                        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transition-colors">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Recent Transactions</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No transactions yet.</p>
                ) : (
                  transactions.slice(0, 5).map((transaction) => (
                    <div
                      key={transaction._id}
                      className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">{transaction.category}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.description || 'No description'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                      <p
                        className={`text-lg font-bold ${
                          transaction.type === 'income'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}