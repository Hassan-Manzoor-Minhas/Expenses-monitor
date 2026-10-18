import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusCircle,
  Sparkles,
  Database,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  TrendingUp,
  PieChart,
} from 'lucide-react';
import { api } from './api/client';
import { useAuth } from './context/AuthContext';
import { useToast } from './components/Toast';
import { Navbar } from './components/Navbar';
import { MongoAlertBanner } from './components/MongoAlertBanner';
import { MongoStatusModal } from './components/MongoStatusModal';
import { AuthModal } from './components/AuthModal';
import { StatCards } from './components/StatCards';
import { BudgetTracker } from './components/BudgetTracker';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { FilterBar } from './components/FilterBar';
import { TransactionTable } from './components/TransactionTable';
import { TransactionModal } from './components/TransactionModal';
import { ExportImportModal } from './components/ExportImportModal';

export const App = () => {
  const { user, isAuthenticated, demoLogin } = useAuth();
  const { showToast } = useToast();

  // Database status state
  const [dbStatus, setDbStatus] = useState(null);

  // App data state
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [allTransactionsForCharts, setAllTransactionsForCharts] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    category: 'all',
    datePreset: 'all',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'date',
    sortOrder: 'desc',
    page: 1,
    limit: 15,
  });

  // Modals state
  const [isMongoModalOpen, setIsMongoModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // 1. Fetch MongoDB Status
  const fetchHealth = useCallback(async () => {
    try {
      const res = await api.getHealth();
      setDbStatus(res.database);
    } catch (err) {
      console.warn('Backend server offline or unreachable:', err.message);
      setDbStatus({ connected: false, mode: 'offline' });
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  // 2. Fetch Summary & Chart Data
  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const summaryRes = await api.getTransactionSummary();
      if (summaryRes.success) {
        setSummary(summaryRes.summary);
      }

      // Fetch all transactions for frontend grouping and charts
      const allTxRes = await api.getTransactions({ limit: 1000 });
      if (allTxRes.success) {
        setAllTransactionsForCharts(allTxRes.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard summary:', err.message);
    }
  }, [isAuthenticated]);

  // 3. Fetch Filtered Table Transactions
  const fetchTableTransactions = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoadingTransactions(true);
    try {
      const res = await api.getTransactions({
        search: filters.search,
        type: filters.type,
        category: filters.category,
        startDate: filters.startDate,
        endDate: filters.endDate,
        minAmount: filters.minAmount,
        maxAmount: filters.maxAmount,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        page: filters.page,
        limit: filters.limit,
      });

      if (res.success) {
        setTransactions(res.data || []);
        setPagination({
          page: res.page || 1,
          totalPages: res.totalPages || 1,
          total: res.total || 0,
        });
      }
    } catch (err) {
      console.error('Failed to load transactions:', err.message);
      showToast(err.message || 'Error loading transactions', 'error');
    } finally {
      setLoadingTransactions(false);
    }
  }, [isAuthenticated, filters, showToast]);

  // Load data on auth change or filter change
  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, fetchDashboardData]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTableTransactions();
    }
  }, [isAuthenticated, fetchTableTransactions]);

  // Handlers
  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      category: 'all',
      datePreset: 'all',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      sortBy: 'date',
      sortOrder: 'desc',
      page: 1,
      limit: 15,
    });
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleOpenTransactionModal = (tx = null) => {
    setEditingTransaction(tx);
    setIsTransactionModalOpen(true);
  };

  const handleTransactionSubmit = async (formData, id) => {
    if (id) {
      await api.updateTransaction(id, formData);
    } else {
      await api.createTransaction(formData);
    }
    // Refresh both table and charts
    fetchDashboardData();
    fetchTableTransactions();
  };

  const handleDeleteTransaction = async (id) => {
    await api.deleteTransaction(id);
    fetchDashboardData();
    fetchTableTransactions();
  };

  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchDashboardData(), fetchTableTransactions(), fetchHealth()]);
      showToast('Dashboard data refreshed', 'success');
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  return (
    <div className="min-h-screen aurora-background fintech-grid-overlay text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white transition-colors duration-200 relative overflow-hidden">
      {/* Soft Ambient Aurora Gradient Orbs behind content */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/[0.08] rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-20 right-10 w-[650px] h-[650px] bg-purple-600/[0.11] rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute bottom-20 left-10 w-[550px] h-[550px] bg-indigo-500/[0.08] rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* MongoDB Status Alert Banner */}
      <MongoAlertBanner
        dbStatus={dbStatus}
        onOpenModal={() => setIsMongoModalOpen(true)}
      />

      {/* A. Top Navigation */}
      <Navbar
        dbStatus={dbStatus}
        onOpenMongoModal={() => setIsMongoModalOpen(true)}
        onOpenExportImport={() => setIsExportImportOpen(true)}
        onOpenTransactionModal={() => handleOpenTransactionModal(null)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 z-10">
        {!isAuthenticated ? (
          /* Guest Hero Showcase */
          <div className="py-12 sm:py-20 flex flex-col items-center text-center max-w-3xl mx-auto animate-in fade-in duration-500">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-6 shadow-sm shadow-purple-500/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full-Stack Personal Finance & Visual Analytics</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight mb-5">
              Master Your Money with{' '}
              <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                Intelligence
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mb-8 leading-relaxed">
              Track multi-category income and expenses, monitor monthly spending limits, and gain clear
              financial clarity through dynamic monthly cashflow analytics.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={demoLogin}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl btn-primary-glow font-bold text-sm cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Explore Live Demo (1-Click)</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-6 py-3.5 rounded-2xl glass-input hover:border-slate-500 text-white font-semibold text-sm transition-all cursor-pointer"
              >
                Sign In / Register
              </button>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-16 text-left w-full">
              <div className="glass-card rounded-3xl p-5 border border-white/[0.08]">
                <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-purple-400 w-fit mb-3">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">Monthly Analytics</h3>
                <p className="text-xs text-slate-400">
                  Transactions grouped by month on the frontend with interactive income vs expense
                  comparisons.
                </p>
              </div>

              <div className="glass-card rounded-3xl p-5 border border-white/[0.08]">
                <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-cyan-400 w-fit mb-3">
                  <PieChart className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">Sector Distribution</h3>
                <p className="text-xs text-slate-400">
                  Color-coded category breakdown revealing exactly where your money goes every month.
                </p>
              </div>

              <div className="glass-card rounded-3xl p-5 border border-white/[0.08]">
                <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-emerald-400 w-fit mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">Resilient Storage</h3>
                <p className="text-xs text-slate-400">
                  Native MongoDB connection with graceful offline in-memory store so testing is 100%
                  uninterrupted.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <>
            {/* B. Welcome and Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Welcome back, <span className="bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">{user?.name || 'Explorer'}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Real-time cashflow analytics, monthly budget guardrail, and transaction ledger.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefreshAll}
                  className="p-2.5 rounded-2xl glass-input text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Refresh Dashboard Data"
                  id="dashboard-refresh-btn"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-purple-400' : ''}`} />
                </button>
                <button
                  onClick={() => handleOpenTransactionModal(null)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl btn-primary-glow font-semibold text-xs cursor-pointer"
                  id="dashboard-add-btn"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Transaction</span>
                </button>
              </div>
            </div>

            {/* C. Financial Overview (4 KPI Cards) */}
            <StatCards summary={summary} />

            {/* D. Monthly Spending Limit (Full-width Budget Card) */}
            <BudgetTracker transactions={allTransactionsForCharts} />

            {/* E. Analytics (Two-Column Responsive Cashflow & Category Breakdown) */}
            <AnalyticsCharts transactions={allTransactionsForCharts} />

            {/* F. Transaction Management (Filter Controls & Ledger Table) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Ledger Records</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Filter, sort, and manage all your historical transaction entries
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {pagination.total} Records
                </span>
              </div>
              <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
              />
              <TransactionTable
                transactions={transactions}
                loading={loadingTransactions}
                onEdit={handleOpenTransactionModal}
                onDelete={handleDeleteTransaction}
                onOpenAdd={() => handleOpenTransactionModal(null)}
                onResetFilters={handleResetFilters}
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </main>

      {/* G. Footer */}
      <footer className="border-t border-white/[0.08] glass-panel py-6 px-4 mt-16 z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">ExpenFlow PRO</span>
            <span>•</span>
            <span className="text-slate-500">Fintech Intelligence & Ledger Suite</span>
            <span>•</span>
            <span className="text-slate-500 hidden md:inline">Amounts stored as floating-point numbers & dates as ISO-8601</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMongoModalOpen(true)}
              className="text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Database Status ({dbStatus?.connected ? 'Online Mongoose' : 'Offline In-Memory'})</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Application Modals */}
      <MongoStatusModal
        isOpen={isMongoModalOpen}
        onClose={() => setIsMongoModalOpen(false)}
        dbStatus={dbStatus}
        onStatusChange={(newStatus) => setDbStatus(newStatus)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        transaction={editingTransaction}
        onSubmit={handleTransactionSubmit}
      />

      <ExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
        transactions={allTransactionsForCharts}
        onRefresh={handleRefreshAll}
      />
    </div>
  );
};

export default App;
