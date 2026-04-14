import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import BeautifulDashboard from './components/BeautifulDashboard';
import TransactionsPage from './pages/TransactionsPage';
import AllTransactionsPage from './pages/AllTransactionsPage';
import BudgetsPage from './pages/BudgetsPage';
import Navbar from './components/Navbar';

function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-benji-cream dark:bg-benji-vault text-benji-forest dark:text-benji-mist">Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Navbar />
                  <BeautifulDashboard />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/transactions"
              element={
                <PrivateRoute>
                  <Navbar />
                  <TransactionsPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/all-transactions"
              element={
                <PrivateRoute>
                  <Navbar />
                  <AllTransactionsPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/budgets"
              element={
                <PrivateRoute>
                  <Navbar />
                  <BudgetsPage />
                </PrivateRoute>
              }
            />
            
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default AppRoutes;