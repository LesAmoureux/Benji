import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-benji-paper dark:bg-benji-vault-up border-b border-benji-sage/20 dark:border-benji-gold/10 shadow-warm dark:shadow-vault transition-colors">
      <div className="w-full px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/dashboard" className="text-2xl font-display font-bold text-benji-forest dark:text-benji-gold tracking-tight">
            BENJI
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className="text-benji-forest/80 dark:text-benji-mist/80 hover:text-benji-sage-dark dark:hover:text-benji-gold transition"
            >
              Dashboard
            </Link>
            <Link
              to="/transactions"
              className="text-benji-forest/80 dark:text-benji-mist/80 hover:text-benji-sage-dark dark:hover:text-benji-gold transition"
            >
              Transactions
            </Link>
            <Link
              to="/all-transactions"
              className="text-benji-forest/80 dark:text-benji-mist/80 hover:text-benji-sage-dark dark:hover:text-benji-gold transition"
            >
              All Transactions
            </Link>
            <Link
              to="/budgets"
              className="text-benji-forest/80 dark:text-benji-mist/80 hover:text-benji-sage-dark dark:hover:text-benji-gold transition"
            >
              Budgets
            </Link>

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
        </div>
      </div>
    </nav>
  );
}
