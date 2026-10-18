import React, { useState } from 'react';
import {
  Search,
  Filter,
  Calendar,
  ArrowUpDown,
  RotateCcw,
  ChevronDown,
  Tag,
  DollarSign,
  SlidersHorizontal,
  Check,
  X,
} from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';

const CATEGORIES = [
  'Food & Dining',
  'Housing & Rent',
  'Transportation',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Salary',
  'Freelance',
  'Investment',
  'Gift / Bonus',
  'Other',
];

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Date: Newest First' },
  { value: 'date-asc', label: 'Date: Oldest First' },
  { value: 'amount-desc', label: 'Amount: Highest First' },
  { value: 'amount-asc', label: 'Amount: Lowest First' },
];

export const FilterBar = ({ filters, onFilterChange, onReset }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Dropdown refs for outside click & Escape dismissal
  const categoryRef = useClickOutside(() => setCategoryDropdownOpen(false), categoryDropdownOpen);
  const sortRef = useClickOutside(() => setSortDropdownOpen(false), sortDropdownOpen);
  const advancedRef = useClickOutside(() => setShowAdvanced(false), showAdvanced);

  const handleTextChange = (e) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleClearSearch = () => {
    onFilterChange({ ...filters, search: '' });
  };

  const handleTypeChange = (type) => {
    onFilterChange({ ...filters, type });
  };

  const handleCategorySelect = (category) => {
    onFilterChange({ ...filters, category });
    setCategoryDropdownOpen(false);
  };

  const handleSortSelect = (sortVal) => {
    const [sortBy, sortOrder] = sortVal.split('-');
    onFilterChange({ ...filters, sortBy, sortOrder });
    setSortDropdownOpen(false);
  };

  const handleDatePreset = (preset) => {
    const now = new Date();
    let startDate = '';
    let endDate = '';

    if (preset === 'this-month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
    } else if (preset === 'last-30') {
      const past = new Date(now);
      past.setDate(past.getDate() - 30);
      startDate = past.toISOString();
      endDate = now.toISOString();
    } else if (preset === 'this-year') {
      startDate = new Date(now.getFullYear(), 0, 1).toISOString();
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59).toISOString();
    }

    onFilterChange({
      ...filters,
      datePreset: preset,
      startDate,
      endDate,
    });
  };

  const isFiltered =
    filters.search ||
    filters.type !== 'all' ||
    filters.category !== 'all' ||
    filters.datePreset !== 'all' ||
    filters.minAmount ||
    filters.maxAmount ||
    filters.startDate ||
    filters.endDate;

  const currentSortVal = `${filters.sortBy || 'date'}-${filters.sortOrder || 'desc'}`;
  const currentSortLabel =
    SORT_OPTIONS.find((s) => s.value === currentSortVal)?.label || 'Date: Newest First';

  return (
    <div className="glass-card rounded-3xl p-4 sm:p-5 border border-white/[0.08] mb-6 space-y-4">
      {/* Top Filter Bar: Search, Type Tabs, Category, Sort, Advanced Toggle, Reset */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            id="filter-search-input"
            value={filters.search || ''}
            onChange={handleTextChange}
            placeholder="Search description, notes, category..."
            className="w-full pl-10 pr-9 py-2 rounded-2xl glass-input text-xs text-white placeholder-slate-400 focus:outline-none"
          />
          {filters.search && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Type Toggle Pills: All / Expense / Income */}
        <div className="flex p-1 bg-slate-900/90 rounded-2xl border border-white/[0.08] text-xs shrink-0">
          <button
            type="button"
            id="filter-type-all"
            onClick={() => handleTypeChange('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              filters.type === 'all'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            type="button"
            id="filter-type-expense"
            onClick={() => handleTypeChange('expense')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              filters.type === 'expense'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Expenses
          </button>
          <button
            type="button"
            id="filter-type-income"
            onClick={() => handleTypeChange('income')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              filters.type === 'income'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Income
          </button>
        </div>

        {/* Category Custom Dropdown (Closes on outside click & Escape) */}
        <div ref={categoryRef} className="relative min-w-[155px]">
          <button
            type="button"
            id="filter-category-select"
            onClick={() => {
              setCategoryDropdownOpen(!categoryDropdownOpen);
              setSortDropdownOpen(false);
            }}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-2xl glass-input hover:border-purple-400/50 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
            aria-expanded={categoryDropdownOpen}
            aria-haspopup="listbox"
          >
            <span className="flex items-center gap-1.5 truncate">
              <Tag className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate">
                {filters.category && filters.category !== 'all' ? filters.category : 'All Categories'}
              </span>
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                categoryDropdownOpen ? 'rotate-180 text-purple-400' : ''
              }`}
            />
          </button>

          {categoryDropdownOpen && (
            <div
              role="listbox"
              className="absolute right-0 mt-2 w-56 max-h-72 overflow-y-auto glass-panel rounded-2xl border border-white/[0.1] p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/[0.08] mb-1">
                Filter by Category
              </div>
              <button
                type="button"
                role="option"
                aria-selected={filters.category === 'all' || !filters.category}
                onClick={() => handleCategorySelect('all')}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                  filters.category === 'all' || !filters.category
                    ? 'bg-purple-600/25 text-purple-200 font-semibold border border-purple-500/30'
                    : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <span>All Categories</span>
                {(filters.category === 'all' || !filters.category) && (
                  <Check className="w-3.5 h-3.5 text-purple-400" />
                )}
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  role="option"
                  aria-selected={filters.category === cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                    filters.category === cat
                      ? 'bg-purple-600/25 text-purple-200 font-semibold border border-purple-500/30'
                      : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  {filters.category === cat && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort Order Custom Dropdown (Closes on outside click & Escape) */}
        <div ref={sortRef} className="relative min-w-[165px]">
          <button
            type="button"
            id="filter-sort-select"
            onClick={() => {
              setSortDropdownOpen(!sortDropdownOpen);
              setCategoryDropdownOpen(false);
            }}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-2xl glass-input hover:border-purple-400/50 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
            aria-expanded={sortDropdownOpen}
            aria-haspopup="listbox"
          >
            <span className="flex items-center gap-1.5 truncate">
              <ArrowUpDown className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate">{currentSortLabel}</span>
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                sortDropdownOpen ? 'rotate-180 text-purple-400' : ''
              }`}
            />
          </button>

          {sortDropdownOpen && (
            <div
              role="listbox"
              className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl border border-white/[0.1] p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/[0.08] mb-1">
                Sort Transactions
              </div>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={currentSortVal === opt.value}
                  onClick={() => handleSortSelect(opt.value)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                    currentSortVal === opt.value
                      ? 'bg-purple-600/25 text-purple-200 font-semibold border border-purple-500/30'
                      : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <span>{opt.label}</span>
                  {currentSortVal === opt.value && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Toggle Advanced Filters Button */}
        <button
          type="button"
          id="filter-toggle-advanced-btn"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`px-3 py-2 rounded-2xl text-xs font-semibold border flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
            showAdvanced
              ? 'bg-purple-600/20 border-purple-500/40 text-purple-300 shadow-sm'
              : 'glass-input text-slate-300 hover:text-white hover:border-slate-500'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {isFiltered && (
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
          )}
        </button>

        {/* Reset Button */}
        {isFiltered && (
          <button
            type="button"
            id="filter-reset-btn"
            onClick={onReset}
            className="p-2 rounded-2xl glass-input text-rose-400 hover:bg-rose-500/15 hover:border-rose-500/35 transition-colors cursor-pointer"
            title="Reset all active filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Advanced Filter Popover / Drawer */}
      {showAdvanced && (
        <div
          ref={advancedRef}
          className="pt-4 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-200 text-xs"
        >
          {/* Date Range Presets */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-semibold text-[11px] uppercase tracking-wider">
              Date Presets
            </label>
            <div className="flex gap-1 bg-slate-900/80 p-1 rounded-2xl border border-white/[0.06]">
              {[
                { id: 'all', label: 'All' },
                { id: 'this-month', label: 'Month' },
                { id: 'last-30', label: '30D' },
                { id: 'this-year', label: 'Year' },
              ].map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleDatePreset(preset.id)}
                  className={`flex-1 py-1.5 rounded-xl font-semibold text-[11px] transition-all ${
                    filters.datePreset === preset.id
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Min Amount */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-semibold text-[11px] uppercase tracking-wider">
              Min Amount
            </label>
            <div className="relative">
              <span className="text-slate-400 absolute left-3 top-2 text-xs">$</span>
              <input
                type="number"
                id="filter-min-amount"
                min="0"
                step="5"
                placeholder="0"
                value={filters.minAmount || ''}
                onChange={(e) => onFilterChange({ ...filters, minAmount: e.target.value })}
                className="w-full pl-7 pr-3 py-1.5 rounded-2xl glass-input text-xs text-white"
              />
            </div>
          </div>

          {/* Max Amount */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-semibold text-[11px] uppercase tracking-wider">
              Max Amount
            </label>
            <div className="relative">
              <span className="text-slate-400 absolute left-3 top-2 text-xs">$</span>
              <input
                type="number"
                id="filter-max-amount"
                min="0"
                step="10"
                placeholder="No limit"
                value={filters.maxAmount || ''}
                onChange={(e) => onFilterChange({ ...filters, maxAmount: e.target.value })}
                className="w-full pl-7 pr-3 py-1.5 rounded-2xl glass-input text-xs text-white"
              />
            </div>
          </div>

          {/* Custom Date Range */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-semibold text-[11px] uppercase tracking-wider">
              Custom Date Start / End
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={filters.startDate ? filters.startDate.slice(0, 10) : ''}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    datePreset: 'custom',
                    startDate: e.target.value ? new Date(e.target.value).toISOString() : '',
                  })
                }
                className="w-full px-2 py-1.5 rounded-2xl glass-input text-[11px] text-white"
              />
              <span className="text-slate-500">to</span>
              <input
                type="date"
                value={filters.endDate ? filters.endDate.slice(0, 10) : ''}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    datePreset: 'custom',
                    endDate: e.target.value ? new Date(e.target.value).toISOString() : '',
                  })
                }
                className="w-full px-2 py-1.5 rounded-2xl glass-input text-[11px] text-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
