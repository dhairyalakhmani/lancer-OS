// src/pages/Login.jsx
import { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2, Moon, Sun } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; // Import ThemeContext

const Login = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, signup } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext); // Extract theme state
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-surface-dark px-4 transition-colors duration-300 relative">
      
      {/* Floating Theme Toggle for the Auth Page */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2.5 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="Toggle Theme"
      >
        {theme === 'light' ? (
          <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        ) : (
          <Sun className="w-5 h-5 text-slate-300" />
        )}
      </button>

      {/* Upgraded Auth Card */}
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 p-8 sm:p-10 transition-colors">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          {/* New LancerOS Heading with modern gradient text */}
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-500 dark:from-primary-400 dark:to-indigo-300 mb-6 tracking-tight">
            Lancer-OS
          </h1>
          
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isLoginMode ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            {isLoginMode ? 'Enter your details to access your workspace.' : 'Start managing your freelance business today.'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white sm:text-sm transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white sm:text-sm transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 dark:focus:ring-offset-slate-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              isLoginMode ? 'Sign In' : 'Sign Up'
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError('');
              }}
              className="text-primary-600 dark:text-primary-400 hover:text-primary-500 hover:underline font-semibold transition-colors"
            >
              {isLoginMode ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;