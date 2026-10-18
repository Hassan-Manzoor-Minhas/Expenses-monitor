import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Tag, CreditCard, FileText, Check, Sparkles } from 'lucide-react';
import { formatInputDate, CURRENCY_SYMBOLS } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Housing & Rent',
  'Transportation',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Other',
];

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Gift / Bonus',
  'Other',
];

const PAYMENT_METHODS = [
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Cash',
  'Digital Wallet',
  'Other',
];

export const TransactionModal = ({
  isOpen,
  onClose,
  transaction, // if non-null, editing mode; if null, create mode
  onSubmit,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const currency = user?.currency || 'USD';
  const currencySymbol = CURRENCY_SYMBOLS[currency] || '$';

  const [type, setType] = useState('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(formatInputDate(new Date()));
  const [paymentMethod, setPaymentMethod] = useState('Debit Card');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Populate form if editing
  useEffect(() => {
    if (transaction) {
      setType(transaction.type || 'expense');
      setDescription(transaction.description || '');
      setAmount(transaction.amount !== undefined ? String(transaction.amount) : '');
      setCategory(transaction.category || EXPENSE_CATEGORIES[0]);
      setDate(formatInputDate(transaction.date));
      setPaymentMethod(transaction.paymentMethod || 'Debit Card');
      setNotes(transaction.notes || '');
      setTagsInput(Array.isArray(transaction.tags) ? transaction.tags.join(', ') : '');
    } else {
      setType('expense');
      setDescription('');
      setAmount('');
      setCategory(EXPENSE_CATEGORIES[0]);
      setDate(formatInputDate(new Date()));
      setPaymentMethod('Debit Card');
      setNotes('');
      setTagsInput('');
    }
    setError('');
  }, [transaction, isOpen]);

  // Adjust default category when type flips
  const handleTypeSwitch = (newType) => {
    setType(newType);
    if (newType === 'expense') {
      if (!EXPENSE_CATEGORIES.includes(category)) {
        setCategory(EXPENSE_CATEGORIES[0]);
      }
    } else {
      if (!INCOME_CATEGORIES.includes(category)) {
        setCategory(INCOME_CATEGORIES[0]);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || !isFinite(numAmount) || numAmount <= 0) {
      setError('Amount must be a valid positive number greater than 0');
      return;
    }

    if (!date) {
      setError('Date is required');
      return;
    }

    // Process comma-separated tags
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    // Store amount as number, date as ISO date
    const payload = {
      description: description.trim(),
      amount: numAmount,
      type,
      category,
      date: new Date(date).toISOString(),
      paymentMethod,
      notes: notes.trim(),
      tags,
    };

    setLoading(true);
    try {
      await onSubmit(payload, transaction?.id || transaction?._id);
      showToast(
        transaction ? 'Transaction updated successfully!' : 'Transaction created successfully!',
        'success'
      );
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Frosted Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xl transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-7 border border-white/[0.12] shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 my-8 overflow-hidden">
        {/* Subtle Ambient Top Glow */}
        <div className="absolute top-0 right-1/3 w-64 h-24 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {transaction ? 'Edit Transaction Entry' : 'Record New Transaction'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Amounts stored as numeric values & dates in ISO-8601
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl glass-input text-slate-400 hover:text-white transition-colors cursor-pointer"
            id="tx-modal-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Type Switcher Pills */}
        <div className="flex p-1 bg-slate-900/90 rounded-2xl mb-5 border border-white/[0.08]">
          <button
            type="button"
            id="tx-type-expense-btn"
            onClick={() => handleTypeSwitch('expense')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              type === 'expense'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Expense (-)
          </button>
          <button
            type="button"
            id="tx-type-income-btn"
            onClick={() => handleTypeSwitch('income')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              type === 'income'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Income (+)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Description */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Description <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              id="tx-desc-input"
              required
              placeholder="e.g. AWS Cloud Services, Client Payment, Grocery"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Amount & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Amount */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Amount ({currency} {currencySymbol.trim()}) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="text-purple-400 font-bold absolute left-3.5 top-2.5 text-xs font-mono">
                  {currencySymbol.trim()}
                </span>
                <input
                  type="number"
                  id="tx-amount-input"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl glass-input text-xs text-white font-mono placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Date <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="date"
                  id="tx-date-input"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl glass-input text-xs text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Category & Payment Method Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Category Select */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Category</label>
              <div className="relative">
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <select
                  id="tx-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full appearance-none pl-9 pr-8 py-2.5 rounded-2xl glass-input text-xs text-white cursor-pointer focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-900 text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Payment Method</label>
              <div className="relative">
                <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <select
                  id="tx-method-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full appearance-none pl-9 pr-8 py-2.5 rounded-2xl glass-input text-xs text-white cursor-pointer focus:outline-none"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method} className="bg-slate-900 text-white">
                      {method}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Notes <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                id="tx-notes-input"
                placeholder="Additional memo or reference details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Tags <span className="text-slate-500 font-normal">(Comma-separated)</span>
            </label>
            <input
              type="text"
              id="tx-tags-input"
              placeholder="e.g. personal, tax, business"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3.5 py-2 rounded-2xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl glass-input text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="tx-submit-btn"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold btn-primary-glow cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{transaction ? 'Save Changes' : 'Record Transaction'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
