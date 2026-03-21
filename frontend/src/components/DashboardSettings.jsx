import { useState, useEffect } from 'react';
import { Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AVAILABLE_WIDGETS = [
  {
    id: 'stats-cards',
    name: 'Financial Stats',
    description: 'Income, Expenses, Balance cards',
    icon: '💰'
  },
  {
    id: 'spending-chart',
    name: 'Spending Chart',
    description: 'Interactive donut chart',
    icon: '📊'
  },
  {
    id: 'category-breakdown',
    name: 'Category Breakdown',
    description: 'Detailed category list with percentages',
    icon: '📋'
  },
  {
    id: 'monthly-trends',
    name: 'Monthly Trends',
    description: 'Income vs Expense by month',
    icon: '📈'
  },
  {
    id: 'top-merchants',
    name: 'Top Merchants',
    description: 'Where you spend the most',
    icon: '🏪'
  },
  {
    id: 'recent-transactions',
    name: 'Recent Transactions',
    description: 'Latest 10 transactions',
    icon: '📝'
  }
];

export default function DashboardSettings({ preferences, onSave }) {
  const [isOpen, setIsOpen] = useState(false);
  const [localPreferences, setLocalPreferences] = useState({
    widgets: AVAILABLE_WIDGETS.map(w => ({ id: w.id, enabled: true }))
  });

  useEffect(() => {
    if (preferences && preferences.widgets && preferences.widgets.length > 0) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const toggleWidget = (widgetId) => {
    setLocalPreferences(prev => {
      const newWidgets = prev.widgets.map(w =>
        w.id === widgetId ? { ...w, enabled: !w.enabled } : w
      );
      return { ...prev, widgets: newWidgets };
    });
  };

  const handleSave = () => {
    onSave(localPreferences);
    setIsOpen(false);
  };

  const isWidgetEnabled = (widgetId) => {
    const widget = localPreferences.widgets.find(w => w.id === widgetId);
    return widget ? widget.enabled : true;
  };

  const enabledCount = localPreferences.widgets.filter(w => w.enabled).length;

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 dark:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition z-40 hover:scale-110 transform"
        title="Dashboard Settings"
      >
        <Settings size={24} />
      </button>

      {/* Settings Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto transition-colors"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard Settings</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {enabledCount} of {AVAILABLE_WIDGETS.length} widgets enabled
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Widgets List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
                    Customize Widgets
                  </h3>

                  {AVAILABLE_WIDGETS.map(widget => {
                    const enabled = isWidgetEnabled(widget.id);
                    return (
                      <motion.div
                        key={widget.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-lg border-2 transition cursor-pointer ${
                          enabled
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-600'
                            : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                        }`}
                        onClick={() => toggleWidget(widget.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-2xl">{widget.icon}</span>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {widget.name}
                              </h4>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {widget.description}
                            </p>
                          </div>
                          
                          {/* Toggle Switch */}
                          <div
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              enabled ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <motion.div
                              animate={{ x: enabled ? 24 : 2 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  className="w-full mt-6 bg-blue-600 dark:bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-800 transition transform hover:scale-105"
                >
                  Save Preferences
                </button>

                {/* Reset Button */}
                <button
                  onClick={() => {
                    setLocalPreferences({
                      widgets: AVAILABLE_WIDGETS.map(w => ({ id: w.id, enabled: true }))
                    });
                  }}
                  className="w-full mt-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Enable All Widgets
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}