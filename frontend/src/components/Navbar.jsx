import { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Menu, X, LayoutDashboard, ArrowLeftRight, List, Wallet } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/all-transactions', label: 'All Transactions', icon: List },
  { to: '/budgets', label: 'Budgets', icon: Wallet },
];

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Top Navbar */}
      <nav className="bg-benji-paper dark:bg-benji-vault-up border-b border-benji-sage/20 dark:border-benji-gold/10 shadow-warm dark:shadow-vault transition-colors">
        <div className="w-full px-4 py-3">
          <div className="flex justify-between items-center">
            <Link to="/dashboard" className="text-2xl font-display font-bold text-benji-forest dark:text-benji-gold tracking-tight">
              BENJI
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-6">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`transition ${isActive(item.to)
                    ? 'text-benji-sage-dark dark:text-benji-gold font-semibold'
                    : 'text-benji-forest/80 dark:text-benji-mist/80 hover:text-benji-sage-dark dark:hover:text-benji-gold'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-benji-cream dark:bg-benji-vault-card hover:bg-benji-sage/20 dark:hover:bg-benji-gold/10 transition"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <Sun size={20} className="text-benji-gold" /> : <Moon size={20} className="text-benji-forest" />}
              </button>

              {user && (
                <div className="flex items-center gap-4">
                  <span className="text-benji-forest dark:text-benji-mist">
                    Welcome, <span className="font-semibold">{user.name}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-benji-brick dark:bg-benji-coral text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile: theme toggle + hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-benji-cream dark:bg-benji-vault-card hover:bg-benji-sage/20 dark:hover:bg-benji-gold/10 transition"
              >
                {isDark ? <Sun size={20} className="text-benji-gold" /> : <Moon size={20} className="text-benji-forest" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-benji-cream dark:bg-benji-vault-card hover:bg-benji-sage/20 dark:hover:bg-benji-gold/10 transition"
              >
                {mobileMenuOpen
                  ? <X size={22} className="text-benji-forest dark:text-benji-mist" />
                  : <Menu size={22} className="text-benji-forest dark:text-benji-mist" />
                }
              </button>
            </div>
          </div>

          {/* Mobile slide-down menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 pt-3 border-t border-benji-sage/20 dark:border-benji-gold/10 space-y-1">
              {user && (
                <div className="px-3 py-2 mb-2">
                  <p className="text-sm text-benji-ink dark:text-benji-mist-dim">Signed in as</p>
                  <p className="font-semibold text-benji-forest dark:text-benji-mist">{user.name}</p>
                </div>
              )}
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition ${isActive(item.to)
                    ? 'bg-benji-sage/15 dark:bg-benji-gold/10 text-benji-sage-dark dark:text-benji-gold font-semibold'
                    : 'text-benji-forest dark:text-benji-mist hover:bg-benji-sage/10 dark:hover:bg-benji-gold/5'
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              ))}
              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-benji-brick dark:text-benji-coral hover:bg-benji-brick/10 dark:hover:bg-benji-coral/10 transition mt-2"
                >
                  Logout
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-benji-paper dark:bg-benji-vault-up border-t border-benji-sage/20 dark:border-benji-gold/10 shadow-warm dark:shadow-vault">
        <div className="flex justify-around items-center py-1">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition min-w-[60px] ${isActive(item.to)
                ? 'text-benji-sage-dark dark:text-benji-gold'
                : 'text-benji-ink/60 dark:text-benji-mist-dim/60'
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px] mt-0.5 leading-tight">{item.label.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Spacer so page content doesn't hide behind the bottom bar on mobile */}
      <div className="md:hidden h-16" />
    </>
  );
}
