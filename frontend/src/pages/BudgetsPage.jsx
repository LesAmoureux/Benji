import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import API from '../services/api';

const CATEGORIES = [
  'Food', 'Travel', 'Bills', 'Entertainment', 'Shopping',
  'Healthcare', 'Education', 'Transfer', 'ATM', 'Subscription',
  'Gifts', 'Other'
];

export default function BudgetsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [accountType, setAccountType] = useState('checking');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('category'); // 'category' or 'overall'
  const [editingBudget, setEditingBudget] = useState(null);
  const [form, setForm] = useState({ category: 'Food', limit: '', alertThreshold: 80 });

  useEffect(() => {
    fetchSummary();
  }, [month, year, accountType]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/budgets/summary?month=${month}&year=${year}&accountType=${accountType}`);
      setSummary(data);
    } catch (error) {
      console.error('Error fetching budget summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const handleNextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const monthLabel = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const openCreate = () => {
    setEditingBudget(null);
    setFormMode('category');
    setForm({ category: 'Food', limit: '', alertThreshold: 80 });
    setShowForm(true);
  };

  const openOverallBudget = () => {
    const existing = overallBudget;
    if (existing) {
      setEditingBudget(existing);
      setForm({ category: '__overall__', limit: existing.limit, alertThreshold: existing.alertThreshold });
    } else {
      setEditingBudget(null);
      setForm({ category: '__overall__', limit: '', alertThreshold: 80 });
    }
    setFormMode('overall');
    setShowForm(true);
  };

  const openEdit = (budget) => {
    setEditingBudget(budget);
    setFormMode(budget.category === '__overall__' ? 'overall' : 'category');
    setForm({ category: budget.category, limit: budget.limit, alertThreshold: budget.alertThreshold });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.limit || parseFloat(form.limit) <= 0) {
      alert('Please enter a valid budget limit');
      return;
    }

    try {
      if (editingBudget) {
        await API.put(`/budgets/${editingBudget._id}`, {
          limit: parseFloat(form.limit),
          alertThreshold: parseInt(form.alertThreshold)
        });
      } else {
        await API.post('/budgets', {
          category: form.category,
          limit: parseFloat(form.limit),
          alertThreshold: parseInt(form.alertThreshold),
          month,
          year
        });
      }
      setShowForm(false);
      fetchSummary();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save budget');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await API.delete(`/budgets/${id}`);
      fetchSummary();
    } catch (error) {
      alert('Failed to delete budget');
    }
  };

  const getBarColor = (budget) => {
    if (budget.overBudget) return 'bg-benji-brick dark:bg-benji-coral';
    if (budget.percentUsed >= budget.alertThreshold) return 'bg-benji-gold';
    return 'bg-benji-sage-dark dark:bg-benji-jade-dim';
  };

  const overallBudget = summary?.data?.find(b => b.category === '__overall__') || null;
  const categoryBudgets = summary?.data?.filter(b => b.category !== '__overall__') || [];

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-benji-vault dark:text-benji-mist">
        <div className="text-xl">Loading budgets...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-benji-cream dark:bg-benji-vault transition-colors">
      <div className="w-full px-4 py-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-benji-forest dark:text-benji-mist">Budget Planner</h1>
          <button
            onClick={openCreate}
            className="bg-benji-sage-dark hover:bg-benji-sage dark:bg-benji-gold dark:hover:bg-benji-gold-light text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            <Plus size={20} /> Add Budget
          </button>
        </div>

        {/* Month Picker + Account Scope */}
        <div className="bg-benji-paper dark:bg-benji-vault-card rounded-xl shadow-md p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-benji-sage/10 dark:hover:bg-benji-gold/10 rounded-lg transition">
              <ChevronLeft size={20} className="text-benji-ink dark:text-benji-mist-dim" />
            </button>
            <span className="text-lg font-semibold text-benji-forest dark:text-benji-mist min-w-[180px] text-center">{monthLabel}</span>
            <button onClick={handleNextMonth} className="p-2 hover:bg-benji-sage/10 dark:hover:bg-benji-gold/10 rounded-lg transition">
              <ChevronRight size={20} className="text-benji-ink dark:text-benji-mist-dim" />
            </button>
          </div>

          <div className="flex gap-2">
            {['checking', 'savings'].map(at => (
              <button
                key={at}
                onClick={() => setAccountType(at)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  accountType === at
                    ? 'bg-benji-sage-dark dark:bg-benji-gold text-white dark:text-benji-vault'
                    : 'bg-benji-cream dark:bg-benji-vault-up text-benji-forest dark:text-benji-mist-dim hover:bg-benji-sage/20 dark:hover:bg-benji-gold/10'
                }`}
              >
                {at.charAt(0).toUpperCase() + at.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Overall Monthly Budget */}
        <div className="bg-benji-paper dark:bg-benji-vault-card rounded-xl shadow-md p-4 mb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-benji-forest dark:text-benji-mist">Overall Monthly Budget</h2>
              <p className="text-sm text-benji-ink/70 dark:text-benji-mist-dim/70 mt-1">
                Set a total spending limit for the entire month across all categories
              </p>
            </div>
            <button
              onClick={openOverallBudget}
              className="bg-benji-sage-dark hover:bg-benji-sage dark:bg-benji-gold dark:hover:bg-benji-gold-light text-white px-4 py-2 rounded-lg transition text-sm"
            >
              {overallBudget ? 'Edit Overall Budget' : 'Set Overall Budget'}
            </button>
          </div>
          {overallBudget ? (
            <div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <p className="text-sm text-benji-ink/70 dark:text-benji-mist-dim/70">Limit</p>
                  <p className="text-2xl font-bold text-benji-forest dark:text-benji-mist">${overallBudget.limit.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-benji-ink/70 dark:text-benji-mist-dim/70">Spent</p>
                  <p className={`text-2xl font-bold ${overallBudget.overBudget ? 'text-benji-brick dark:text-benji-coral' : 'text-benji-moss dark:text-benji-jade'}`}>
                    ${overallBudget.actual.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-benji-ink/70 dark:text-benji-mist-dim/70">Remaining</p>
                  <p className={`text-2xl font-bold ${overallBudget.remaining < 0 ? 'text-benji-brick dark:text-benji-coral' : 'text-benji-moss dark:text-benji-jade'}`}>
                    {overallBudget.remaining < 0 ? '-' : ''}${Math.abs(overallBudget.remaining).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="w-full bg-benji-sage/20 dark:bg-benji-vault-up rounded-full h-4 mb-2">
                <div
                  className={`h-4 rounded-full transition-all ${
                    overallBudget.overBudget ? 'bg-benji-brick dark:bg-benji-coral' :
                    overallBudget.percentUsed >= overallBudget.alertThreshold ? 'bg-benji-gold' : 'bg-benji-sage-dark dark:bg-benji-jade-dim'
                  }`}
                  style={{ width: `${Math.min(overallBudget.percentUsed, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className={`font-semibold ${
                  overallBudget.overBudget ? 'text-benji-brick dark:text-benji-coral' :
                  overallBudget.percentUsed >= overallBudget.alertThreshold ? 'text-benji-gold' : 'text-benji-moss dark:text-benji-jade'
                }`}>
                  {overallBudget.overBudget ? 'Over Budget!' : overallBudget.percentUsed >= overallBudget.alertThreshold ? 'Near Limit' : 'On Track'}
                </span>
                <span className="text-benji-ink/70 dark:text-benji-mist-dim/70">{overallBudget.percentUsed}% used</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-benji-ink/50 dark:text-benji-mist-dim/50">No overall budget set for {monthLabel}</p>
            </div>
          )}
        </div>

        {/* Category Budgets Summary */}
        {summary && categoryBudgets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="bg-benji-paper dark:bg-benji-vault-card rounded-xl shadow-md p-4">
              <p className="text-sm text-benji-ink/70 dark:text-benji-mist-dim/70">Categories Planned</p>
              <p className="text-2xl font-bold text-benji-forest dark:text-benji-mist">${summary.totalPlanned.toFixed(2)}</p>
            </div>
            <div className="bg-benji-paper dark:bg-benji-vault-card rounded-xl shadow-md p-4">
              <p className="text-sm text-benji-ink/70 dark:text-benji-mist-dim/70">Categories Spent</p>
              <p className={`text-2xl font-bold ${summary.totalActual > summary.totalPlanned ? 'text-benji-brick dark:text-benji-coral' : 'text-benji-moss dark:text-benji-jade'}`}>
                ${summary.totalActual.toFixed(2)}
              </p>
            </div>
            <div className="bg-benji-paper dark:bg-benji-vault-card rounded-xl shadow-md p-4">
              <p className="text-sm text-benji-ink/70 dark:text-benji-mist-dim/70">Categories Remaining</p>
              <p className={`text-2xl font-bold ${summary.totalRemaining < 0 ? 'text-benji-brick dark:text-benji-coral' : 'text-benji-moss dark:text-benji-jade'}`}>
                {summary.totalRemaining < 0 ? '-' : ''}${Math.abs(summary.totalRemaining).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Category Budget List */}
        <h2 className="text-xl font-bold text-benji-forest dark:text-benji-mist mb-4">Category Budgets</h2>
        {categoryBudgets.length === 0 ? (
          <div className="bg-benji-paper dark:bg-benji-vault-card rounded-xl shadow-md p-8 text-center">
            <p className="text-benji-ink/70 dark:text-benji-mist-dim/70 text-lg mb-4">No category budgets set for {monthLabel}</p>
            <button
              onClick={openCreate}
              className="bg-benji-sage-dark hover:bg-benji-sage dark:bg-benji-gold dark:hover:bg-benji-gold-light text-white px-6 py-3 rounded-lg transition"
            >
              Add a Category Budget
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {categoryBudgets.map((budget) => (
              <motion.div
                key={budget._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-benji-paper dark:bg-benji-vault-card rounded-xl shadow-md p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-benji-forest dark:text-benji-mist">{budget.category}</h3>
                    <p className="text-sm text-benji-ink/70 dark:text-benji-mist-dim/70">
                      ${budget.actual.toFixed(2)} of ${budget.limit.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      budget.overBudget
                        ? 'bg-benji-brick/15 dark:bg-benji-coral/15 text-benji-brick dark:text-benji-coral'
                        : budget.percentUsed >= budget.alertThreshold
                        ? 'bg-benji-gold/15 dark:bg-benji-gold/10 text-benji-gold dark:text-benji-gold-light'
                        : 'bg-benji-sage/15 dark:bg-benji-jade/15 text-benji-moss dark:text-benji-jade'
                    }`}>
                      {budget.overBudget ? 'Over Budget' : budget.percentUsed >= budget.alertThreshold ? 'Near Limit' : 'On Track'}
                    </span>
                    <button onClick={() => openEdit(budget)} className="p-1 text-benji-sage-dark dark:text-benji-gold hover:bg-benji-sage/10 dark:hover:bg-benji-gold/10 rounded">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(budget._id)} className="p-1 text-benji-brick dark:text-benji-coral hover:bg-benji-brick/10 dark:hover:bg-benji-coral/10 rounded">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-benji-sage/20 dark:bg-benji-vault-up rounded-full h-3 mb-2">
                  <div
                    className={`h-3 rounded-full transition-all ${getBarColor(budget)}`}
                    style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-benji-ink/70 dark:text-benji-mist-dim/70">
                  <span>{budget.percentUsed}% used</span>
                  <span>{budget.remaining >= 0 ? `$${budget.remaining.toFixed(2)} left` : `$${Math.abs(budget.remaining).toFixed(2)} over`}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {showForm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-50"
                onClick={() => setShowForm(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 flex items-center justify-center z-50 p-4"
              >
                <div className="bg-benji-paper dark:bg-benji-vault-card rounded-xl shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-benji-forest dark:text-benji-mist">
                      {formMode === 'overall'
                        ? (editingBudget ? 'Edit Overall Budget' : 'Set Overall Budget')
                        : (editingBudget ? 'Edit Category Budget' : 'New Category Budget')
                      }
                    </h2>
                    <button onClick={() => setShowForm(false)} className="text-benji-ink/50 hover:text-benji-forest dark:hover:text-benji-mist">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formMode === 'overall' ? (
                      <div className="p-3 bg-benji-sage/10 dark:bg-benji-gold/10 rounded-lg">
                        <p className="text-sm text-benji-sage-dark dark:text-benji-gold">
                          This sets a single spending limit for all expenses combined this month.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-benji-forest dark:text-benji-mist mb-1">Category</label>
                        <select
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value })}
                          disabled={!!editingBudget}
                          className="w-full px-3 py-2 border border-benji-sage/30 dark:border-benji-gold/20 rounded-lg dark:bg-benji-vault-up dark:text-benji-mist disabled:opacity-50"
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-benji-forest dark:text-benji-mist mb-1">Monthly Limit ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.limit}
                        onChange={(e) => setForm({ ...form, limit: e.target.value })}
                        className="w-full px-3 py-2 border border-benji-sage/30 dark:border-benji-gold/20 rounded-lg dark:bg-benji-vault-up dark:text-benji-mist"
                        placeholder="e.g. 500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-benji-forest dark:text-benji-mist mb-1">
                        Alert Threshold ({form.alertThreshold}%)
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={form.alertThreshold}
                        onChange={(e) => setForm({ ...form, alertThreshold: e.target.value })}
                        className="w-full"
                      />
                      <p className="text-xs text-benji-ink/70 dark:text-benji-mist-dim/70">
                        You'll see a warning when spending reaches {form.alertThreshold}% of the limit
                      </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setShowForm(false)}
                        className="flex-1 px-4 py-2 border border-benji-sage/30 dark:border-benji-gold/20 rounded-lg text-benji-forest dark:text-benji-mist hover:bg-benji-cream dark:hover:bg-benji-vault-up transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-2 bg-benji-sage-dark hover:bg-benji-sage dark:bg-benji-gold dark:hover:bg-benji-gold-light text-white rounded-lg transition"
                      >
                        {editingBudget ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
