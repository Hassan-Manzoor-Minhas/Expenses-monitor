import React, { useState, useMemo } from 'react';
import { BarChart3, PieChart as PieIcon, Layers } from 'lucide-react';
import { groupTransactionsByMonth, groupExpensesByCategory } from '../utils/chartHelpers';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

export const AnalyticsCharts = ({ transactions = [] }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  const [timeRange, setTimeRange] = useState('6'); // '3', '6', '12', 'all'
  const [activeHoverMonth, setActiveHoverMonth] = useState(null);

  // Group chart data by month on the frontend
  const monthlyData = useMemo(() => {
    const limit = timeRange === 'all' ? 24 : Number(timeRange);
    return groupTransactionsByMonth(transactions, limit);
  }, [transactions, timeRange]);

  // Category breakdown for expenses
  const categoryData = useMemo(() => {
    return groupExpensesByCategory(transactions);
  }, [transactions]);

  // Find max value for monthly chart scaling
  const maxVal = useMemo(() => {
    let max = 100;
    monthlyData.forEach((m) => {
      if (m.income > max) max = m.income;
      if (m.expense > max) max = m.expense;
    });
    return Math.ceil(max * 1.15);
  }, [monthlyData]);

  // Total expense across all categories
  const totalCategoryExpense = useMemo(() => {
    return categoryData.reduce((acc, c) => acc + c.amount, 0);
  }, [categoryData]);

  // SVG Donut Calculations for Category Ring without mutation
  const donutSegments = useMemo(() => {
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const topCategories = categoryData.slice(0, 5);

    let runningTotal = 0;
    return topCategories.map((cat) => {
      const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -((runningTotal / 100) * circumference);
      runningTotal += cat.percentage;
      return {
        ...cat,
        strokeDasharray,
        strokeDashoffset,
      };
    });
  }, [categoryData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Monthly Trends Chart (7 cols on lg, 12 on sm) */}
      <div className="lg:col-span-7 glass-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-purple-400 group-hover:border-purple-500/30 transition-all">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Monthly Cashflow Analytics</h3>
                <p className="text-xs text-slate-400">Income vs. expenses grouped by month</p>
              </div>
            </div>

            {/* Time range filter pills */}
            <div className="flex items-center p-1 bg-slate-900/90 rounded-2xl border border-white/[0.08] text-xs">
              {[
                { id: '3', label: '3M' },
                { id: '6', label: '6M' },
                { id: '12', label: '1Y' },
                { id: 'all', label: 'All' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTimeRange(tab.id)}
                  className={`px-3 py-1 rounded-xl font-semibold transition-all ${
                    timeRange === tab.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-purple-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center gap-5 mb-4 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span>Income</span>
            </div>
            <div className="flex items-center gap-2 text-rose-400 font-medium">
              <span className="w-3 h-3 rounded-full bg-rose-400 shadow-[0_0_8px_#f43f5e]" />
              <span>Expenses</span>
            </div>
            {activeHoverMonth && (
              <span className="ml-auto text-purple-300 font-semibold animate-in fade-in text-xs">
                {activeHoverMonth.label}: Net{' '}
                <span className={activeHoverMonth.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {formatCurrency(activeHoverMonth.net, currency)}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* SVG Monthly Bar Chart */}
        {monthlyData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
            <Layers className="w-8 h-8 mb-2 opacity-40" />
            <span>No transaction data available for this range</span>
          </div>
        ) : (
          <div className="w-full h-64 relative flex items-end justify-between gap-2 sm:gap-4 pt-10 pb-6 px-2 border-b border-white/[0.08]">
            {monthlyData.map((m) => {
              const incomeHeight = maxVal > 0 ? (m.income / maxVal) * 100 : 0;
              const expenseHeight = maxVal > 0 ? (m.expense / maxVal) * 100 : 0;
              const isHovered = activeHoverMonth?.key === m.key;

              return (
                <div
                  key={m.key}
                  onMouseEnter={() => setActiveHoverMonth(m)}
                  onMouseLeave={() => setActiveHoverMonth(null)}
                  className="flex-1 h-full flex flex-col justify-end items-center group/bar relative cursor-pointer"
                >
                  {/* Floating tooltip */}
                  {isHovered && (
                    <div className="absolute -top-14 z-30 bg-[#080d1a] border border-white/[0.15] p-2.5 rounded-2xl shadow-2xl text-[11px] whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 backdrop-blur-md">
                      <p className="font-bold text-white mb-1 border-b border-white/[0.08] pb-0.5">{m.label}</p>
                      <p className="text-emerald-400 font-mono">Inflow: +{formatCurrency(m.income, currency)}</p>
                      <p className="text-rose-400 font-mono">Outflow: -{formatCurrency(m.expense, currency)}</p>
                    </div>
                  )}

                  {/* Rounded pill bars side by side matching reference design */}
                  <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full">
                    {/* Income Bar */}
                    <div
                      className="w-full max-w-[14px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full transition-all duration-300 group-hover/bar:shadow-[0_0_12px_#34d399] group-hover/bar:brightness-125"
                      style={{ height: `${Math.max(6, incomeHeight)}%` }}
                    />
                    {/* Expense Bar */}
                    <div
                      className="w-full max-w-[14px] bg-gradient-to-t from-rose-600 to-rose-400 rounded-full transition-all duration-300 group-hover/bar:shadow-[0_0_12px_#f43f5e] group-hover/bar:brightness-125"
                      style={{ height: `${Math.max(6, expenseHeight)}%` }}
                    />
                  </div>

                  {/* Month Label */}
                  <span
                    className={`text-[10px] sm:text-xs mt-2.5 transition-colors font-medium ${
                      isHovered ? 'text-purple-300 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Subtitle */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
          <span>Dynamic Scale: {formatCurrency(0, currency)} – {formatCurrency(maxVal, currency)}</span>
          <span>{monthlyData.length} monthly active intervals</span>
        </div>
      </div>

      {/* 2. Category Spending Breakdown (5 cols on lg, 12 on sm) */}
      <div className="lg:col-span-5 glass-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-cyan-400 group-hover:border-cyan-500/30 transition-all">
                <PieIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Category Distribution</h3>
                <p className="text-xs text-slate-400">Top spending sectors</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
              {categoryData.length} Sectors
            </span>
          </div>

          {/* Donut preview & top categories */}
          {categoryData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
              <Layers className="w-8 h-8 mb-2 opacity-40" />
              <span>No expense records recorded</span>
            </div>
          ) : (
            <div>
              {/* Sleek SVG Mini Donut visualization inspired by reference design */}
              <div className="flex items-center justify-center my-3 relative">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="10"
                    fill="none"
                  />
                  {donutSegments.map((segment) => (
                    <circle
                      key={segment.category}
                      cx="50"
                      cy="50"
                      r="38"
                      stroke={segment.color}
                      strokeWidth="10"
                      strokeDasharray={segment.strokeDasharray}
                      strokeDashoffset={segment.strokeDashoffset}
                      strokeLinecap="round"
                      fill="none"
                      className="transition-all duration-700 hover:opacity-80"
                    />
                  ))}
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-slate-400 font-medium">Outflow</span>
                  <span className="text-xs font-extrabold text-white">100%</span>
                </div>
              </div>

              {/* Category Rows with Custom Progress Pills */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {categoryData.map((cat) => (
                  <div key={cat.category} className="group/item">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-semibold text-slate-200 group-hover/item:text-white transition-colors">
                          {cat.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono text-[11px]">
                          {formatCurrency(cat.amount, currency)}
                        </span>
                        <span className="text-xs font-bold text-white px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.06]">
                          {cat.percentage}%
                        </span>
                      </div>
                    </div>
                    {/* Category pill progress bar */}
                    <div className="w-full bg-slate-900/80 rounded-full h-1.5 overflow-hidden p-[1px] border border-white/[0.05]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(3, cat.percentage)}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-3.5 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-300">
          <span>Total Monthly Outflow:</span>
          <span className="font-extrabold text-white text-sm font-mono">
            {formatCurrency(totalCategoryExpense, currency)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
