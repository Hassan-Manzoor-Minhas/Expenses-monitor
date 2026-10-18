import React from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

export const StatCards = ({ summary }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  const balance = summary?.totalBalance ?? 0;
  const income = summary?.totalIncome ?? 0;
  const expense = summary?.totalExpense ?? 0;
  const savingsRate = summary?.savingsRate ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. Net Balance Card */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 relative overflow-hidden group">
        {/* Soft Ambient Aurora Gradient Orb */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-500" />
        
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
            Net Balance
          </span>
          <div className="p-2.5 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-cyan-400 group-hover:border-cyan-500/30 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
            {formatCurrency(balance, currency)}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
          {balance >= 0 ? (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
              <span className="p-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                <ArrowUpRight className="w-3 h-3" />
              </span>
              <span>Positive Cashflow</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-semibold text-rose-400">
              <span className="p-0.5 rounded-full bg-rose-500/15 border border-rose-500/30">
                <ArrowDownRight className="w-3 h-3" />
              </span>
              <span>Deficit Balance</span>
            </span>
          )}
          <span className="text-slate-400 text-[11px]">Cumulative</span>
        </div>
      </div>

      {/* 2. Total Income Card */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500" />

        <div className="flex items-center justify-between mb-3.5">
          <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
            Total Income
          </span>
          <div className="p-2.5 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-emerald-400 group-hover:border-emerald-500/30 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight font-sans">
            +{formatCurrency(income, currency)}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span>Received Inflow</span>
          </span>
          <span className="text-slate-400 text-[11px]">All-Time</span>
        </div>
      </div>

      {/* 3. Total Expenses Card */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/20 transition-all duration-500" />

        <div className="flex items-center justify-between mb-3.5">
          <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
            Total Expenses
          </span>
          <div className="p-2.5 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-rose-400 group-hover:border-rose-500/30 group-hover:shadow-[0_0_15px_rgba(244,63,94,0.2)] transition-all">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-rose-400 tracking-tight font-sans">
            -{formatCurrency(expense, currency)}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
          <span className="inline-flex items-center gap-1 text-slate-300">
            <span className="font-semibold text-rose-400">
              {income > 0 ? `${Math.round((expense / income) * 100)}%` : '0%'}
            </span>
            <span>of earnings</span>
          </span>
          <span className="text-slate-400 text-[11px]">Disbursed</span>
        </div>
      </div>

      {/* 4. Savings Rate Card */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-all duration-500" />

        <div className="flex items-center justify-between mb-3.5">
          <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
            Savings Rate
          </span>
          <div className="p-2.5 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-purple-400 group-hover:border-purple-500/30 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all">
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>

        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-extrabold text-purple-200 tracking-tight font-sans">
            {savingsRate}%
          </span>
          <span className="text-[11px] font-semibold text-purple-300/80 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
            {savingsRate >= 20 ? 'Optimal' : 'Needs Focus'}
          </span>
        </div>

        {/* Sleek rounded capsule progress bar */}
        <div className="pt-2 border-t border-white/[0.06]">
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden p-[1px] border border-white/[0.05]">
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]"
              style={{ width: `${Math.max(0, Math.min(100, savingsRate))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCards;
