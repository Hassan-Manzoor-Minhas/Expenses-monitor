import React, { useState } from 'react';
import {
  Edit3,
  Trash2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';
import { formatCurrency, formatDate, formatRelativeDate } from '../utils/formatters';
import { getCategoryColor } from '../utils/chartHelpers';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

export const TransactionTable = ({
  transactions = [],
  loading,
  onEdit,
  onDelete,
  onOpenAdd,
  onResetFilters,
  pagination = { page: 1, totalPages: 1, total: 0 },
  onPageChange,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const currency = user?.currency || 'USD';

  const [deletingId, setDeletingId] = useState(null);

  const confirmDelete = async (id, description) => {
    try {
      await onDelete(id);
      showToast(`Deleted transaction "${description}"`, 'info');
      setDeletingId(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete transaction', 'error');
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-3xl p-14 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-3 shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
        <span className="text-xs text-slate-400 font-medium tracking-wide">Syncing financial ledger...</span>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-14 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
          <Layers className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-white mb-1.5">No Matching Transactions</h3>
        <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
          No records matched your search query or filter parameters. Reset your filters or record a new transaction.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={onResetFilters}
            className="px-4 py-2 rounded-2xl glass-input text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            Reset Filters
          </button>
          <button
            onClick={onOpenAdd}
            className="px-4 py-2 rounded-2xl text-xs font-semibold btn-primary-glow cursor-pointer"
          >
            Add Transaction
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl border border-white/[0.08] overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Financial Ledger</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Displaying {transactions.length} of {pagination.total || transactions.length} total transaction entries
          </p>
        </div>

        {/* Pagination buttons */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-xl glass-input text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-300 font-mono text-[11px] px-2.5 py-1 rounded-xl bg-slate-900/80 border border-white/[0.06]">
              Page {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-xl glass-input text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-white/[0.06]">
              <th className="py-3.5 px-5">Date</th>
              <th className="py-3.5 px-5">Description</th>
              <th className="py-3.5 px-5">Category</th>
              <th className="py-3.5 px-5">Method</th>
              <th className="py-3.5 px-5 text-right">Amount</th>
              <th className="py-3.5 px-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {transactions.map((tx) => {
              const id = tx.id || tx._id;
              const isIncome = tx.type === 'income';
              const catColor = getCategoryColor(tx.category);

              return (
                <tr
                  key={id}
                  className="hover:bg-white/[0.03] transition-colors group"
                >
                  {/* Date Column */}
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <span className="font-semibold text-slate-200 block">
                      {formatRelativeDate(tx.date)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatDate(tx.date)}
                    </span>
                  </td>

                  {/* Description Column */}
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-white group-hover:text-purple-300 transition-colors">
                      {tx.description}
                    </div>
                    {tx.notes && (
                      <p className="text-[11px] text-slate-400 truncate max-w-xs flex items-center gap-1 mt-0.5">
                        <FileText className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{tx.notes}</span>
                      </p>
                    )}
                    {Array.isArray(tx.tags) && tx.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tx.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-white/[0.05]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Category Column */}
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border shadow-sm"
                      style={{
                        backgroundColor: `${catColor}18`,
                        borderColor: `${catColor}35`,
                        color: catColor,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: catColor }}
                      />
                      <span>{tx.category}</span>
                    </span>
                  </td>

                  {/* Payment Method Column */}
                  <td className="py-3.5 px-5 whitespace-nowrap text-slate-400 text-[11px]">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-900/80 border border-white/[0.06] font-medium text-slate-300">
                      {tx.paymentMethod || 'Debit Card'}
                    </span>
                  </td>

                  {/* Amount Column */}
                  <td className="py-3.5 px-5 whitespace-nowrap text-right font-mono font-bold text-sm">
                    <span
                      className={
                        isIncome
                          ? 'text-emerald-400 flex items-center justify-end gap-1'
                          : 'text-rose-400 flex items-center justify-end gap-1'
                      }
                    >
                      <span className="text-xs">{isIncome ? '+' : '-'}</span>
                      <span>{formatCurrency(tx.amount, currency)}</span>
                    </span>
                  </td>

                  {/* Actions Column */}
                  <td className="py-3.5 px-5 whitespace-nowrap text-center">
                    {deletingId === id ? (
                      <div className="inline-flex items-center gap-1.5 bg-[#090e1c] border border-rose-500/40 p-1 rounded-xl animate-in fade-in">
                        <span className="text-[10px] text-rose-300 font-semibold px-1">Delete?</span>
                        <button
                          onClick={() => confirmDelete(id, tx.description)}
                          className="px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold cursor-pointer"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="px-1.5 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 opacity-75 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(tx)}
                          className="p-1.5 rounded-xl glass-input text-slate-400 hover:text-purple-400 hover:border-purple-500/40 transition-colors cursor-pointer"
                          title="Edit transaction"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(id)}
                          className="p-1.5 rounded-xl glass-input text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors cursor-pointer"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
