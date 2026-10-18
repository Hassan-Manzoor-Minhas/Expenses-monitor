import React, { useState, useRef } from 'react';
import { X, Download, Upload, FileText, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from './Toast';
import confetti from 'canvas-confetti';

export const ExportImportModal = ({ isOpen, onClose, transactions = [], onRefresh }) => {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [importing, setImporting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // 1. Export CSV
  const handleExportCSV = () => {
    if (!transactions.length) {
      showToast('No transactions to export', 'error');
      return;
    }

    const headers = ['Date', 'Description', 'Amount', 'Type', 'Category', 'PaymentMethod', 'Notes', 'Tags'];
    const rows = transactions.map((t) => [
      `"${t.date || ''}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      Number(t.amount) || 0,
      `"${t.type || 'expense'}"`,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      `"${t.paymentMethod || 'Debit Card'}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      `"${Array.isArray(t.tags) ? t.tags.join(';') : ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `expenflow_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exported transactions as CSV spreadsheet!', 'success');
  };

  // 2. Export JSON
  const handleExportJSON = () => {
    if (!transactions.length) {
      showToast('No transactions to export', 'error');
      return;
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(transactions, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `expenflow_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exported raw JSON database backup!', 'success');
  };

  // 3. File Input Parse
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    const reader = new FileReader();

    if (file.name.endsWith('.json')) {
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          const list = Array.isArray(parsed) ? parsed : parsed.transactions || [];
          if (!list.length) throw new Error('File contains no transaction records');
          setPreviewData(list);
        } catch (err) {
          setError('Invalid JSON format: ' + err.message);
        }
      };
      reader.readAsText(file);
    } else {
      // Treat as CSV
      reader.onload = (event) => {
        try {
          const text = event.target.result;
          const lines = text.split('\n').filter((l) => l.trim().length > 0);
          if (lines.length < 2) throw new Error('CSV must contain a header and at least 1 record');

          const records = [];
          for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
            if (parts.length >= 4) {
              records.push({
                date: parts[0] ? new Date(parts[0]).toISOString() : new Date().toISOString(),
                description: parts[1] || 'Imported Entry',
                amount: parseFloat(parts[2]) || 1.0,
                type: parts[3]?.toLowerCase() === 'income' ? 'income' : 'expense',
                category: parts[4] || 'Other',
                paymentMethod: parts[5] || 'Debit Card',
                notes: parts[6] || '',
              });
            }
          }

          if (!records.length) throw new Error('No valid records parsed from CSV');
          setPreviewData(records);
        } catch (err) {
          setError('Failed to parse CSV file: ' + err.message);
        }
      };
      reader.readAsText(file);
    }
  };

  // 4. Confirm Import
  const handleConfirmImport = async () => {
    if (!previewData || !previewData.length) return;
    setImporting(true);
    try {
      const res = await api.importTransactions(previewData);
      showToast(`Successfully imported ${res.count || previewData.length} transactions!`, 'success');
      setPreviewData(null);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      setError(err.message || 'Import failed');
      showToast(err.message || 'Failed to import transactions', 'error');
    } finally {
      setImporting(false);
    }
  };

  // 5. Seed Demo Data
  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await api.seedTransactions();
      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      } catch {
        // Ignore optional animation failure
      }
      showToast('Loaded realistic multi-month sample transactions!', 'success');
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to seed sample data', 'error');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Frosted Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xl transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="glass-panel w-full max-w-lg rounded-3xl border border-white/[0.12] p-6 sm:p-7 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200 my-8 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-48 h-24 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white glass-input transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-5">
          <h2 className="text-xl font-extrabold text-white tracking-tight">Import & Export Ledger Data</h2>
          <p className="text-xs text-slate-400 mt-1">
            Backup your ledger, import CSV/JSON statements, or reset with sample transactions.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Export Options */}
        <div className="mb-5">
          <label className="block text-slate-300 font-bold text-xs uppercase tracking-wider mb-2">
            Export Records
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExportCSV}
              className="p-3.5 rounded-2xl glass-input hover:border-emerald-500/50 flex flex-col items-center justify-center gap-1.5 transition-all text-xs group cursor-pointer"
            >
              <Download className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-white">Export to CSV</span>
              <span className="text-[10px] text-slate-400">Spreadsheet ready (.csv)</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="p-3.5 rounded-2xl glass-input hover:border-purple-500/50 flex flex-col items-center justify-center gap-1.5 transition-all text-xs group cursor-pointer"
            >
              <FileText className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-white">Export to JSON</span>
              <span className="text-[10px] text-slate-400">Complete raw backup (.json)</span>
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="mb-5">
          <label className="block text-slate-300 font-bold text-xs uppercase tracking-wider mb-2">
            Import Records
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .json, text/csv, application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          {previewData ? (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/40 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-purple-300">
                  Ready to import {previewData.length} records
                </span>
                <button
                  onClick={() => setPreviewData(null)}
                  className="text-slate-400 hover:text-white text-[11px] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              <p className="text-slate-400 text-[11px] mb-3">
                First item: "{previewData[0]?.description}" - {previewData[0]?.amount} ({previewData[0]?.type})
              </p>
              <button
                onClick={handleConfirmImport}
                disabled={importing}
                className="w-full py-2.5 rounded-xl btn-primary-glow font-bold text-xs cursor-pointer disabled:opacity-50"
              >
                {importing ? 'Importing records...' : `Confirm Import of ${previewData.length} Records`}
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 rounded-2xl border border-dashed border-white/[0.15] hover:border-purple-500/60 bg-slate-900/40 hover:bg-slate-900/80 flex flex-col items-center justify-center gap-1.5 transition-all text-xs cursor-pointer group"
            >
              <Upload className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-slate-200">Click to upload CSV or JSON file</span>
              <span className="text-[10px] text-slate-400">Auto-detects structure and formats</span>
            </button>
          )}
        </div>

        {/* Demo Data Seeder */}
        <div className="pt-4 border-t border-white/[0.08]">
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="w-full p-3 rounded-2xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-purple-900/30 border border-purple-500/30 hover:border-purple-500/60 text-purple-200 text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Load Realistic Multi-Month Sample Dataset</span>
            </div>
            <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${seeding ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportImportModal;
