import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#7D9B6B', '#C9A227', '#E07A5F', '#5EEAD4', '#A3C191', '#D4AF37', '#B54A4A', '#3B9B85', '#3D5A45', '#B8C4B8'];

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
    date: new Date().toISOString().split('T')[0],
    accountType: 'checking'
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
        date: new Date().toISOString().split('T')[0],
        accountType: 'checking'
      });
      fetchTransactions();
    } catch (error) {
      alert('Error adding transaction: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-benji-cream dark:bg-benji-vault transition-colors">
      <div className="w-full px-3 sm:px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Left Column - Add Transaction */}
          <div className="lg:col-span-1">
            <div className="bg-benji-paper dark:bg-benji-vault-card p-3 sm:p-4 rounded-xl shadow-warm dark:shadow-vault border border-benji-sage/10 dark:border-benji-gold/10 transition-colors">
              <h2 className="text-xl sm:text-2xl font-bold text-benji-forest dark:text-benji-mist mb-3 sm:mb-4">Add Transaction</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-benji-forest dark:text-benji-mist mb-2">Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" value="income" checked={form.type === 'income'}
                        onChange={(e) => setForm({ ...form, type: e.target.value })} className="mr-2 accent-benji-sage-dark dark:accent-benji-gold" />
                      <span className="text-benji-forest dark:text-benji-mist-dim">Income</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" value="expense" checked={form.type === 'expense'}
                        onChange={(e) => setForm({ ...form, type: e.target.value })} className="mr-2 accent-benji-sage-dark dark:accent-benji-gold" />
                      <span className="text-benji-forest dark:text-benji-mist-dim">Expense</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-benji-forest dark:text-benji-mist mb-2">Account</label>
                  <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" value="checking" checked={form.accountType === 'checking'}
                        onChange={(e) => setForm({ ...form, accountType: e.target.value })} className="mr-2 accent-benji-sage-dark dark:accent-benji-gold" />
                      <span className="text-benji-forest dark:text-benji-mist-dim">Checking</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" value="savings" checked={form.accountType === 'savings'}
                        onChange={(e) => setForm({ ...form, accountType: e.target.value })} className="mr-2 accent-benji-sage-dark dark:accent-benji-gold" />
                      <span className="text-benji-forest dark:text-benji-mist-dim">Savings</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-benji-forest dark:text-benji-mist mb-2">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2 border border-benji-sage/30 dark:border-benji-gold/20 rounded-lg focus:ring-2 focus:ring-benji-sage dark:focus:ring-benji-gold bg-benji-cream/50 dark:bg-benji-vault/50 text-benji-forest dark:text-benji-mist transition-colors">
                    {CATEGORIES.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-benji-forest dark:text-benji-mist mb-2">Amount</label>
                  <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-benji-sage/30 dark:border-benji-gold/20 rounded-lg focus:ring-2 focus:ring-benji-sage dark:focus:ring-benji-gold bg-benji-cream/50 dark:bg-benji-vault/50 text-benji-forest dark:text-benji-mist transition-colors"
                    required />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-benji-forest dark:text-benji-mist mb-2">Description</label>
                  <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-2 border border-benji-sage/30 dark:border-benji-gold/20 rounded-lg focus:ring-2 focus:ring-benji-sage dark:focus:ring-benji-gold bg-benji-cream/50 dark:bg-benji-vault/50 text-benji-forest dark:text-benji-mist transition-colors" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-benji-forest dark:text-benji-mist mb-2">Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-2 border border-benji-sage/30 dark:border-benji-gold/20 rounded-lg focus:ring-2 focus:ring-benji-sage dark:focus:ring-benji-gold bg-benji-cream/50 dark:bg-benji-vault/50 text-benji-forest dark:text-benji-mist transition-colors"
                    required />
                </div>

                <button type="submit"
                  className="w-full bg-benji-sage-dark hover:bg-benji-sage dark:bg-benji-gold dark:hover:bg-benji-gold-light text-white dark:text-benji-vault font-semibold py-3 rounded-lg transition-colors">
                  Add Transaction
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Dashboard */}
          <div className="lg:col-span-2 space-y-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-benji-forest dark:text-benji-mist mb-3 sm:mb-4">Dashboard</h2>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="benji-money-lines bg-gradient-to-br from-benji-sage to-benji-sage-dark dark:from-benji-jade-dim dark:to-benji-jade-dim/70 p-3 sm:p-4 rounded-xl shadow-warm dark:shadow-vault text-white">
                  <h3 className="text-[10px] sm:text-sm font-semibold opacity-90 mb-1">Total Income</h3>
                  <p className="text-lg sm:text-2xl md:text-3xl font-bold">${stats.totalIncome.toFixed(2)}</p>
                </div>
                <div className="benji-money-lines bg-gradient-to-br from-benji-brick to-benji-brick/80 dark:from-benji-coral dark:to-benji-coral/70 p-3 sm:p-4 rounded-xl shadow-warm dark:shadow-vault text-white">
                  <h3 className="text-[10px] sm:text-sm font-semibold opacity-90 mb-1">Total Expenses</h3>
                  <p className="text-lg sm:text-2xl md:text-3xl font-bold">${stats.totalExpenses.toFixed(2)}</p>
                </div>
                <div className="benji-money-lines bg-gradient-to-br from-benji-forest to-benji-forest-light dark:from-benji-gold/90 dark:to-benji-gold/60 p-3 sm:p-4 rounded-xl shadow-warm dark:shadow-vault text-white dark:text-benji-vault">
                  <h3 className="text-[10px] sm:text-sm font-semibold opacity-90 mb-1">Balance</h3>
                  <p className="text-lg sm:text-2xl md:text-3xl font-bold">${stats.balance.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {categoryData.length > 0 && (
              <div className="bg-benji-paper dark:bg-benji-vault-card p-4 rounded-xl shadow-warm dark:shadow-vault border border-benji-sage/10 dark:border-benji-gold/10 transition-colors">
                <h3 className="text-xl font-bold text-benji-forest dark:text-benji-mist mb-3">Spending by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100} fill="#8884d8" dataKey="value">
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 42, 36, 0.95)', color: '#F4EFE6', border: 'none', borderRadius: '8px' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="bg-benji-paper dark:bg-benji-vault-card p-4 rounded-xl shadow-warm dark:shadow-vault border border-benji-sage/10 dark:border-benji-gold/10 transition-colors">
              <h3 className="text-xl font-bold text-benji-forest dark:text-benji-mist mb-3">Recent Transactions</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.length === 0 ? (
                  <p className="text-benji-ink/70 dark:text-benji-mist-dim/70">No transactions yet.</p>
                ) : (
                  transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction._id}
                      className="flex justify-between items-center p-4 bg-benji-cream/50 dark:bg-benji-vault-up rounded-lg transition-colors">
                      <div>
                        <p className="font-semibold text-benji-forest dark:text-benji-mist">{transaction.category}</p>
                        <p className="text-sm text-benji-ink/70 dark:text-benji-mist-dim/70">
                          {transaction.description || 'No description'}
                        </p>
                        <p className="text-xs text-benji-ink/50 dark:text-benji-mist-dim/50 mt-1">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className={`text-lg font-bold ${
                        transaction.type === 'income'
                          ? 'text-benji-moss dark:text-benji-jade'
                          : 'text-benji-brick dark:text-benji-coral'
                      }`}>
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
