import React from 'react';
import { AlertTriangle, Database, ArrowRight } from 'lucide-react';

export const MongoAlertBanner = ({ dbStatus, onOpenModal }) => {
  if (!dbStatus || dbStatus.connected) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 backdrop-blur-md z-40 relative">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-amber-300">
          <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </span>
          <div>
            <span className="font-bold text-amber-200">MongoDB is currently not running</span>
            <span className="text-amber-300/80 hidden sm:inline">
              {' '}- Local in-memory store active. All charts, transactions, and filters are 100% operational!
            </span>
          </div>
        </div>

        <button
          onClick={onOpenModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold transition-all border border-amber-500/35 ml-auto cursor-pointer"
        >
          <Database className="w-3.5 h-3.5" />
          <span>Setup / Connect MongoDB</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default MongoAlertBanner;
