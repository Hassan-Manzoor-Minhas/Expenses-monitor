import React, { useState } from 'react';
import { Target, Edit2, Check, X, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

export const BudgetTracker = ({ transactions = [] }) => {
  const { user, updateBudgetLimit } = useAuth();
  const { showToast } = useToast();
  const currency = user?.currency || 'USD';

  const budgetLimit = user?.budgetLimit || 2500;
  const [isEditing, setIsEditing] = useState(false);
  const [newLimit, setNewLimit] = useState(budgetLimit);

  // Calculate current month's expenses
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const currentMonthExpenses = transactions
    .filter((tx) => {
      if (tx.type !== 'expense' || !tx.date) return false;
      const d = new Date(tx.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const spent = Math.round(currentMonthExpenses * 100) / 100;
  const remaining = Math.max(0, Math.round((budgetLimit - spent) * 100) / 100);
  const percentUsed = budgetLimit > 0 ? Math.round((spent / budgetLimit) * 100) : 0;
  const isOverBudget = spent > budgetLimit;

  const handleSaveBudget = async () => {
    const num = Number(newLimit);
    if (isNaN(num) || num <= 0) {
      showToast('Please enter a valid positive budget amount', 'error');
      return;
    }
    await updateBudgetLimit(num);
    setIsEditing(false);
    showToast(`Monthly budget updated to ${formatCurrency(num, currency)}`, 'success');
  };

  const getStatusBadge = () => {
    if (percentUsed >= 100) {
      return 'text-rose-300 bg-rose-500/15 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)]';
    }
    if (percentUsed >= 80) {
      return 'text-amber-300 bg-amber-500/15 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]';
    }
    return 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]';
  };

  const getBarGradient = () => {
    if (percentUsed >= 100) return 'from-rose-500 via-rose-600 to-red-600 shadow-[0_0_12px_rgba(244,63,94,0.4)]';
    if (percentUsed >= 80) return 'from-amber-400 via-orange-500 to-rose-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]';
    return 'from-purple-500 via-indigo-400 to-cyan-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]';
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-7 relative overflow-hidden group">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-72 h-32 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Row: Title, Description, and Edit Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-purple-400 shadow-inner group-hover:border-purple-500/30 transition-all">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">Monthly Spending Limit</h3>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${getStatusBadge()}`}>
                {percentUsed}% Used
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Active financial guardrail for {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Edit Budget Controls */}
        {isEditing ? (
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-white/[0.1] animate-in fade-in zoom-in-95">
            <span className="text-xs text-slate-400 pl-2 font-mono">{currency}</span>
            <input
              type="number"
              min="1"
              step="50"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              className="w-28 px-2.5 py-1.5 rounded-xl glass-input text-xs text-white font-semibold focus:outline-none"
              autoFocus
            />
            <button
              onClick={handleSaveBudget}
              className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              title="Save Limit"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setNewLimit(budgetLimit);
                setIsEditing(false);
              }}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-input hover:border-purple-400/50 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            title="Adjust monthly budget limit"
            id="budget-edit-btn"
          >
            <Edit2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Edit Budget</span>
          </button>
        )}
      </div>

      {/* Progress Bar with Aurora Glow */}
      <div className="mb-6">
        <div className="w-full bg-slate-900/90 rounded-full h-3 overflow-hidden p-[2px] border border-white/[0.08] shadow-inner">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getBarGradient()} transition-all duration-700`}
            style={{ width: `${Math.min(100, percentUsed)}%` }}
          />
        </div>
      </div>

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/[0.06]">
        {/* Spent Amount */}
        <div className="flex flex-col">
          <span className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
            Spent This Month
          </span>
          <span className="text-lg sm:text-xl font-extrabold text-white font-sans tracking-tight">
            {formatCurrency(spent, currency)}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5">
            {transactions.filter(t => t.type === 'expense').length} expense transactions recorded
          </span>
        </div>

        {/* Remaining / Over Budget */}
        <div className="flex flex-col sm:items-center sm:text-center">
          <span className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
            Remaining Guardrail
          </span>
          <span
            className={`text-lg sm:text-xl font-extrabold font-sans tracking-tight ${
              isOverBudget ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {isOverBudget
              ? `-${formatCurrency(spent - budgetLimit, currency)} (Deficit)`
              : formatCurrency(remaining, currency)}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5">
            {isOverBudget ? 'Exceeded current ceiling' : 'Available for remaining days'}
          </span>
        </div>

        {/* Target Limit */}
        <div className="flex flex-col sm:items-end sm:text-right">
          <span className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
            Allocated Limit
          </span>
          <span className="text-lg sm:text-xl font-extrabold text-slate-200 font-sans tracking-tight">
            {formatCurrency(budgetLimit, currency)}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5">
            Set for 30-day budget cycle
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetTracker;
