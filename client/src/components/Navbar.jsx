import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Database,
  Download,
  Upload,
  LogOut,
  ChevronDown,
  DollarSign,
  PlusCircle,
  Sun,
  Moon,
  FileSpreadsheet,
  FileJson,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CURRENCY_SYMBOLS, CURRENCY_DETAILS } from '../utils/formatters';
import { useClickOutside } from '../hooks/useClickOutside';

export const Navbar = ({
  dbStatus,
  onOpenMongoModal,
  onOpenExportImport,
  onOpenTransactionModal,
  onOpenAuthModal,
}) => {
  const { user, isAuthenticated, logout, updateCurrency, demoLogin } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [dataDropdownOpen, setDataDropdownOpen] = useState(false);

  // Dropdown refs with outside click and Escape dismissal
  const currencyRef = useClickOutside(() => setCurrencyDropdownOpen(false), currencyDropdownOpen);
  const profileRef = useClickOutside(() => setProfileDropdownOpen(false), profileDropdownOpen);
  const dataRef = useClickOutside(() => setDataDropdownOpen(false), dataDropdownOpen);

  // Theme toggle state (dark mode default)
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved !== 'light';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const currentCurrency = user?.currency || 'USD';
  const currentSymbol = CURRENCY_SYMBOLS[currentCurrency] || '$';

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & PRO indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[1px] shadow-lg shadow-purple-500/20">
              <div className="w-full h-full bg-[#080d1a] rounded-2xl flex items-center justify-center">
                {/* Custom minimalist geometric emblem matching reference design */}
                <svg
                  className="w-5 h-5 text-cyan-300 transform group-hover:rotate-45 transition-transform duration-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.4" />
                  <path d="M8 8L16 16" stroke="currentColor" />
                  <path d="M16 8L8 16" stroke="currentColor" />
                </svg>
              </div>
            </div>
            {/* Ambient subtle logo glow */}
            <div className="absolute inset-0 bg-purple-500/20 rounded-2xl blur-lg -z-10 group-hover:bg-purple-500/35 transition-colors" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent">
              Exp<span className="text-purple-400">en</span>Flow
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-sm shadow-purple-500/10">
              PRO
            </span>
          </div>
        </div>

        {/* Center / Right Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* MongoDB Health Indicator Badge */}
          <button
            onClick={onOpenMongoModal}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              dbStatus?.connected
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/20 hover:border-emerald-500/40'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/25 hover:bg-amber-500/20 hover:border-amber-500/40'
            }`}
            title="Click to view MongoDB connection details"
            id="navbar-db-status-btn"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                dbStatus?.connected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse' : 'bg-amber-400'
              }`}
            />
            <Database className="w-3.5 h-3.5 hidden sm:inline opacity-80" />
            <span className="font-semibold text-[11px] sm:text-xs">
              {dbStatus?.connected ? 'MongoDB Live' : 'Offline DB'}
            </span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl glass-input text-slate-300 hover:text-white transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            id="theme-toggle-btn"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-200" />
            ) : (
              <Moon className="w-4 h-4 text-purple-300 animate-in spin-in-180 duration-200" />
            )}
          </button>

          {/* Currency Switcher Dropdown (with outside click & escape handler) */}
          <div ref={currencyRef} className="relative">
            <button
              onClick={() => {
                setCurrencyDropdownOpen(!currencyDropdownOpen);
                setProfileDropdownOpen(false);
                setDataDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium glass-input hover:border-purple-400/50 text-slate-200 transition-all cursor-pointer"
              title="Select Currency"
              id="navbar-currency-btn"
              aria-expanded={currencyDropdownOpen}
              aria-haspopup="listbox"
            >
              <DollarSign className="w-3.5 h-3.5 text-purple-400 hidden sm:inline" />
              <span className="font-semibold tracking-wide">{currentCurrency}</span>
              <span className="text-slate-400 text-[11px] font-mono hidden md:inline">({currentSymbol.trim()})</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  currencyDropdownOpen ? 'rotate-180 text-purple-400' : ''
                }`}
              />
            </button>

            {currencyDropdownOpen && (
              <div
                role="listbox"
                className="absolute right-0 mt-2 w-56 max-h-80 overflow-y-auto glass-panel rounded-2xl border border-white/[0.1] p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/[0.08] mb-1 flex items-center justify-between">
                  <span>Select Active Currency</span>
                  <span className="text-[9px] text-purple-400">{CURRENCY_DETAILS.length} Available</span>
                </div>
                {CURRENCY_DETAILS.map((c) => (
                  <button
                    key={c.code}
                    role="option"
                    aria-selected={currentCurrency === c.code}
                    onClick={() => {
                      updateCurrency(c.code);
                      setCurrencyDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                      currentCurrency === c.code
                        ? 'bg-purple-600/25 text-purple-200 font-semibold border border-purple-500/30'
                        : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">{c.flag}</span>
                      <span className="font-semibold">{c.code}</span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[85px]">{c.name}</span>
                    </span>
                    <span className="text-slate-400 text-xs font-mono">{c.symbol.trim()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Add Transaction Button */}
          {isAuthenticated && (
            <button
              onClick={() => onOpenTransactionModal(null)}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold btn-primary-glow cursor-pointer"
              id="navbar-add-btn"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Add Transaction</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}

          {/* Data Menu Dropdown (Export & Import) */}
          {isAuthenticated && (
            <div ref={dataRef} className="relative">
              <button
                onClick={() => {
                  setDataDropdownOpen(!dataDropdownOpen);
                  setCurrencyDropdownOpen(false);
                  setProfileDropdownOpen(false);
                }}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl glass-input text-slate-300 hover:text-white hover:border-slate-500 transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
                title="Export or Import Transactions"
                id="navbar-data-btn"
                aria-expanded={dataDropdownOpen}
              >
                <Download className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline font-medium">Data</span>
                <ChevronDown
                  className={`w-3 h-3 text-slate-400 hidden sm:inline transition-transform duration-200 ${
                    dataDropdownOpen ? 'rotate-180 text-purple-400' : ''
                  }`}
                />
              </button>

              {dataDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 glass-panel rounded-2xl border border-white/[0.1] p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/[0.08] mb-1">
                    Data Management
                  </div>
                  <button
                    onClick={() => {
                      setDataDropdownOpen(false);
                      onOpenExportImport();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-white/[0.06] hover:text-white flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export CSV / JSON</span>
                  </button>
                  <button
                    onClick={() => {
                      setDataDropdownOpen(false);
                      onOpenExportImport();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-white/[0.06] hover:text-white flex items-center gap-2"
                  >
                    <Upload className="w-3.5 h-3.5 text-purple-400" />
                    <span>Import Backup File</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* User Profile Menu */}
          {isAuthenticated ? (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setCurrencyDropdownOpen(false);
                  setDataDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl glass-input hover:border-slate-500 text-slate-200 transition-colors cursor-pointer"
                id="navbar-user-btn"
                aria-expanded={profileDropdownOpen}
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                  {user?.name ? user.name[0] : 'U'}
                </div>
                <span className="text-xs font-semibold max-w-[80px] sm:max-w-[110px] truncate hidden sm:inline">
                  {user?.name || 'User'}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                    profileDropdownOpen ? 'rotate-180 text-purple-400' : ''
                  }`}
                />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl border border-white/[0.1] p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-white/[0.08] mb-1">
                    <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 text-[10px] font-medium border border-purple-500/25">
                      <span>Preferred: {currentCurrency}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenExportImport();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/[0.06] hover:text-white flex items-center gap-2"
                  >
                    <Upload className="w-3.5 h-3.5 text-purple-400" />
                    <span>Import / Export Data</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 mt-1"
                    id="logout-btn"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={demoLogin}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Quick demo access with preloaded sample data"
                id="quick-demo-btn"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Quick Demo</span>
              </button>
              <button
                onClick={onOpenAuthModal}
                className="px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold btn-primary-glow cursor-pointer"
                id="signin-btn"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
