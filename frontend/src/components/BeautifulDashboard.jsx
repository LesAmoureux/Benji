import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import API from '../services/api';
import DashboardSettings from './DashboardSettings';
import WIDGET_REGISTRY, { mergeWidgetPreferences } from '../dashboard/widgetRegistry';
import computeDashboardMetrics from '../dashboard/computeMetrics';
import { renderWidget } from '../dashboard/widgets';

const LAYOUT_MAP = {
  'total-income': 'kpi',
  'total-expenses': 'kpi',
  'net-balance': 'kpi',
  'transaction-count': 'kpi',
  'avg-transaction': 'kpi',
  'largest-expense': 'kpi',
  'largest-income': 'kpi',
  'avg-daily-spend': 'kpi',
  'expense-frequency': 'kpi',
  'income-count': 'kpi',
  'savings-rate': 'kpi',
  'small-purchases': 'kpi',
  'recurring-vs-onetime': 'kpi',
  'cash-flow-ratio': 'kpi',
  'biggest-spending-month': 'kpi',
  'biggest-income-month': 'kpi',
  'expense-growth-rate': 'kpi',
  'bills-total': 'kpi',
  'subscriptions-total': 'kpi',
  'fixed-expense-ratio': 'kpi',
  'weekend-vs-weekday': 'kpi',
  'spending-velocity': 'kpi',
  'median-transaction': 'kpi',
  'transactions-over-100': 'kpi',
  'category-count': 'kpi',
  'merchant-count': 'kpi',
  'avg-monthly-savings': 'kpi',
  'best-savings-month': 'kpi',
  'worst-savings-month': 'kpi',
  'days-of-runway': 'kpi',
  'checking-income': 'kpi',
  'savings-income': 'kpi',
  'avg-weekly-spend': 'kpi',
  'days-since-last-income': 'kpi',
  'days-since-last-expense': 'kpi',
};

