import { useState, useEffect } from 'react';
import { Settings, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WIDGET_REGISTRY, { getWidgetCategories } from '../dashboard/widgetRegistry';

export default function DashboardSettings({ preferences, onSave }) {
  const [isOpen, setIsOpen] = useState(false);
  const [localWidgets, setLocalWidgets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (preferences && preferences.widgets && preferences.widgets.length > 0) {
      setLocalWidgets(preferences.widgets);
    } else {
      setLocalWidgets(WIDGET_REGISTRY.map(w => ({ id: w.id, enabled: w.defaultEnabled })));
    }
  }, [preferences]);

  const toggleWidget = (widgetId) => {
    setLocalWidgets(prev => prev.map(w =>
      w.id === widgetId ? { ...w, enabled: !w.enabled } : w
    ));
  };

  const handleSave = () => {
    onSave({ widgets: localWidgets });
    setIsOpen(false);
  };

  const isWidgetEnabled = (widgetId) => {
    const w = localWidgets.find(w => w.id === widgetId);
    return w ? w.enabled : false;
  };

  const enabledCount = localWidgets.filter(w => w.enabled).length;
  const categories = getWidgetCategories();

  const filteredRegistry = searchTerm
    ? WIDGET_REGISTRY.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : WIDGET_REGISTRY;

  const filteredCategories = categories.filter(cat =>
    filteredRegistry.some(w => w.category === cat)
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-benji-sage-dark dark:bg-benji-gold text-white dark:text-benji-vault p-4 rounded-full shadow-warm-md dark:shadow-vault-md hover:bg-benji-sage dark:hover:bg-benji-gold-light transition z-40 hover:scale-110 transform"
        title="Dashboard Settings"
      >
        <Settings size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-benji-paper dark:bg-benji-vault-card shadow-warm-md dark:shadow-vault-md z-50 overflow-y-auto transition-colors"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-benji-forest dark:text-benji-mist">Dashboard Settings</h2>
                    <p className="text-sm text-benji-ink dark:text-benji-mist-dim mt-1">
                      {enabledCount} of {WIDGET_REGISTRY.length} widgets enabled
                    </p>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="text-benji-ink/50 dark:text-benji-mist-dim/50 hover:text-benji-forest dark:hover:text-benji-mist">
                    <X size={24} />
                  </button>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-3 text-benji-ink/40 dark:text-benji-mist-dim/40" size={18} />
                  <input
                    type="text"
                    placeholder="Search widgets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-benji-sage/30 dark:border-benji-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-benji-sage dark:focus:ring-benji-gold bg-benji-cream/50 dark:bg-benji-vault/50 text-benji-forest dark:text-benji-mist"
                  />
                </div>

                <div className="space-y-6">
                  {filteredCategories.map(cat => (
                    <div key={cat}>
                      <h3 className="text-sm font-bold text-benji-ink/60 dark:text-benji-mist-dim/60 uppercase tracking-wider mb-3">{cat}</h3>
                      <div className="space-y-2">
                        {filteredRegistry.filter(w => w.category === cat).map(widget => {
                          const enabled = isWidgetEnabled(widget.id);
                          return (
                            <motion.div
                              key={widget.id}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              className={`p-3 rounded-lg border-2 transition cursor-pointer ${
                                enabled
                                  ? 'border-benji-sage dark:border-benji-gold bg-benji-sage/10 dark:bg-benji-gold/10'
                                  : 'border-benji-sage/15 dark:border-benji-gold/10 bg-benji-cream/50 dark:bg-benji-vault-up'
                              }`}
                              onClick={() => toggleWidget(widget.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                  <span className="text-xl">{widget.icon}</span>
                                  <div>
                                    <h4 className="font-semibold text-sm text-benji-forest dark:text-benji-mist">{widget.name}</h4>
                                    <p className="text-xs text-benji-ink/70 dark:text-benji-mist-dim/70">{widget.description}</p>
                                  </div>
                                </div>
                                <div
                                  className={`relative w-10 h-5 rounded-full transition-colors ${
                                    enabled ? 'bg-benji-sage-dark dark:bg-benji-gold' : 'bg-benji-sage/30 dark:bg-benji-vault-up'
                                  }`}
                                >
                                  <motion.div
                                    animate={{ x: enabled ? 20 : 2 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md"
                                  />
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleSave}
                    className="w-full bg-benji-sage-dark dark:bg-benji-gold text-white dark:text-benji-vault py-3 rounded-lg font-semibold hover:bg-benji-sage dark:hover:bg-benji-gold-light transition"
                  >
                    Save Preferences
                  </button>
                  <button
                    onClick={() => setLocalWidgets(WIDGET_REGISTRY.map(w => ({ id: w.id, enabled: true })))}
                    className="w-full bg-benji-cream dark:bg-benji-vault-up text-benji-forest dark:text-benji-mist py-3 rounded-lg font-semibold hover:bg-benji-sage/20 dark:hover:bg-benji-gold/10 transition"
                  >
                    Enable All
                  </button>
                  <button
                    onClick={() => setLocalWidgets(WIDGET_REGISTRY.map(w => ({ id: w.id, enabled: false })))}
                    className="w-full bg-benji-cream dark:bg-benji-vault-up text-benji-forest dark:text-benji-mist py-3 rounded-lg font-semibold hover:bg-benji-sage/20 dark:hover:bg-benji-gold/10 transition"
                  >
                    Disable All
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
