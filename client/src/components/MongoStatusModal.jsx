import React, { useState } from 'react';
import { Database, CheckCircle2, AlertTriangle, RefreshCw, X, Copy, Check, Terminal } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from './Toast';

export const MongoStatusModal = ({ isOpen, onClose, dbStatus, onStatusChange }) => {
  const { showToast } = useToast();
  const [reconnecting, setReconnecting] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(null);

  if (!isOpen) return null;

  const isConnected = dbStatus?.connected;

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    showToast('Command copied to clipboard!', 'info', 2000);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleReconnect = async () => {
    setReconnecting(true);
    try {
      const res = await api.reconnectDB();
      if (onStatusChange) onStatusChange(res.database);
      if (res.database.connected) {
        showToast('Successfully connected to MongoDB!', 'success');
      } else {
        showToast('MongoDB is still offline. Please check that MongoDB is running.', 'error');
      }
    } catch (err) {
      showToast('Connection attempt failed: ' + err.message, 'error');
    } finally {
      setReconnecting(false);
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
        <div className="absolute top-0 right-1/4 w-48 h-24 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white glass-input transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div
            className={`p-3 rounded-2xl border ${
              isConnected
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
            }`}
          >
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white tracking-tight">MongoDB Connection Status</h3>
            <p className="text-xs text-slate-400">Database health & architecture details</p>
          </div>
        </div>

        {/* Current Status Box */}
        <div
          className={`p-4 rounded-2xl border mb-6 ${
            isConnected
              ? 'bg-emerald-950/25 border-emerald-500/30 text-emerald-200'
              : 'bg-amber-950/25 border-amber-500/30 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5 font-bold text-sm">
            {isConnected ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>MongoDB Live & Synchronized</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Offline In-Memory Resilient Store Active</span>
              </>
            )}
          </div>
          <p className="text-xs leading-relaxed opacity-90">
            {isConnected
              ? `Connected to: ${dbStatus?.uri || 'mongodb://127.0.0.1:27017/expense-tracker'}. All data persists directly to MongoDB collections.`
              : `The server operates seamlessly in-memory. All charts, transactions, filters, and authentication work 100%, but data will not persist across server reboots until MongoDB is running.`}
          </p>
        </div>

        {/* Quick Setup Instructions if disconnected */}
        {!isConnected && (
          <div className="space-y-4 mb-6 text-xs text-slate-300">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              How to Start MongoDB Locally:
            </h4>

            {/* Option 1: Windows Service */}
            <div className="bg-slate-900/80 rounded-2xl p-3 border border-white/[0.08]">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-semibold text-slate-300">1. Start Windows Service:</span>
                <button
                  onClick={() => copyToClipboard('net start MongoDB', 'cmd1')}
                  className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  {copiedCmd === 'cmd1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <code className="text-emerald-400 bg-slate-950/90 px-2.5 py-1.5 rounded-xl block font-mono text-[11px] border border-white/[0.05]">
                net start MongoDB
              </code>
            </div>

            {/* Option 2: Run mongod CLI */}
            <div className="bg-slate-900/80 rounded-2xl p-3 border border-white/[0.08]">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-semibold text-slate-300">2. Run mongod directly:</span>
                <button
                  onClick={() => copyToClipboard('mongod --dbpath "C:/data/db"', 'cmd2')}
                  className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  {copiedCmd === 'cmd2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <code className="text-emerald-400 bg-slate-950/90 px-2.5 py-1.5 rounded-xl block font-mono text-[11px] border border-white/[0.05]">
                mongod --dbpath "C:/data/db"
              </code>
            </div>

            {/* Option 3: MongoDB Atlas */}
            <div className="bg-slate-900/80 rounded-2xl p-3 border border-white/[0.08]">
              <span className="font-semibold text-slate-300 block mb-1">3. Or use Free Cloud MongoDB Atlas:</span>
              <p className="text-slate-400 text-[11px] leading-relaxed mb-1.5">
                Add your Atlas URI in <span className="text-purple-400 font-mono">server/.env</span>:
              </p>
              <code className="text-emerald-400 bg-slate-950/90 px-2.5 py-1.5 rounded-xl block font-mono text-[11px] break-all border border-white/[0.05]">
                MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/expense-tracker
              </code>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-2xl glass-input text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleReconnect}
            disabled={reconnecting}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl btn-primary-glow text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reconnecting ? 'animate-spin' : ''}`} />
            <span>{reconnecting ? 'Checking...' : 'Retry Connection'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MongoStatusModal;
