import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import API from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    recentTransactions: []
  });
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await API.get('/transactions');
      
      const income = data.data
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = data.data
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const categoryMap = {};
      data.data.filter(t => t.type === 'expense').forEach(t => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      });

      const chartData = Object.entries(categoryMap).map(([name, value]) => ({
        name,
        value: Math.round(value * 100) / 100
      }));

      setStats({
        totalIncome: income,
        totalExpenses: expenses,
        balance: income - expenses,
        recentTransactions: data.data.slice(0, 5)
      });
      setCategoryData(chartData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-green-100 p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">
            ${stats.totalIncome.toFixed(2)}
          </p>
        </div>
        <div className="bg-red-100 p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">
            ${stats.totalExpenses.toFixed(2)}
          </p>
        </div>
        <div className="bg-blue-100 p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm">Balance</h3>
          <p className="text-2xl font-bold text-blue-600">
            ${stats.balance.toFixed(2)}
          </p>
        </div>
      </div>

      {categoryData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        {stats.recentTransactions.length === 0 ? (
          <p className="text-gray-500">No transactions yet. Add your first transaction!</p>
        ) : (
          <div className="space-y-2">
            {stats.recentTransactions.map((transaction) => (
              <div key={transaction._id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{transaction.category}</p>
                  <p className="text-sm text-gray-500">{transaction.description || 'No description'}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
                <p className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}