export default function BeautifulDashboard() {
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [preferences, setPreferences] = useState({ widgets: [] });
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [accountScope, setAccountScope] = useState('all');

  useEffect(() => {
    fetchData();
    fetchPreferences();
  }, []);

  useEffect(() => {
    filterDataByTimeRange();
  }, [allTransactions, timeRange, customStartDate, customEndDate, accountScope]);

  useEffect(() => {
    fetchBudgetSummary();
  }, [accountScope]);

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

  const fetchBudgetSummary = async () => {
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const acctParam = accountScope !== 'all' && accountScope !== 'unspecified' ? `&accountType=${accountScope}` : '';
      const { data } = await API.get(`/budgets/summary?month=${month}&year=${year}${acctParam}`);
      setBudgetSummary(data);
    } catch (error) {
      console.error('Error fetching budget summary:', error);
    }
  };

  const filterDataByTimeRange = () => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    let filtered = [...allTransactions];

    if (accountScope !== 'all') {
      if (accountScope === 'unspecified') {
        filtered = filtered.filter(t => !t.accountType);
      } else {
        filtered = filtered.filter(t => t.accountType === accountScope);
      }
    }

    if (timeRange === 'custom') {
      if (customStartDate && customEndDate) {
        const start = new Date(customStartDate); start.setHours(0, 0, 0, 0);
        const end = new Date(customEndDate); end.setHours(23, 59, 59, 999);
        filtered = filtered.filter(t => { const d = new Date(t.date); return d >= start && d <= end; });
      }
    } else if (timeRange !== 'all') {
      let startDate = new Date(now);
      switch (timeRange) {
        case '7days': startDate.setDate(startDate.getDate() - 7); break;
        case '30days': startDate.setDate(startDate.getDate() - 30); break;
        case '3months': startDate.setMonth(startDate.getMonth() - 3); break;
        case '6months': startDate.setMonth(startDate.getMonth() - 6); break;
        case 'year': startDate.setFullYear(startDate.getFullYear() - 1); break;
        default: break;
      }
      filtered = filtered.filter(t => new Date(t.date) >= startDate);
    }

    setFilteredTransactions(filtered);
  };

  const mergedWidgets = useMemo(
    () => mergeWidgetPreferences(preferences.widgets, WIDGET_REGISTRY),
    [preferences.widgets]
  );

  const metrics = useMemo(
    () => computeDashboardMetrics(filteredTransactions),
    [filteredTransactions]
  );

  const enabledWidgetIds = useMemo(
    () => new Set(mergedWidgets.filter(w => w.enabled).map(w => w.id)),
    [mergedWidgets]
  );

  const savePreferences = async (newPreferences) => {
    try {
      await API.put('/preferences', newPreferences);
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences');
    }
  };

  const timeRangeLabel = {
    '7days': 'Last 7 Days',
    '30days': 'Last 30 Days',
    '3months': 'Last 3 Months',
    '6months': 'Last 6 Months',
    'year': 'Last Year',
    'custom': `${customStartDate} to ${customEndDate}`,
    'all': 'All Time'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-benji-cream dark:bg-benji-vault text-benji-forest dark:text-benji-mist">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  const kpiWidgets = WIDGET_REGISTRY.filter(w => LAYOUT_MAP[w.id] === 'kpi' && enabledWidgetIds.has(w.id));
  const fullWidgets = WIDGET_REGISTRY.filter(w => LAYOUT_MAP[w.id] !== 'kpi' && enabledWidgetIds.has(w.id));

  return (
    <div className="min-h-screen bg-benji-cream dark:bg-benji-vault px-4 py-4 transition-colors">
      <div className="w-full">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <div className="flex flex-wrap justify-between items-start mb-4 gap-4">
            <div>
              <h1 className="text-4xl font-bold text-benji-forest dark:text-benji-mist mb-2">Your Financial Dashboard</h1>
              <p className="text-benji-ink dark:text-benji-mist-dim">
                Showing data for: <span className="font-semibold">{timeRangeLabel[timeRange]}</span>
                {' '}({filteredTransactions.length} transactions)
                {accountScope !== 'all' && (
                  <span className="ml-2 px-2 py-0.5 bg-benji-sage/20 dark:bg-benji-gold/20 text-benji-sage-dark dark:text-benji-gold text-xs rounded-full">
                    {accountScope === 'unspecified' ? 'Unspecified' : accountScope.charAt(0).toUpperCase() + accountScope.slice(1)}
                  </span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* Account Scope */}
              <div className="bg-benji-paper dark:bg-benji-vault-card rounded-lg shadow-warm dark:shadow-vault p-2 border border-benji-sage/10 dark:border-benji-gold/10">
                <label className="text-xs text-benji-ink dark:text-benji-mist-dim block mb-1">Account</label>
                <select
                  value={accountScope}
                  onChange={(e) => setAccountScope(e.target.value)}
                  className="px-3 py-2 border-none rounded focus:outline-none focus:ring-2 focus:ring-benji-sage dark:focus:ring-benji-gold bg-transparent text-benji-forest dark:text-benji-mist"
                >
                  <option value="all">All Accounts</option>
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                  <option value="unspecified">Unspecified</option>
                </select>
              </div>

              {/* Time Range */}
              <div className="bg-benji-paper dark:bg-benji-vault-card rounded-lg shadow-warm dark:shadow-vault p-2 border border-benji-sage/10 dark:border-benji-gold/10">
                <label className="text-xs text-benji-ink dark:text-benji-mist-dim block mb-1">Time Range</label>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border-none rounded focus:outline-none focus:ring-2 focus:ring-benji-sage dark:focus:ring-benji-gold bg-transparent text-benji-forest dark:text-benji-mist"
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
                  <div className="bg-benji-paper dark:bg-benji-vault-card rounded-lg shadow-warm dark:shadow-vault p-2 border border-benji-sage/10 dark:border-benji-gold/10">
                    <label className="text-xs text-benji-ink dark:text-benji-mist-dim block mb-1">Start Date</label>
                    <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-3 py-2 border-none rounded focus:outline-none focus:ring-2 focus:ring-benji-sage dark:focus:ring-benji-gold bg-transparent text-benji-forest dark:text-benji-mist" />
                  </div>
                  <div className="bg-benji-paper dark:bg-benji-vault-card rounded-lg shadow-warm dark:shadow-vault p-2 border border-benji-sage/10 dark:border-benji-gold/10">
                    <label className="text-xs text-benji-ink dark:text-benji-mist-dim block mb-1">End Date</label>
                    <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-3 py-2 border-none rounded focus:outline-none focus:ring-2 focus:ring-benji-sage dark:focus:ring-benji-gold bg-transparent text-benji-forest dark:text-benji-mist" />
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* KPI Row */}
        {kpiWidgets.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mb-4">
            {kpiWidgets.map(w => (
              <div key={w.id} className="min-w-0">{renderWidget(w.id, metrics, budgetSummary, filteredTransactions)}</div>
            ))}
          </div>
        )}

        {/* Full-width / half-width widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
          {fullWidgets.map(w => (
            <div key={w.id} className="min-w-0">{renderWidget(w.id, metrics, budgetSummary, filteredTransactions)}</div>
          ))}
        </div>

        {enabledWidgetIds.size === 0 && (
          <div className="text-center py-20">
            <p className="text-benji-ink dark:text-benji-mist-dim text-lg mb-4">No widgets enabled. Open settings to customize your dashboard.</p>
          </div>
        )}

        {/* Settings */}
        <DashboardSettings preferences={{ widgets: mergedWidgets }} onSave={savePreferences} />
      </div>
    </div>
  );
}
