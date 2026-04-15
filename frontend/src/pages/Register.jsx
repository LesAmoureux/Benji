import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="benji-auth-bg min-h-screen flex items-end sm:items-center justify-center px-0 sm:px-4 py-0 sm:py-4 transition-colors">
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 p-2.5 sm:p-3 rounded-lg bg-benji-paper dark:bg-benji-vault-card shadow-warm dark:shadow-vault hover:scale-110 transition-transform z-50"
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? <Sun size={22} className="text-benji-gold" /> : <Moon size={22} className="text-benji-forest" />}
      </button>

      <div className="benji-money-lines bg-benji-paper dark:bg-benji-vault-card p-5 sm:p-6 rounded-t-2xl sm:rounded-xl shadow-warm-md dark:shadow-vault-md w-full sm:max-w-md border border-benji-sage/10 dark:border-benji-gold/10 transition-colors">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-benji-forest dark:text-benji-gold mb-2">BENJI</h1>
          <p className="text-sm sm:text-base text-benji-ink dark:text-benji-mist-dim">Create Your Account</p>
        </div>

        {error && (
          <div className="bg-benji-brick/10 dark:bg-benji-coral/10 border border-benji-brick/30 dark:border-benji-coral/30 text-benji-brick dark:text-benji-coral px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-benji-forest dark:text-benji-mist text-sm font-semibold mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-benji-sage/30 dark:border-benji-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-benji-sage dark:focus:ring-benji-gold bg-benji-cream/50 dark:bg-benji-vault/50 text-benji-forest dark:text-benji-mist transition-colors"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-benji-forest dark:text-benji-mist text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-benji-sage/30 dark:border-benji-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-benji-sage dark:focus:ring-benji-gold bg-benji-cream/50 dark:bg-benji-vault/50 text-benji-forest dark:text-benji-mist transition-colors"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-benji-forest dark:text-benji-mist text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-benji-sage/30 dark:border-benji-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-benji-sage dark:focus:ring-benji-gold bg-benji-cream/50 dark:bg-benji-vault/50 text-benji-forest dark:text-benji-mist transition-colors"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-benji-sage-dark hover:bg-benji-sage dark:bg-benji-gold dark:hover:bg-benji-gold-light text-white dark:text-benji-vault font-semibold py-3 rounded-lg transition-colors"
          >
            Register
          </button>
        </form>

        <p className="text-center text-benji-ink dark:text-benji-mist-dim mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-benji-sage-dark dark:text-benji-gold hover:underline font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
