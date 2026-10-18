import React, { useState } from 'react';
import { X, Lock, Mail, User, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { CURRENCY_DETAILS } from '../utils/formatters';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, demoLogin } = useAuth();
  const { showToast } = useToast();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Please enter your full name');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        await register(name, email, password, currency);
        showToast('Account registered successfully! Welcome to ExpenFlow PRO.', 'success');
      } else {
        await login(email, password);
        showToast('Welcome back! Successfully signed in.', 'success');
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async () => {
    setError('');
    setLoading(true);
    try {
      await demoLogin();
      showToast('Live Demo activated with sample financial data!', 'success');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to initialize demo session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Frosted Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xl transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="glass-panel w-full max-w-md rounded-3xl border border-white/[0.12] p-6 sm:p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200 my-8 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-48 h-24 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          id="auth-close-btn"
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white glass-input transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {isRegister ? 'Create Your Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isRegister
              ? 'Start tracking multi-currency cashflow with ExpenFlow PRO'
              : 'Sign in to access your financial intelligence dashboard'}
          </p>
        </div>

        {/* 1-Click Demo Login Banner */}
        <button
          type="button"
          id="auth-demo-btn"
          onClick={handleDemoClick}
          disabled={loading}
          className="w-full mb-5 p-3 rounded-2xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-cyan-900/30 border border-purple-500/30 hover:border-purple-500/60 text-purple-200 text-xs font-semibold flex items-center justify-between transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300">
              <Sparkles className="w-4 h-4" />
            </span>
            <div className="text-left">
              <span className="block text-white font-bold">1-Click Instant Demo Access</span>
              <span className="text-[10px] text-purple-300/80">Pre-seeded with rich sample transactions</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-purple-400 transform group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-px bg-white/[0.08] flex-1" />
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
            Or continue with email
          </span>
          <div className="h-px bg-white/[0.08] flex-1" />
        </div>

        {/* Tabs: Sign In / Register */}
        <div className="flex p-1 bg-slate-900/90 rounded-2xl mb-5 border border-white/[0.08]">
          <button
            type="button"
            id="auth-tab-signin"
            onClick={() => {
              setIsRegister(false);
              setError('');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              !isRegister
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            id="auth-tab-register"
            onClick={() => {
              setIsRegister(true);
              setError('');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isRegister
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  id="auth-name-input"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                id="auth-email-input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                id="auth-password-input"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            {isRegister && (
              <span className="text-[11px] text-slate-500 mt-1 block">Minimum 6 characters</span>
            )}
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Currency</label>
              <select
                id="auth-currency-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl glass-input text-xs text-white focus:outline-none cursor-pointer"
              >
                {CURRENCY_DETAILS.map((c) => (
                  <option key={c.code} value={c.code} className="bg-slate-900">
                    {c.flag} {c.code} ({c.symbol.trim()}) - {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            id="auth-submit-btn"
            disabled={loading}
            className="w-full py-2.5 rounded-2xl btn-primary-glow font-semibold text-xs cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
