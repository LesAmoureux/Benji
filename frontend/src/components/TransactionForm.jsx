import { useState } from 'react';
import API from '../services/api';

const CATEGORIES = ['Salary', 'Freelance', 'Gifts', 'Food', 'Travel', 'Bills', 
                    'Entertainment', 'Shopping', 'Healthcare', 'Other'];

export default function TransactionForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    category: 'Food',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    accountType: 'checking'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await API.post('/transactions', formData);
      setSuccess('Transaction added successfully!');
      setFormData({
        type: 'expense',
        category: 'Food',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        accountType: 'checking'
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add transaction');
    }
  };

  const inputClasses = "w-full px-3 py-2 border border-benji-sage/30 dark:border-benji-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-benji-sage dark:focus:ring-benji-gold bg-benji-cream/50 dark:bg-benji-vault/50 text-benji-forest dark:text-benji-mist transition-colors";

  return (
    <div className="bg-benji-paper dark:bg-benji-vault-card p-4 rounded-xl shadow-warm dark:shadow-vault border border-benji-sage/10 dark:border-benji-gold/10 transition-colors">
      <h2 className="text-2xl font-bold text-benji-forest dark:text-benji-mist mb-4">Add Transaction</h2>
      
      {error && (
        <div className="bg-benji-brick/10 dark:bg-benji-coral/10 border border-benji-brick/30 dark:border-benji-coral/30 text-benji-brick dark:text-benji-coral px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-benji-sage/10 dark:bg-benji-jade/10 border border-benji-sage/30 dark:border-benji-jade/30 text-benji-moss dark:text-benji-jade px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-benji-forest dark:text-benji-mist text-sm font-bold mb-2">Type</label>
          <div className="flex gap-4">
            <label className="flex items-center text-benji-forest dark:text-benji-mist-dim">
              <input type="radio" value="income" checked={formData.type === 'income'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="mr-2 accent-benji-sage-dark dark:accent-benji-gold" />
              Income
            </label>
            <label className="flex items-center text-benji-forest dark:text-benji-mist-dim">
              <input type="radio" value="expense" checked={formData.type === 'expense'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="mr-2 accent-benji-sage-dark dark:accent-benji-gold" />
              Expense
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-benji-forest dark:text-benji-mist text-sm font-bold mb-2">Account</label>
          <div className="flex gap-4">
            <label className="flex items-center text-benji-forest dark:text-benji-mist-dim">
              <input type="radio" value="checking" checked={formData.accountType === 'checking'}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value })} className="mr-2 accent-benji-sage-dark dark:accent-benji-gold" />
              Checking
            </label>
            <label className="flex items-center text-benji-forest dark:text-benji-mist-dim">
              <input type="radio" value="savings" checked={formData.accountType === 'savings'}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value })} className="mr-2 accent-benji-sage-dark dark:accent-benji-gold" />
              Savings
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-benji-forest dark:text-benji-mist text-sm font-bold mb-2">Category</label>
          <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={inputClasses}>
            {CATEGORIES.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-benji-forest dark:text-benji-mist text-sm font-bold mb-2">Amount</label>
          <input type="number" step="0.01" value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className={inputClasses} required />
        </div>

        <div className="mb-4">
          <label className="block text-benji-forest dark:text-benji-mist text-sm font-bold mb-2">Description</label>
          <input type="text" value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={inputClasses} />
        </div>

        <div className="mb-4">
          <label className="block text-benji-forest dark:text-benji-mist text-sm font-bold mb-2">Date</label>
          <input type="date" value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })} className={inputClasses} required />
        </div>

        <button type="submit"
          className="w-full bg-benji-sage-dark hover:bg-benji-sage dark:bg-benji-gold dark:hover:bg-benji-gold-light text-white dark:text-benji-vault py-2 px-4 rounded-lg transition font-semibold">
          Add Transaction
        </button>
      </form>
    </div>
  );
}
